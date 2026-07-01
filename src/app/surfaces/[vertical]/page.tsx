'use client';

import React, { useEffect, useState, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ChevronRight, HelpCircle, FileDown, CheckCircle, Info, ChevronDown } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import Reveal from '@/components/Reveal';
import TextureExplorer from '@/components/TextureExplorer';

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  specs: string; // JSON string
  applications: string;
  isFeatured: boolean;
};

type FAQItem = {
  q: string;
  a: string;
};

export default function VerticalHub({ params }: { params: Promise<{ vertical: string }> }) {
  const router = useRouter();
  const { openBrochure } = useModal();
  
  // Unwrap the params promise using React.use()
  const { vertical } = use(params);
  const verticalKey = vertical.toLowerCase();
  
  const validVerticals = ['plywood', 'laminates', 'veneer', 'decoratives'];
  if (!validVerticals.includes(verticalKey)) {
    notFound();
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  const [media, setMedia] = useState({ mediaType: 'image', mediaUrl: '' });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  
  // Accordion state for FAQs
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // Enquiry form state
  const [enquiry, setEnquiry] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products for this vertical
        const prodRes = await fetch(`/api/products?vertical=${verticalKey}`);
        const prodData = await prodRes.json();
        if (prodData.success) {
          setProducts(prodData.products);
          
          // Extract unique categories
          const cats = ['All', ...new Set(prodData.products.map((p: Product) => p.category))] as string[];
          setCategories(cats);
        }

        // Fetch page copy content
        const contentRes = await fetch(`/api/page-content?page=${verticalKey}`);
        const contentData = await contentRes.json();
        if (contentData.success) setContent(contentData.content);

        // Fetch hero media
        const mediaRes = await fetch('/api/media');
        const mediaData = await mediaRes.json();
        if (mediaData.success && mediaData.media[verticalKey]) {
          setMedia(mediaData.media[verticalKey]);
        }
      } catch (err) {
        console.error('Failed to load vertical page data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [verticalKey]);

  // Submit direct quote/enquiry
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...enquiry,
          interestArea: verticalKey.toUpperCase(),
          persona: 'Other', // default fallback, can be updated in full quote flow
        }),
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setEnquiry({ name: '', email: '', phone: '', message: '', company: '' });
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. DATA DICTIONARIES (Fallback Static Content from Prompt copy)
  const meta: Record<string, {
    title: string;
    subhead: string;
    intro: string;
    specsTableHeaders: string[];
    faqs: FAQItem[];
    crossSellText: string;
    crossSellLink: string;
    crossSellTitle: string;
    heroUrlFallback: string;
  }> = {
    plywood: {
      title: 'The core decision every project is built on.',
      subhead: 'Engineered plywood panels for structural integrity, dead-flat lamination, and long-term dimensional stability.',
      intro: 'Plywood is the part of the project no one sees and everyone depends on. Sitka plywood is manufactured for consistent thickness, superior screw-holding, and a laminating surface that stays true under pressure and time. Whether it is the substrate behind a veneer panel or the structural core of a piece of furniture, the panel underneath has to perform.',
      specsTableHeaders: ['Grade', 'Core Type', 'Thickness Range', 'Bonding', 'Certification'],
      heroUrlFallback: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1600&q=80',
      faqs: [
        { q: 'What is the difference between MR and BWR grade?', a: 'MR (Moisture Resistant) plywood handles everyday interior humidity; BWR (Boiling Water Resistant) is tested for prolonged water exposure, making it the standard for modular kitchens and bathroom cabinets.' },
        { q: 'Can Sitka Plywood be used for exterior applications?', a: 'Yes — our Marine Grade IS 710 range is manufactured specifically for continuous outdoor exposure, marine facades, and constant moisture contact.' },
        { q: 'What thicknesses are available?', a: 'Standard stocked thicknesses range from 6mm to 25mm (6mm, 9mm, 12mm, 16mm, 19mm, 25mm). Custom thickness sheets are available for bulk commercial orders.' },
        { q: 'What certifications does Sitka Plywood carry?', a: 'All our core plywood ranges are FSC certified, CARB Phase 2 compliant, and satisfy E1 emission standards for indoor air quality.' }
      ],
      crossSellTitle: 'Complementary Surfaces',
      crossSellText: 'Plywood is only as good as what covers it — Pair with Sitka Veneer for a real-wood face, or Sitka Laminates for a durable, low-maintenance surface.',
      crossSellLink: '/surfaces/laminates'
    },
    laminates: {
      title: 'Surfaces built for the hands that use them every day.',
      subhead: 'High-pressure laminates engineered for durability, color consistency, and finish variety — from matte stone to high-gloss woodgrains.',
      intro: 'Laminates are the surface layer that takes the daily impact — countertops, cabinet fronts, tabletops, and wall panels. Sitka Laminates are pressed for scratch resistance, heat tolerance, and color that does not drift between sheets. The range spans wood-grain realism to bold solid colors.',
      specsTableHeaders: ['Finish Type', 'Thickness', 'Gloss Level', 'Scratch Resistance', 'Ideal Use'],
      heroUrlFallback: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
      faqs: [
        { q: 'What is the difference between standard laminate and compact laminate?', a: 'Standard laminate is a 1mm sheet bonded to a substrate like plywood; compact laminate is self-supporting (usually 6mm to 18mm) and does not need a core panel. Ideal for washroom partitions and thin profile countertops.' },
        { q: 'Do high-gloss finishes show fingerprints more?', a: 'Yes, gloss reflects light directly. For high-touch areas, we recommend our Super-Matte and Suede finishes which incorporate anti-fingerprint and scratch-resistant coatings.' },
        { q: 'Can laminates be used outdoors?', a: 'Select ranges of our Compact Laminates are UV-stabilized and weather-resistant, certified for exterior building cladding and rain-screens.' }
      ],
      crossSellTitle: 'Underneath the Surface',
      crossSellText: 'Every laminate requires a solid substrate — get flat, stable lamination by bonding to our high-strength Sitka Plywood cores.',
      crossSellLink: '/surfaces/plywood'
    },
    veneer: {
      title: 'Real wood, without the guesswork.',
      subhead: 'Natural wood veneers sliced and sequenced for grain-true consistency across every feature panel.',
      intro: 'Veneer is where material honesty matters most — the grain, the figure, and the way light moves across it is either right or it is not. Sitka Veneer is sliced from carefully selected logs and sequence-matched so an entire wall paneling set or door run reads as one continuous piece of timber.',
      specsTableHeaders: ['Species', 'Cut Type', 'Backer Options', 'Panel Match', 'State'],
      heroUrlFallback: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1600&q=80',
      faqs: [
        { q: 'Will veneer grain match exactly across my order?', a: 'Natural wood varies. For strict consistency across huge commercial spaces, we sequence-match raw sheets from the same log or offer Reconstructed/Engineered Veneer.' },
        { q: 'What is the difference between rotary, quarter, and rift cut?', a: 'Rotary cut yields broad cathedral grain; quarter cut gives straight linear grain with light flecking; rift cut sits between the two with a tight straight pattern. Each cut suits a different style.' },
        { q: 'Does veneer need to be sealed on-site?', a: 'Our natural veneers ship raw (sanded and backed) and require sealing/polishing after installation. We also stock prefinished panels for quick installations.' }
      ],
      crossSellTitle: 'Structural Substrate',
      crossSellText: 'Ensure your wood panelling remains dead-flat — veneer is only as good as the substrate. Combine with Sitka BWP Plywood.',
      crossSellLink: '/surfaces/plywood'
    },
    decoratives: {
      title: 'The finishing details that make a space feel resolved.',
      subhead: 'Decorative surfaces, edgebanding, and specialty panels for the details that separate finished from done.',
      intro: 'Decoratives covers everything that happens at the edges and highlights of a project. Edgebanding that blends into the surface panel it is protecting. Specialty textured surfaces — metallics, fabrics, soundproofing acoustic panels — for the feature sections that need to stand apart.',
      specsTableHeaders: ['Product Type', 'Material Base', 'Thickness', 'Application', 'Matching Range'],
      heroUrlFallback: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1600&q=80',
      faqs: [
        { q: 'Can edgebanding be matched exactly to standard laminate sheets?', a: 'Yes — every decorative edgeband we sell is cross-referenced by SKU to match the color, sheen, and woodgrain print of our Laminate and Veneer ranges.' },
        { q: 'What sound absorption properties do acoustic panels have?', a: 'Our ribbed wood slats are backed by 9mm recycled PET felt, achieving a high Noise Reduction Coefficient (NRC) rating of 0.82.' }
      ],
      crossSellTitle: 'Core Surfaces',
      crossSellText: 'Decoratives is designed to blend into or accent other collections. Start with your Laminate or Veneer selection and we will match the detail.',
      crossSellLink: '/surfaces/veneer'
    }
  };

  const vInfo = meta[verticalKey];

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const displayHeroUrl = media.mediaUrl || vInfo.heroUrlFallback;

  return (
    <div className="w-full">
      {/* 1. HERO HEADER SECTION */}
      <section className="relative min-h-[60vh] flex flex-col justify-center py-24 md:py-32 bg-ink">
        <div className="absolute inset-0 z-0">
          {media.mediaType === 'video' ? (
            <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20 filter saturate-50">
              <source src={displayHeroUrl} type="video/mp4" />
            </video>
          ) : (
            <img src={displayHeroUrl} alt={verticalKey} className="w-full h-full object-cover opacity-25 filter saturate-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-[#15120F]/95" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full space-y-5">
          <span className="text-xs font-mono tracking-widest text-brass uppercase block">
            Material Vertical
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-medium text-parchment leading-tight max-w-3xl capitalize">
            {verticalKey}: {vInfo.title}
          </h1>
          <p className="text-stone text-base max-w-xl leading-relaxed">
            {vInfo.subhead}
          </p>
        </div>
      </section>

      {/* 2. CATEGORY INTRO STRIP */}
      <section className="bg-ink border-t border-line/60 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Reveal className="lg:col-span-8 space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase">Overview</span>
            <p className="text-stone text-base md:text-lg leading-relaxed">
              {vInfo.intro}
            </p>
          </Reveal>
          <Reveal className="lg:col-span-4 lg:pl-10 space-y-4" delay={100}>
            <span className="text-[10px] font-mono tracking-widest text-stone-dim uppercase block">Downloads</span>
            <button 
              onClick={() => openBrochure(verticalKey)}
              className="w-full border border-brass hover:border-ember hover:bg-ember text-parchment py-4 px-6 rounded-sm text-xs font-mono tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4" /> Download {verticalKey} Guide
            </button>
          </Reveal>
        </div>
      </section>

      {/* 3. PRODUCT RANGE GRID (WITH FILTER) */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <Reveal className="flex justify-between items-end gap-6 flex-wrap">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-brass uppercase">Product Catalog</span>
              <h2 className="text-2xl md:text-3xl font-display font-medium text-parchment">The {verticalKey} Range</h2>
            </div>
            
            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 px-4 rounded-sm text-[10px] font-mono tracking-wider uppercase border transition-all duration-300 cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-ember border-ember text-parchment' 
                      : 'border-line text-stone-dim hover:border-stone-dim/60 hover:text-stone'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Products Grid */}
          <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" delay={100}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const specs = JSON.parse(p.specs || '{}');
                return (
                  <div 
                    key={p.id}
                    className="border border-line bg-ink-2 p-6 md:p-8 rounded-sm space-y-5 hover:border-brass/30 transition-colors duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono tracking-widest text-brass uppercase">
                          {p.category}
                        </span>
                        {p.isFeatured && (
                          <span className="text-[8px] bg-ember/15 text-ember-light font-mono px-1.5 py-0.5 rounded-sm">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-display font-semibold text-parchment">
                        {p.name}
                      </h3>
                      <p className="text-stone-dim text-xs leading-relaxed font-sans normal-case">
                        {p.description}
                      </p>
                      
                      {/* Short specs block */}
                      <div className="bg-ink/50 border border-line/40 rounded-sm p-3 space-y-1.5 text-[10px] font-mono text-stone-dim">
                        {Object.entries(specs).slice(0, 3).map(([key, val]) => (
                          <div key={key} className="flex justify-between gap-4 border-b border-line/20 pb-1 last:border-b-0 last:pb-0">
                            <span className="uppercase tracking-wider">{key}</span>
                            <span className="text-parchment text-right">{val as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Link 
                      href={`/surfaces/${verticalKey}/${p.slug}`}
                      className="text-[10px] font-mono tracking-wider uppercase text-ember-light hover:text-ember transition-colors flex items-center gap-1.5 pt-4 border-t border-line/30"
                    >
                      View Technical Specs <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full border border-dashed border-line p-12 text-center text-stone-dim text-sm">
                No products found matching the selected category.
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* 4. SPECIFICATION COMPARISON TABLE */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <Reveal className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase">Specifications</span>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-parchment">Comparison Matrix</h2>
          </Reveal>
          
          <Reveal className="overflow-x-auto border border-line rounded-sm custom-scrollbar" delay={100}>
            <table className="w-full border-collapse text-left text-xs font-mono tracking-wide text-stone">
              <thead>
                <tr className="bg-ink-2 border-b border-line text-brass uppercase tracking-wider">
                  <th className="p-4 md:p-5 font-semibold">Product Name</th>
                  {vInfo.specsTableHeaders.map((header) => (
                    <th key={header} className="p-4 md:p-5 font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {products.map((p) => {
                  const specs = JSON.parse(p.specs || '{}');
                  return (
                    <tr key={p.id} className="hover:bg-ink-2/30 transition-colors">
                      <td className="p-4 md:p-5 font-sans font-semibold text-parchment">{p.name}</td>
                      {vInfo.specsTableHeaders.map((header) => (
                        <td key={header} className="p-4 md:p-5 text-stone-dim">
                          {specs[header] || specs[header.toLowerCase()] || '-'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* 5. TEXTURE EXPLORER Swatch Viewer */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <Reveal className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase">Interactive Swatch</span>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-parchment">Detail Inspector</h2>
          </Reveal>
          <Reveal delay={100}>
            <TextureExplorer verticalName={verticalKey} />
          </Reveal>
        </div>
      </section>

      {/* 6. FAQ ACCORDION SECTION */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32" id="faq">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <Reveal className="text-center space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase block">Knowledge Base</span>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-parchment">Frequently Asked Questions</h2>
          </Reveal>

          {/* Accordion List */}
          <Reveal className="space-y-4" delay={100}>
            {vInfo.faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div 
                  key={idx}
                  className="border border-line bg-ink-2 rounded-sm transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 font-display font-medium text-parchment text-sm md:text-base cursor-pointer focus:outline-none"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-brass flex-shrink-0" />
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-stone-dim transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-[200px] border-t border-line/45' : 'max-h-0'
                  }`}>
                    <p className="p-5 md:p-6 text-xs md:text-sm text-stone-dim leading-relaxed font-sans normal-case">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* 7. CROSS-SELL STRIP */}
      <section className="bg-ink-2 border-t border-b border-line py-16 text-center select-none relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-brass uppercase block">{vInfo.crossSellTitle}</span>
          <p className="text-parchment text-sm max-w-xl mx-auto leading-relaxed">
            {vInfo.crossSellText}
          </p>
          <Link 
            href={vInfo.crossSellLink}
            className="text-xs font-mono tracking-wider uppercase text-ember-light hover:text-ember transition-colors inline-flex items-center gap-1 mt-2"
          >
            Explore Next Collection <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 8. INLINE ENQUIRY FORM */}
      <section className="bg-ink py-24 md:py-32">
        <div className="max-w-xl mx-auto px-6 border border-line bg-ink-2 p-8 md:p-10 rounded-sm space-y-6">
          <div className="space-y-1.5 text-center">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase block">Request a Quote</span>
            <h3 className="text-xl md:text-2xl font-display font-medium text-parchment">
              Get {verticalKey} specifications
            </h3>
            <p className="text-stone-dim text-xs leading-relaxed">
              Tell us about your project scale and species details, and a materials specialist will reply in one business day.
            </p>
          </div>

          {submitSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-sm text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Thank you — your enquiry has been recorded!
            </div>
          )}

          <form onSubmit={handleEnquirySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim">Full Name *</label>
                <input 
                  type="text" 
                  value={enquiry.name}
                  onChange={(e) => setEnquiry(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                  placeholder="John Architect"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim">Studio / Company</label>
                <input 
                  type="text" 
                  value={enquiry.company}
                  onChange={(e) => setEnquiry(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                  placeholder="Spatia Studio"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim">Email Address *</label>
                <input 
                  type="email" 
                  value={enquiry.email}
                  onChange={(e) => setEnquiry(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                  placeholder="john@spatia.com"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim">Phone Number *</label>
                <input 
                  type="tel" 
                  value={enquiry.phone}
                  onChange={(e) => setEnquiry(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                  placeholder="+91 98765..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim">Your Requirement / Spec list *</label>
              <textarea 
                value={enquiry.message}
                onChange={(e) => setEnquiry(prev => ({ ...prev, message: e.target.value }))}
                required
                rows={4}
                className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                placeholder="We require 40 sheets of 19mm Gurjan core plywood and book-matched walnut veneer panel sets for a lobby wall..."
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-ember text-parchment py-3.5 mt-2 rounded-sm text-[10px] font-mono tracking-wider uppercase hover:bg-ember-light transition-colors duration-300 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Sending...' : 'Send Enquiry'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
