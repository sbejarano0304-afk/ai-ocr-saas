import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This route uses the Service Role key because external API callers
// do not have a Next.js / Supabase Auth Session cookie.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    try {
        // 1. Authenticate via Bearer Token (API Key)
        const authHeader = req.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 })
        }

        const apiKey = authHeader.split(' ')[1]

        // Look up the API key in the database
        const { data: keyRecord, error: keyError } = await supabaseAdmin
            .from('api_keys')
            .select('user_id, id')
            .eq('key_value', apiKey)
            .single()

        if (keyError || !keyRecord) {
            return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 })
        }

        // Update last_used_at timestamp asynchronously
        supabaseAdmin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', keyRecord.id).then()

        // 2. Parse the multipart form data
        const formData = await req.formData()
        const file = formData.get('file') as File
        const folderId = formData.get('folderId') as string

        if (!file || !folderId) {
            return NextResponse.json({ error: 'File and folderId are required' }, { status: 400 })
        }

        // Validate that the folder actually belongs to the user who owns this API key
        const { data: folderRecord, error: folderError } = await supabaseAdmin
            .from('patient_folders')
            .select('id')
            .eq('id', folderId)
            .eq('created_by', keyRecord.user_id)
            .single()

        if (folderError || !folderRecord) {
            return NextResponse.json({ error: 'Folder not found or you do not have permission to upload to it.' }, { status: 403 })
        }

        // 3. Convert file to buffer for Supabase Storage
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const fileExt = file.name.split('.').pop()
        const safeFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${folderId}/${safeFileName}`

        // 4. Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
            .from('scans')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage.from('scans').getPublicUrl(filePath)

        // 5. Create database record
        const { data: docRecord, error: dbError } = await supabaseAdmin
            .from('documents')
            .insert({
                folder_id: folderId,
                file_name: file.name,
                file_url: publicUrl,
                status: 'pending'
            })
            .select('id')
            .single()

        if (dbError) throw new Error(`Database insert failed: ${dbError.message}`)

        // 6. Forward to Local Kubernetes OCR Worker
        const workerUrl = process.env.OCR_WORKER_URL || "http://127.0.0.1:3001";
        const workerResponse = await fetch(`${workerUrl}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                documentId: docRecord.id,
                folderId: folderId,
                fileUrl: publicUrl
            })
        })

        if (!workerResponse.ok) {
            const errBase = await workerResponse.text()
            console.error('Kubernetes worker rejected request:', errBase)
            // We don't fail the whole API request, the file is in storage, worker can retry later
        }

        return NextResponse.json({
            success: true,
            message: 'Document accepted for processing',
            documentId: docRecord.id
        })

    } catch (error: any) {
        console.error('Developer Upload API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
