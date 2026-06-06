import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="text-center z-10 max-w-3xl px-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-elevated border border-border text-xs font-medium text-brand-primary mb-8 tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <span>Next-Gen Proctoring</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-medium text-text-primary tracking-tight mb-6 mt-4">
          Browser-native interviews, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">AI-powered trust.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-secondary font-sans mb-10 max-w-2xl mx-auto leading-relaxed">
          The enterprise-ready platform for technical interviews. No downloads required. Zero-trust security. Real-time behavior monitoring.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/recruiter"
            className="px-8 py-3 rounded-md bg-text-primary text-background font-medium hover:bg-text-secondary transition-colors w-full sm:w-auto"
          >
            Enter Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            className="px-8 py-3 rounded-md bg-surface-elevated text-text-primary border border-border font-medium hover:bg-surface-hover transition-colors w-full sm:w-auto"
            rel="noreferrer"
          >
            View Documentation
          </a>
        </div>
      </main>

      <div className="absolute bottom-10 left-0 w-full text-center text-xs font-mono text-text-secondary flex items-center justify-center space-x-6">
        <span>© 2026 GetAWay Inc.</span>
        <span>Status: <span className="text-brand-primary">Operational</span></span>
      </div>
    </div>
  );
}
