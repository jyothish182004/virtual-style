import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  signIn: () => void;
}

export function Navbar({ user, signIn }: NavbarProps) {
  const location = useLocation();

  const navItems = [
    { label: 'Studio', path: '/studio' },
    { label: 'Wardrobe', path: '/wardrobe' },
    { label: 'Concierge', path: '/concierge' },
    { label: 'Identity', path: '/profile' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
      <nav className="max-w-7xl mx-auto glass rounded-[2.5rem] px-10 py-5 flex items-center justify-between shadow-2xl border border-white/20">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-brand-black rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500">
            <Sparkles size={20} className="text-brand-gold" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tighter">
            Virtual<span className="text-brand-gold italic group-hover:text-brand-black transition-colors duration-500">Style</span>
          </h1>
        </Link>

        <div className="hidden md:flex items-center gap-12">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={cn(
                "text-[10px] font-bold uppercase tracking-[0.25em] transition-all duration-300 relative py-2",
                location.pathname === item.path ? "text-brand-black" : "text-neutral-400 hover:text-brand-black"
              )}
            >
              {item.label}
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold rounded-full"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-brand-gold/5 rounded-full border border-brand-gold/10">
            <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(191,155,48,0.5)]" />
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-brand-gold">AI Engine Active</span>
          </div>
          {user ? (
            <Link to="/profile" className="flex items-center gap-4 group">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">{user.displayName}</p>
                <p className="text-[8px] text-neutral-400 font-mono uppercase tracking-widest">Member Since 2026</p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-brand-gold/20 p-1 group-hover:border-brand-gold transition-colors duration-500">
                <img src={user.photoURL || ''} alt="" className="w-full h-full rounded-full object-cover" />
              </div>
            </Link>
          ) : (
            <button 
              onClick={signIn}
              className="btn-primary px-8 py-3 text-[10px]"
            >
              Enter Studio
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
