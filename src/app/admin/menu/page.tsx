'use client';

import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Plus, Trash2, Save, RotateCcw } from 'lucide-react';

type MenuItem = {
  id: string;
  name: string;
  href: string;
};

export default function MenuEditor() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Surfaces', href: '/surfaces/plywood' },
    { id: '2', name: 'Inspiration', href: '/inspiration' },
    { id: '3', name: 'About', href: '/about' },
    { id: '4', name: 'Journal', href: '/journal' },
    { id: '5', name: 'Contact', href: '/contact' },
  ]);

  const [newItem, setNewItem] = useState({ name: '', href: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...menuItems];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    setMenuItems(items);
  };

  const handleMoveDown = (index: number) => {
    if (index === menuItems.length - 1) return;
    const items = [...menuItems];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    setMenuItems(items);
  };

  const handleAdd = () => {
    if (!newItem.name || !newItem.href) return;
    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name,
      href: newItem.href,
    };
    setMenuItems([...menuItems, item]);
    setNewItem({ name: '', href: '' });
  };

  const handleDelete = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleSave = () => {
    setSuccessMsg('Menu configurations saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-line pb-4">
        <div>
          <span className="block text-[8px] font-mono tracking-widest text-brass uppercase">Global Navigation</span>
          <h1 className="text-2xl font-display font-medium text-parchment">Menu Link Manager</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-ember hover:bg-ember-light text-ember-text font-mono text-[10px] tracking-wider uppercase font-semibold py-2 px-5 rounded-sm transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-ember/10 border border-ember text-ember-light p-3 text-xs font-mono rounded-sm">
          {successMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Active links list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-ink-2/40 border border-line p-4 rounded-sm">
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase mb-4">Active Header Links</span>

            <div className="divide-y divide-line/40">
              {menuItems.map((item, index) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  {/* Link Details */}
                  <div className="flex-grow grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Display Label</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const items = [...menuItems];
                          items[index].name = e.target.value;
                          setMenuItems(items);
                        }}
                        className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">URL path</label>
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => {
                          const items = [...menuItems];
                          items[index].href = e.target.value;
                          setMenuItems(items);
                        }}
                        className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                      />
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-1 mt-5 shrink-0">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-2 border border-line/50 hover:border-stone text-stone-dim hover:text-parchment disabled:opacity-30 disabled:pointer-events-none rounded-sm transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === menuItems.length - 1}
                      className="p-2 border border-line/50 hover:border-stone text-stone-dim hover:text-parchment disabled:opacity-30 disabled:pointer-events-none rounded-sm transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 border border-line/50 hover:border-red-500 text-stone-dim hover:text-red-400 rounded-sm transition-colors cursor-pointer"
                      title="Delete Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add new link box */}
        <div className="lg:col-span-4 bg-ink-2/30 border border-line p-6 space-y-4">
          <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Add New Link</span>

          <div className="space-y-3">
            <div>
              <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Link Name</label>
              <input
                type="text"
                placeholder="e.g. Catalog"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Destination URL</label>
              <input
                type="text"
                placeholder="e.g. /catalog"
                value={newItem.href}
                onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
                className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
              />
            </div>

            <button
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-1.5 bg-ink border border-line hover:border-ember text-parchment font-mono text-[9px] tracking-wider uppercase py-3 rounded-sm hover:bg-ember/10 transition-colors cursor-pointer mt-4"
            >
              <Plus className="w-4 h-4" /> Add Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
