import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Trend, WardrobeItem } from '../types';

interface HomeProps {
  recentCreations: WardrobeItem[];
  trendingTrends: Trend[];
}

export function Home({ recentCreations, trendingTrends }: HomeProps) {
  return (
    <div className="space-y-40">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden rounded-[4rem] bg-brand-black mx-4 mt-4">
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
            alt="Fashion Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/20 via-transparent to-brand-black" />
        </motion.div>

        <div className="relative z-10 text-center space-y-12 px-6 max-w-5xl">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="space-y-6"
          >
            <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.6em] block">The Future of Personal Style</span>
            <h1 className="font-display text-[10vw] md:text-[8vw] font-bold text-white leading-[0.85] tracking-tighter">
              AESTHETIC<br />
              <span className="text-brand-gold italic">INTELLIGENCE</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-white/60 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed tracking-wide"
          >
            Experience the world's first AI-driven virtual fitting room. 
            Upload your identity, analyze your DNA, and redefine your wardrobe.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6"
          >
            <Link to="/studio" className="btn-primary px-12 py-5 text-sm group">
              Enter the Studio
              <ArrowRight size={18} className="inline-block ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link to="/concierge" className="text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:text-brand-gold transition-colors">
              Consult Concierge
            </Link>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center gap-4"
        >
          <span className="text-[8px] font-bold uppercase tracking-[0.4em]">Scroll to Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </section>

      {/* Recent Creations */}
      {recentCreations.length > 0 && (
        <section className="px-8 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.4em]">Live from the Studio</span>
              <h2 className="font-display text-6xl font-bold tracking-tighter">Recent Creations</h2>
            </div>
            <Link to="/wardrobe" className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 hover:text-brand-black transition-colors flex items-center gap-3 group">
              View Full Collection <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          <div className="flex gap-10 overflow-x-auto pb-12 no-scrollbar -mx-8 px-8">
            {recentCreations.map((item) => (
              <motion.div 
                key={item.docId}
                whileHover={{ y: -10 }}
                className="min-w-[320px] bento-card p-0 overflow-hidden group/card"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img 
                    src={item.tryOnResult || item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-500">
                    <button className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors flex items-center justify-center gap-3">
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono">{item.platform}</p>
                  <h3 className="font-display text-lg font-bold truncate">{item.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section className="px-8 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.4em]">Curated by AI</span>
              <div className="h-px w-12 bg-brand-gold/30" />
            </div>
            <h2 className="font-display text-6xl font-bold tracking-tighter">Trending Now</h2>
          </div>
          <p className="text-neutral-400 font-light max-w-xs text-sm leading-relaxed">
            Real-time analysis of global fashion movements and aesthetic shifts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {trendingTrends.map((trend) => (
            <motion.div 
              key={trend.id}
              whileHover={{ y: -15 }}
              className="group relative h-[600px] rounded-[3.5rem] overflow-hidden shadow-2xl"
            >
              <img 
                src={trend.image} 
                alt={trend.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              
              <div className="absolute inset-0 p-12 flex flex-col justify-end space-y-6">
                <span className="bg-brand-gold/20 backdrop-blur-md text-brand-gold text-[9px] font-bold uppercase tracking-[0.3em] px-4 py-2 rounded-full border border-brand-gold/30 self-start">
                  {trend.tag}
                </span>
                <h3 className="font-display text-4xl font-bold text-white leading-tight">{trend.title}</h3>
                <p className="text-white/70 text-sm font-light leading-relaxed line-clamp-2">{trend.desc}</p>
                <button className="text-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-3 group/btn">
                  Explore Trend <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-3 text-brand-gold" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
