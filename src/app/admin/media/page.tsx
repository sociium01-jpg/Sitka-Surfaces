'use client';

import React, { useEffect, useState } from 'react';
import { Image, Video, Save, CheckCircle } from 'lucide-react';

type MediaSlot = {
  mediaType: string;
  mediaUrl: string;
  fallbackUrl: string | null;
};

export default function AdminMedia() {
  const [mediaMap, setMediaMap] = useState<Record<string, MediaSlot>>({});
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const pages = [
    { key: 'home', name: 'Homepage Hero' },
    { key: 'plywood', name: 'Plywood Core Hub' },
    { key: 'laminates', name: 'Laminates Hub' },
    { key: 'veneer', name: 'Natural Veneer Hub' },
    { key: 'decoratives', name: 'Decoratives &amp; Edge Hub' },
    { key: 'about', name: 'About Page Hero' },
    { key: 'inspiration', name: 'Lookbook Gallery Hero' },
  ];

  useEffect(() => {
    async function fetchMedia() {
      try {
        const res = await fetch('/api/media');
        const data = await res.json();
        if (data.success) {
          // Initialize empty slots if database has missing values
          const updated = { ...data.media };
          pages.forEach(p => {
            if (!updated[p.key]) {
              updated[p.key] = { mediaType: 'image', mediaUrl: '', fallbackUrl: '' };
            }
          });
          setMediaMap(updated);
        }
      } catch (err) {
        console.error('Failed to load media slots:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
  }, []);

  const handleChange = (page: string, field: keyof MediaSlot, value: string) => {
    setMediaMap(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value
      }
    }));
  };

  const handleSave = async (page: string) => {
    setIsSaving(page);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          ...mediaMap[page]
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Hero media for ${page} updated successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        throw new Error('Failed to update media.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="text-xs font-mono tracking-wider uppercase text-stone-dim">
        Assembling Media Slots...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-display font-medium text-parchment flex items-center gap-2">
          Hero Media Manager
        </h1>
        <p className="text-stone-dim text-xs">
          Replace or update background media (images or MP4 videos) for the primary headers across the site.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-sm text-xs flex items-center gap-2 max-w-xl">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Media Edit Cards List */}
      <div className="grid grid-cols-1 gap-6 max-w-3xl">
        {pages.map((p) => {
          const item = mediaMap[p.key];
          const saving = isSaving === p.key;
          return (
            <div 
              key={p.key}
              className="bg-ink-2 border border-line p-6 rounded-sm space-y-4 hover:border-line transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
            >
              {/* Preview block (cols 4) */}
              <div className="md:col-span-4 space-y-2">
                <span className="block text-[9px] font-mono tracking-wider uppercase text-brass">
                  {p.name}
                </span>
                
                <div className="relative aspect-video bg-ink rounded-sm overflow-hidden border border-line flex items-center justify-center">
                  {item.mediaUrl ? (
                    item.mediaType === 'video' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-dim text-[10px] font-mono p-4 text-center">
                        <Video className="w-5 h-5 text-brass mb-1.5" />
                        <span className="truncate w-full block">{item.mediaUrl.split('/').pop()}</span>
                        <span className="text-[8px] text-stone-dim/60 block mt-1">(Video File Tracked)</span>
                      </div>
                    ) : (
                      <img 
                        src={item.mediaUrl} 
                        alt="Hero preview" 
                        className="w-full h-full object-cover filter brightness-90"
                      />
                    )
                  ) : (
                    <span className="text-[10px] font-mono text-stone-dim">No Media Active</span>
                  )}
                </div>
              </div>

              {/* Form Input fields (cols 8) */}
              <div className="md:col-span-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim">Media Type</label>
                    <select 
                      value={item.mediaType}
                      onChange={(e) => handleChange(p.key, 'mediaType', e.target.value)}
                      className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                    >
                      <option value="image">Image Background</option>
                      <option value="video">MP4 Video Background</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim">Fallback Image (Optional)</label>
                    <input 
                      type="text"
                      value={item.fallbackUrl || ''}
                      onChange={(e) => handleChange(p.key, 'fallbackUrl', e.target.value)}
                      placeholder="e.g. /images/fallback.jpg"
                      className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim">Background Media URL</label>
                  <input 
                    type="text"
                    value={item.mediaUrl}
                    onChange={(e) => handleChange(p.key, 'mediaUrl', e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/... or /videos/bg.mp4"
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleSave(p.key)}
                    disabled={saving}
                    className="bg-ink hover:bg-ember text-stone hover:text-parchment border border-line hover:border-ember py-2.5 px-6 rounded-sm text-[10px] font-mono tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Media Slot'}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
