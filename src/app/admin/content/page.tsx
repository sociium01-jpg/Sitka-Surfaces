'use client';

import React, { useEffect, useState } from 'react';
import { Save, CheckCircle, Info } from 'lucide-react';

type ContentItem = {
  section: string;
  key: string;
  label: string;
  value: string;
  type: 'text' | 'textarea';
};

export default function AdminContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [fields, setFields] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const pages = [
    { key: 'home', name: 'Home Page' },
    { key: 'plywood', name: 'Plywood' },
    { key: 'laminates', name: 'Laminates' },
    { key: 'veneer', name: 'Veneer' },
    { key: 'decoratives', name: 'Decoratives' },
    { key: 'about', name: 'About' },
    { key: 'contact', name: 'Contact' },
    { key: 'inspiration', name: 'Inspiration' },
    { key: 'journal', name: 'Journal' },
    { key: 'terms', name: 'Terms' },
  ];

  // Define editable schema metadata per page
  const pageSchema: Record<string, { section: string; key: string; label: string; type: 'text' | 'textarea' }[]> = {
    home: [
      { section: 'hero', key: 'eyebrow', label: 'Hero Eyebrow Label', type: 'text' },
      { section: 'hero', key: 'headline', label: 'Hero Headline Title', type: 'textarea' },
      { section: 'hero', key: 'subhead', label: 'Hero Subtitle Description', type: 'textarea' },
      { section: 'hero', key: 'microtext', label: 'Hero Micro Copy', type: 'text' },
      { section: 'manifesto', key: 'headline', label: 'Manifesto Headline', type: 'textarea' },
      { section: 'manifesto', key: 'body', label: 'Manifesto Body Description', type: 'textarea' },
      { section: 'stats', key: 'years', label: 'Stats: Years count label', type: 'text' },
      { section: 'stats', key: 'finishes', label: 'Stats: Finishes count label', type: 'text' },
      { section: 'stats', key: 'projects', label: 'Stats: Projects specified label', type: 'text' },
      { section: 'stats', key: 'cities', label: 'Stats: Cities served label', type: 'text' },
    ],
    plywood: [
      { section: 'intro', key: 'headline', label: 'Intro Headline Title', type: 'text' },
      { section: 'intro', key: 'body', label: 'Intro Paragraph Details', type: 'textarea' },
    ],
    laminates: [
      { section: 'intro', key: 'headline', label: 'Intro Headline Title', type: 'text' },
      { section: 'intro', key: 'body', label: 'Intro Paragraph Details', type: 'textarea' },
    ],
    veneer: [
      { section: 'intro', key: 'headline', label: 'Intro Headline Title', type: 'text' },
      { section: 'intro', key: 'body', label: 'Intro Paragraph Details', type: 'textarea' },
    ],
    decoratives: [
      { section: 'intro', key: 'headline', label: 'Intro Headline Title', type: 'text' },
      { section: 'intro', key: 'body', label: 'Intro Paragraph Details', type: 'textarea' },
    ],
    about: [
      { section: 'intro', key: 'title', label: 'About Title', type: 'text' },
      { section: 'intro', key: 'body', label: 'About Page Body Copy', type: 'textarea' },
      { section: 'manifesto', key: 'title', label: 'About Manifesto Title', type: 'text' },
      { section: 'manifesto', key: 'text', label: 'About Manifesto Copy', type: 'textarea' },
    ],
    contact: [
      { section: 'header', key: 'title', label: 'Contact Header Title', type: 'text' },
      { section: 'header', key: 'body', label: 'Contact Header Description', type: 'textarea' },
      { section: 'office', key: 'address', label: 'Office Address Spec', type: 'textarea' },
      { section: 'office', key: 'phone', label: 'Office Phone Contact', type: 'text' },
    ],
    inspiration: [
      { section: 'header', key: 'title', label: 'Inspiration Header Title', type: 'text' },
      { section: 'header', key: 'body', label: 'Inspiration Header Description', type: 'textarea' },
    ],
    journal: [
      { section: 'header', key: 'title', label: 'Journal Header Title', type: 'text' },
      { section: 'header', key: 'body', label: 'Journal Header Description', type: 'textarea' },
    ],
    terms: [
      { section: 'terms', key: 'title', label: 'Terms Page Title', type: 'text' },
      { section: 'terms', key: 'body', label: 'Terms Page Body Copy', type: 'textarea' },
    ],
  };

  useEffect(() => {
    async function loadPageContent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/page-content?page=${currentPage}`);
        const data = await res.json();
        
        if (data.success) {
          const schema = pageSchema[currentPage] || [];
          const populatedFields = schema.map(item => ({
            ...item,
            value: data.content[`${item.section}_${item.key}`] || '',
          }));
          setFields(populatedFields);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPageContent();
  }, [currentPage]);

  const handleChange = (idx: number, val: string) => {
    setFields(prev => {
      const updated = [...prev];
      updated[idx].value = val;
      return updated;
    });
  };

  const handleSave = async (idx: number) => {
    const item = fields[idx];
    const fieldKey = `${item.section}_${item.key}`;
    setIsSaving(fieldKey);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/page-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: currentPage,
          section: item.section,
          key: item.key,
          value: item.value
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Field "${item.label}" updated successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        throw new Error('Failed to update content field.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-display font-medium text-parchment">
            Page Copy &amp; Content Editor
          </h1>
          <p className="text-stone-dim text-xs">
            Edit text headers, eyebrows, manifesto blocks, and stats across the website without code deployments.
          </p>
        </div>

        {/* Page Selector Tabs */}
        <div className="flex gap-2 bg-ink-2 p-1 border border-line rounded-sm overflow-x-auto max-w-full custom-scrollbar shrink-0">
          {pages.map(p => (
            <button
              key={p.key}
              onClick={() => setCurrentPage(p.key)}
              className={`py-1.5 px-3 rounded-sm text-[10px] font-mono tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                currentPage === p.key 
                  ? 'bg-ember text-parchment' 
                  : 'text-stone-dim hover:text-stone hover:bg-ink'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-sm text-xs flex items-center gap-2 max-w-xl">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Fields List */}
      {loading ? (
        <div className="text-xs font-mono tracking-wider uppercase text-stone-dim">
          Fetching copy mappings...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-3xl bg-ink-2 border border-line p-6 md:p-8 rounded-sm">
          
          <div className="flex gap-3 items-start text-stone-dim text-xs leading-relaxed border-b border-line/45 pb-4 mb-4">
            <Info className="w-4.5 h-4.5 text-brass flex-shrink-0" />
            <p>
              Modifying these text keys updates the frontend copy immediately. HTML formatting tags (like <code className="text-parchment">&lt;br/&gt;</code> or <code className="text-parchment">&lt;em&gt;</code>) are allowed for layout adjustments.
            </p>
          </div>

          <div className="space-y-6">
            {fields.map((field, idx) => {
              const fieldKey = `${field.section}_${field.key}`;
              const saving = isSaving === fieldKey;
              return (
                <div key={fieldKey} className="space-y-2 border-b border-line/30 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-mono tracking-wider uppercase text-brass">
                      {field.label}
                    </label>
                    <span className="text-[9px] font-mono text-stone-dim/60">
                      Key: {fieldKey}
                    </span>
                  </div>

                  <div className="flex gap-4 items-end">
                    <div className="flex-grow">
                      {field.type === 'textarea' ? (
                        <textarea
                          value={field.value}
                          onChange={(e) => handleChange(idx, e.target.value)}
                          rows={3}
                          className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember font-sans normal-case"
                        />
                      ) : (
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleChange(idx, e.target.value)}
                          className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember font-sans normal-case"
                        />
                      )}
                    </div>

                    <button
                      onClick={() => handleSave(idx)}
                      disabled={saving}
                      className="bg-ink hover:bg-ember text-stone hover:text-parchment border border-line hover:border-ember p-3 rounded-sm text-[10px] font-mono tracking-wider uppercase transition-all duration-300 flex items-center justify-center flex-shrink-0 cursor-pointer w-28"
                    >
                      <Save className="w-3.5 h-3.5 mr-1" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
