import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function HtmlSitemap() {
  const links = [
    { section: 'Core Pages', items: [
      { name: 'Home', href: '/' },
      { name: 'About Brand', href: '/about' },
      { name: 'Inspiration Gallery', href: '/inspiration' },
      { name: 'Journal/Blog', href: '/journal' },
      { name: 'Request a Quote / Contact', href: '/contact' },
    ]},
    { section: 'Material Worlds (Verticals)', items: [
      { name: 'Plywood Core Hub', href: '/surfaces/plywood' },
      { name: 'Laminates Hub', href: '/surfaces/laminates' },
      { name: 'Natural Veneer Hub', href: '/surfaces/veneer' },
      { name: 'Decoratives & Edging Hub', href: '/surfaces/decoratives' },
    ]},
    { section: 'Utility & Administration', items: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Use', href: '/terms' },
      { name: 'HTML Sitemap', href: '/sitemap' },
      { name: 'Content Administration Portal', href: '/admin' },
    ]}
  ];

  return (
    <div className="bg-ink min-h-screen py-24 md:py-32 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <Link 
          href="/"
          className="text-stone hover:text-parchment text-xs font-mono tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="border-t border-line/45 pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-widest text-brass uppercase block">Index Sitemap</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-parchment">Sitemap</h1>
          <p className="text-stone-dim text-xs font-mono uppercase">Full HTML Structure</p>
        </div>

        <div className="space-y-8 font-sans">
          {links.map((sec, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-xs font-mono tracking-widest text-brass uppercase border-b border-line/20 pb-2">{sec.section}</h3>
              <ul className="space-y-2.5 pl-2">
                {sec.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link 
                      href={item.href}
                      className="text-stone hover:text-ember-light transition-colors text-sm font-medium flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-stone-dim/60" /> {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
