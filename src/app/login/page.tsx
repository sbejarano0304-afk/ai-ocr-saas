import { login, signup } from './actions'
import { ShieldAlert } from 'lucide-react'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const error = (await searchParams).error as string | undefined;

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="w-full max-w-md p-8 rounded-2xl glass border border-white/10 relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/30">
                        <span className="text-primary text-2xl font-bold">⬡</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Clinic Portal Access</h1>
                    <p className="text-muted-foreground text-sm mt-2">
                        Pinoy Medical Office Employee Login
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="employee@pinoymedical.com"
                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        />
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            type="submit"
                            formAction={login}
                            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                        >
                            Log In
                        </button>
                        <button
                            type="submit"
                            formAction={signup}
                            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-lg font-medium transition-colors"
                        >
                            Sign up as new employee
                        </button>
                    </div>
                </form>

                <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground bg-white/5 p-3 rounded-lg">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 text-primary" />
                    <p>
                        Secure access. All patient folders and documents are protected by Row Level Security (RLS) policies.
                    </p>
                </div>
            </div>
        </div>
    )
}
