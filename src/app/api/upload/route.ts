import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const folderId = formData.get("folderId") as string;

        if (!file || !folderId) {
            return NextResponse.json({ error: "Missing file or folderId" }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch { }
                    },
                },
            }
        );

        // Verify auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Upload to Supabase Storage Bucket
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${folderId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("scans")
            .upload(filePath, file);

        if (uploadError) {
            console.error("Supabase storage error:", uploadError);
            return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage.from("scans").getPublicUrl(filePath);

        // 2. Create the Document record in Postgres
        const { data: documentData, error: dbError } = await supabase
            .from("documents")
            .insert({
                folder_id: folderId,
                file_name: file.name,
                file_url: publicUrl,
                status: "pending"
            })
            .select()
            .single();

        if (dbError) {
            console.error("Supabase DB error:", dbError);
            return NextResponse.json({ error: "Failed to create database record" }, { status: 500 });
        }

        // 3. Send to our Kubernetes OCR Worker (via the Local NodePort proxy)
        // In production, this would be an internal K8s service URL or a message queue
        const workerFormData = new FormData();
        workerFormData.append("document", file); // sending the physical file to the worker
        workerFormData.append("documentId", documentData.id);
        workerFormData.append("folderId", folderId);

        // Fire and forget (Worker processes asynchronously)
        const workerUrl = process.env.OCR_WORKER_URL || "http://localhost:3001";
        fetch(`${workerUrl}/process`, {
            method: "POST",
            body: workerFormData as any,
        }).catch(err => console.error("Failed to reach worker:", err));

        return NextResponse.json({ success: true, document: documentData });

    } catch (err: any) {
        console.error("Upload handler error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
