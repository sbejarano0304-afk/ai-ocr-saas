import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, FolderHeart, FileUp, Settings, CreditCard, FileText, Trash2 } from 'lucide-react'
import { signout } from '@/app/login/actions'
import { createFolder, deleteFolder, deleteDocument } from './actions'
import { UploadDropzone } from '@/components/UploadDropzone'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Verify the user is logged in
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect('/login')
    }

    const { data: folders } = await supabase
        .from('patient_folders')
        .select('*')
        .order('created_at', { ascending: false })

    // Fetch the documents for this user via RLS
    const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-white/10 glass flex flex-col hidden md:flex">
                <div className="p-4 border-b border-white/10">
                    <p className="text-sm font-medium text-muted-foreground">Logged in as:</p>
                    <p className="text-sm font-semibold truncate" title={user.email}>{user.email}</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium bg-primary/20 text-primary rounded-md">
                        <FolderHeart className="w-4 h-4" />
                        Patient Folders
                    </button>
                    <Link href="/settings/api-keys" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground rounded-md transition-colors">
                        <Settings className="w-4 h-4" />
                        Developer API Keys
                    </Link>
                    <Link href="/settings/billing" className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground rounded-md transition-colors">
                        <CreditCard className="w-4 h-4" />
                        Billing & Plans
                    </Link>
                </nav>
                <div className="p-4 border-t border-white/10">
                    <form action={signout}>
                        <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-500/80 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-black/20">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Patient Folders</h1>
                        <p className="text-muted-foreground mt-1">Manage documents & scans for Pinoy Medical Office patients.</p>
                    </div>
                    <form action={createFolder} className="flex items-center gap-2">
                        <input type="text" name="folderName" placeholder="New Patient Name" required className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-foreground focus:outline-none focus:border-primary/50" />
                        <button type="submit" className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors">
                            <FolderHeart className="w-4 h-4" />
                            Create Folder
                        </button>
                    </form>
                </header>

                {/* Upload Zone (Temporarily placed here for testing) */}
                <div className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileUp className="w-5 h-5 text-primary" />
                        Quick Upload Scan
                    </h2>
                    {folders && folders.length > 0 ? (
                        <UploadDropzone folders={folders} />
                    ) : (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-balance text-muted-foreground">
                            Create a patient folder first to upload documents!
                        </div>
                    )}
                </div>

                {/* Folders List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Recent Folders</h2>
                    {folders?.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl glass">
                            <FolderHeart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                            <h3 className="text-lg font-medium">No patient folders yet</h3>
                            <p className="text-sm text-muted-foreground">Click "New Folder" to create one for a patient like John Doe.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {folders?.map((folder) => (
                                <Link href={`/dashboard/folder/${folder.id}`} key={folder.id} className="p-4 border border-white/10 rounded-xl glass hover:border-primary/50 transition-colors cursor-pointer group block relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <FolderHeart className="w-5 h-5" />
                                        </div>
                                        <form action={deleteFolder}>
                                            <input type="hidden" name="id" value={folder.id} />
                                            <button type="submit" className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100" title="Delete Folder">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </form>
                                    </div>
                                    <h3 className="font-semibold text-lg">{folder.patient_name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Created {new Date(folder.created_at).toLocaleDateString()}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Documents List */}
                <div className="mt-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Processed Documents
                    </h2>
                    {documents?.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl glass">
                            <p className="text-sm text-muted-foreground">No documents processed yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto glass border border-white/10 rounded-xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-sm font-medium text-muted-foreground bg-white/5">
                                        <th className="p-4">File Name</th>
                                        <th className="p-4">Extracted Type</th>
                                        <th className="p-4">Extracted Data</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 w-12 text-center">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents?.map(doc => {
                                        const fileUrl = doc.file_url?.startsWith('http')
                                            ? doc.file_url
                                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scans/${doc.file_url}`;

                                        return (
                                            <tr key={doc.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 font-medium text-sm">
                                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2 max-w-[200px] truncate" title={doc.file_name}>
                                                        <FileText className="w-4 h-4 shrink-0" />
                                                        <span className="truncate">{doc.file_name}</span>
                                                    </a>
                                                </td>
                                                <td className="p-4 text-sm capitalize text-muted-foreground">{doc.document_type || 'Unknown'}</td>
                                                <td className="p-4 text-sm max-w-[250px]">
                                                    {doc.extracted_data ? (
                                                        <div className="truncate text-xs font-mono bg-black/40 p-2 rounded border border-white/10 overflow-hidden cursor-help" title={JSON.stringify(doc.extracted_data, null, 2)}>
                                                            {JSON.stringify(doc.extracted_data)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">Awaiting OCR...</span>
                                                    )}
                                                </td>
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
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
