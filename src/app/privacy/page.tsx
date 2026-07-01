import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <Shield className="w-5 h-5 text-brass" />
            <span className="text-xs font-mono tracking-widest text-brass uppercase block">Compliance Row</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-parchment">Privacy Policy</h1>
          <p className="text-stone-dim text-xs font-mono uppercase">Last updated: July 1, 2026</p>
        </div>

        <div className="space-y-6 text-stone-dim text-sm leading-relaxed font-sans normal-case">
          <p>
            At Sitka Surfaces, we respect your privacy and are committed to protecting any personal data you share with us. This policy describes how we collect, store, and process lead details captured through our gated brochures, contact forms, and sample requests.
          </p>

          <h3 className="text-base font-display font-semibold text-parchment mt-6 mb-2">1. Data We Collect</h3>
          <p>
            We only collect personal information that you explicitly submit to us via our forms. This includes: name, email address, phone number, company/studio name, interest area, and your B2B role/persona (e.g. Architect, Designer). We also capture general UTM query parameters to analyze brochure downloads and campaign performance.
          </p>

          <h3 className="text-base font-display font-semibold text-parchment mt-6 mb-2">2. How We Use Your Data</h3>
          <p>
            Your information is used solely to deliver requested material guides, ship physical samples, and respond to commercial project quote requests. We do not sell, rent, or lease our list databases to third parties. Occasional email updates about new material releases or case study journals can be unsubscribed from instantly.
          </p>

          <h3 className="text-base font-display font-semibold text-parchment mt-6 mb-2">3. Storage &amp; Security</h3>
          <p>
            All lead submissions are stored securely inside our local relational database. We execute standard security checks to protect your data from unauthorized access, disclosure, or modification.
          </p>

          <h3 className="text-base font-display font-semibold text-parchment mt-6 mb-2">4. Your Rights</h3>
          <p>
            You have the right to request access to, correction of, or complete deletion of your personal data at any time. To exercise these rights, please contact our support team at <b className="text-parchment">info@sitkasurfaces.com</b>.
          </p>
        </div>

      </div>
    </div>
  );
}
