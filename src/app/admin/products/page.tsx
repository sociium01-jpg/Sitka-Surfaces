'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layers, Plus, Edit2, Trash2, X, PlusCircle, MinusCircle, CheckCircle } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  slug: string;
  vertical: string;
  category: string;
  description: string;
  specs: string; // JSON string
  swatches: string; // JSON string
  applications: string;
  tags: string;
  isFeatured: boolean;
};

type KeyValRow = {
  key: string;
  val: string;
};

type SwatchRow = {
  name: string;
  value: string;
};

function ProductsConsole() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initAction = searchParams.get('action');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [vertical, setVertical] = useState('plywood');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [applications, setApplications] = useState('');
  const [tags, setTags] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Custom Dynamic Spec & Swatch builders
  const [specsRows, setSpecsRows] = useState<KeyValRow[]>([{ key: '', val: '' }]);
  const [swatchRows, setSwatchRows] = useState<SwatchRow[]>([{ name: '', value: '#242220' }]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle action parameter on init load
  useEffect(() => {
    if (initAction === 'new' && !loading) {
      openNewForm();
      router.replace('/admin/products');
    }
  }, [initAction, loading, router]);

  const openNewForm = () => {
    setName('');
    setVertical('plywood');
    setCategory('');
    setDescription('');
    setApplications('');
    setTags('');
    setIsFeatured(false);
    setSpecsRows([{ key: 'Grade', val: 'BWP / MR' }, { key: 'Thickness', val: '19mm' }, { key: 'Core', val: 'Hardwood' }]);
    setSwatchRows([{ name: 'Standard Finish', value: '#5c4033' }]);
    setEditingId(null);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (p: Product) => {
    setName(p.name);
    setVertical(p.vertical);
    setCategory(p.category);
    setDescription(p.description);
    setApplications(p.applications);
    setTags(p.tags);
    setIsFeatured(p.isFeatured);

    // Populate KeyVal spec rows
    try {
      const parsedSpecs = JSON.parse(p.specs || '{}');
      const rows = Object.entries(parsedSpecs).map(([k, v]) => ({ key: k, val: v as string }));
      setSpecsRows(rows.length > 0 ? rows : [{ key: '', val: '' }]);
    } catch (e) {
      setSpecsRows([{ key: '', val: '' }]);
    }

    // Populate Swatch rows
    try {
      const parsedSwatches = JSON.parse(p.swatches || '[]');
      setSwatchRows(parsedSwatches.length > 0 ? parsedSwatches : [{ name: '', value: '#242220' }]);
    } catch (e) {
      setSwatchRows([{ name: '', value: '#242220' }]);
    }

    setEditingId(p.id);
    setError('');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product SKU?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Spec builder helpers
  const handleAddSpecRow = () => setSpecsRows(prev => [...prev, { key: '', val: '' }]);
  const handleRemoveSpecRow = (idx: number) => setSpecsRows(prev => prev.filter((_, i) => i !== idx));
  const handleSpecRowChange = (idx: number, field: keyof KeyValRow, value: string) => {
    setSpecsRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  // Swatch builder helpers
  const handleAddSwatchRow = () => setSwatchRows(prev => [...prev, { name: '', value: '#242220' }]);
  const handleRemoveSwatchRow = (idx: number) => setSwatchRows(prev => prev.filter((_, i) => i !== idx));
  const handleSwatchRowChange = (idx: number, field: keyof SwatchRow, value: string) => {
    setSwatchRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    // Compile dynamic specs array to object
    const finalSpecs: Record<string, string> = {};
    specsRows.forEach(row => {
      if (row.key.trim()) {
        finalSpecs[row.key.trim()] = row.val.trim();
      }
    });

    // Compile swatches
    const finalSwatches = swatchRows.filter(row => row.name.trim());

    const url = '/api/products';
    const method = editingId ? 'PUT' : 'POST';
    const payload = {
      id: editingId,
      name,
      vertical,
      category,
      description,
      specs: JSON.stringify(finalSpecs),
      swatches: JSON.stringify(finalSwatches),
      applications,
      tags,
      isFeatured
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save product SKU.');
      }

      await fetchProducts();
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
        Assembling Products SKU...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-display font-medium text-parchment flex items-center gap-2">
            <Layers className="w-6 h-6 text-brass" /> Products Catalog SKU
          </h1>
          <p className="text-stone-dim text-xs">
            Manage inventory items, customize technical specifications, and add swatches colorways.
          </p>
        </div>

        <button
          onClick={openNewForm}
          className="bg-ember hover:bg-ember-light text-parchment text-xs font-mono tracking-wider uppercase py-3.5 px-6 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Product SKU
        </button>
      </div>

      {/* Product Edit Popup */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0a0806]/85 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-ink-2 border border-line rounded-sm max-w-[720px] w-full p-8 relative shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-stone-dim hover:text-parchment transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg md:text-xl font-display font-medium text-parchment mb-4">
              {editingId ? 'Edit Product SKU' : 'Add New Product SKU'}
            </h3>

            {error && (
              <div className="bg-ember/15 border border-ember/30 text-ember-light p-3.5 rounded-sm text-xs mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold font-sans">Product Name *</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember font-sans normal-case"
                    placeholder="e.g. Club Grade BWR Plywood"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold font-sans">Material Vertical *</label>
                  <select 
                    value={vertical}
                    onChange={(e) => setVertical(e.target.value)}
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember"
                  >
                    <option value="plywood">Plywood</option>
                    <option value="laminates">Laminates</option>
                    <option value="veneer">Veneer</option>
                    <option value="decoratives">Decoratives</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold font-sans">Sub-Category *</label>
                  <input 
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember font-sans normal-case"
                    placeholder="e.g. Premium Grade or Super Matte"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold font-sans">Applications Suitable *</label>
                  <input 
                    type="text"
                    value={applications}
                    onChange={(e) => setApplications(e.target.value)}
                    required
                    className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember font-sans normal-case"
                    placeholder="e.g. Kitchen modular cabinets, wardrobes"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono tracking-wider uppercase text-stone-dim font-semibold font-sans">Description *</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-ink border border-line rounded-sm p-3 text-parchment text-xs focus:outline-none focus:border-ember font-sans normal-case"
                  placeholder="Insert product summary details..."
                />
              </div>

              {/* Dynamic Specifications Matrix Builder */}
              <div className="space-y-3 bg-ink/30 border border-line/70 p-4 rounded-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-brass font-bold">Specifications Matrix</span>
                  <button 
                    type="button" 
                    onClick={handleAddSpecRow}
                    className="text-[9px] font-mono text-ember-light hover:text-ember transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Spec Row
                  </button>
                </div>

                <div className="space-y-2">
                  {specsRows.map((row, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input 
                        type="text" 
                        value={row.key} 
                        onChange={(e) => handleSpecRowChange(idx, 'key', e.target.value)}
                        placeholder="Spec Key (e.g. Thickness)" 
                        className="bg-ink border border-line rounded-sm p-2 text-parchment text-[11px] focus:outline-none w-1/2 font-sans normal-case"
                      />
                      <input 
                        type="text" 
                        value={row.val} 
                        onChange={(e) => handleSpecRowChange(idx, 'val', e.target.value)}
                        placeholder="Spec Value (e.g. 19mm)" 
                        className="bg-ink border border-line rounded-sm p-2 text-parchment text-[11px] focus:outline-none w-1/2 font-sans normal-case"
                      />
                      {specsRows.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSpecRow(idx)}
                          className="text-stone-dim hover:text-ember transition-colors p-1 cursor-pointer"
                        >
                          <MinusCircle className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Swatches Colorway Builder */}
              <div className="space-y-3 bg-ink/30 border border-line/70 p-4 rounded-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-brass font-bold">Colorway Swatches</span>
                  <button 
                    type="button" 
                    onClick={handleAddSwatchRow}
                    className="text-[9px] font-mono text-ember-light hover:text-ember transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Swatch Row
                  </button>
                </div>

                <div className="space-y-2">
                  {swatchRows.map((row, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input 
                        type="text" 
                        value={row.name} 
                        onChange={(e) => handleSwatchRowChange(idx, 'name', e.target.value)}
                        placeholder="Color Name (e.g. Natural Oak)" 
                        className="bg-ink border border-line rounded-sm p-2 text-parchment text-[11px] focus:outline-none w-1/2 font-sans normal-case"
                      />
                      <div className="flex gap-2 items-center w-1/2">
                        <input 
                          type="color" 
                          value={row.value} 
                          onChange={(e) => handleSwatchRowChange(idx, 'value', e.target.value)}
                          className="w-8 h-8 rounded-sm bg-transparent border-0 cursor-pointer p-0 shrink-0"
                        />
                        <input 
                          type="text" 
                          value={row.value} 
                          onChange={(e) => handleSwatchRowChange(idx, 'value', e.target.value)}
                          placeholder="Hex Value (e.g. #ffffff)" 
                          className="bg-ink border border-line rounded-sm p-2 text-parchment text-[11px] focus:outline-none w-full font-mono uppercase"
                        />
                      </div>
                      {swatchRows.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSwatchRow(idx)}
                          className="text-stone-dim hover:text-ember transition-colors p-1 cursor-pointer"
                        >
                          <MinusCircle className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-line/45 pt-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-ember cursor-pointer"
                  />
                  <label htmlFor="isFeatured" className="text-xs text-stone font-semibold cursor-pointer">Feature on hub pages</label>
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-ember text-parchment py-3 px-8 rounded-sm text-[10px] font-mono tracking-wider uppercase hover:bg-ember-light transition-colors disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Product SKU'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Catalog List Table */}
      <div className="bg-ink-2 border border-line rounded-sm overflow-hidden shadow-sm">
        <div className="p-4 bg-ink/30 border-b border-line text-xs font-mono text-stone-dim">
          Total Database Products: <b className="text-parchment">{products.length}</b>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-line/45">
              <thead>
                <tr className="bg-ink/30 text-brass uppercase tracking-wider">
                  <th className="p-4">SKU Name</th>
                  <th className="p-4">Vertical</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Applications</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30 text-stone-dim">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-ink/20 transition-colors">
                    <td className="p-4 font-sans font-semibold text-parchment">{p.name}</td>
                    <td className="p-4 uppercase tracking-wider">{p.vertical}</td>
                    <td className="p-4">{p.category}</td>
                    <td className="p-4 font-sans max-w-[180px] truncate">{p.applications}</td>
                    <td className="p-4">
                      {p.isFeatured ? (
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> YES</span>
                      ) : (
                        <span className="text-stone-dim">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditForm(p)}
                          className="p-2 border border-line hover:border-stone hover:text-parchment rounded-sm transition-colors text-stone-dim cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-2 border border-line hover:border-ember hover:text-ember-light rounded-sm transition-colors text-stone-dim cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-stone-dim text-sm">
            No products found in the catalog.
          </div>
        )}
      </div>

    </div>
  );
}

export default function AdminProducts() {
  return (
    <Suspense fallback={
      <div className="text-xs font-mono tracking-wider uppercase text-stone-dim">
        Loading Products Console...
      </div>
    }>
      <ProductsConsole />
    </Suspense>
  );
}
