import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function LoadingScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-brand-black flex items-center justify-center"
    >
      <div className="relative text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-24 h-24 bg-white rounded-[2.5rem] shadow-[0_0_100px_rgba(255,255,255,0.1)] flex items-center justify-center mx-auto relative group"
        >
          <Sparkles className="text-brand-gold" size={40} />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-brand-gold rounded-[2.5rem] blur-2xl -z-10"
          />
        </motion.div>
        
        <div className="space-y-4">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-display text-2xl font-bold text-white tracking-[0.2em] uppercase"
          >
            Virtual Style
          </motion.h2>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
            className="h-px bg-gradient-to-r from-transparent via-brand-gold to-transparent mx-auto"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-[10px] text-white font-bold uppercase tracking-[0.4em]"
          >
            Initializing Aesthetic Intelligence
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
