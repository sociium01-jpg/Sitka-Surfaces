'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { useTheme } from '@/context/ThemeContext';

export default function Nav() {
  const pathname = usePathname();
  const { openBrochure } = useModal();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on path changes
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Inspiration', href: '/inspiration' },
    { name: 'About', href: '/about' },
    { name: 'Journal', href: '/journal' },
    { name: 'Contact', href: '/contact' },
  ];

  const verticals = [
    { name: 'Plywood', desc: 'Engineered cores for structural strength.', href: '/surfaces/plywood' },
    { name: 'Laminates', desc: 'Durable surface layers for heavy contact.', href: '/surfaces/laminates' },
    { name: 'Veneer', desc: 'Real wood grain, sequenced & sliced thin.', href: '/surfaces/veneer' },
    { name: 'Decoratives', desc: 'Specialty panels, acoustic slats & edgebands.', href: '/surfaces/decoratives' },
  ];

  const isDarkBg = pathname === '/' || pathname.startsWith('/surfaces/') || pathname === '/about';
  const isDarkFamily = theme === 'dark' || theme === 'modern' || theme === 'onyx';

  const togglePrimaryTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-100 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-500 ${
      scrolled 
        ? 'bg-ink/90 border-b border-line/50 backdrop-blur-md shadow-lg py-4' 
        : isDarkBg ? 'bg-gradient-to-b from-[#15120F]/90 to-transparent' : 'bg-parchment/90 border-b border-line/20 backdrop-blur-md py-4'
    }`}>
      {/* Logo */}
      <Link 
        href="/" 
        className={`font-display font-bold text-lg md:text-xl tracking-wider select-none transition-colors duration-500 ${
          isDarkFamily ? 'text-white opacity-100' : 'text-parchment'
        }`}
      >
        SITKA <span className="text-ember-light">SURFACES</span>
      </Link>

      {/* Desktop Links */}
      <nav className="hidden min-[901px]:flex items-center gap-8 text-xs font-mono tracking-wider uppercase">
        {/* Surfaces Dropdown */}
        <div 
          className="relative"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button className={`flex items-center gap-1.5 transition-all cursor-pointer pb-2 pt-2 ${
            pathname.startsWith('/surfaces/') 
              ? 'text-ember-light font-medium' 
              : isDarkFamily 
                ? 'text-white opacity-100' 
                : 'text-stone hover:text-parchment'
          }`}>
            Surfaces <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mega Dropdown */}
          <div className={`absolute top-full -left-20 w-[420px] bg-ink-2 border border-line rounded-sm p-5 shadow-2xl transition-all duration-300 transform origin-top-left ${
            dropdownOpen 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}>
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase mb-3 pb-1.5 border-b border-line/40">
              Product Verticals
            </span>
            <div className="grid grid-cols-2 gap-4">
              {verticals.map((v) => (
                <Link 
                  key={v.name}
                  href={v.href} 
                  className="group block p-2 hover:bg-ink/40 rounded-sm transition-colors"
                >
                  <span className="block text-xs font-semibold text-parchment group-hover:text-ember-light transition-colors mb-0.5">
                    {v.name}
                  </span>
                  <span className="block text-[10px] text-stone-dim leading-relaxed group-hover:text-stone transition-colors font-sans normal-case tracking-normal">
                    {v.desc}
                  </span>
                </Link>
              ))}
            </div>
            <Link 
              href="/surfaces/plywood" 
              className="mt-4 flex items-center justify-center gap-1.5 bg-ink py-2 text-[10px] font-mono text-brass hover:text-parchment hover:bg-ember/25 transition-all duration-300 rounded-sm"
            >
              Browse All Collections <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`transition-all cursor-pointer relative pb-2 pt-2 ${
                isActive 
                  ? 'text-ember-light font-medium' 
                  : isDarkFamily 
                    ? 'text-white opacity-100' 
                    : 'text-stone hover:text-parchment'
              }`}
            >
              {link.name}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-ember-light animate-expand-width" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Action Button & Theme Pill */}
      <div className="hidden min-[901px]:flex items-center gap-4">
        {/* Sun/Moon toggle pill */}
        <button
          onClick={togglePrimaryTheme}
          className="p-2 border border-line bg-ink-2/80 hover:bg-ink text-stone hover:text-parchment transition-all duration-300 rounded-sm cursor-pointer flex items-center justify-center"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </button>

        <button 
          onClick={() => openBrochure('All')}
          className="border border-brass hover:border-ember hover:bg-ember text-parchment text-[10px] font-mono tracking-widest uppercase py-2 px-5 rounded-sm transition-all duration-300 cursor-pointer"
        >
          Download Brochure
        </button>
      </div>

      {/* Mobile Nav Trigger & Theme Toggle */}
      <div className="flex items-center gap-3 min-[901px]:hidden">
        <button
          onClick={togglePrimaryTheme}
          className="p-1.5 border border-line bg-ink-2/80 text-stone rounded-sm cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-stone hover:text-parchment p-1 transition-colors z-110"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar overlay */}
      <div className={`fixed inset-0 bg-ink/95 z-105 flex flex-col justify-center px-8 space-y-8 min-[901px]:hidden transition-all duration-500 transform ${
        isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
      }`}>
        <span className="text-[10px] font-mono tracking-widest text-brass uppercase">
          Navigation Menu
        </span>
        <nav className="flex flex-col gap-6 text-xl font-display font-medium text-parchment">
          <Link href="/" className="hover:text-ember-light transition-colors">
            Home
          </Link>
          
          <div className="border-t border-b border-line/30 py-4 space-y-3">
            <span className="block text-[10px] font-mono tracking-wider text-stone-dim uppercase">
              Material Worlds
            </span>
            <div className="grid grid-cols-2 gap-3 text-base font-sans font-normal">
              {verticals.map((v) => (
                <Link key={v.name} href={v.href} className="hover:text-ember-light transition-colors">
                  {v.name}
                </Link>
              ))}
            </div>
          </div>

          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-ember-light transition-colors">
              {link.name}
            </Link>
          ))}
        </nav>

        <button 
          onClick={() => {
            setIsOpen(false);
            openBrochure('All');
          }}
          className="bg-ember hover:bg-ember-light text-parchment text-xs font-mono tracking-wider uppercase py-4 rounded-sm transition-colors text-center w-full"
        >
          Download Material Guide
        </button>
      </div>
    </header>
  );
}
