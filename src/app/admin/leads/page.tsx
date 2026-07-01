'use client';

import React, { useEffect, useState } from 'react';
import { Users, FileDown, Search, Filter } from 'lucide-react';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  interestArea: string;
  persona: string;
  createdAt: string;
  utmSource: string | null;
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInterest, setFilterInterest] = useState('All');
  const [filterPersona, setFilterPersona] = useState('All');

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/leads');
        const data = await res.json();
        if (data.success) {
          setLeads(data.leads);
        }
      } catch (err) {
        console.error('Failed to fetch leads:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  const interests = ['All', 'Plywood', 'Laminates', 'Veneer', 'Decoratives'];
  const personas = ['All', 'Architect', 'Designer', 'Contractor', 'Dealer', 'Homeowner'];

  // Filter leads based on query, interest, and persona
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if interestArea contains selected vertical or equals exactly
    const matchesInterest = 
      filterInterest === 'All' || 
      lead.interestArea.toUpperCase().includes(filterInterest.toUpperCase());

    const matchesPersona = 
      filterPersona === 'All' || 
      lead.persona.toUpperCase() === filterPersona.toUpperCase();

    return matchesSearch && matchesInterest && matchesPersona;
  });

  const handleExport = () => {
    // Open the API export endpoint in a new window/tab to trigger download
    window.open('/api/leads/export', '_blank');
  };

  if (loading) {
    return (
      <div className="text-xs font-mono tracking-wider uppercase text-stone-dim">
        Assembling Leads Records...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-display font-medium text-parchment flex items-center gap-2">
            <Users className="w-6 h-6 text-brass" /> Leads &amp; Brochure Manager
          </h1>
          <p className="text-stone-dim text-xs">
            Manage captured brochure downloads, quote requests, and export contacts to CSV.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="bg-ember hover:bg-ember-light text-parchment text-xs font-mono tracking-wider uppercase py-3.5 px-6 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
        >
          <FileDown className="w-4 h-4" /> Export CSV Contacts
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-ink-2 p-5 border border-line rounded-sm">
        
        {/* Search */}
        <div className="space-y-1 md:col-span-2">
          <label className="block text-[9px] font-mono tracking-wider uppercase text-brass">Search Name / Email / Company</label>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads..."
            className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
          />
        </div>

        {/* Interest Filter */}
        <div className="space-y-1">
          <label className="block text-[9px] font-mono tracking-wider uppercase text-brass">By Material Area</label>
          <select 
            value={filterInterest}
            onChange={(e) => setFilterInterest(e.target.value)}
            className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
          >
            {interests.map(i => (
              <option key={i} value={i}>{i === 'All' ? 'All Verticals' : i}</option>
            ))}
          </select>
        </div>

        {/* Persona Filter */}
        <div className="space-y-1">
          <label className="block text-[9px] font-mono tracking-wider uppercase text-brass">By Persona</label>
          <select 
            value={filterPersona}
            onChange={(e) => setFilterPersona(e.target.value)}
            className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
          >
            {personas.map(p => (
              <option key={p} value={p}>{p === 'All' ? 'All Personas' : p}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Leads Table */}
      <div className="bg-ink-2 border border-line rounded-sm overflow-hidden shadow-sm">
        <div className="p-4 bg-ink/30 border-b border-line flex justify-between items-center text-xs font-mono text-stone-dim">
          <span>Active Filter Count: <b className="text-parchment">{filteredLeads.length}</b></span>
          <span>Total Database Leads: <b className="text-parchment">{leads.length}</b></span>
        </div>

        {filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-line/45">
              <thead>
                <tr className="bg-ink/30 text-brass uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Interest</th>
                  <th className="p-4">Persona</th>
                  <th className="p-4">UTM Source</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30 text-stone-dim">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-ink/20 transition-colors">
                    <td className="p-4 font-sans font-semibold text-parchment">{lead.name}</td>
                    <td className="p-4">{lead.email}</td>
                    <td className="p-4">{lead.phone}</td>
                    <td className="p-4">{lead.company || '-'}</td>
                    <td className="p-4 uppercase tracking-wider">{lead.interestArea}</td>
                    <td className="p-4">{lead.persona}</td>
                    <td className="p-4 text-[10px] text-brass">{lead.utmSource || '-'}</td>
                    <td className="p-4 text-[10px]">
                      {new Date(lead.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-stone-dim text-sm">
            No lead submissions match the selected filters.
          </div>
        )}
      </div>

    </div>
  );
}
