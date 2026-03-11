import React, { useEffect, useState } from "react";

function Landing({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 35);
    const timer = setTimeout(() => onFinish(), 4000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [onFinish]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>

      <div className="relative z-10 text-center animate-fadeIn">
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-600 shadow-[0_0_50px_rgba(52,211,153,0.3)] border border-white/20">
          <span className="text-5xl">✨</span>
        </div>

        <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white mb-4">
          SMARTY<span className="text-emerald-500">.</span>
        </h1>
        
        <div className="max-w-md mx-auto">
          <p className="text-slate-400 text-lg font-medium tracking-[0.4em] uppercase mb-12">
            AI Vision Intelligence
          </p>
          
          {/* Minimalist Progress Bar */}
          <div className="h-[2px] w-full bg-slate-800 rounded-full relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_15px_#10b981] transition-all duration-100"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-4 flex justify-between text-[10px] font-mono text-slate-500 tracking-widest uppercase">
            <span>System Initialize</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 border border-slate-800 px-4 py-1 rounded-full bg-slate-900/50 backdrop-blur-sm text-[10px] text-slate-500 uppercase tracking-widest">
        Powered by Qwen 2.5 Vision
      </div>
    </div>
  );
}

export default Landing;