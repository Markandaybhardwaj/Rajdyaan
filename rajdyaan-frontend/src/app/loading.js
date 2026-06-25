'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-secondary/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Elegant Animated Logo/Spinner */}
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-full border-2 border-accent/20"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-accent"></div>
          <div className="absolute inset-4 animate-pulse rounded-full bg-primary/10 flex items-center justify-center">
             <span className="text-accent font-heading font-bold text-xl">R</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <p className="font-heading text-lg font-medium text-primary tracking-widest animate-pulse">
            RAJDHYAAN
          </p>
          <div className="h-0.5 w-12 bg-accent/30 mt-1 rounded-full overflow-hidden">
            <div className="h-full bg-accent w-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
