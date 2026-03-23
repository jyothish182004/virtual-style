import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Settings, Shield, CreditCard, Bell, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';

interface ProfileProps {
  user: User | null;
  profile: UserProfile;
  saveProfile: (newProfile: UserProfile) => Promise<void>;
  saving: boolean;
  signOut: () => void;
  signIn: () => void;
}

export function Profile({ user, profile, saveProfile, saving, signOut, signIn }: ProfileProps) {
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile(formData);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto bento-card py-40 text-center space-y-10 border-dashed bg-neutral-50/30">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto border border-black/[0.03]">
          <UserIcon className="text-neutral-200" size={40} />
        </div>
        <div className="space-y-3">
          <p className="font-display text-3xl font-bold">Identity Not Verified</p>
          <p className="text-neutral-500 font-light max-w-sm mx-auto">Please sign in to manage your aesthetic profile and secure your digital wardrobe.</p>
        </div>
        <button 
          onClick={signIn}
          className="btn-primary px-12"
        >
          Verify Identity
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-4 space-y-12">
        <div className="bento-card p-10 space-y-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-brand-gold/20 p-1 group-hover:border-brand-gold transition-colors duration-700">
                <img src={user.photoURL || ''} alt="" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg">
                <CheckCircle2 size={14} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-bold">{user.displayName}</h2>
              <p className="text-xs text-neutral-400 font-mono uppercase tracking-[0.3em]">{user.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-4">
            {[
              { icon: UserIcon, label: 'Profile Settings', active: true },
              { icon: Shield, label: 'Security & Privacy' },
              { icon: CreditCard, label: 'Billing & Plans' },
              { icon: Bell, label: 'Notifications' },
            ].map((item, idx) => (
              <button 
                key={idx}
                className={cn(
                  "flex items-center gap-6 p-6 rounded-2xl transition-all duration-300 group",
                  item.active ? "bg-brand-black text-white shadow-xl" : "hover:bg-neutral-50 text-neutral-400 hover:text-brand-black"
                )}
              >
                <item.icon size={20} className={cn(item.active ? "text-brand-gold" : "group-hover:text-brand-gold")} />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{item.label}</span>
              </button>
            ))}
            <button 
              onClick={signOut}
              className="flex items-center gap-6 p-6 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group mt-10"
            >
              <LogOut size={20} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Sign Out</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Form */}
      <div className="lg:col-span-8 space-y-12">
        <section className="bento-card p-12 space-y-16">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.4em]">Aesthetic DNA</span>
              <h3 className="font-display text-4xl font-bold">Personal Profile</h3>
            </div>
            <div className="w-16 h-16 bg-neutral-50 rounded-3xl flex items-center justify-center text-neutral-200 border border-black/[0.03]">
              <Settings size={28} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="label-luxury">Style Preference</label>
                <select 
                  className="input-luxury appearance-none bg-white"
                  value={formData.stylePreference}
                  onChange={(e) => setFormData({...formData, stylePreference: e.target.value})}
                >
                  <option value="">Select Aesthetic</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="avant-garde">Avant-Garde</option>
                  <option value="streetwear">Streetwear</option>
                  <option value="classic">Classic</option>
                  <option value="bohemian">Bohemian</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="label-luxury">Body Type</label>
                <select 
                  className="input-luxury appearance-none bg-white"
                  value={formData.bodyType}
                  onChange={(e) => setFormData({...formData, bodyType: e.target.value})}
                >
                  <option value="">Select Type</option>
                  <option value="slim">Slim</option>
                  <option value="athletic">Athletic</option>
                  <option value="average">Average</option>
                  <option value="curvy">Curvy</option>
                  <option value="plus">Plus Size</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="label-luxury">Height (cm)</label>
                <input 
                  type="number" 
                  placeholder="175"
                  className="input-luxury"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="label-luxury">Weight (kg)</label>
                <input 
                  type="number" 
                  placeholder="70"
                  className="input-luxury"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                />
              </div>
              <div className="space-y-4 md:col-span-2">
                <label className="label-luxury">Skin Tone Hex</label>
                <div className="flex gap-6">
                  <input 
                    type="color" 
                    className="w-20 h-16 rounded-2xl border-none cursor-pointer p-0 overflow-hidden shadow-lg"
                    value={formData.skinTone}
                    onChange={(e) => setFormData({...formData, skinTone: e.target.value})}
                  />
                  <input 
                    type="text" 
                    className="input-luxury flex-1"
                    value={formData.skinTone}
                    onChange={(e) => setFormData({...formData, skinTone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-black/[0.03] flex items-center justify-between">
              <div className="flex items-center gap-4 text-neutral-400">
                <AlertCircle size={16} />
                <p className="text-[10px] font-bold uppercase tracking-widest">Changes are encrypted and private.</p>
              </div>
              <button 
                type="submit"
                disabled={saving}
                className="btn-primary px-16 py-5 text-sm flex items-center gap-4"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : 'Save Identity'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
