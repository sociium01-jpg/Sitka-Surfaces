'use client';

import React, { useState } from 'react';
import { Compass, CheckCircle2, ShieldCheck, Layers, ChevronRight, HelpCircle, ChevronDown } from 'lucide-react';
import Reveal from '@/components/Reveal';

type ProcessStep = {
  num: string;
  title: string;
  desc: string;
  imgUrl: string;
};

export default function AboutPage() {
  const [activeStep, setActiveStep] = useState(0);

  const steps: ProcessStep[] = [
    {
      num: '01',
      title: 'Sourcing Responsibly',
      desc: 'All timber logs and veneers are selected directly from certified concessions. We prioritize species consistency, density, and grain configuration before raw stock ever enters our pressing yards.',
      imgUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80',
    },
    {
      num: '02',
      title: 'Precision Slicing & Pressing',
      desc: 'State-of-the-art hydraulic slicing machinery cuts natural logs down to 0.6mm thickness. High-pressure steam presses bond veneers and laminates onto Gurjan core sheets under temperature-regulated settings.',
      imgUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80',
    },
    {
      num: '03',
      title: 'Batch Calibration Check',
      desc: 'Every press run is checked for micro-thickness variations. Color matching spectrophotometers scan laminate finishes to guarantee batch-to-batch color stability across reorders.',
      imgUrl: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=600&q=80',
    },
    {
      num: '04',
      title: 'Scheduled Site Handover',
      desc: 'Panels are flat-packed, palletized, and shrink-wrapped with corner guards to prevent chipping during transit. Scheduled dispatch connects directly to your site contractor’s timeline.',
      imgUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const whoWeWorkWith = [
    { name: 'Architects', desc: 'Providing CAD specs, FSC certs, and sequence matching logs.' },
    { name: 'Interior Designers', desc: 'Offering finish swatch samples and custom texture mapping.' },
    { name: 'Contractors / Fabricators', desc: 'Providing screw-holding calibration data and consistent thickness sheets.' },
    { name: 'Dealers & Distributors', desc: 'Providing high inventory safety stock and localized shipping.' },
  ];

  return (
    <div className="bg-ink min-h-screen">
      
      {/* 1. HERO HEADER */}
      <section className="relative min-h-[50vh] flex flex-col justify-center py-20 bg-ink">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-25 filter saturate-50" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80")' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-[#15120F]/95" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full space-y-4">
          <span className="text-xs font-mono tracking-widest text-brass uppercase block">
            Brand Narrative
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-medium text-parchment leading-tight max-w-3xl">
            Surfaces, made with intent.
          </h1>
          <p className="text-stone text-base max-w-xl leading-relaxed">
            Sitka Surfaces was built on a simple premise: the material comes first. We build the substrate and finish choices that hold their character under real-world use.
          </p>
        </div>
      </section>

      {/* 2. MANIFESTO STRIP */}
      <section className="border-t border-line/60 py-20 md:py-28 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <Reveal className="lg:col-span-8 space-y-6">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase block">Our Heritage</span>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-parchment leading-snug">
              Evolving from Sitka Plywood, we have spent years earning trust one panel, one project, one reorder at a time.
            </h2>
            <p className="text-stone-dim text-sm md:text-base leading-relaxed normal-case">
              Today, Sitka Surfaces brings that same rigorous engineering standard across four material worlds — Plywood, Laminates, Veneer, and Decoratives — because the best architectural interiors aren&apos;t built from a single material. They&apos;re built from the right combination, every time.
            </p>
          </Reveal>
          
          <Reveal className="lg:col-span-4 lg:pl-8 border border-line bg-ink-2 p-6 rounded-sm space-y-4" delay={100}>
            <div className="flex gap-2 items-center">
              <ShieldCheck className="w-5 h-5 text-brass" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-parchment">Quality Seal</span>
            </div>
            <p className="text-[11px] text-stone-dim leading-relaxed normal-case">
              FSC Chain of Custody, CARB Phase 2 compliance, and E1 emission standards certified. Documentation is available on request for every certified range.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. INTERACTIVE PROCESS STEP-THROUGH */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32" id="process">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <Reveal className="max-w-xl space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase">Quality System</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-parchment">Manufacturing Flow</h2>
            <p className="text-stone-dim text-sm leading-relaxed">
              Step through our production process to see how raw timber logs are converted into sequence-calibrated finished panels.
            </p>
          </Reveal>

          <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" delay={100}>
            
            {/* Steps select list (cols 5) */}
            <div className="lg:col-span-5 space-y-4">
              {steps.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={step.num}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-5 border rounded-sm flex items-start gap-4 transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'border-brass bg-ink-2' 
                        : 'border-line/45 hover:border-stone-dim/35 bg-ink/20'
                    }`}
                  >
                    <span className={`font-mono text-xs tracking-wider ${isActive ? 'text-ember-light' : 'text-stone-dim'}`}>
                      {step.num}
                    </span>
                    <div className="space-y-1">
                      <span className="block text-sm font-semibold text-parchment">
                        {step.title}
                      </span>
                      {isActive && (
                        <p className="text-xs text-stone-dim leading-relaxed font-sans normal-case pt-1 transition-opacity duration-300">
                          {step.desc}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Step Image Panel (cols 7) */}
            <div className="lg:col-span-7">
              <div className="relative h-[280px] md:h-[400px] bg-ink-2 border border-line rounded-sm overflow-hidden shadow-xl">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500 filter brightness-90"
                  style={{ backgroundImage: `url(${steps[activeStep].imgUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 bg-ink/80 border border-line text-stone-dim text-[9px] font-mono tracking-wider p-2 rounded-sm uppercase">
                  Calibration Step {steps[activeStep].num}
                </div>
              </div>
            </div>

          </Reveal>
        </div>
      </section>

      {/* 4. WHO WE WORK WITH GRID */}
      <section className="bg-ink border-t border-line/60 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          <Reveal className="max-w-xl space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase">Collaboration</span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-parchment">Who we partner with</h2>
          </Reveal>
          
          <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" delay={100}>
            {whoWeWorkWith.map((w, idx) => (
              <div key={idx} className="border border-line bg-ink-2 p-6 md:p-8 rounded-sm space-y-3">
                <div className="flex gap-2 items-center text-brass font-mono text-xs">
                  <CheckCircle2 className="w-4 h-4 text-ember-light" />
                  <h3 className="text-sm font-display font-semibold text-parchment uppercase tracking-wider">{w.name}</h3>
                </div>
                <p className="text-stone-dim text-xs leading-relaxed font-sans normal-case">
                  {w.desc}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

    </div>
  );
}
