import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function BillingPage() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect('/login')
    }

    // In a real app, you would fetch user's subscription status from Supabase or Stripe
    const isPro = false

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-black/20 p-8 overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto space-y-8">
                <div>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
                    <p className="text-muted-foreground mt-1">Manage your Extractify OCR subscription.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Free Plan */}
                    <div className="glass border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                        {isPro ? null : <div className="absolute top-0 right-0 bg-primary/20 text-primary px-3 py-1 rounded-bl-lg text-xs font-medium">Current Plan</div>}
                        <h2 className="text-2xl font-bold mb-2">Starter</h2>
                        <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-muted-foreground font-normal">/month</span></div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                100 Document Scans per month
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Basic OCR Extraction
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Web Dashboard Access
                            </li>
                        </ul>

                        <button disabled={!isPro} className="w-full py-3 rounded-lg border border-white/10 bg-white/5 text-foreground font-medium disabled:opacity-50 transition-colors">
                            {isPro ? 'Downgrade' : 'Active'}
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="glass border-2 border-primary/50 bg-primary/5 rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

                        {isPro ? <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 rounded-bl-lg text-xs font-medium">Current Plan</div> : null}

                        <h2 className="text-2xl font-bold mb-2">Clinic Pro</h2>
                        <div className="text-4xl font-bold mb-6">$49<span className="text-lg text-muted-foreground font-normal">/month</span></div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Unlimited Document Scans
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Custom Developer API Keys
                            </li>
                            <li className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Premium Tesseract Support
                            </li>
                        </ul>

                        <form action="/api/stripe/checkout" method="POST">
                            <input type="hidden" name="priceId" value="price_mock_123" />
                            <button type="submit" disabled={isPro} className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <CreditCard className="w-4 h-4" />
                                {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
