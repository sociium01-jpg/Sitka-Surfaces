'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

export default function Footer() {
  const { openBrochure } = useModal();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink border-t border-line/60 pt-20 pb-10 md:pb-16 text-stone select-none">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 pb-16 border-b border-line/40">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="font-display font-bold text-lg md:text-xl tracking-wider text-parchment">
              SITKA <span className="text-ember-light">SURFACES</span>
            </Link>
            <p className="text-stone-dim text-sm max-w-sm leading-relaxed">
              Material worlds for architects, designers, and fabricators who build for the long term. Engineered to perform and look pristine for decades.
            </p>
            
            {/* Newsletter Block */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono tracking-wider uppercase text-brass">Material updates, in your inbox</h4>
              <p className="text-stone-dim text-xs">New finishes, project features, and design guides.</p>
              
              {!subscribed ? (
                <form onSubmit={handleSubmit} className="flex max-w-sm border border-line focus-within:border-ember transition-colors">
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="architect@studio.com"
                    className="w-full bg-ink-2 p-3 text-xs text-parchment placeholder-stone-dim/60 focus:outline-none"
                  />
                  <button 
                    type="submit"
                    className="bg-ember hover:bg-ember-light text-parchment p-3 transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2 text-ember-light text-xs font-medium py-1">
                  <CheckCircle className="w-4 h-4" /> Thank you for subscribing!
                </div>
              )}
            </div>
          </div>

          {/* Surfaces Col */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono tracking-wider uppercase text-brass">Surfaces</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/surfaces/plywood" className="hover:text-ember-light transition-colors">Plywood Core</Link></li>
              <li><Link href="/surfaces/laminates" className="hover:text-ember-light transition-colors">Laminates</Link></li>
              <li><Link href="/surfaces/veneer" className="hover:text-ember-light transition-colors">Natural Veneer</Link></li>
              <li><Link href="/surfaces/decoratives" className="hover:text-ember-light transition-colors">Decoratives &amp; Edge</Link></li>
            </ul>
          </div>

          {/* Resources Col */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono tracking-wider uppercase text-brass">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/journal" className="hover:text-ember-light transition-colors">Journal</Link></li>
              <li><button onClick={() => openBrochure('All')} className="hover:text-ember-light transition-colors text-left cursor-pointer">Download Brochure</button></li>
              <li><Link href="/inspiration" className="hover:text-ember-light transition-colors">Project Gallery</Link></li>
              <li><Link href="/about#faq" className="hover:text-ember-light transition-colors">FAQs</Link></li>
              <li><Link href="/about#process" className="hover:text-ember-light transition-colors">Quality Process</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono tracking-wider uppercase text-brass">Contact &amp; Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/contact" className="text-ember-light hover:underline font-semibold">Get a Quote →</Link></li>
              <li className="text-stone-dim text-xs leading-relaxed">
                Sitka Surfaces HQ<br />
                [Plot No. 12, Industrial Area]<br />
                [Bangalore, Karnataka, 560001]
              </li>
              <li className="text-stone-dim text-xs">
                t: [e: info@sitkasurfaces.com] <br />
                p: [+91 80 4567 8901]
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 text-xs text-stone-dim gap-4">
          <p>© {currentYear} Sitka Surfaces. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-parchment transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-parchment transition-colors">Terms of Use</Link>
            <Link href="/sitemap" className="hover:text-parchment transition-colors">HTML Sitemap</Link>
            <Link href="/offline-game" className="hover:text-ember transition-colors" title="Play the Plywood Stacker game — even offline!">Play Offline 🪵</Link>
            <Link href="/admin" className="hover:text-ember-light transition-colors font-semibold">Admin Panel</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
