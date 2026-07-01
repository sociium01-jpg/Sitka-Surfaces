'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
import { ArrowLeft, ChevronRight, Compass, ShieldCheck, MapPin, Building } from 'lucide-react';
import Reveal from '@/components/Reveal';

type ProjectDetail = {
  title: string;
  city: string;
  spaceType: string;
  materials: string;
  verticals: string[];
  architect: string;
  heroImg: string;
  challenge: string;
  solution: string;
  outcome: string;
};

export default function ProjectCaseStudy({ params }: { params: Promise<{ projectSlug: string }> }) {
  const router = useRouter();
  
  // Unwrap parameters
  const { projectSlug } = use(params);

  const projectsData: Record<string, ProjectDetail> = {
    'amber-house-residence': {
      title: 'Amber House Residence',
      city: 'Bangalore',
      spaceType: 'Kitchen & Living',
      materials: 'Natural Walnut Veneer, Chalk White Matte Laminate',
      verticals: ['Veneer', 'Laminates'],
      architect: 'Studio Meridian Architects',
      heroImg: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      challenge: 'The clients wanted a high-end, editorial feel for their open-plan kitchen and dining area. The space needed to stand up to heavy daily cooking use while maintaining a seamless, organic timber backdrop that matched the dining table and feature wall.',
      solution: 'Studio Meridian specified Sitka American Walnut Crown-Cut veneer sequence-matched panels to wrap the entire dining backdrop and TV run. Underneath the veneer, Sitka BWP Marine plywood cores were specified to guarantee long-term warp resistance. The active kitchen cabinet run was faced with Chalk White Super-Matte laminates featuring anti-fingerprint coating to absorb grease splashes and finger marks.',
      outcome: 'A stunning open-plan interior where the active cooking surfaces are highly scratch-resistant and wipe-clean, while the enclosing walls retain the warm, highly textured grain symmetry of sequence-matched American Walnut.'
    },
    'northline-studio-office': {
      title: 'Northline Studio Office',
      city: 'Mumbai',
      spaceType: 'Creative Workspace',
      materials: 'Flexible Plywood, Ribbed Charcoal Acoustic Panel',
      verticals: ['Plywood', 'Decoratives'],
      architect: 'Formwork Interiors',
      heroImg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      challenge: 'A growing digital agency needed curved partitions and sound-dampening panels for meeting pods to reduce echoes across a high-ceiling concrete warehouse conversion.',
      solution: 'Formwork Interiors specified Sitka Flexi-Ply (Flexible Plywood) to wrap around circular workspace pods, creating curvilinear structural columns with a minimal radius of 180mm. Inside the meeting pods, Ribbed Charcoal Acoustic Panels were bonded to PET recycled felt backings to absorb high-frequency speech echoes.',
      outcome: 'Pod structures that machine perfectly without delamination, achieving acoustic absorption targets (NRC 0.82) and curved structural elegance without requiring heavy, expensive steel framing.'
    },
    'cedar-point-hospitality': {
      title: 'Cedar Point Hospitality',
      city: 'Goa',
      spaceType: 'Resort Bedrooms',
      materials: 'Compact Laminates, Gurjan BWR Plywood',
      verticals: ['Laminates', 'Plywood'],
      architect: 'Bellwood Build Associates',
      heroImg: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      challenge: 'A coastal resort required cabinetry and wardrobe surfaces capable of enduring Goa’s extreme monsoon humidity, salty sea air, and high guest turnover without peeling or swelling.',
      solution: 'The building contractor used Sitka BWR (Boiling Water Resistant) plywood cores for all modular framing, and compact laminates for luggage ledges, vanity countertops, and wardrobe doors. Compact laminates are self-supporting and waterproof, eliminating the need to edge-band substrates in wet zones.',
      outcome: 'Zero maintenance callouts three years post-completion. The compact panels stand up to guest luggage impacts and coastal moisture without showing warp or seam delamination.'
    },
    'harbor-lobby-panelling': {
      title: 'Harbor Lobby Panelling',
      city: 'Kochi',
      spaceType: 'Corporate Lobby',
      materials: 'American Walnut Veneer, BWR Plywood Core',
      verticals: ['Veneer', 'Plywood'],
      architect: 'Spacial Corporate Architects',
      heroImg: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      challenge: 'An office lobby required sequence-matched wood panelling that wrapped around a 40ft executive reception counter and a double-height lift corridor, requiring absolute grain continuity.',
      solution: 'Spacial Corporate specified flat crown-cut American Walnut veneers, hand-selected from a single log sequence. Every panel was mapped, cataloged, and pressed onto Sitka BWP plywood substrates. The panels were slip-matched sequentially from left to right.',
      outcome: 'A breathtaking double-height reception lobby wall where the woodgrain wraps around corners and doors seamlessly, reading as one massive, monolithic slab of timber.'
    }
  };

  const project = projectsData[projectSlug];
  if (!project) {
    notFound();
  }

  return (
    <div className="bg-ink min-h-screen py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & breadcrumbs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-line/20 pb-6">
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
            <span className="text-brass">{project.title}</span>
          </div>
        </div>

        {/* Hero Image */}
        <Reveal className="relative h-[360px] md:h-[500px] border border-line rounded-sm overflow-hidden bg-ink-2 shadow-2xl">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-65"
            style={{ backgroundImage: `url(${project.heroImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        </Reveal>

        {/* Project Meta Details */}
        <Reveal className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-line/40 items-start">
          <div className="space-y-1">
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Architect / Design</span>
            <span className="text-sm text-parchment font-display font-medium flex items-center gap-1.5">
              <Building className="w-4 h-4 text-stone-dim" /> {project.architect}
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Project Location</span>
            <span className="text-sm text-parchment font-display font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-stone-dim" /> {project.city}, India
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Materials Specified</span>
            <span className="text-xs text-stone-dim leading-snug">
              {project.materials}
            </span>
          </div>
        </Reveal>

        {/* Case Study Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          
          {/* Main Story column */}
          <div className="md:col-span-8 space-y-8 font-sans">
            <Reveal className="space-y-3">
              <h3 className="text-lg font-display font-medium text-parchment border-l border-ember pl-3">
                01. The Challenge
              </h3>
              <p className="text-stone-dim text-sm leading-relaxed normal-case">
                {project.challenge}
              </p>
            </Reveal>

            <Reveal className="space-y-3" delay={50}>
              <h3 className="text-lg font-display font-medium text-parchment border-l border-ember pl-3">
                02. The Specification
              </h3>
              <p className="text-stone-dim text-sm leading-relaxed normal-case">
                {project.solution}
              </p>
            </Reveal>

            <Reveal className="space-y-3" delay={100}>
              <h3 className="text-lg font-display font-medium text-parchment border-l border-ember pl-3">
                03. The Outcome
              </h3>
              <p className="text-stone-dim text-sm leading-relaxed normal-case">
                {project.outcome}
              </p>
            </Reveal>
          </div>

          {/* Sidebar CTA column */}
          <Reveal className="md:col-span-4 bg-ink-2 border border-line p-6 rounded-sm space-y-5 self-start" delay={150}>
            <div className="flex gap-2 items-center">
              <Compass className="w-5 h-5 text-brass" />
              <span className="text-[10px] font-mono tracking-wider uppercase text-parchment">Get this Look</span>
            </div>
            
            <p className="text-[11px] text-stone-dim leading-relaxed normal-case">
              Like the grain pattern or materials specified in the <b className="text-parchment">{project.title}</b>? We can recreate this specification template.
            </p>

            <div className="space-y-3 pt-2">
              <Link 
                href={`/contact?reference=${projectSlug}`}
                className="block w-full bg-ember hover:bg-ember-light text-parchment text-[10px] font-mono tracking-wider uppercase py-3.5 rounded-sm transition-colors text-center font-medium"
              >
                Inquire Specification
              </Link>
              <button 
                onClick={() => router.push('/inspiration')}
                className="block w-full border border-line hover:border-stone text-stone-dim hover:text-parchment text-[10px] font-mono tracking-wider uppercase py-3.5 rounded-sm transition-colors text-center cursor-pointer"
              >
                Browse Projects
              </button>
            </div>
          </Reveal>

        </div>

      </div>
    </div>
  );
}
