'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Compass, ShieldCheck, MapPin, Building, ChevronLeft, X, Link as LinkIcon, HelpCircle, Layers } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Project, Block, Finish } from '@/types/visualizer';

// Simple helper to parse basic markdown headings, lists, bold, and paragraphs
function parseMarkdown(md: string = '') {
  const lines = md.split('\n');
  return lines.map((line, idx) => {
    let content = line.trim();
    if (!content) return <div key={idx} className="h-4" />;

    // Headings
    if (content.startsWith('### ')) {
      return <h3 key={idx} className="text-lg md:text-xl font-display font-medium text-parchment mt-6 mb-3">{content.slice(4)}</h3>;
    }
    if (content.startsWith('## ')) {
      return <h2 key={idx} className="text-xl md:text-2xl font-display font-medium text-parchment mt-8 mb-4">{content.slice(3)}</h2>;
    }
    if (content.startsWith('# ')) {
      return <h1 key={idx} className="text-2xl md:text-4xl font-display font-medium text-parchment mt-10 mb-4">{content.slice(2)}</h1>;
    }

    // Bullet points
    if (content.startsWith('- ') || content.startsWith('* ')) {
      return (
        <ul key={idx} className="list-disc list-inside ml-4 my-2 text-stone-dim text-sm space-y-1">
          <li>{content.slice(2)}</li>
        </ul>
      );
    }

    // Quotes
    if (content.startsWith('> ')) {
      return (
        <blockquote key={idx} className="border-l-2 border-brass pl-4 py-1.5 my-4 italic text-stone text-sm normal-case bg-ink-2/30 rounded-r-sm">
          {content.slice(2)}
        </blockquote>
      );
    }

    // Default paragraph with bold replacement
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} className="text-parchment font-semibold">{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return <p key={idx} className="text-sm md:text-base text-stone-dim leading-relaxed mb-4 normal-case font-sans">{parts.length > 0 ? parts : content}</p>;
  });
}

export default function ProjectCaseStudy({ params }: { params: Promise<{ projectSlug: string }> }) {
  const router = useRouter();
  const { projectSlug } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [finishesCatalog, setFinishesCatalog] = useState<Finish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox index states
  const [lightbox, setLightbox] = useState<{ images: { url: string; caption?: string }[]; index: number } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, finRes] = await Promise.all([
          fetch(`/api/projects?slug=${projectSlug}`),
          fetch('/api/visualizer/finishes')
        ]);
        const projData = await projRes.json();
        const finData = await finRes.json();

        if (projData.success) {
          setProject(projData.project);
        } else {
          setError(projData.error || 'Project not found');
        }

        if (finData.success) {
          setFinishesCatalog(finData.finishes || []);
        }
      } catch (err) {
        console.error('Failed to load project details:', err);
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectSlug]);

  if (loading) {
    return (
      <div className="bg-ink min-h-screen flex items-center justify-center text-stone-dim font-mono text-sm">
        Loading case study details...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-ink min-h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-stone-dim font-mono text-sm">{error || 'Project not found'}</p>
        <Link href="/inspiration" className="text-xs font-mono uppercase text-ember-light hover:text-ember">
          Return to Lookbook
        </Link>
      </div>
    );
  }

  // Helper to map finish ID to URL/name
  const getFinishDetails = (id: string) => {
    const f = finishesCatalog.find(item => item.id === id);
    if (!f) return null;
    // Map catalog category to path vertical segment
    let verticalKey = 'plywood';
    if (f.category.toLowerCase().includes('laminate')) verticalKey = 'laminates';
    if (f.category.toLowerCase().includes('veneer')) verticalKey = 'veneer';
    if (f.category.toLowerCase().includes('decor')) verticalKey = 'decoratives';
    return {
      name: f.name,
      category: f.category,
      href: `/surfaces/${verticalKey}/${f.sku.toLowerCase()}`
    };
  };

  // ─── Chart SVG Component ───────────────────────────────────────────
  const RenderChart = ({ chartType, dataSeries, title }: { chartType: string; dataSeries?: any[]; title?: string }) => {
    if (!dataSeries || dataSeries.length < 2) return null;

    const maxVal = Math.max(...dataSeries.map(d => d.value), 1);

    if (chartType === 'bar') {
      return (
        <div className="bg-ink-2 border border-line p-6 rounded-sm space-y-4 w-full">
          {title && <h4 className="text-xs font-mono tracking-wider text-brass uppercase">{title}</h4>}
          <div className="space-y-3.5">
            {dataSeries.map((item, idx) => {
              const pct = (item.value / maxVal) * 100;
              return (
                <div key={idx} className="space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-stone-dim">
                    <span>{item.label}</span>
                    <span className="text-parchment font-semibold">{item.value}</span>
                  </div>
                  <div className="h-2 w-full bg-ink/75 border border-line rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-ember transition-all duration-1000" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (chartType === 'line') {
      const width = 500;
      const height = 200;
      const padding = 40;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      const points = dataSeries.map((d, idx) => {
        const x = padding + (idx / (dataSeries.length - 1)) * chartWidth;
        const y = padding + chartHeight - (d.value / maxVal) * chartHeight;
        return { x, y, label: d.label, val: d.value };
      });

      const pathD = points.reduce((acc, p, idx) => {
        return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
      }, '');

      return (
        <div className="bg-ink-2 border border-line p-6 rounded-sm space-y-4 w-full">
          {title && <h4 className="text-xs font-mono tracking-wider text-brass uppercase mb-2">{title}</h4>}
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-stone-dim">
            {/* Grid line axes */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#2C2825" strokeWidth="1" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#2C2825" strokeWidth="1" />
            
            {/* Trend path line */}
            <path d={pathD} fill="none" stroke="#E05A47" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Highlight nodes */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="4" fill="#F5B800" stroke="#15120F" strokeWidth="1.5" />
                <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] font-mono fill-parchment">{p.val}</text>
                <text x={p.x} y={height - padding + 18} textAnchor="middle" className="text-[8px] font-mono fill-stone-dim">{p.label}</text>
              </g>
            ))}
          </svg>
        </div>
      );
    }

    if (chartType === 'pie') {
      let accumAngle = 0;
      const total = dataSeries.reduce((acc, d) => acc + d.value, 0);

      return (
        <div className="bg-ink-2 border border-line p-6 rounded-sm space-y-4 w-full flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {dataSeries.map((item, idx) => {
                const angle = (item.value / total) * 360;
                const radStart = (accumAngle * Math.PI) / 180;
                const radEnd = ((accumAngle + angle) * Math.PI) / 180;
                
                const x1 = 50 + 40 * Math.cos(radStart);
                const y1 = 50 + 40 * Math.sin(radStart);
                const x2 = 50 + 40 * Math.cos(radEnd);
                const y2 = 50 + 40 * Math.sin(radEnd);

                const largeArc = angle > 180 ? 1 : 0;
                const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
                
                // Cycle colors matching Sitka's visual tokens
                const colors = ['#E05A47', '#F5B800', '#7A8F7A', '#EDE6D8', '#423B36'];
                const color = colors[idx % colors.length];
                accumAngle += angle;

                return <path key={idx} d={pathData} fill={color} stroke="#15120F" strokeWidth="0.8" />;
              })}
            </svg>
          </div>
          <div className="flex-1 space-y-2 font-mono text-xs text-stone-dim">
            {title && <h4 className="text-[10px] tracking-wider text-brass uppercase mb-2">{title}</h4>}
            {dataSeries.map((item, idx) => {
              const colors = ['#E05A47', '#F5B800', '#7A8F7A', '#EDE6D8', '#423B36'];
              const color = colors[idx % colors.length];
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span>{item.label}: <strong className="text-parchment">{item.value}</strong></span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  // ─── Single Block Renderer ─────────────────────────────────────────
  const renderBlock = (b: Block) => {
    switch (b.type) {
      case 'hero':
        const displayImg = b.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
        return (
          <section key={b.id} className="relative min-h-[60vh] flex flex-col justify-center py-24 bg-ink border-b border-line select-none">
            <div className="absolute inset-0 z-0">
              <img src={displayImg} alt={b.title || project.name} className="w-full h-full object-cover opacity-20 filter saturate-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-[#15120F]/95" />
            </div>

            <div className="relative z-10 space-y-6 w-full text-left">
              <div className="flex flex-wrap gap-2 text-[10px] font-mono tracking-widest text-brass uppercase">
                <span>{project.verticals.join(' · ')}</span>
                <span>|</span>
                <span>{project.spaceTypes.join(' · ')}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-medium text-parchment leading-tight max-w-4xl">
                {b.title || project.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-stone">
                {b.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brass" /> {b.location}
                  </span>
                )}
                {b.credit && (
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-brass" /> Design Credit: {b.creditLink ? (
                      <a href={b.creditLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-parchment text-ember-light">{b.credit}</a>
                    ) : b.credit}
                  </span>
                )}
              </div>
            </div>
          </section>
        );

      case 'richText':
        return (
          <div key={b.id} className="py-6 border-b border-line/30 last:border-0">
            {parseMarkdown(b.content)}
          </div>
        );

      case 'image':
        const containerClass = b.layout === 'full-bleed' 
          ? 'w-screen relative left-[50%] right-[50%] -mx-[50vw] h-[60vh]' 
          : 'w-full h-[400px] border border-line rounded-sm';
        return (
          <div key={b.id} className="py-8 space-y-3">
            <div className={`${containerClass} overflow-hidden bg-zinc-950`}>
              <img src={b.imageUrl} alt={b.caption || ''} className="w-full h-full object-cover" />
            </div>
            {b.caption && (
              <p className="text-[10px] font-mono text-stone-dim text-center italic uppercase tracking-wider">{b.caption}</p>
            )}
          </div>
        );

      case 'gallery':
        if (!b.images || b.images.length === 0) return null;
        return (
          <div key={b.id} className="py-8 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {b.images.map((img, index) => (
                <div 
                  key={index} 
                  className="aspect-square border border-line rounded-sm overflow-hidden cursor-zoom-in bg-zinc-900 group"
                  onClick={() => setLightbox({ images: b.images || [], index })}
                >
                  <img 
                    src={img.url} 
                    alt={img.caption || ''} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'video':
        if (!b.source) return null;
        const isEmbed = b.source.includes('youtube') || b.source.includes('vimeo');
        return (
          <div key={b.id} className="py-8 space-y-3">
            <div className="aspect-video w-full border border-line bg-zinc-950 rounded-sm overflow-hidden relative">
              {isEmbed ? (
                /* Privacy enhanced embed player */
                <iframe
                  src={b.source.replace('youtube.com', 'youtube-nocookie.com')}
                  title="Project Video Case Study"
                  className="w-full h-full absolute inset-0"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <video
                  src={b.source}
                  poster={b.poster}
                  autoPlay={b.autoplay}
                  loop={b.loop}
                  muted={b.muted}
                  controls={b.controls !== false}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {b.caption && (
              <p className="text-[10px] font-mono text-stone-dim text-center italic">{b.caption}</p>
            )}
          </div>
        );

      case 'graph':
        return (
          <div key={b.id} className="py-6">
            <RenderChart chartType={b.chartType || 'bar'} dataSeries={b.dataSeries} title={b.title} />
          </div>
        );

      case 'stat':
        return (
          <div key={b.id} className="py-8 border-t border-b border-line/45 my-4 bg-ink-2/30 p-6 md:p-8 rounded-sm text-center space-y-2 select-none">
            <div className="text-4xl md:text-6xl font-display font-medium text-ember-light tracking-tight">{b.value}</div>
            <div className="text-xs font-mono tracking-wider uppercase text-brass">{b.label}</div>
          </div>
        );

      case 'quote':
        return (
          <div key={b.id} className="py-8 border-l-2 border-brass pl-6 italic my-6 font-sans normal-case text-stone-dim text-base leading-relaxed bg-ink-2/45 rounded-r-sm">
            <p className="mb-2">"{b.quoteText}"</p>
            {b.quoteAuthor && <span className="text-xs font-mono tracking-wider uppercase text-brass">— {b.quoteAuthor}</span>}
          </div>
        );

      case 'materialsUsed':
        if (!b.finishIds || b.finishIds.length === 0) return null;
        return (
          <div key={b.id} className="py-8 space-y-4 border-t border-line/25">
            <h4 className="text-[10px] font-mono tracking-wider uppercase text-brass">Spec Details: Materials Used</h4>
            <div className="flex flex-wrap gap-3">
              {b.finishIds.map((id) => {
                const det = getFinishDetails(id);
                if (!det) return null;
                return (
                  <Link
                    key={id}
                    href={det.href}
                    className="border border-line hover:border-brass/50 bg-ink-2 py-2 px-3 rounded-sm text-xs font-mono text-stone hover:text-parchment transition-all flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-brass" />
                    <span>{det.name} ({det.category})</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );

      case 'twoColumn':
        return (
          <div key={b.id} className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-b border-line/25 pb-10">
            <div>{b.leftBlock ? renderBlock(b.leftBlock) : null}</div>
            <div>{b.rightBlock ? renderBlock(b.rightBlock) : null}</div>
          </div>
        );

      case 'cta':
        return (
          <div key={b.id} className="py-12 text-center select-none">
            <button
              onClick={() => {
                // Prefill session & scroll to contact/leads
                if (typeof window !== 'undefined') {
                  const el = document.getElementById('leads-inquiry-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    router.push(`/contact?prefill=${encodeURIComponent(b.prefillNote || '')}`);
                  }
                }
              }}
              className="border border-ember hover:border-ember bg-ember hover:bg-ink text-parchment font-mono py-4 px-8 rounded-sm text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer inline-flex items-center gap-2"
            >
              {b.label || 'Get This Look'} <ChevronRight className="w-4 h-4" />
            </button>
            {b.prefillNote && (
              <p className="text-[10px] font-mono text-stone-dim mt-2 tracking-wide italic">{b.prefillNote}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-ink min-h-screen py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & breadcrumbs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-line/20 pb-6 select-none">
          <Link 
            href="/inspiration"
            className="text-stone hover:text-parchment text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Lookbook
          </Link>

          <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase text-stone-dim">
            <Link href="/" className="hover:text-stone transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/inspiration" className="hover:text-stone transition-colors">Inspiration</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-brass">{project.name}</span>
          </div>
        </div>

        {/* Dynamic Blocks Container */}
        <div className="space-y-6">
          {project.blocks && project.blocks.length > 0 ? (
            project.blocks.map((b) => renderBlock(b))
          ) : (
            <div className="border border-dashed border-line p-16 text-center text-stone-dim font-mono text-sm">
              This case study is currently empty. Add blocks in the admin panel to publish content.
            </div>
          )}
        </div>

      </div>

      {/* Lightbox Modal overlay */}
      {lightbox && (
        <div className="fixed inset-0 bg-ink/95 z-50 flex flex-col justify-center items-center p-4 select-none">
          <button 
            onClick={() => setLightbox(null)}
            className="absolute top-6 right-6 text-stone hover:text-parchment cursor-pointer p-1"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative max-w-4xl max-h-[80vh] flex items-center justify-center">
            {lightbox.images.length > 1 && (
              <button 
                onClick={() => setLightbox({
                  ...lightbox,
                  index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length
                })}
                className="absolute left-[-40px] md:left-[-60px] text-stone hover:text-parchment cursor-pointer p-2 bg-ink/50 border border-line rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <img 
              src={lightbox.images[lightbox.index].url} 
              alt={lightbox.images[lightbox.index].caption || ''} 
              className="max-w-full max-h-[75vh] object-contain border border-line rounded-sm"
            />

            {lightbox.images.length > 1 && (
              <button 
                onClick={() => setLightbox({
                  ...lightbox,
                  index: (lightbox.index + 1) % lightbox.images.length
                })}
                className="absolute right-[-40px] md:right-[-60px] text-stone hover:text-parchment cursor-pointer p-2 bg-ink/50 border border-line rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {lightbox.images[lightbox.index].caption && (
            <p className="text-xs font-mono text-brass uppercase tracking-wider mt-4 text-center">
              {lightbox.images[lightbox.index].caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
