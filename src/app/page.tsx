import { UploadDropzone } from "@/components/UploadDropzone";
import { ArrowRight, Shield, Zap, Database } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Abstract background gradient */}
        <div className="absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 bg-gradient-to-tr from-primary to-purple-600 rounded-full blur-[120px]"></div>

        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
            <Zap className="mr-2 h-4 w-4" />
            v1.0 is now live for developers
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-6">
            Turn unstructured documents into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">structured data</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mb-12">
            Automate your document workflows. Upload PDFs or receipts, and our AI OCR extraction engine automatically categorizes and saves the structured JSON data straight to your user folder.
          </p>

          <UploadDropzone />
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 border-t border-white/5 bg-black/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl glass hover:bg-white/[0.02] border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
                <Shield className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Isolated User Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                Powered by Supabase RLS policies, every document uploaded is securely stored and exclusively accessible in your virtual user folder.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass hover:bg-white/[0.02] border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
                <Zap className="text-blue-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Kubernetes Scaled</h3>
              <p className="text-muted-foreground leading-relaxed">
                The OCR processing worker runs in a resilient K8s pod. As document volume increases, the queue seamlessly scales.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass hover:bg-white/[0.02] border border-white/10 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                <Database className="text-purple-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Developer API</h3>
              <p className="text-muted-foreground leading-relaxed">
                Integrate directly via API keys. Fetch extracted data exactly when the webhook notifies your external services.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
