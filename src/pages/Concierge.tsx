import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageSquare, Settings, Send, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from 'firebase/auth';
import { ChatMessage } from '../types';
import { getStylistChatResponse } from '../services/geminiService';
import { toast } from 'react-hot-toast';

interface ConciergeProps {
  user: User | null;
}

export function Concierge({ user }: ConciergeProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 2) {
      toast.error('You can upload up to 2 images for comparison.');
      return;
    }

    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!chatInput.trim() && selectedImages.length === 0) || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      role: 'user',
      images: selectedImages,
      createdAt: { toDate: () => new Date() } as any
    };

    setMessages(prev => [...prev, userMsg]);
    const currentImages = [...selectedImages];
    const currentInput = chatInput;
    
    setChatInput('');
    setSelectedImages([]);
    setIsTyping(true);

    try {
      const response = await getStylistChatResponse(currentInput || "Evaluate these images.", messages, currentImages);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        role: 'assistant',
        createdAt: { toDate: () => new Date() } as any
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from stylist');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[85vh] flex flex-col bento-card p-0 overflow-hidden shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] border-black/[0.03]">
      <div className="p-10 border-b border-black/[0.03] flex items-center justify-between bg-white/50 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-brand-black rounded-3xl flex items-center justify-center text-white shadow-xl shadow-black/20">
            <Sparkles size={28} className="text-brand-gold" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Style Concierge</h2>
            <p className="text-[9px] text-emerald-500 flex items-center gap-2 font-bold uppercase tracking-[0.3em]">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              AI Intelligence Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-12 h-12 rounded-2xl border border-black/5 flex items-center justify-center text-neutral-400 hover:text-brand-black hover:border-black/10 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar bg-neutral-50/20">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center border border-black/[0.03]">
              <MessageSquare className="text-neutral-200" size={40} />
            </div>
            <div className="space-y-4">
              <p className="font-display text-3xl font-bold">Refine Your Aesthetic</p>
              <p className="text-sm text-neutral-500 font-light leading-relaxed">Ask our concierge about seasonal trends, color theory, or curated looks for your next high-profile event.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full">
              {[
                "Compare these two dresses for a gala event.",
                "Suggest a look for a white shirt and black pants.",
                "What accessories go with a navy blue blazer?"
              ].map((suggestion, idx) => (
                <button 
                  key={idx}
                  onClick={() => setChatInput(suggestion)}
                  className="p-4 rounded-2xl bg-white border border-black/[0.03] text-xs font-bold text-neutral-400 hover:text-brand-black hover:border-brand-gold/30 transition-all text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex flex-col max-w-[75%]",
              msg.role === 'user' ? "ml-auto items-end" : "items-start"
            )}
          >
            {msg.images && msg.images.length > 0 && (
              <div className="flex gap-4 mb-4">
                {msg.images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt="Upload" 
                    className="w-32 h-40 object-cover rounded-2xl shadow-lg border-2 border-white" 
                  />
                ))}
              </div>
            )}
            <div className={cn(
              "p-8 rounded-[2.5rem] text-sm leading-relaxed shadow-sm",
              msg.role === 'user' 
                ? "bg-brand-black text-white rounded-tr-none" 
                : "bg-white text-neutral-800 rounded-tl-none border border-black/[0.03]"
            )}>
              {msg.text}
            </div>
            <span className="text-[9px] text-neutral-400 mt-3 font-mono uppercase tracking-[0.2em] px-4">
              {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
            </span>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-black/[0.03] p-8 rounded-[2.5rem] rounded-tl-none flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-10 bg-white border-t border-black/[0.03] space-y-6">
        {selectedImages.length > 0 && (
          <div className="flex gap-4">
            {selectedImages.map((img, i) => (
              <div key={i} className="relative group/img">
                <img src={img} alt="" className="w-20 h-24 object-cover rounded-xl shadow-md" />
                <button 
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <form 
          onSubmit={handleSendMessage}
          className="relative group flex items-center gap-4"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            multiple
            onChange={handleImageSelect}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-2xl border border-black/5 flex items-center justify-center text-neutral-400 hover:text-brand-black hover:border-black/10 transition-all shrink-0"
          >
            <ImageIcon size={20} />
          </button>
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Inquire about style, trends, or identity..."
              className="input-luxury pr-20"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={!user && messages.length > 5}
            />
            <button 
              type="submit"
              disabled={(!chatInput.trim() && selectedImages.length === 0) || isTyping}
              className="absolute right-3 top-3 bottom-3 btn-primary px-8 rounded-xl"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
