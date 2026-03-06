import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FolderHeart, FileText, Trash2 } from 'lucide-react'
import { UploadDropzone } from '@/components/UploadDropzone'
import { deleteDocument } from '../../actions'

export default async function FolderPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { id } = await params;

    const { data: folder } = await supabase
        .from('patient_folders')
        .select('*')
        .eq('id', id)
        .single()

    if (!folder) {
        redirect('/dashboard')
    }

    const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('folder_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-black/20 h-[calc(100vh-4rem)]">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <FolderHeart className="w-8 h-8 text-primary" />
                    {folder.patient_name}
                </h1>
                <p className="text-muted-foreground mt-1">Patient Folder Details</p>
            </header>

            <div className="mb-12">
                <UploadDropzone defaultFolderId={id} />
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Documents in Folder
                </h2>
                {documents?.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl glass">
                        <p className="text-sm text-muted-foreground">No documents uploaded to this folder yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto glass border border-white/10 rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-sm font-medium text-muted-foreground bg-white/5">
                                    <th className="p-4">File Name</th>
                                    <th className="p-4">Extracted Type</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 w-12 text-center">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents?.map(doc => (
                                    <tr key={doc.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 font-medium text-sm">
                                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2 max-w-[200px] truncate" title={doc.file_name}>
                                                <FileText className="w-4 h-4 shrink-0" />
                                                <span className="truncate">{doc.file_name}</span>
                                            </a>
                                        </td>
                                        <td className="p-4 text-sm capitalize text-muted-foreground">{doc.document_type || 'Unknown'}</td>
                                        <td className="p-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'completed' ? 'bg-green-500/20 text-green-400' : doc.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <form action={deleteDocument}>
                                                <input type="hidden" name="id" value={doc.id} />
                                                <button type="submit" className="text-red-500/70 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-500/10">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
