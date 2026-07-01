import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';

export default function TermsOfUse() {
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
            <Scale className="w-5 h-5 text-brass" />
            <span className="text-xs font-mono tracking-widest text-brass uppercase block">Regulatory Row</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-parchment">Terms of Use</h1>
          <p className="text-stone-dim text-xs font-mono uppercase">Last updated: July 1, 2026</p>
        </div>

        <div className="space-y-6 text-stone-dim text-sm leading-relaxed font-sans normal-case">
          <p>
            Welcome to the Sitka Surfaces website. By accessing or using this site, you agree to comply with and be bound by the following terms and conditions of use.
          </p>

          <h3 className="text-base font-display font-semibold text-parchment mt-6 mb-2">1. Intellectual Property</h3>
          <p>
            All content, images, scans, and code on this site — including the layout, design system colors, and signature Material Deck animation — are the intellectual property of Sitka Surfaces. You may download our brochures for material specification purposes only; commercial reproduction of our scanned texture swatches is prohibited.
          </p>

          <h3 className="text-base font-display font-semibold text-parchment mt-6 mb-2">2. Accuracy of Specifications</h3>
          <p>
            While we strive to publish accurate technical specifications (e.g. dimensions, thicknesses, cores, water-resistance grades), actual batch tolerances may vary slightly depending on manufacturing runs. Always request physical sample swatches to verify colors and sheens before final project specification.
          </p>

          <h3 className="text-base font-display font-semibold text-parchment mt-6 mb-2">3. Mock Downloads &amp; PDF Guides</h3>
          <p>
            Brochures, guides, and spec sheets available on this site are intended for design specification planning. These materials do not constitute a direct contract or purchase guarantee.
          </p>

          <h3 className="text-base font-display font-semibold text-parchment mt-6 mb-2">4. User Accounts</h3>
          <p>
            The admin console `/admin` is strictly for authorized employee use. Unauthorized access attempts constitute a breach of site security and will result in IP blockages and legal remediation where applicable.
          </p>
        </div>

      </div>
    </div>
  );
}
