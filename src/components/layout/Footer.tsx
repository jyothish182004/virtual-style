import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-60 border-t border-black/[0.03] bg-white py-32">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-24">
        <div className="col-span-1 md:col-span-2 space-y-10">
          <h2 className="font-display text-5xl font-bold tracking-tighter">
            Virtual<span className="text-brand-gold italic">Style</span>
          </h2>
          <p className="text-neutral-500 max-w-md font-light text-lg leading-relaxed">
            Redefining the haute couture experience through advanced artificial intelligence. 
            Try on the world's most exclusive collections from your private digital studio.
          </p>
          <div className="flex gap-10">
            {['Instagram', 'Twitter', 'Pinterest', 'LinkedIn'].map((social) => (
              <a key={social} href="#" className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 hover:text-brand-black transition-all hover:-translate-y-1">
                {social}
              </a>
            ))}
          </div>
        </div>
        <div className="space-y-10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-black">Maison</h3>
          <nav className="flex flex-col gap-6">
            <Link to="/studio" className="text-sm text-neutral-400 hover:text-brand-black transition-colors text-left font-light tracking-wide">The Studio</Link>
            <Link to="/wardrobe" className="text-sm text-neutral-400 hover:text-brand-black transition-colors text-left font-light tracking-wide">Collection</Link>
            <Link to="/concierge" className="text-sm text-neutral-400 hover:text-brand-black transition-colors text-left font-light tracking-wide">Concierge</Link>
            <Link to="/profile" className="text-sm text-neutral-400 hover:text-brand-black transition-colors text-left font-light tracking-wide">Identity</Link>
          </nav>
        </div>
        <div className="space-y-10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-black">Archives</h3>
          <nav className="flex flex-col gap-6">
            <a href="#" className="text-sm text-neutral-400 hover:text-brand-black transition-colors font-light tracking-wide">Privacy Policy</a>
            <a href="#" className="text-sm text-neutral-400 hover:text-brand-black transition-colors font-light tracking-wide">Terms of Service</a>
            <a href="#" className="text-sm text-neutral-400 hover:text-brand-black transition-colors font-light tracking-wide">Cookie Policy</a>
            <a href="#" className="text-sm text-neutral-400 hover:text-brand-black transition-colors font-light tracking-wide">Contact Us</a>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 mt-32 pt-12 border-t border-black/[0.03] flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-300 font-mono">
          © 2026 VIRTUALSTYLE AI STUDIO. ALL RIGHTS RESERVED.
        </p>
        <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-300">
          <span>PARIS</span>
          <div className="w-1 h-1 bg-brand-gold rounded-full" />
          <span>MILAN</span>
          <div className="w-1 h-1 bg-brand-gold rounded-full" />
          <span>NEW YORK</span>
        </div>
      </div>
    </footer>
  );
}
