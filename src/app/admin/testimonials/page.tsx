'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Check, X, Plus, Trash2, Edit2 } from 'lucide-react';

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  vertical: string;
  persona: string;
  approved: boolean;
  order: number;
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    quote: '',
    name: '',
    role: '',
    company: '',
    vertical: 'General',
    persona: 'Architect',
    approved: true,
    order: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials?all=true');
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'order' ? parseInt(value) || 0 : value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const toggleApproval = async (id: string, currentApproved: boolean) => {
    try {
      const res = await fetch('/api/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: !currentApproved }),
      });
      if (res.ok) {
        setTestimonials(prev => 
          prev.map(t => t.id === id ? { ...t, approved: !currentApproved } : t)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openNewForm = () => {
    setFormData({
      quote: '',
      name: '',
      role: '',
      company: '',
      vertical: 'General',
      persona: 'Architect',
      approved: true,
      order: 0,
    });
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (t: Testimonial) => {
    setFormData({
      quote: t.quote,
      name: t.name,
      role: t.role,
      company: t.company,
      vertical: t.vertical,
      persona: t.persona,
      approved: t.approved,
      order: t.order,
    });
    setEditingId(t.id);
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const url = '/api/testimonials';
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { id: editingId, ...formData } : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save testimonial. Verify fields.');
      }

      await fetchTestimonials();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-xs font-mono tracking-wider uppercase text-stone-dim">
        Assembling Client Testimonials...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-display font-medium text-parchment flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brass" /> Testimonials Manager
          </h1>
          <p className="text-stone-dim text-xs">
            Review, edit, and approve client quotes. Tag by persona or vertical to control marquee display logic.
          </p>
        </div>

        <button
          onClick={openNewForm}
          className="bg-ember hover:bg-ember-light text-parchment text-xs font-mono tracking-wider uppercase py-3.5 px-6 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Editor Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0a0806]/85 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-ink-2 border border-line rounded-sm max-w-[500px] w-full p-8 relative shadow-2xl">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-stone-dim hover:text-parchment transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg md:text-xl font-display font-medium text-parchment mb-4">
              {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h3>

            {error && (
              <div className="bg-ember/15 border border-ember/30 text-ember-light p-3.5 rounded-sm text-xs mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Quote Text *</label>
                <textarea 
                  name="quote"
                  value={formData.quote}
                  onChange={handleTextChange}
                  required
                  rows={4}
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember font-sans normal-case"
                  placeholder="Insert client quote statement..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Author Name *</label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleTextChange}
                    required
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember font-sans normal-case"
                    placeholder="Karan Johar"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Role / Title *</label>
                  <input 
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleTextChange}
                    required
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember font-sans normal-case"
                    placeholder="Lead Architect"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Company / Studio *</label>
                  <input 
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleTextChange}
                    required
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember font-sans normal-case"
                    placeholder="Studio Meridian"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Display Order</label>
                  <input 
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleTextChange}
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember font-sans normal-case"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">B2B Persona</label>
                  <select 
                    name="persona"
                    value={formData.persona}
                    onChange={handleTextChange}
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember"
                  >
                    <option value="Architect">Architect</option>
                    <option value="Designer">Interior Designer</option>
                    <option value="Contractor">Contractor / Builder</option>
                    <option value="Dealer">Dealer Partner</option>
                    <option value="Homeowner">Homeowner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold">Material Area</label>
                  <select 
                    name="vertical"
                    value={formData.vertical}
                    onChange={handleTextChange}
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember"
                  >
                    <option value="General">General / All</option>
                    <option value="Plywood">Plywood</option>
                    <option value="Laminates">Laminates</option>
                    <option value="Veneer">Veneer</option>
                    <option value="Decoratives">Decoratives</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  name="approved"
                  id="approved"
                  checked={formData.approved}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 accent-ember cursor-pointer"
                />
                <label htmlFor="approved" className="text-xs text-stone font-semibold cursor-pointer">Approved for Display on Site</label>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-ember text-parchment py-3.5 mt-4 rounded-sm text-[10px] font-mono tracking-wider uppercase hover:bg-ember-light transition-colors disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Testimonial'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Testimonials List Grid */}
      <div className="bg-ink-2 border border-line rounded-sm overflow-hidden shadow-sm">
        <div className="p-4 bg-ink/30 border-b border-line text-xs font-mono text-stone-dim">
          Total Testimonials: <b className="text-parchment">{testimonials.length}</b>
        </div>

        {testimonials.length > 0 ? (
          <div className="divide-y divide-line/60">
            {testimonials.map((t) => (
              <div 
                key={t.id}
                className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-ink/10 transition-colors"
              >
                <div className="space-y-3 max-w-2xl">
                  <p className="font-serif italic text-sm text-parchment leading-relaxed normal-case">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="text-[11px] text-stone-dim font-sans">
                    <span className="font-bold text-brass uppercase tracking-wider">{t.name}</span>
                    <span className="mx-1.5 font-mono">•</span>
                    <span>{t.role}, {t.company}</span>
                    <span className="mx-1.5 font-mono">•</span>
                    <span className="bg-ink border border-line px-1.5 py-0.5 rounded-sm font-mono text-[9px] uppercase">{t.persona}</span>
                  </div>
                </div>

                {/* Status Toggle & edit buttons */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <button
                    onClick={() => toggleApproval(t.id, t.approved)}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-mono tracking-wider uppercase border transition-all duration-300 flex items-center gap-1 cursor-pointer ${
                      t.approved 
                        ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400' 
                        : 'border-line text-stone-dim hover:text-stone'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> {t.approved ? 'Approved' : 'Pending'}
                  </button>

                  <button 
                    onClick={() => openEditForm(t)}
                    className="p-2 border border-line hover:border-stone hover:text-parchment rounded-sm transition-colors text-stone-dim cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="p-2 border border-line hover:border-ember hover:text-ember-light rounded-sm transition-colors text-stone-dim cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center text-stone-dim text-sm">
            No testimonials recorded in the database yet.
          </div>
        )}
      </div>

    </div>
  );
}
