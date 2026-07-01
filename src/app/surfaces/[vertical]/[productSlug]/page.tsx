'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import Reveal from '@/components/Reveal';

type Product = {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  category: string;
  description: string;
  specs: string; // JSON string
  swatches: string; // JSON string
  applications: string;
  tags: string;
  isFeatured: boolean;
};

type Swatch = {
  name: string;
  value: string;
};

export default function ProductDetail({ params }: { params: Promise<{ vertical: string; productSlug: string }> }) {
  const router = useRouter();
  const { openBrochure } = useModal();
  
  // Unwrap parameters
  const { vertical, productSlug } = use(params);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [activeSwatch, setActiveSwatch] = useState<Swatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [sampleOrdered, setSampleOrdered] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?slug=${productSlug}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          
          const parsedSwatches = JSON.parse(data.product.swatches || '[]') as Swatch[];
          setSwatches(parsedSwatches);
          if (parsedSwatches.length > 0) {
            setActiveSwatch(parsedSwatches[0]);
          }

          const parsedSpecs = JSON.parse(data.product.specs || '{}') as Record<string, string>;
          setSpecs(parsedSpecs);
        } else {
          router.push(`/surfaces/${vertical}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productSlug, vertical, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center text-xs font-mono tracking-wider uppercase text-stone-dim">
        Loading Spec Sheet...
      </div>
    );
  }

  if (!product) return null;

  const requestSample = () => {
    setSampleOrdered(true);
    setTimeout(() => setSampleOrdered(false), 3000);
  };

  return (
    <div className="bg-ink min-h-screen py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
      
      {/* 1. Breadcrumbs & Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
        <button 
          onClick={() => router.back()}
          className="text-stone hover:text-parchment text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collection
        </button>

        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase text-stone-dim">
          <Link href="/" className="hover:text-stone transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/surfaces/${vertical}`} className="hover:text-stone transition-colors capitalize">{vertical}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-brass">{product.name}</span>
        </div>
      </div>

      {/* 2. Main Product Spec Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Mock Swatch/Texture Magnifier Frame (cols 7) */}
        <div className="lg:col-span-7 space-y-4">
          <Reveal className="relative h-[340px] md:h-[480px] bg-ink-2 border border-line rounded-sm overflow-hidden flex items-center justify-center group shadow-lg">
            
            {/* Display Background color matching active swatch or generic wood grain pattern */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter brightness-90 group-hover:scale-105"
              style={{ 
                backgroundColor: activeSwatch?.value || '#242220',
                backgroundImage: 'url("https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80")',
                backgroundBlendMode: 'multiply'
              }}
            />
            
            {/* Visual overlay for scale and authenticity */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/20 pointer-events-none" />
            <div className="absolute bottom-6 left-6 bg-[#0a0806]/85 border border-line text-parchment text-[9px] font-mono tracking-widest uppercase p-2 rounded-sm backdrop-blur-sm">
              Material preview: {activeSwatch?.name || product.name}
            </div>
          </Reveal>

          {/* Colorway/Swatch Selectors */}
          {swatches.length > 0 && (
            <Reveal className="bg-ink-2 border border-line p-5 rounded-sm space-y-3" delay={100}>
              <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Available Swatches</span>
              <div className="flex flex-wrap gap-3">
                {swatches.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setActiveSwatch(s)}
                    className={`p-1.5 border rounded-sm flex items-center gap-2 transition-all duration-300 cursor-pointer ${
                      activeSwatch?.name === s.name 
                        ? 'border-brass bg-ink' 
                        : 'border-line/40 hover:border-stone-dim bg-ink/10'
                    }`}
                  >
                    <div 
                      className="w-5 h-5 border border-line/50 rounded-sm" 
                      style={{ backgroundColor: s.value }}
                    />
                    <span className="text-[10px] font-mono text-stone hover:text-parchment">
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </Reveal>
          )}
        </div>

        {/* Right Side: Product Details & Specs Table (cols 5) */}
        <div className="lg:col-span-5 space-y-8">
          <Reveal className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono tracking-widest text-brass border border-brass/40 px-2 py-0.5 rounded-sm uppercase">
                {product.category}
              </span>
              <span className="text-[9px] font-mono text-stone-dim uppercase">
                {product.vertical} Collection
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-display font-medium text-parchment">
              {product.name}
            </h1>
            <p className="text-stone-dim text-sm leading-relaxed">
              {product.description}
            </p>
          </Reveal>

          {/* Specs Table */}
          <Reveal className="border border-line rounded-sm overflow-hidden" delay={100}>
            <div className="bg-ink-2 px-5 py-3 border-b border-line flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brass" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-parchment">Technical Specifications</span>
            </div>
            <table className="w-full border-collapse text-left text-xs font-mono text-stone divide-y divide-line/40">
              <tbody className="divide-y divide-line/30">
                {Object.entries(specs).map(([key, val]) => (
                  <tr key={key} className="hover:bg-ink-2/30 transition-colors">
                    <td className="p-4 bg-ink-2/20 text-stone-dim uppercase tracking-wider font-semibold w-1/3">{key}</td>
                    <td className="p-4 text-parchment font-sans">{val as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          {/* Application suitability & certifications */}
          <Reveal className="grid grid-cols-2 gap-4 border-t border-line/60 pt-6" delay={150}>
            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="w-5 h-5 text-ember-light flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="block text-[10px] font-mono tracking-wider uppercase text-brass">Certified Core</span>
                <span className="block text-[11px] text-stone-dim leading-snug font-sans">CARB Phase-2 &amp; FSC certified sustainable sourcing.</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <Layers className="w-5 h-5 text-ember-light flex-shrink-0" />
              <div className="space-y-0.5">
                <span className="block text-[10px] font-mono tracking-wider uppercase text-brass">Applications</span>
                <span className="block text-[11px] text-stone-dim leading-snug font-sans">{product.applications}</span>
              </div>
            </div>
          </Reveal>

          {/* Action CTAs */}
          <Reveal className="flex flex-col sm:flex-row gap-4" delay={200}>
            <button 
              onClick={requestSample}
              className="flex-grow bg-ember hover:bg-ember-light text-parchment text-xs font-mono tracking-widest uppercase py-4 rounded-sm transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              {sampleOrdered ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Requested successfully
                </>
              ) : (
                'Request Physical Sample'
              )}
            </button>
            <button 
              onClick={() => openBrochure(product.vertical)}
              className="border border-line hover:border-stone text-stone-dim hover:text-parchment text-xs font-mono tracking-widest uppercase py-4 px-6 rounded-sm transition-colors text-center cursor-pointer"
            >
              Download PDF Spec
            </button>
          </Reveal>

        </div>

      </div>

    </div>
  );
}
