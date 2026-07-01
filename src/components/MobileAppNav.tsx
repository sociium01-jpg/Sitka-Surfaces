'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, Compass, BookOpen, Download } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

export default function MobileAppNav() {
  const pathname = usePathname();
  const { openBrochure } = useModal();

  const appLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Surfaces', href: '/surfaces/plywood', icon: Layers, matchPattern: /^\/surfaces/ },
    { name: 'Inspire', href: '/inspiration', icon: Compass },
    { name: 'Journal', href: '/journal', icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-150 min-[901px]:hidden bg-ink/95 border-t border-line/80 backdrop-blur-md px-2 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex justify-around shadow-2xl">
      {appLinks.map((link) => {
        const Icon = link.icon;
        const isActive = link.matchPattern 
          ? link.matchPattern.test(pathname)
          : pathname === link.href;

        return (
          <Link 
            key={link.name} 
            href={link.href}
            className={`flex flex-col items-center gap-1.5 text-[9px] font-mono tracking-wider uppercase transition-colors duration-300 w-16 ${
              isActive ? 'text-ember-light font-medium' : 'text-stone-dim hover:text-stone'
            }`}
          >
            <div className={`p-1.5 rounded-full transition-all duration-300 ${
              isActive ? 'bg-ember/15 text-ember-light' : 'bg-transparent text-stone-dim'
            }`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            {link.name}
          </Link>
        );
      })}
      
      {/* Brochure Gate Trigger */}
      <button 
        onClick={() => openBrochure('All')}
        className="flex flex-col items-center gap-1.5 text-[9px] font-mono tracking-wider uppercase text-stone-dim hover:text-stone w-16 cursor-pointer"
      >
        <div className="p-1.5 rounded-full bg-transparent text-stone-dim">
          <Download className="w-4.5 h-4.5" />
        </div>
        Guide
      </button>
    </nav>
  );
}
