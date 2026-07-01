'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, ArrowLeft, Send, CheckCircle2, MapPin, Phone, Mail } from 'lucide-react';
import Reveal from '@/components/Reveal';

function ContactForm() {
  const searchParams = useSearchParams();
  const projectRef = searchParams.get('reference') || '';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectType: 'New Build',
    scale: '',
    timeline: 'Immediate (1-3 months)',
    location: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: projectRef ? `Inquiring about materials used in project reference: ${projectRef}` : '',
  });

  const [selectedVerticals, setSelectedVerticals] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (vertical: string) => {
    setSelectedVerticals(prev => 
      prev.includes(vertical) 
        ? prev.filter(v => v !== vertical)
        : [...prev, vertical]
    );
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      if (selectedVerticals.length === 0) {
        setError('Please select at least one material vertical.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.scale || !formData.location) {
        setError('Please fill in both the approximate scale and location fields.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required contact details.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company || null,
          interestArea: selectedVerticals.join(', '),
          persona: 'Architect', // default fallback
          utmSource: `quote-flow:${formData.projectType}`,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to record enquiry. Please try again.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showrooms = [
    { city: 'Bangalore Showroom', addr: 'Plot No. 12, Industrial Area, Bangalore, 560001', phone: '+91 80 4567 8901' },
    { city: 'Mumbai Experience Center', addr: 'Ground Floor, Creative Towers, Lower Parel, Mumbai, 400013', phone: '+91 22 2345 6789' },
    { city: 'Hyderabad Design Studio', addr: 'Road No. 36, Jubilee Hills, Hyderabad, 500033', phone: '+91 40 3456 7890' },
  ];

  return (
    <div className="bg-ink min-h-screen py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
      
      {/* 1. Header */}
      <div className="space-y-4 max-w-2xl mb-12">
        <span className="text-xs font-mono tracking-widest text-brass uppercase block">
          Material Specification
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-medium text-parchment leading-tight">
          Let&apos;s talk about your project.
        </h1>
        <p className="text-stone text-sm md:text-base leading-relaxed">
          Whether it is a single bespoke custom residence or a multi-site commercial rollout, tell us what you are specifying and we will get back with the right panel recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Stepper Form (cols 7) */}
        <div className="lg:col-span-7 bg-ink-2 border border-line p-8 md:p-10 rounded-sm shadow-xl">
          
          {/* Stepper Progress bar */}
          <div className="flex items-center justify-between mb-8 select-none">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs border ${
                    step === s 
                      ? 'bg-ember border-ember text-parchment' 
                      : step > s 
                        ? 'bg-ink border-brass text-brass' 
                        : 'border-line text-stone-dim'
                  }`}>
                    {s}
                  </div>
                  <span className={`text-[10px] font-mono tracking-wider uppercase hidden sm:inline ${
                    step === s ? 'text-parchment font-semibold' : 'text-stone-dim'
                  }`}>
                    {s === 1 ? 'Project' : s === 2 ? 'Scale' : 'Contact'}
                  </span>
                </div>
                {s < 3 && <div className={`flex-grow h-px mx-4 ${step > s ? 'bg-brass/50' : 'bg-line'}`} />}
              </React.Fragment>
            ))}
          </div>

          {error && (
            <div className="bg-ember/15 border border-ember/30 text-ember-light p-3.5 rounded-sm text-xs mb-6">
              {error}
            </div>
          )}

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: PROJECT TYPE & VERTICALS */}
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">1. Project Type</label>
                    <select 
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleTextChange}
                      className="w-full bg-ink border border-line rounded-sm p-3.5 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                    >
                      <option value="New Build">New Build Architectural Project</option>
                      <option value="Renovation">Residential Renovation / Fit-out</option>
                      <option value="Furniture">Custom Furniture / Cabinetry fabrication</option>
                      <option value="Commercial Fit-out">Commercial Office / Hotel Fit-out</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">2. Verticals of Interest (Select all that apply)</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['Plywood', 'Laminates', 'Veneer', 'Decoratives'].map(v => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => handleCheckboxChange(v)}
                          className={`p-4 border rounded-sm text-left transition-all duration-300 cursor-pointer ${
                            selectedVerticals.includes(v) 
                              ? 'border-brass bg-ink text-parchment' 
                              : 'border-line hover:border-stone-dim/40 bg-ink/10 text-stone-dim'
                          }`}
                        >
                          <span className="block text-xs font-semibold">{v}</span>
                          <span className="block text-[9px] font-sans mt-0.5 normal-case font-normal leading-normal">
                            {v === 'Plywood' ? 'Structure & Core substrate' : v === 'Laminates' ? 'HPL surface sheets' : v === 'Veneer' ? 'Natural timber face' : 'Acoustics, trim & edges'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SCALE & LOCATION */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">3. Scale of Project *</label>
                    <input 
                      type="text"
                      name="scale"
                      value={formData.scale}
                      onChange={handleTextChange}
                      required
                      placeholder="e.g. 2,400 sq. ft. floor area or 50 panels required"
                      className="w-full bg-ink border border-line rounded-sm p-3.5 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">4. Project Timeline</label>
                    <select 
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleTextChange}
                      className="w-full bg-ink border border-line rounded-sm p-3.5 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                    >
                      <option value="Immediate (1-3 months)">Immediate (1-3 months)</option>
                      <option value="Upcoming (3-6 months)">Upcoming (3-6 months)</option>
                      <option value="Planning (6+ months)">Planning Phase</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">5. Delivery City / Location *</label>
                    <input 
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleTextChange}
                      required
                      placeholder="e.g. Kochi, Kerala"
                      className="w-full bg-ink border border-line rounded-sm p-3.5 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: CONTACT DETAILS & MESSAGE */}
              {step === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">Your Name *</label>
                      <input 
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleTextChange}
                        required
                        placeholder="Sarah Connor"
                        className="w-full bg-ink border border-line rounded-sm p-3.5 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">Studio / Company Name</label>
                      <input 
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleTextChange}
                        placeholder="Spacial Architecture"
                        className="w-full bg-ink border border-line rounded-sm p-3.5 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">Email Address *</label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleTextChange}
                        required
                        placeholder="sarah@spacial.com"
                        className="w-full bg-ink border border-line rounded-sm p-3.5 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">Phone Number *</label>
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleTextChange}
                        required
                        placeholder="+91 98765 43210"
                        className="w-full bg-ink border border-line rounded-sm p-3.5 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono tracking-wider uppercase text-stone-dim">Project specifications / Notes</label>
                    <textarea 
                      name="notes"
                      value={formData.notes}
                      onChange={handleTextChange}
                      rows={4}
                      placeholder="Specify core grade (MR/BWP), veneer cuts, or edgebanding matches if known..."
                      className="w-full bg-ink border border-line rounded-sm p-3.5 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                    />
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-4 pt-4 border-t border-line/40">
                {step > 1 && (
                  <button 
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-1 bg-ink border border-line text-stone hover:text-parchment py-3.5 px-6 rounded-sm text-[10px] font-mono tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                )}
                
                {step < 3 ? (
                  <button 
                    type="button"
                    onClick={nextStep}
                    className="ml-auto flex items-center gap-1 bg-ember hover:bg-ember-light text-parchment py-3.5 px-8 rounded-sm text-[10px] font-mono tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Next Step <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="ml-auto flex items-center gap-2 bg-ember hover:bg-ember-light text-parchment py-3.5 px-8 rounded-sm text-[10px] font-mono tracking-wider uppercase transition-colors disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> {isSubmitting ? 'Sending...' : 'Send Enquiry'}
                  </button>
                )}
              </div>

            </form>
          ) : (
            <div className="text-center py-10 space-y-6">
              <CheckCircle2 className="w-16 h-16 text-ember-light mx-auto" />
              <h3 className="text-2xl font-display font-medium text-parchment">
                Project Enquiry Received
              </h3>
              <p className="text-stone-dim text-sm max-w-sm mx-auto leading-relaxed normal-case">
                Thank you, <b className="text-parchment">{formData.name}</b>. Your material request is recorded. A Sitka Surfaces specialist will reach out to you at <b className="text-parchment">{formData.email}</b> within one business day.
              </p>
              <button 
                onClick={() => {
                  setStep(1);
                  setIsSuccess(false);
                }}
                className="inline-block border border-line hover:border-stone text-stone-dim hover:text-parchment text-[10px] font-mono tracking-wider uppercase py-3 px-6 rounded-sm transition-colors cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Locations & Contact info (cols 5) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Direct Support */}
          <Reveal className="bg-ink-2 border border-line p-6 rounded-sm space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-brass uppercase">Direct Assistance</h3>
            <ul className="space-y-3.5 text-xs text-stone-dim">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-ember-light flex-shrink-0" />
                <span>e: info@sitkasurfaces.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-ember-light flex-shrink-0" />
                <span>p: +91 80 4567 8901</span>
              </li>
            </ul>
          </Reveal>

          {/* Showroom list */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-brass uppercase">Experience Centers</h3>
            <div className="space-y-4">
              {showrooms.map((room, idx) => (
                <Reveal 
                  key={idx}
                  className="bg-ink-2/40 border border-line/70 p-5 rounded-sm space-y-2 hover:border-line transition-colors duration-300"
                  delay={idx * 50}
                >
                  <h4 className="text-xs font-display font-semibold text-parchment uppercase tracking-wider">{room.city}</h4>
                  <div className="flex gap-2 text-stone-dim text-[11px] leading-relaxed">
                    <MapPin className="w-4.5 h-4.5 text-brass flex-shrink-0 mt-0.5" />
                    <p className="normal-case">{room.addr}</p>
                  </div>
                  <span className="block text-[10px] font-mono text-stone-dim">t: {room.phone}</span>
                </Reveal>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function ContactQuote() {
  return (
    <Suspense fallback={
      <div className="bg-ink min-h-screen flex items-center justify-center text-xs font-mono tracking-wider uppercase text-stone-dim">
        Loading Specification Form...
      </div>
    }>
      <ContactForm />
    </Suspense>
  );
}
