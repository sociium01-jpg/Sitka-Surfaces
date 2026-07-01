'use client';

import React, { useState } from 'react';
import { Save, Plus, Trash2, Globe, Heart } from 'lucide-react';

type FooterLink = {
  id: string;
  name: string;
  href: string;
};

export default function FooterEditor() {
  const [address, setAddress] = useState('12, Material Boulevard, Industrial Zone, Bangalore, India');
  const [phone, setPhone] = useState('+91 80 4912 3000');
  const [email, setEmail] = useState('info@sitkasurfaces.com');
  const [copyright, setCopyright] = useState('© 2026 Sitka Surfaces Private Limited. All specifications subject to change.');
  
  const [socials, setSocials] = useState({
    instagram: 'https://instagram.com/sitkasurfaces',
    linkedin: 'https://linkedin.com/company/sitkasurfaces',
    youtube: 'https://youtube.com/c/sitkasurfaces',
  });

  const [newsletterHeadline, setNewsletterHeadline] = useState('Sign up for technical specs and range releases.');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = () => {
    setSuccessMsg('Footer settings updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-line pb-4">
        <div>
          <span className="block text-[8px] font-mono tracking-widest text-brass uppercase">Global Layout</span>
          <h1 className="text-2xl font-display font-medium text-parchment">Footer Manager</h1>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-ember hover:bg-ember-light text-ember-text font-mono text-[10px] tracking-wider uppercase font-semibold py-2 px-5 rounded-sm transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>

      {successMsg && (
        <div className="bg-ember/10 border border-ember text-ember-light p-3 text-xs font-mono rounded-sm">
          {successMsg}
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Basic Fields */}
        <div className="lg:col-span-8 space-y-6">
          {/* Office details */}
          <div className="bg-ink-2/40 border border-line p-6 rounded-sm space-y-4">
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Contact Details</span>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Corporate Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-ink border border-line p-3 text-xs text-parchment rounded-sm focus:border-ember outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Office Telephone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-ink border border-line p-2.5 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Support Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-ink border border-line p-2.5 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Copyright & Newsletter */}
          <div className="bg-ink-2/40 border border-line p-6 rounded-sm space-y-4">
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Newsletter & Compliance</span>

            <div className="space-y-4">
              <div>
                <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Newsletter Callout</label>
                <input
                  type="text"
                  value={newsletterHeadline}
                  onChange={(e) => setNewsletterHeadline(e.target.value)}
                  className="w-full bg-ink border border-line p-2.5 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                />
              </div>

              <div>
                <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Legal Copyright Text</label>
                <input
                  type="text"
                  value={copyright}
                  onChange={(e) => setCopyright(e.target.value)}
                  className="w-full bg-ink border border-line p-2.5 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Profile links */}
        <div className="lg:col-span-4 bg-ink-2/30 border border-line p-6 space-y-4">
          <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Social Profiles</span>

          <div className="space-y-4">
            <div>
              <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Instagram URL</label>
              <input
                type="text"
                value={socials.instagram}
                onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">LinkedIn Page</label>
              <input
                type="text"
                value={socials.linkedin}
                onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">YouTube Channel</label>
              <input
                type="text"
                value={socials.youtube}
                onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
