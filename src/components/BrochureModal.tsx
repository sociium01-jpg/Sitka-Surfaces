'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Download } from 'lucide-react';
import { useModal } from '@/context/ModalContext';

export default function BrochureModal() {
  const { isBrochureOpen, closeBrochure, selectedVertical } = useModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    interestArea: 'All',
    persona: 'Architect',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Sync selected vertical from context
  useEffect(() => {
    if (isBrochureOpen) {
      setFormData((prev) => ({
        ...prev,
        interestArea: selectedVertical,
      }));
      setIsSuccess(false);
      setError('');
    }
  }, [isBrochureOpen, selectedVertical]);

  if (!isBrochureOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Capture UTM source if any
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || 'website';

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, utmSource }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit form. Please try again.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get PDF download URL based on selected vertical
  const getBrochureUrl = () => {
    const interest = formData.interestArea.toLowerCase();
    if (interest === 'plywood') return '/brochures/sitka-plywood-guide.pdf';
    if (interest === 'laminates') return '/brochures/sitka-laminates-guide.pdf';
    if (interest === 'veneer') return '/brochures/sitka-veneer-guide.pdf';
    if (interest === 'decoratives') return '/brochures/sitka-decoratives-guide.pdf';
    return '/brochures/sitka-surfaces-guide.pdf';
  };

  return (
    <div className="fixed inset-0 bg-[#0a0806]/85 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fade-in">
      <div 
        className="bg-ink-2 border border-line rounded-sm max-w-[480px] w-full p-8 md:p-10 relative shadow-2xl transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={closeBrochure}
          className="absolute top-4 right-4 text-stone-dim hover:text-parchment transition-colors p-1"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {!isSuccess ? (
          <div>
            <h3 className="text-xl md:text-2xl font-display font-medium text-parchment mb-2">
              Get the Sitka Surfaces Material Guide
            </h3>
            <p className="text-stone-dim text-sm mb-6 leading-relaxed">
              Full specifications, finishes, and application guidance across Plywood, Laminates, Veneer, and Decoratives — one download.
            </p>

            {error && (
              <div className="bg-ember/15 border border-ember/30 text-ember-light p-3 rounded-sm text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-sm focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                  placeholder="e.g. Sarah Connor"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-sm focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                    placeholder="sarah@studio.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-sm focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">Company / Studio (Optional)</label>
                <input 
                  type="text" 
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-sm focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                  placeholder="Architectural Syndicate"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">I am a</label>
                  <select 
                    name="persona"
                    value={formData.persona}
                    onChange={handleChange}
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-sm focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                  >
                    <option value="Architect">Architect</option>
                    <option value="Interior Designer">Interior Designer</option>
                    <option value="Contractor">Contractor / Fabricator</option>
                    <option value="Dealer">Dealer / Distributor</option>
                    <option value="Homeowner">Homeowner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">Interested In</label>
                  <select 
                    name="interestArea"
                    value={formData.interestArea}
                    onChange={handleChange}
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-sm focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                  >
                    <option value="All">All Surfaces</option>
                    <option value="Plywood">Plywood Core</option>
                    <option value="Laminates">Laminates</option>
                    <option value="Veneer">Natural Veneer</option>
                    <option value="Decoratives">Decoratives &amp; Edge</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-ember text-parchment py-4 px-6 mt-2 rounded-sm text-xs font-mono tracking-wider uppercase hover:bg-ember-light transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Processing...' : 'Download the Guide'}
              </button>

              <p className="text-[10px] text-stone-dim/80 text-center leading-relaxed mt-2">
                By downloading, you agree to receive occasional material updates. Unsubscribe anytime.
              </p>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-ember-light mx-auto mb-4" />
            <h3 className="text-2xl font-display font-medium text-parchment mb-3">
              Your guide is ready
            </h3>
            <p className="text-stone-dim text-sm mb-8 leading-relaxed max-w-[34ch] mx-auto">
              Click below to download the {formData.interestArea} guide directly. We have also sent a backup link to <b className="text-parchment">{formData.email}</b>.
            </p>
            
            <a 
              href={getBrochureUrl()}
              download
              onClick={() => setTimeout(closeBrochure, 2000)}
              className="w-full bg-ember text-parchment py-4 px-6 rounded-sm text-xs font-mono tracking-wider uppercase hover:bg-ember-light transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF Brochure
            </a>
            
            <button 
              onClick={closeBrochure}
              className="text-xs text-stone-dim hover:text-parchment underline mt-6 transition-colors"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
