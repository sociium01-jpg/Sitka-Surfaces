'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Layers, BookOpen, MessageSquare, ArrowRight, Download, CheckCircle } from 'lucide-react';

type Lead = {
  id: string;
  name: string;
  email: string;
  interestArea: string;
  persona: string;
  createdAt: string;
  utmSource?: string | null;
};

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    leadsCount: 0,
    brochuresCount: 0,
    productsCount: 0,
    postsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch leads
        const leadsRes = await fetch('/api/leads');
        const leadsData = await leadsRes.json();
        let fetchedLeads: Lead[] = [];
        if (leadsData.success) {
          fetchedLeads = leadsData.leads;
          setLeads(fetchedLeads.slice(0, 5)); // recent 5
        }

        // Fetch products count
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        const pCount = prodData.success ? prodData.products.length : 0;

        // Fetch posts count
        const postsRes = await fetch('/api/posts');
        const postsData = await postsRes.json();
        const postCount = postsData.success ? postsData.posts.length : 0;

        // Calculate brochure downloads count
        // (Assuming UTM source starting with quote-flow or website represents leads, and brochure downloads are tracked)
        const leadsCount = fetchedLeads.length;
        // In our mock database, since every lead downloads a brochure or requests a quote, 
        // we can count brochure downloads as leads with interestArea or specify it:
        const brochureDownloads = fetchedLeads.filter(l => l.utmSource === 'website' || l.utmSource === 'brochure-modal').length || leadsCount;

        setStats({
          leadsCount,
          brochuresCount: brochureDownloads,
          productsCount: pCount,
          postsCount: postCount,
        });

      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-xs font-mono tracking-wider uppercase text-stone-dim">
        Assembling Dashboard Stats...
      </div>
    );
  }

  const statCards = [
    { name: 'Total Leads', count: stats.leadsCount, icon: Users, desc: 'Contact & Quote requests', href: '/admin/leads' },
    { name: 'Brochure Downloads', count: stats.brochuresCount, icon: Download, desc: 'Gated material guide stats', href: '/admin/leads' },
    { name: 'Catalog Products', count: stats.productsCount, icon: Layers, desc: 'Items in Plywood/Laminates/Veneer', href: '/admin/products' },
    { name: 'Blog Journal Posts', count: stats.postsCount, icon: BookOpen, desc: 'Articles written and published', href: '/admin/blog' },
  ];

  return (
    <div className="space-y-10">
      
      {/* Welcome banner */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-display font-medium text-parchment">
          Dashboard Overview
        </h1>
        <p className="text-stone-dim text-xs">
          Real-time lead monitoring and content counts from the Sitka database.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="bg-ink-2 border border-line p-6 rounded-sm space-y-4 shadow-sm hover:border-brass/30 transition-colors duration-300">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-stone-dim">{card.name}</span>
                  <div className="text-2xl md:text-3xl font-display font-medium text-parchment">{card.count}</div>
                </div>
                <div className="p-2 bg-ink rounded-sm text-brass">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] text-stone-dim font-sans">{card.desc}</p>
              <Link 
                href={card.href} 
                className="text-[10px] font-mono tracking-wider uppercase text-ember-light hover:text-ember transition-colors inline-flex items-center gap-1"
              >
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent leads table (cols 8) */}
        <div className="lg:col-span-8 bg-ink-2 border border-line rounded-sm shadow-sm overflow-hidden">
          <div className="p-5 border-b border-line flex justify-between items-center bg-ink-2/30">
            <span className="text-[10px] font-mono tracking-wider uppercase text-parchment">Recent Leads Submission</span>
            <Link 
              href="/admin/leads" 
              className="text-[10px] font-mono tracking-wider uppercase text-stone-dim hover:text-parchment transition-colors"
            >
              View All leads →
            </Link>
          </div>

          {leads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono divide-y divide-line/40">
                <thead>
                  <tr className="bg-ink/30 text-brass uppercase tracking-wider">
                    <th className="p-4">Name</th>
                    <th className="p-4">Interest Area</th>
                    <th className="p-4">Role/Persona</th>
                    <th className="p-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/30 text-stone-dim">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-ink/20 transition-colors">
                      <td className="p-4 font-sans font-semibold text-parchment">{lead.name}</td>
                      <td className="p-4 uppercase tracking-wider">{lead.interestArea}</td>
                      <td className="p-4">{lead.persona}</td>
                      <td className="p-4 text-[10px]">
                        {new Date(lead.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-stone-dim text-sm">
              No leads recorded in the database yet.
            </div>
          )}
        </div>

        {/* Quick actions (cols 4) */}
        <div className="lg:col-span-4 bg-ink-2 border border-line p-6 rounded-sm space-y-5">
          <span className="text-[10px] font-mono tracking-wider uppercase text-brass block">Quick Shortcuts</span>
          
          <div className="flex flex-col gap-2.5">
            <Link 
              href="/admin/content" 
              className="w-full bg-ink border border-line hover:border-ember text-stone hover:text-parchment p-3 text-xs text-center rounded-sm transition-all duration-300 font-mono tracking-wider uppercase block"
            >
              Edit Homepage Text
            </Link>
            <Link 
              href="/admin/media" 
              className="w-full bg-ink border border-line hover:border-ember text-stone hover:text-parchment p-3 text-xs text-center rounded-sm transition-all duration-300 font-mono tracking-wider uppercase block"
            >
              Update Hero Images
            </Link>
            <Link 
              href="/admin/products?action=new" 
              className="w-full bg-ink border border-line hover:border-ember text-stone hover:text-parchment p-3 text-xs text-center rounded-sm transition-all duration-300 font-mono tracking-wider uppercase block"
            >
              Add New Product SKU
            </Link>
            <Link 
              href="/admin/blog?action=new" 
              className="w-full bg-ink border border-line hover:border-ember text-stone hover:text-parchment p-3 text-xs text-center rounded-sm transition-all duration-300 font-mono tracking-wider uppercase block"
            >
              Write Journal Post
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
