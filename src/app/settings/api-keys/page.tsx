import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KeyRound, Trash2, Plus, ArrowLeft } from 'lucide-react'
import { generateApiKey, deleteApiKey } from './actions'
import Link from 'next/link'

export default async function ApiKeysPage() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect('/login')
    }

    const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-black/20 p-8 overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto space-y-8">
                <div>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Developer API Keys</h1>
                    <p className="text-muted-foreground mt-1">Manage API keys to programmatically upload documents to the Extractify OCR Engine.</p>
                </div>

                <div className="glass border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4">Generate New Key</h2>
                    <form action={generateApiKey} className="flex gap-4">
                        <input
                            type="text"
                            name="keyName"
                            placeholder="e.g. Production Billing Server"
                            required
                            className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
                        />
                        <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium transition-colors">
                            <Plus className="w-4 h-4" />
                            Generate Key
                        </button>
                    </form>
                </div>

                <div className="glass border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-primary" />
                        Active API Keys
                    </h2>

                    {apiKeys?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No API keys found. Create one above.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {apiKeys?.map((apiKey) => (
                                <div key={apiKey.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                                    <div>
                                        <p className="font-medium text-foreground">{apiKey.key_name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <code className="text-sm text-primary px-2 py-0.5 bg-primary/10 rounded break-all max-w-[300px]">
                                                {apiKey.key_value}
                                            </code>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                Created {new Date(apiKey.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <form action={deleteApiKey}>
                                        <input type="hidden" name="id" value={apiKey.id} />
                                        <button type="submit" className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Revoke Key">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
