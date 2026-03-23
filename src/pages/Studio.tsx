import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Camera, Search, ShoppingBag, Sparkles, 
  ChevronRight, X, Loader2, CheckCircle2, AlertCircle, 
  ExternalLink, ArrowRight, Eye, Trash2, Send
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../lib/utils';
import { User } from 'firebase/auth';
import { Product, StyleAnalysis, UserProfile } from '../types';
import { 
  performVirtualTryOn, 
  getStyleAdvice, 
  searchProducts, 
  analyzeUserStyle 
} from '../services/geminiService';
import { toast } from 'react-hot-toast';

interface StudioProps {
  user: User | null;
  profile: UserProfile;
  addToWardrobe: (product: Product, tryOnResult?: string) => Promise<void>;
}

export function Studio({ user, profile, addToWardrobe }: StudioProps) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [styleAnalysis, setStyleAnalysis] = useState<StyleAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [quickTryOnResults, setQuickTryOnResults] = useState<Record<string, string>>({});
  const [loadingQuickTryOn, setLoadingQuickTryOn] = useState<string | null>(null);
  const [detectedGender, setDetectedGender] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserImage(reader.result as string);
        setSearchResults([]); // Clear previous results
        setStyleAnalysis(null); // Clear previous analysis
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    multiple: false 
  } as any);

  useEffect(() => {
    if (userImage && !styleAnalysis && !isAnalyzing) {
      handleAnalyzeStyle();
    }
  }, [userImage]);

  const handleAnalyzeStyle = async () => {
    if (!userImage) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeUserStyle(userImage);
      setStyleAnalysis(analysis);
      if (analysis.gender) setDetectedGender(analysis.gender);
      toast.success('Aesthetic DNA Analysis Complete');
      
      // Automatically search for recommended items based on analysis
      if (analysis.recommendedSearch) {
        handleSearch(undefined, undefined, analysis.recommendedSearch, analysis.gender);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze style');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent, occasion?: string, customQuery?: string, genderOverride?: string) => {
    if (e) e.preventDefault();
    
    const currentOccasion = occasion || selectedOccasion;
    const gender = genderOverride || detectedGender || undefined;
    
    let query = customQuery || searchQuery;
    if (!customQuery) {
      if (currentOccasion) {
        query = `Complete ${currentOccasion} outfit collection including shirts, pants, and shoes`;
      }
    }

    if (!query.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchProducts(query, profile, gender);
      setSearchResults(results);
      if (results.length === 0) setSearchError('No products found for this query.');
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to fetch products. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleOccasionClick = (occasion: string) => {
    const newOccasion = selectedOccasion === occasion ? null : occasion;
    setSelectedOccasion(newOccasion);
    if (newOccasion) {
      handleSearch(undefined, newOccasion);
    }
  };

  const handleQuickTryOn = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!userImage) {
      toast.error('Please upload your portrait first.');
      return;
    }
    setLoadingQuickTryOn(product.id);
    try {
      const result = await performVirtualTryOn(userImage, product.imageUrl, product.name, product.category || 'Shirts');
      setQuickTryOnResults(prev => ({ ...prev, [product.id]: result }));
      toast.success('Quick try-on complete');
    } catch (error) {
      console.error('Quick try-on error:', error);
      toast.error('Failed to perform quick try-on');
    } finally {
      setLoadingQuickTryOn(null);
    }
  };

  const handleSaveQuickResult = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to save your look.');
      return;
    }
    const result = quickTryOnResults[product.id];
    if (!result) return;
    
    try {
      await addToWardrobe(product, result);
      toast.success('Look archived in your wardrobe');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save look');
    }
  };
  const handleTryOn = async () => {
    if (!userImage || !selectedProduct) return;
    setIsTryingOn(true);
    setTryOnResult(null);
    try {
      const result = await performVirtualTryOn(userImage, selectedProduct.imageUrl, selectedProduct.name, selectedProduct.category || 'Shirts');
      setTryOnResult(result);
      toast.success('Virtual try-on successful');
    } catch (error) {
      console.error('Try-on error:', error);
      toast.error('Failed to perform virtual try-on');
    } finally {
      setIsTryingOn(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-black/[0.03] pb-12">
        <div className="space-y-4">
          <span className="text-brand-gold text-[10px] font-bold uppercase tracking-[0.4em]">Creative Suite</span>
          <h2 className="font-display text-7xl font-bold tracking-tighter">The Studio</h2>
          <p className="text-neutral-500 font-light tracking-wide max-w-xl">
            Upload your identity, analyze your aesthetic DNA, and experience high-fidelity virtual try-ons.
          </p>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
          <span>AI ENGINE V2.5</span>
          <div className="w-16 h-px bg-neutral-200" />
          <span>READY FOR DEPLOYMENT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Identity & Analysis */}
        <div className="lg:col-span-5 space-y-12">
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-black rounded-2xl flex items-center justify-center text-white shadow-xl">
                <Camera size={18} />
              </div>
              <h3 className="font-display text-2xl font-bold">Digital Identity</h3>
            </div>

            <div 
              {...getRootProps()} 
              className={cn(
                "group relative aspect-[3/4] rounded-[3rem] border-2 border-dashed transition-all duration-700 overflow-hidden flex flex-col items-center justify-center cursor-pointer",
                isDragActive ? "border-brand-gold bg-brand-gold/5 scale-[0.98]" : "border-neutral-200 hover:border-brand-gold hover:bg-neutral-50",
                userImage && "border-none"
              )}
            >
              <input {...getInputProps()} />
              {userImage ? (
                <>
                  <img src={userImage} alt="User Identity" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-xl px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
                      <Upload size={18} className="text-brand-gold" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Replace Identity</span>
                    </div>
                  </div>
                  <div className="absolute top-6 left-6 bg-brand-black/40 backdrop-blur-xl text-white text-[9px] font-bold uppercase tracking-[0.3em] px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-400" /> Identity Verified
                  </div>
                </>
              ) : (
                <div className="text-center space-y-6 p-12">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto border border-black/[0.03]"
                  >
                    <Upload className="text-brand-gold" size={32} />
                  </motion.div>
                  <div className="space-y-2">
                    <p className="font-display text-xl font-bold">Upload Portrait</p>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">Drag and drop or click to upload your high-resolution portrait.</p>
                  </div>
                  <div className="pt-4 flex items-center justify-center gap-4 text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-300">
                    <div className="w-8 h-px bg-neutral-200" />
                    RECOMMENDED: CLEAR LIGHTING
                    <div className="w-8 h-px bg-neutral-200" />
                  </div>
                </div>
              )}
            </div>

            {userImage && !styleAnalysis && (
              <button 
                onClick={handleAnalyzeStyle}
                disabled={isAnalyzing}
                className="btn-primary w-full py-6 text-sm flex items-center justify-center gap-4 group"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Analyze My Aesthetic DNA
                    <Sparkles size={18} className="text-brand-gold group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </button>
            )}
          </section>

          <AnimatePresence>
            {styleAnalysis && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10 bento-card p-10 border-brand-gold/20 bg-brand-gold/[0.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-brand-gold text-[9px] font-bold uppercase tracking-[0.3em]">AI Analysis Result</span>
                    <h3 className="font-display text-3xl font-bold">Aesthetic Profile</h3>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-brand-gold/10">
                    <Sparkles size={20} className="text-brand-gold" />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-white rounded-3xl border border-black/[0.03] shadow-sm">
                    <p className="text-sm font-light leading-relaxed text-neutral-600 italic">"{styleAnalysis.aesthetic}"</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">Recommended Palette</label>
                    <div className="flex gap-4">
                      {styleAnalysis.colors.map((color, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="w-10 h-10 rounded-full shadow-lg border-2 border-white"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-400">Style Directives</label>
                    <div className="grid grid-cols-1 gap-3">
                      {styleAnalysis.advice.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-black/[0.02] group hover:border-brand-gold/20 transition-colors">
                          <div className="w-6 h-6 bg-brand-gold/10 rounded-lg flex items-center justify-center text-brand-gold text-[10px] font-bold shrink-0">
                            {idx + 1}
                          </div>
                          <p className="text-xs text-neutral-500 font-light leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Collection & Try-on */}
        <div className="lg:col-span-7 space-y-12">
          {!userImage ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-12 bento-card border-dashed bg-neutral-50/30">
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm flex items-center justify-center border border-black/[0.03]">
                <Camera className="text-neutral-200" size={40} />
              </div>
              <div className="space-y-4">
                <p className="font-display text-3xl font-bold">Identity Required</p>
                <p className="text-sm text-neutral-500 font-light leading-relaxed max-w-xs mx-auto">
                  Upload your portrait to the left to begin your AI-powered fashion consultation.
                </p>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-12 bento-card border-dashed bg-brand-gold/[0.02] border-brand-gold/20">
              <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center border border-brand-gold/10">
                <Loader2 className="text-brand-gold animate-spin" size={40} />
              </div>
              <div className="space-y-4">
                <p className="font-display text-3xl font-bold text-brand-gold animate-pulse">Analyzing DNA...</p>
                <p className="text-sm text-neutral-500 font-light leading-relaxed max-w-xs mx-auto">
                  Our AI is currently mapping your body architecture and color harmony to curate the perfect collection.
                </p>
              </div>
            </div>
          ) : (
            <section className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-black rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <Search size={18} />
                    </div>
                    <h3 className="font-display text-2xl font-bold">Curated for You</h3>
                  </div>
                  <div className="flex gap-3">
                    {['Casual', 'Formal', 'Party', 'Streetwear'].map((occasion) => (
                      <button 
                        key={occasion}
                        onClick={() => handleOccasionClick(occasion)}
                        className={cn(
                          "px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                          selectedOccasion === occasion 
                            ? "bg-brand-gold text-white shadow-lg" 
                            : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                        )}
                      >
                        {occasion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSearch} className="relative group">
                <input 
                  type="text" 
                  placeholder="Inquire about specific pieces..."
                  className="input-luxury pl-16"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-brand-gold transition-colors" size={20} />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-3 top-3 bottom-3 btn-primary px-8 rounded-xl text-[10px]"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={16} /> : 'Search'}
                </button>
              </form>

              <div className="space-y-16">
                {['Shirts', 'Pants', 'Shoes', 'Accessories'].map((category) => {
                  const categoryProducts = searchResults.filter(p => p.category === category);
                  if (categoryProducts.length === 0) return null;

                  return (
                    <div key={category} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display text-xl font-bold tracking-tight flex items-center gap-3">
                          <span className="w-8 h-px bg-brand-gold" />
                          {category}
                        </h4>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{categoryProducts.length} Pieces</span>
                      </div>
                      
                      <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-brand-gold/20 scrollbar-track-transparent -mx-4 px-4 snap-x">
                        <AnimatePresence mode="popLayout">
                          {categoryProducts.map((product) => (
                            <motion.div 
                              key={product.id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              onClick={() => setSelectedProduct(product)}
                              className={cn(
                                "min-w-[280px] snap-start bento-card p-6 cursor-pointer group/item transition-all duration-500",
                                selectedProduct?.id === product.id ? "ring-2 ring-brand-gold shadow-2xl scale-[1.02]" : "hover:shadow-2xl hover:-translate-y-1"
                              )}
                            >
                              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 mb-6 relative group/tryon">
                                <img 
                                  src={quickTryOnResults[product.id] || product.imageUrl} 
                                  alt={product.name} 
                                  className={cn(
                                    "w-full h-full object-cover transition-all duration-700",
                                    quickTryOnResults[product.id] && "group-hover/tryon:opacity-0"
                                  )}
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (!target.src.includes('picsum.photos')) {
                                      target.src = `https://picsum.photos/seed/${product.id}/800/1200`;
                                    }
                                  }}
                                />
                                {quickTryOnResults[product.id] && (
                                  <img 
                                    src={product.imageUrl} 
                                    alt="Original" 
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/tryon:opacity-100 transition-opacity duration-500"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      if (!target.src.includes('picsum.photos')) {
                                        target.src = `https://picsum.photos/seed/${product.id}-orig/800/1200`;
                                      }
                                    }}
                                  />
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-bold font-mono shadow-sm z-10">
                                  {product.price}
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 z-20">
                                  <button 
                                    onClick={(e) => handleQuickTryOn(e, product)}
                                    disabled={loadingQuickTryOn === product.id || !userImage}
                                    className="bg-white text-black px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors flex items-center gap-2 shadow-2xl"
                                  >
                                    {loadingQuickTryOn === product.id ? (
                                      <Loader2 className="animate-spin" size={12} />
                                    ) : (
                                      <Sparkles size={12} className="text-brand-gold" />
                                    )}
                                    {quickTryOnResults[product.id] ? 'Re-Render' : 'Quick Try-On'}
                                  </button>
                                  {quickTryOnResults[product.id] && (
                                    <button 
                                      onClick={(e) => handleSaveQuickResult(e, product)}
                                      className="bg-brand-gold text-white px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-brand-black transition-colors flex items-center gap-2 shadow-2xl"
                                    >
                                      <CheckCircle2 size={12} />
                                      Save to Wardrobe
                                    </button>
                                  )}
                                </div>
                                {quickTryOnResults[product.id] && (
                                  <div className="absolute top-4 left-4 bg-brand-gold text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-10">
                                    AI Rendered
                                  </div>
                                )}
                                {quickTryOnResults[product.id] && (
                                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-white text-[7px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full opacity-0 group-hover/tryon:opacity-100 transition-opacity z-10">
                                    Hover to see original
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono">{product.platform}</p>
                                <h4 className="font-display text-lg font-bold truncate">{product.name}</h4>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>

              {searchError && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center bento-card border-dashed bg-neutral-50/50"
                >
                  <AlertCircle className="mx-auto text-neutral-300 mb-4" size={32} />
                  <p className="text-sm text-neutral-500 font-light">{searchError}</p>
                </motion.div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Try-on Result Overlay */}
      <AnimatePresence>
        {tryOnResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-black/95 backdrop-blur-2xl flex items-center justify-center p-8"
          >
            <button 
              onClick={() => setTryOnResult(null)}
              className="absolute top-12 right-12 text-white/50 hover:text-white transition-colors"
            >
              <X size={40} />
            </button>

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="aspect-[3/4] rounded-[4rem] overflow-hidden shadow-[0_64px_128px_-32px_rgba(0,0,0,0.5)] border-8 border-white/10"
              >
                <img src={tryOnResult} alt="Try-on Result" className="w-full h-full object-cover" />
              </motion.div>

              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Sparkles className="text-brand-gold" size={32} />
                    <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.4em]">AI Stylist Verdict</span>
                  </div>
                  <h2 className="font-display text-6xl font-bold text-white tracking-tighter">Masterpiece.</h2>
                  <p className="text-white/60 text-xl font-light leading-relaxed">
                    The silhouette perfectly complements your frame, while the color palette harmonizes with your natural aesthetic DNA. 
                    A bold yet sophisticated choice for your collection.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  <button 
                    onClick={() => {
                      if (selectedProduct) addToWardrobe(selectedProduct, tryOnResult);
                      setTryOnResult(null);
                    }}
                    className="btn-primary py-6 px-12 text-sm flex-1"
                  >
                    Archive to Wardrobe
                  </button>
                  <a 
                    href={selectedProduct?.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-secondary py-6 px-12 text-sm flex-1 text-center bg-white/10 border-white/20 text-white hover:bg-white hover:text-black"
                  >
                    Acquire Piece
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Bar */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[60] w-full max-w-4xl px-6"
          >
            <div className="glass rounded-[3rem] p-6 flex items-center justify-between shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/20">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-black/5 shadow-lg">
                  <img src={selectedProduct.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono mb-1">{selectedProduct.platform}</p>
                  <h5 className="font-display text-lg font-bold truncate max-w-[200px]">{selectedProduct.name}</h5>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="w-14 h-14 rounded-2xl border border-black/5 flex items-center justify-center text-neutral-400 hover:text-black transition-all"
                >
                  <X size={20} />
                </button>
                <div className="h-10 w-px bg-black/5 mx-2" />
                <button 
                  onClick={handleTryOn}
                  disabled={isTryingOn || !userImage}
                  className="btn-primary h-14 px-10 text-[10px] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTryingOn ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Fitting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="text-brand-gold" />
                      Virtual Try-On
                    </>
                  )}
                </button>
                <a 
                  href={selectedProduct.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary h-14 px-10 text-[10px] flex items-center gap-3"
                >
                  Shop Piece
                </a>
              </div>
            </div>
            {!userImage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 bg-brand-black text-white text-[9px] font-bold uppercase tracking-[0.3em] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 whitespace-nowrap"
              >
                <AlertCircle size={14} className="text-brand-gold" />
                Upload Identity Portrait to Enable Try-On
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
