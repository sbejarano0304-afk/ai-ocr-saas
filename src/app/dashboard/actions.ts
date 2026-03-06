'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFolder(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) throw new Error('Unauthorized')

    const folderName = formData.get('folderName') as string
    if (!folderName) throw new Error('Folder name required')

    await supabase.from('patient_folders').insert({
        patient_name: folderName,
        created_by: user.id
    })

    revalidatePath('/dashboard')
}

export async function deleteFolder(formData: FormData) {
    const supabase = await createClient()

    const id = formData.get('id') as string
    if (!id) return

    await supabase.from('patient_folders').delete().eq('id', id)
    revalidatePath('/dashboard')
}

export async function deleteDocument(formData: FormData) {
    const supabase = await createClient()

    const id = formData.get('id') as string
    if (!id) return

    await supabase.from('documents').delete().eq('id', id)
    revalidatePath('/dashboard')
}
