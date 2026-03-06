import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut, FolderHeart, FileUp, Settings, CreditCard } from 'lucide-react'
import { signout } from '@/app/login/actions'
import { UploadDropzone } from '@/components/UploadDropzone'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Verify the user is logged in
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect('/login')
    }

    // Fetch the patient folders created by this clinic employee
    const { data: folders } = await supabase
        .from('patient_folders')
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
                    <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors">
                        <FolderHeart className="w-4 h-4" />
                        New Folder
                    </button>
                </header>

                {/* Upload Zone (Temporarily placed here for testing) */}
                <div className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileUp className="w-5 h-5 text-primary" />
                        Quick Upload Scan
                    </h2>
                    {folders && folders.length > 0 ? (
                        <UploadDropzone folderId={folders[0].id} />
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
                                <div key={folder.id} className="p-4 border border-white/10 rounded-xl glass hover:border-primary/50 transition-colors cursor-pointer group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <FolderHeart className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-lg">{folder.patient_name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Created {new Date(folder.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
