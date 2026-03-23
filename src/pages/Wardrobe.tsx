import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ShoppingBag, Sparkles, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WardrobeItem } from '../types';
import { User } from 'firebase/auth';

interface WardrobeProps {
  user: User | null;
  wardrobe: WardrobeItem[];
  removeFromWardrobe: (docId: string) => Promise<void>;
  signIn: () => void;
}

export function Wardrobe({ user, wardrobe, removeFromWardrobe, signIn }: WardrobeProps) {
  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-black/[0.03] pb-10">
        <div className="space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">Your Collection</span>
          <h2 className="font-display text-5xl font-bold">The Wardrobe</h2>
          <p className="text-neutral-500 font-light tracking-wide max-w-xl">A curated archive of your virtual designs, favorites, and style experiments.</p>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
          <span>{wardrobe.length} PIECES</span>
          <div className="w-16 h-px bg-neutral-200" />
          <span>CHRONOLOGICAL ORDER</span>
        </div>
      </div>
      
      {!user ? (
        <div className="bento-card py-40 text-center space-y-10 border-dashed bg-neutral-50/30">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto border border-black/[0.03]">
            <AlertCircle className="text-neutral-200" size={40} />
          </div>
          <div className="space-y-3">
            <p className="font-display text-3xl font-bold">Access Restricted</p>
            <p className="text-neutral-500 font-light max-w-sm mx-auto">Please sign in to your identity to view your curated collection.</p>
          </div>
          <button 
            onClick={signIn}
            className="btn-primary px-12"
          >
            Sign In
          </button>
        </div>
      ) : wardrobe.length === 0 ? (
        <div className="bento-card py-40 text-center space-y-10 border-dashed bg-neutral-50/30">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto border border-black/[0.03]">
            <ShoppingBag className="text-neutral-200" size={40} />
          </div>
          <div className="space-y-3">
            <p className="font-display text-3xl font-bold">Your Wardrobe is Empty</p>
            <p className="text-neutral-500 font-light max-w-sm mx-auto">Begin your style journey in the Studio to start archiving your looks.</p>
          </div>
          <Link 
            to="/studio"
            className="btn-primary px-12 py-4 inline-block"
          >
            Enter Studio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {wardrobe.map((item) => (
            <motion.div 
              key={item.docId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bento-card p-0 overflow-hidden shadow-xl hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] transition-all duration-700"
            >
              <div className="aspect-[3/4] overflow-hidden bg-neutral-100 relative">
                <img 
                  src={item.tryOnResult || item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                {item.tryOnResult && (
                  <div className="absolute top-6 left-6 bg-brand-black/40 backdrop-blur-xl text-white text-[9px] font-bold uppercase tracking-[0.3em] px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                    <Sparkles size={12} className="text-brand-gold" /> AI Rendered
                  </div>
                )}
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 font-mono">{item.platform}</span>
                  <span className="text-xs font-bold font-mono text-brand-black">{item.price}</span>
                </div>
                <h3 className="font-display text-xl font-bold truncate group-hover:text-brand-gold transition-colors duration-300">{item.name}</h3>
                <div className="flex items-center justify-between pt-6 border-t border-black/[0.03] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] font-bold text-neutral-400 hover:text-brand-black flex items-center gap-2 transition-colors uppercase tracking-[0.2em]"
                  >
                    Shop Piece <ExternalLink size={12} />
                  </a>
                  <button 
                    onClick={() => removeFromWardrobe(item.docId!)}
                    className="text-[9px] font-bold text-red-400 hover:text-red-600 flex items-center gap-2 transition-colors uppercase tracking-[0.2em]"
                  >
                    Remove <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
