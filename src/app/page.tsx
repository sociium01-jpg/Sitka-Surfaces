'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Volume2 } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import Reveal from '@/components/Reveal';
import MaterialDeck from '@/components/MaterialDeck';
import TestimonialsMarquee from '@/components/TestimonialsMarquee';
import Counter from '@/components/Counter';
import LaminateToWoodButton from '@/components/LaminateToWoodButton';
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('@/components/Hero3D'), { ssr: false });
const ThreeInspector = dynamic(() => import('@/components/ThreeInspector'), { ssr: false });
const Visualizer = dynamic(() => import('@/components/Visualizer'), { ssr: false });

type PageContentMap = Record<string, string>;

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
};

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
};

export default function Home() {
  const { openBrochure } = useModal();
  const [content, setContent] = useState<PageContentMap>({});
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [media, setMedia] = useState({ mediaType: 'image', mediaUrl: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch copy contents
        const contentRes = await fetch('/api/page-content?page=home');
        const contentData = await contentRes.json();
        if (contentData.success) setContent(contentData.content);

        // Fetch latest posts (limit 3)
        const postsRes = await fetch('/api/posts');
        const postsData = await postsRes.json();
        if (postsData.success) setPosts(postsData.posts.slice(0, 3));

        // Fetch testimonials
        const testiRes = await fetch('/api/testimonials');
        const testiData = await testiRes.json();
        if (testiData.success) setTestimonials(testiData.testimonials);

        // Fetch hero media
        const mediaRes = await fetch('/api/media');
        const mediaData = await mediaRes.json();
        if (mediaData.success && mediaData.media.home) {
          setMedia(mediaData.media.home);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Default fallback copy if DB query is still loading or empty
  const c = {
    hero_eyebrow: content['hero_eyebrow'] || 'Sitka Surfaces',
    hero_headline: content['hero_headline'] || 'Every surface tells you what a space is made of.',
    hero_subhead: content['hero_subhead'] || 'Plywood, laminates, veneer, and decoratives engineered for architects and designers who refuse to compromise on how a material looks, feels, and lasts.',
    hero_microtext: content['hero_microtext'] || 'Trusted by studios and fabricators across 40 cities.',
    manifesto_headline: content['manifesto_headline'] || "We don't sell sheets. We sell decisions that outlast the project.",
    manifesto_body: content['manifesto_body'] || "A material choice made today gets looked at, touched, and lived with for the next twenty years. Sitka Surfaces exists for the moment an architect runs a hand across a sample and knows, immediately, that it's right. Four material worlds — Plywood, Laminates, Veneer, Decoratives — built on the same standard: consistent stock, honest specifications, and finishes that hold their character under real-world use.",
    stats_years: content['stats_years'] || '18+',
    stats_finishes: content['stats_finishes'] || '300+',
    stats_projects: content['stats_projects'] || '2400+',
    stats_cities: content['stats_cities'] || '40',
  };

  const yearsVal = parseInt(c.stats_years.replace(/[^0-9]/g, '')) || 18;
  const finishesVal = parseInt(c.stats_finishes.replace(/[^0-9]/g, '')) || 300;
  const projectsVal = parseInt(c.stats_projects.replace(/[^0-9]/g, '')) || 2400;
  const citiesVal = parseInt(c.stats_cities.replace(/[^0-9]/g, '')) || 40;

  const projectCards = [
    {
      title: 'Amber House Residence',
      city: 'Bangalore',
      materials: 'Veneer · Laminates',
      desc: 'A full-floor renovation using book-matched walnut veneer panelling against a matte laminate kitchen run.',
      imgUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Northline Studio Office',
      city: 'Mumbai',
      materials: 'Plywood · Decoratives',
      desc: 'An open-plan workspace built entirely on flexible plywood millwork with matched edgebanding detail.',
      imgUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Cedar Point Hospitality',
      city: 'Goa',
      materials: 'Laminates',
      desc: 'Compact laminate specified across 60 rooms for a consistent, high-durability finish at scale.',
      imgUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Harbor Lobby Panelling',
      city: 'Kochi',
      materials: 'Veneer',
      desc: 'Sequence-matched oak veneer wraps a 40ft lobby wall without a single visible seam.',
      imgUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center py-32 md:py-40 overflow-hidden bg-ink">
        <Hero3D />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/75 pointer-events-none z-1" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full space-y-6">
          <span className="text-xs font-mono tracking-widest text-brass uppercase block animate-fade-in-down">
            {c.hero_eyebrow}
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-medium text-parchment leading-[1.05] max-w-4xl tracking-tight select-none">
            Every surface tells you what a space is <em className="font-serif italic font-normal text-ember-light">made of</em>.
          </h1>
          <p className="text-stone text-base md:text-lg max-w-xl leading-relaxed font-sans font-normal">
            {c.hero_subhead}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-6">
            <Link 
              href="#surfaces" 
              className="bg-ember hover:bg-ember-light text-parchment text-xs font-mono tracking-wider uppercase py-4 px-8 rounded-sm transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Explore Surfaces
            </Link>
            <button 
              onClick={() => openBrochure('All')}
              className="border-b border-stone-dim hover:border-parchment text-stone hover:text-parchment text-xs font-mono tracking-widest uppercase py-4 px-2 transition-colors duration-300 cursor-pointer"
            >
              Download Material Guide →
            </button>
          </div>

          {/* Trusted Footer tag */}
          <p className="text-[10px] md:text-xs text-stone-dim font-mono uppercase tracking-wider pt-8">
            {c.hero_microtext}
          </p>
        </div>
      </section>

      {/* 2. MANIFESTO & STATS STRIP */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <Reveal className="lg:col-span-7 space-y-6">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase">Our Standard</span>
            <h2 className="text-2xl md:text-4xl font-display font-medium text-parchment leading-snug">
              {c.manifesto_headline}
            </h2>
            <p className="text-stone-dim text-sm md:text-base leading-relaxed max-w-xl">
              {c.manifesto_body}
            </p>
          </Reveal>
          
          <Reveal className="lg:col-span-5 grid grid-cols-2 gap-8 md:gap-12" delay={150}>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-display font-medium text-ember-light">
                <Counter target={yearsVal} suffix="+" />
              </div>
              <p className="text-[10px] md:text-xs text-stone-dim font-mono uppercase tracking-wider">Years engineering surfaces</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-display font-medium text-ember-light">
                <Counter target={finishesVal} suffix="+" />
              </div>
              <p className="text-[10px] md:text-xs text-stone-dim font-mono uppercase tracking-wider">Finishes &amp; species</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-display font-medium text-ember-light">
                <Counter target={projectsVal} suffix="+" />
              </div>
              <p className="text-[10px] md:text-xs text-stone-dim font-mono uppercase tracking-wider">Projects specified</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-display font-medium text-ember-light">
                <Counter target={citiesVal} suffix="" />
              </div>
              <p className="text-[10px] md:text-xs text-stone-dim font-mono uppercase tracking-wider">Cities served</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. INTERACTIVE MATERIAL DECK SECTION */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32" id="surfaces">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <Reveal className="max-w-xl space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase">The Collection</span>
            <h2 className="text-3xl md:text-5xl font-display font-medium text-parchment">Four materials. One standard.</h2>
            <p className="text-stone-dim text-sm leading-relaxed">
              Drag or click through the deck to examine specs. Replicate the experience of flipping samples at a site briefing table.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <MaterialDeck />
          </Reveal>
        </div>
      </section>

      {/* 3.1. INSPECT IN 3D SECTION */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32" id="inspector">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <Reveal className="max-w-xl space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase">3D Spec Viewer</span>
            <h2 className="text-3xl md:text-5xl font-display font-medium text-parchment">Inspect Core &amp; Grain Structure</h2>
            <p className="text-stone-dim text-sm leading-relaxed">
              Examine veneer ply layering or solid surface finishes. Drag to inspect the physical core structure under high detail.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <ThreeInspector />
          </Reveal>
        </div>
      </section>

      {/* 3.2. INTERACTIVE ROOM VISUALIZER */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32" id="visualizer">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <Reveal className="max-w-xl space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase">Material Visualizer</span>
            <h2 className="text-3xl md:text-5xl font-display font-medium text-parchment">Interactive Interior Visualizer</h2>
            <p className="text-stone-dim text-sm leading-relaxed">
              Apply various plywood cores, high-pressure laminates, and woodgrain veneers directly to the cabinet, flooring, countertop, or feature wall.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <Visualizer />
          </Reveal>
        </div>
      </section>

      {/* 4. WHY SITKA GRID */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <Reveal className="max-w-xl space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase">Engineered Specifications</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-parchment">What &ldquo;premium&rdquo; actually means here</h2>
          </Reveal>
          
          <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line" delay={150}>
            <div className="bg-ink p-8 space-y-4 hover:bg-ink-2/30 transition-colors duration-300">
              <span className="text-[10px] font-mono tracking-widest text-brass">01</span>
              <h3 className="text-base font-display font-semibold text-parchment">Consistent Stock</h3>
              <p className="text-stone-dim text-xs leading-relaxed">
                What you specify is what ships. Precise batch-to-batch color and grain matching so a reorder months later matches exactly.
              </p>
            </div>
            <div className="bg-ink p-8 space-y-4 hover:bg-ink-2/30 transition-colors duration-300">
              <span className="text-[10px] font-mono tracking-widest text-brass">02</span>
              <h3 className="text-base font-display font-semibold text-parchment">Fabrication Tested</h3>
              <p className="text-stone-dim text-xs leading-relaxed">
                Panels tested for how they machine, router, edge, and press — engineered for execution, not just catalog photography.
              </p>
            </div>
            <div className="bg-ink p-8 space-y-4 hover:bg-ink-2/30 transition-colors duration-300">
              <span className="text-[10px] font-mono tracking-widest text-brass">03</span>
              <h3 className="text-base font-display font-semibold text-parchment">Certified Sourcing</h3>
              <p className="text-stone-dim text-xs leading-relaxed">
                FSC chain-of-custody, BWP boiling water testing, and low-emission E1 compliance across all our core ranges.
              </p>
            </div>
            <div className="bg-ink p-8 space-y-4 hover:bg-ink-2/30 transition-colors duration-300">
              <span className="text-[10px] font-mono tracking-widest text-brass">04</span>
              <h3 className="text-base font-display font-semibold text-parchment">Built for Scale</h3>
              <p className="text-stone-dim text-xs leading-relaxed">
                From a single bespoke home mockup to a multi-city commercial roll-out — consistent stock guarantees timeline security.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. FEATURED PROJECTS HORIZONTAL SCROLL */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32" id="projects">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <Reveal className="flex justify-between items-end gap-6 flex-wrap">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-brass uppercase">Portfolio Lookbook</span>
              <h2 className="text-3xl md:text-4xl font-display font-medium text-parchment">Specified, fabricated, lived in.</h2>
            </div>
            <Link 
              href="/inspiration" 
              className="text-xs font-mono tracking-wider uppercase border-b border-stone-dim hover:border-parchment text-stone hover:text-parchment pb-1 transition-colors"
            >
              View Lookbook Gallery →
            </Link>
          </Reveal>

          {/* Swipeable snap scroll track */}
          <Reveal 
            className="flex gap-6 overflow-x-auto pb-6 scroll-snap-type-x custom-scrollbar snap-x snap-mandatory"
            delay={100}
          >
            {projectCards.map((proj) => (
              <div 
                key={proj.title}
                className="min-w-[290px] sm:min-w-[340px] md:min-w-[400px] bg-ink-2 border border-line rounded-sm overflow-hidden flex-shrink-0 snap-start group"
              >
                <div 
                  className="h-[200px] md:h-[240px] bg-cover bg-center bg-zinc-800 transition-all duration-700 group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url(${proj.imgUrl})` }}
                />
                <div className="p-6 md:p-8 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-mono tracking-wider uppercase text-stone-dim">
                    <span>{proj.materials}</span>
                    <span className="text-brass font-sans normal-case">{proj.city}</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-display font-medium text-parchment group-hover:text-ember-light transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs md:text-sm text-stone-dim leading-relaxed">
                    {proj.desc}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 6. TESTIMONIALS MARQUEE */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <Reveal className="text-center space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase block">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-parchment">
              What the people who spec us have to say
            </h2>
          </Reveal>
        </div>
        
        {/* Infinite Loop Marquee component */}
        <Reveal delay={150}>
          <TestimonialsMarquee testimonials={testimonials} />
        </Reveal>
      </section>

      {/* 7. JOURNAL PREVIEW */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32" id="journal">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <Reveal className="flex justify-between items-end gap-6 flex-wrap">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-brass uppercase">From the Journal</span>
              <h2 className="text-3xl md:text-4xl font-display font-medium text-parchment">Material guides, trends &amp; updates</h2>
            </div>
            <Link 
              href="/journal" 
              className="text-xs font-mono tracking-wider uppercase border-b border-stone-dim hover:border-parchment text-stone hover:text-parchment pb-1 transition-colors"
            >
              Browse All Articles →
            </Link>
          </Reveal>

          {/* Blog Cards Grid */}
          <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-8" delay={150}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link 
                  key={post.id}
                  href={`/journal/${post.slug}`}
                  className="group flex flex-col justify-between p-6 border border-line bg-ink hover:border-brass/35 transition-colors duration-300 min-h-[220px]"
                >
                  <div className="space-y-4">
                    <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">
                      {post.category}
                    </span>
                    <h3 className="text-base font-display font-medium text-parchment group-hover:text-ember-light transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-stone-dim leading-relaxed font-sans normal-case">
                      {post.summary.substring(0, 100)}...
                    </p>
                  </div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-ember-light group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 mt-4">
                    Read Article →
                  </span>
                </Link>
              ))
            ) : (
              /* Fallback default templates if database not seeded */
              <>
                <div className="p-6 border border-line bg-ink space-y-4">
                  <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Material Guides</span>
                  <h3 className="text-base font-display font-medium text-parchment">Plywood, Laminate, or Veneer: How to Actually Choose</h3>
                  <p className="text-xs text-stone-dim leading-relaxed">Every project eventually hits the same question — here&apos;s how to choose and combine surfaces.</p>
                </div>
                <div className="p-6 border border-line bg-ink space-y-4">
                  <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Sustainability</span>
                  <h3 className="text-base font-display font-medium text-parchment">What FSC Certification Actually Means for Your Project</h3>
                  <p className="text-xs text-stone-dim leading-relaxed">A chain of custody, not just a sourcing claim — what to verify before you specify.</p>
                </div>
                <div className="p-6 border border-line bg-ink space-y-4">
                  <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Design Trends</span>
                  <h3 className="text-base font-display font-medium text-parchment">Designing With Grain: A Short Guide to Veneer Matching</h3>
                  <p className="text-xs text-stone-dim leading-relaxed">Book-matched, slip-matched, or random-matched — the decision that makes a wood wall feel intentional.</p>
                </div>
              </>
            )}
          </Reveal>
        </div>
      </section>

      {/* 8. LEAD CAPTURE BAND */}
      <section className="bg-ink border-t border-line/60 py-28 md:py-36 relative overflow-hidden">
        {/* Soft ember focal glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-ember/10 rounded-full blur-[100px] pointer-events-none z-0" />
        
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6 relative z-10">
          <Reveal className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-medium text-parchment leading-tight">
              Get the complete material guide.
            </h2>
            <p className="text-stone text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Specs, finishes, application guidance, and certifications for every Sitka Surfaces range — one download.
            </p>
          </Reveal>
          
          <Reveal className="pt-4" delay={100}>
            <LaminateToWoodButton 
              onClick={() => openBrochure('All')}
              label="Download the Brochure"
              loadingLabel="Preparing PDF..."
            />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
