'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, Copy, Save, Edit, RefreshCw, Layers, FileText, BarChart2, Video, Quote, Percent, PlusCircle, Check } from 'lucide-react';
import { Project, Block, Finish } from '@/types/visualizer';

export default function AdminInspirationBuilder() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [finishesCatalog, setFinishesCatalog] = useState<Finish[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Editor form meta details
  const [metaName, setMetaName] = useState('');
  const [metaSlug, setMetaSlug] = useState('');
  const [metaStatus, setMetaStatus] = useState<'draft' | 'published'>('draft');
  const [metaVerticals, setMetaVerticals] = useState<string[]>([]);
  const [metaSpaces, setMetaSpaces] = useState<string[]>([]);
  const [metaFeatured, setMetaFeatured] = useState(false);
  const [metaOrder, setMetaOrder] = useState(0);

  // Dynamic blocks builder state
  const [editorBlocks, setEditorBlocks] = useState<Block[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, finRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/visualizer/finishes')
        ]);
        const projData = await projRes.json();
        const finData = await finRes.json();

        if (projData.success) {
          setProjects(projData.projects || []);
        }
        if (finData.success) {
          setFinishesCatalog(finData.finishes || []);
        }
      } catch (err) {
        console.error('Failed to load portfolio CMS details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectProject = (proj: Project) => {
    setSelectedProject(proj);
    setMetaName(proj.name);
    setMetaSlug(proj.slug);
    setMetaStatus(proj.status);
    setMetaVerticals(proj.verticals || []);
    setMetaSpaces(proj.spaceTypes || []);
    setMetaFeatured(proj.featuredOnHomepage || false);
    setMetaOrder(proj.homepageOrder || 0);
    setEditorBlocks(proj.blocks || []);
    setActiveBlockId(proj.blocks?.[0]?.id || null);
    setMessage(null);
  };

  const handleNewProject = () => {
    const tempSlug = `new-case-study-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempProj: Project = {
      id: '',
      name: 'Untitled Case Study',
      slug: tempSlug,
      status: 'draft',
      verticals: ['Plywood'],
      spaceTypes: ['Office'],
      featuredOnHomepage: false,
      homepageOrder: 0,
      blocks: [
        {
          id: Math.random().toString(36).substring(2, 9),
          type: 'hero',
          title: 'Untitled Case Study',
          location: 'Bangalore',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          credit: 'Architectural Credit',
          layout: 'full-bleed'
        }
      ]
    };
    handleSelectProject(tempProj);
  };

  // Add block helper
  const handleAddBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      ...(type === 'richText' && { content: '### Section Header\n\nEnter formatted case study description paragraphs here. Supports **bold** text and lists.' }),
      ...(type === 'image' && { imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', caption: 'Material detail view', layout: 'contained' }),
      ...(type === 'gallery' && { images: [{ url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80' }] }),
      ...(type === 'video' && { source: 'https://www.w3schools.com/html/mov_bbb.mp4', autoplay: false, loop: true, muted: true, controls: true }),
      ...(type === 'graph' && { chartType: 'bar', title: 'Performance Metrics', dataSeries: [{ label: 'Metric A', value: 80 }, { label: 'Metric B', value: 45 }] }),
      ...(type === 'stat' && { value: '45%', label: 'Install duration reduction' }),
      ...(type === 'quote' && { quoteText: 'Sitka surfaces transformed our design vision into durable reality.', quoteAuthor: 'Design Lead' }),
      ...(type === 'materialsUsed' && { finishIds: [] }),
      ...(type === 'cta' && { label: 'Inquire About This Look', prefillNote: 'Hi! I am interested in building a similar layout.' })
    };

    setEditorBlocks([...editorBlocks, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  // Reordering helpers
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const updated = [...editorBlocks];
    if (direction === 'up' && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === 'down' && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    setEditorBlocks(updated);
  };

  const duplicateBlock = (block: Block) => {
    const duplicated: Block = {
      ...block,
      id: Math.random().toString(36).substring(2, 9),
      // Deep copy nested objects
      dataSeries: block.dataSeries ? [...block.dataSeries] : undefined,
      finishIds: block.finishIds ? [...block.finishIds] : undefined,
      images: block.images ? [...block.images] : undefined
    };
    const idx = editorBlocks.findIndex(b => b.id === block.id);
    const updated = [...editorBlocks];
    updated.splice(idx + 1, 0, duplicated);
    setEditorBlocks(updated);
    setActiveBlockId(duplicated.id);
  };

  const deleteBlock = (id: string) => {
    if (editorBlocks.length <= 1) {
      alert('A project case study requires at least one block.');
      return;
    }
    const updated = editorBlocks.filter(b => b.id !== id);
    setEditorBlocks(updated);
    if (activeBlockId === id) {
      setActiveBlockId(updated[0]?.id || null);
    }
  };

  const updateBlockField = (id: string, field: keyof Block, value: any) => {
    setEditorBlocks(
      editorBlocks.map(b => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // Save changes API
  const handleSaveProject = async () => {
    if (!metaName.trim() || !metaSlug.trim()) {
      setMessage({ type: 'error', text: 'Name and slug are required parameters.' });
      return;
    }

    // Validate Graph Block constraint
    const hasInvalidGraph = editorBlocks.some(b => b.type === 'graph' && (!b.dataSeries || b.dataSeries.length < 2));
    if (hasInvalidGraph) {
      setMessage({ type: 'error', text: 'Graph Blocks require at least 2 data points.' });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    const payload = {
      id: selectedProject?.id,
      name: metaName,
      slug: metaSlug,
      status: metaStatus,
      verticals: metaVerticals,
      spaceTypes: metaSpaces,
      featuredOnHomepage: metaFeatured,
      homepageOrder: Number(metaOrder),
      blocks: editorBlocks
    };

    try {
      const isEdit = !!selectedProject?.id;
      const res = await fetch('/api/projects', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: isEdit ? 'Case study updated successfully.' : 'Case study created successfully.' });
        // Reload list
        const listRes = await fetch('/api/projects');
        const listData = await listRes.json();
        if (listData.success) {
          setProjects(listData.projects);
          const matched = listData.projects.find((p: any) => p.slug === metaSlug);
          if (matched) setSelectedProject(matched);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save project.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Database save failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this case study?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSelectedProject(null);
        setEditorBlocks([]);
        const listRes = await fetch('/api/projects');
        const listData = await listRes.json();
        if (listData.success) setProjects(listData.projects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-ink min-h-screen p-6 md:p-8 space-y-6 select-none">
      <div className="border-b border-line pb-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-brass uppercase block">CMS Dashboard</span>
          <h2 className="text-xl md:text-2xl font-display font-medium text-parchment uppercase">Inspiration Page Builder</h2>
        </div>
        <button
          onClick={handleNewProject}
          className="bg-ember border border-ember text-parchment py-2.5 px-4 rounded-sm text-xs font-mono tracking-wider uppercase hover:bg-ink hover:text-ember transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Case Study
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Projects List */}
        <div className="lg:col-span-3 bg-ink-2 border border-line p-5 rounded-sm space-y-4">
          <h3 className="text-xs font-mono tracking-wider text-brass uppercase border-b border-line/45 pb-2">Case Study Pages</h3>
          {loading ? (
            <div className="text-xs font-mono text-stone-dim animate-pulse">Loading list...</div>
          ) : projects.length === 0 ? (
            <div className="text-xs text-stone-dim py-4 italic">No projects found. Add one to start.</div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {projects.map((p) => {
                const isSelected = selectedProject?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p)}
                    className={`p-3 rounded-sm border cursor-pointer transition-all flex justify-between items-center ${
                      isSelected
                        ? 'border-brass bg-brass/10 text-parchment'
                        : 'border-line text-stone-dim hover:border-stone-dim/50 hover:bg-ink'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="block text-xs font-medium truncate">{p.name}</span>
                      <span className="text-[9px] font-mono tracking-wider uppercase text-brass">
                        {p.status} · {p.spaceTypes.join(', ')}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(p.id);
                      }}
                      className="text-stone-dim hover:text-red-400 p-1 cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Case Study Workspace */}
        {selectedProject ? (
          <div className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Editor Workspace Panel */}
            <div className="xl:col-span-6 space-y-6">
              
              {/* Meta Config Block */}
              <div className="bg-ink-2 border border-line p-6 rounded-sm space-y-4">
                <div className="flex justify-between items-center border-b border-line/30 pb-2">
                  <h4 className="text-xs font-mono tracking-wider text-brass uppercase">Page Settings</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProject}
                      disabled={actionLoading}
                      className="bg-brass text-ink font-mono text-[10px] py-1.5 px-3 rounded-sm uppercase tracking-wider font-semibold hover:bg-parchment transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> {actionLoading ? 'Saving...' : 'Save Page'}
                    </button>
                  </div>
                </div>

                {message && (
                  <div className={`p-3 rounded-sm text-xs font-mono ${
                    message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider uppercase text-stone-dim">Project Name</label>
                    <input
                      type="text"
                      value={metaName}
                      onChange={(e) => setMetaName(e.target.value)}
                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:outline-none focus:border-brass"
                      placeholder="e.g. Amber House Residence"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider uppercase text-stone-dim">URL Slug</label>
                    <input
                      type="text"
                      value={metaSlug}
                      onChange={(e) => setMetaSlug(e.target.value)}
                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:outline-none focus:border-brass"
                      placeholder="e.g. amber-house"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider uppercase text-stone-dim">Publish Status</label>
                    <select
                      value={metaStatus}
                      onChange={(e) => setMetaStatus(e.target.value as any)}
                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:outline-none focus:border-brass"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="metaFeatured"
                      checked={metaFeatured}
                      onChange={(e) => setMetaFeatured(e.target.checked)}
                      className="rounded border-line bg-ink text-ember focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="metaFeatured" className="text-[10px] font-mono tracking-wider uppercase text-stone-dim cursor-pointer">
                      Featured on Homepage
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider uppercase text-stone-dim">Vertical Tags (Comma Separated)</label>
                    <input
                      type="text"
                      value={metaVerticals.join(', ')}
                      onChange={(e) => setMetaVerticals(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:outline-none focus:border-brass"
                      placeholder="e.g. Veneer, Laminates"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider uppercase text-stone-dim">Space Tags (Comma Separated)</label>
                    <input
                      type="text"
                      value={metaSpaces.join(', ')}
                      onChange={(e) => setMetaSpaces(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:outline-none focus:border-brass"
                      placeholder="e.g. Kitchen, Living"
                    />
                  </div>
                </div>
              </div>

              {/* Block Assembly Canvas */}
              <div className="bg-ink-2 border border-line p-6 rounded-sm space-y-4">
                <h4 className="text-xs font-mono tracking-wider text-brass uppercase border-b border-line/30 pb-2">Block Layout Canvas</h4>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                  {editorBlocks.map((b, index) => {
                    const isActive = activeBlockId === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setActiveBlockId(b.id)}
                        className={`p-4 rounded-sm border cursor-pointer transition-all space-y-2 ${
                          isActive
                            ? 'border-brass bg-brass/5'
                            : 'border-line hover:border-stone-dim/30'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono uppercase text-parchment font-semibold">
                            Block #{index + 1}: {b.type}
                          </span>
                          
                          {/* Reordering and block controls */}
                          <div className="flex items-center gap-1.5 opacity-65 group-hover:opacity-100">
                            <button
                              onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }}
                              className="text-stone-dim hover:text-parchment p-1 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }}
                              className="text-stone-dim hover:text-parchment p-1 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); duplicateBlock(b); }}
                              className="text-stone-dim hover:text-parchment p-1 cursor-pointer"
                              title="Duplicate Block"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteBlock(b.id); }}
                              className="text-stone-dim hover:text-red-400 p-1 cursor-pointer"
                              title="Delete Block"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline block edit panel fields */}
                        {isActive && (
                          <div className="space-y-4 pt-3 border-t border-line/35 text-xs text-stone">
                            
                            {b.type === 'hero' && (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Hero Title</label>
                                  <input
                                    type="text"
                                    value={b.title || ''}
                                    onChange={(e) => updateBlockField(b.id, 'title', e.target.value)}
                                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Location</label>
                                    <input
                                      type="text"
                                      value={b.location || ''}
                                      onChange={(e) => updateBlockField(b.id, 'location', e.target.value)}
                                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Design Credit</label>
                                    <input
                                      type="text"
                                      value={b.credit || ''}
                                      onChange={(e) => updateBlockField(b.id, 'credit', e.target.value)}
                                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Hero Image URL</label>
                                  <input
                                    type="text"
                                    value={b.imageUrl || ''}
                                    onChange={(e) => updateBlockField(b.id, 'imageUrl', e.target.value)}
                                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                  />
                                </div>
                              </>
                            )}

                            {b.type === 'richText' && (
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Markdown Content</label>
                                <textarea
                                  value={b.content || ''}
                                  onChange={(e) => updateBlockField(b.id, 'content', e.target.value)}
                                  rows={6}
                                  className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:outline-none focus:border-brass font-mono"
                                />
                              </div>
                            )}

                            {b.type === 'image' && (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Image URL</label>
                                  <input
                                    type="text"
                                    value={b.imageUrl || ''}
                                    onChange={(e) => updateBlockField(b.id, 'imageUrl', e.target.value)}
                                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Caption</label>
                                    <input
                                      type="text"
                                      value={b.caption || ''}
                                      onChange={(e) => updateBlockField(b.id, 'caption', e.target.value)}
                                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Layout</label>
                                    <select
                                      value={b.layout || 'contained'}
                                      onChange={(e) => updateBlockField(b.id, 'layout', e.target.value)}
                                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                    >
                                      <option value="contained">Contained Box</option>
                                      <option value="full-bleed">Full Bleed Screen</option>
                                    </select>
                                  </div>
                                </div>
                              </>
                            )}

                            {b.type === 'gallery' && (
                              <div className="space-y-3">
                                <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Gallery Images</label>
                                {b.images?.map((img, idx) => (
                                  <div key={idx} className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      value={img.url}
                                      onChange={(e) => {
                                        const copy = [...(b.images || [])];
                                        copy[idx] = { ...copy[idx], url: e.target.value };
                                        updateBlockField(b.id, 'images', copy);
                                      }}
                                      className="flex-1 bg-ink border border-line p-1 text-xs text-parchment rounded-sm"
                                      placeholder="Image URL"
                                    />
                                    <button
                                      onClick={() => {
                                        const copy = (b.images || []).filter((_, i) => i !== idx);
                                        updateBlockField(b.id, 'images', copy);
                                      }}
                                      className="text-red-400 p-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    updateBlockField(b.id, 'images', [...(b.images || []), { url: '', caption: '' }]);
                                  }}
                                  className="text-[10px] font-mono uppercase text-brass flex items-center gap-1"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" /> Add Image
                                </button>
                              </div>
                            )}

                            {b.type === 'video' && (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Video File URL or Embed Link</label>
                                  <input
                                    type="text"
                                    value={b.source || ''}
                                    onChange={(e) => updateBlockField(b.id, 'source', e.target.value)}
                                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                    placeholder="e.g. https://domain.com/video.mp4 or YouTube URL"
                                  />
                                </div>
                                <div className="grid grid-cols-4 gap-2 pt-2">
                                  <label className="flex items-center gap-1">
                                    <input
                                      type="checkbox"
                                      checked={!!b.autoplay}
                                      onChange={(e) => updateBlockField(b.id, 'autoplay', e.target.checked)}
                                    /> Autoplay
                                  </label>
                                  <label className="flex items-center gap-1">
                                    <input
                                      type="checkbox"
                                      checked={!!b.loop}
                                      onChange={(e) => updateBlockField(b.id, 'loop', e.target.checked)}
                                    /> Loop
                                  </label>
                                  <label className="flex items-center gap-1">
                                    <input
                                      type="checkbox"
                                      checked={!!b.muted}
                                      onChange={(e) => updateBlockField(b.id, 'muted', e.target.checked)}
                                    /> Muted
                                  </label>
                                  <label className="flex items-center gap-1">
                                    <input
                                      type="checkbox"
                                      checked={!!b.controls}
                                      onChange={(e) => updateBlockField(b.id, 'controls', e.target.checked)}
                                    /> Controls
                                  </label>
                                </div>
                              </>
                            )}

                            {b.type === 'graph' && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Chart Type</label>
                                    <select
                                      value={b.chartType || 'bar'}
                                      onChange={(e) => updateBlockField(b.id, 'chartType', e.target.value as any)}
                                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                    >
                                      <option value="bar">Bar Chart</option>
                                      <option value="line">Line Trend Chart</option>
                                      <option value="pie">Pie Breakdown</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Chart Title</label>
                                    <input
                                      type="text"
                                      value={b.title || ''}
                                      onChange={(e) => updateBlockField(b.id, 'title', e.target.value)}
                                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Data Series Table</label>
                                  {b.dataSeries?.map((ds, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                      <input
                                        type="text"
                                        value={ds.label}
                                        onChange={(e) => {
                                          const copy = [...(b.dataSeries || [])];
                                          copy[idx] = { ...copy[idx], label: e.target.value };
                                          updateBlockField(b.id, 'dataSeries', copy);
                                        }}
                                        className="flex-1 bg-ink border border-line p-1 text-xs text-parchment rounded-sm"
                                        placeholder="Label (e.g. Cost)"
                                      />
                                      <input
                                        type="number"
                                        value={ds.value}
                                        onChange={(e) => {
                                          const copy = [...(b.dataSeries || [])];
                                          copy[idx] = { ...copy[idx], value: Number(e.target.value) };
                                          updateBlockField(b.id, 'dataSeries', copy);
                                        }}
                                        className="w-24 bg-ink border border-line p-1 text-xs text-parchment rounded-sm"
                                        placeholder="Value"
                                      />
                                      <button
                                        onClick={() => {
                                          const copy = (b.dataSeries || []).filter((_, i) => i !== idx);
                                          updateBlockField(b.id, 'dataSeries', copy);
                                        }}
                                        className="text-red-400 p-1"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      updateBlockField(b.id, 'dataSeries', [...(b.dataSeries || []), { label: '', value: 0 }]);
                                    }}
                                    className="text-[10px] font-mono uppercase text-brass flex items-center gap-1"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" /> Add Datapoint
                                  </button>
                                </div>
                              </div>
                            )}

                            {b.type === 'stat' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Big Value</label>
                                  <input
                                    type="text"
                                    value={b.value || ''}
                                    onChange={(e) => updateBlockField(b.id, 'value', e.target.value)}
                                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                    placeholder="e.g. 40ft or 98%"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Label</label>
                                  <input
                                    type="text"
                                    value={b.label || ''}
                                    onChange={(e) => updateBlockField(b.id, 'label', e.target.value)}
                                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                    placeholder="e.g. seamless lobby backdrop"
                                  />
                                </div>
                              </div>
                            )}

                            {b.type === 'quote' && (
                              <>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Quote text</label>
                                  <textarea
                                    value={b.quoteText || ''}
                                    onChange={(e) => updateBlockField(b.id, 'quoteText', e.target.value)}
                                    rows={3}
                                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Author</label>
                                  <input
                                    type="text"
                                    value={b.quoteAuthor || ''}
                                    onChange={(e) => updateBlockField(b.id, 'quoteAuthor', e.target.value)}
                                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                    placeholder="Author name and title"
                                  />
                                </div>
                              </>
                            )}

                            {b.type === 'materialsUsed' && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Materials Used Catalog Links</label>
                                <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto border border-line p-2 rounded-sm bg-ink custom-scrollbar">
                                  {finishesCatalog.map(fin => {
                                    const isUsed = b.finishIds?.includes(fin.id);
                                    return (
                                      <label key={fin.id} className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={!!isUsed}
                                          onChange={(e) => {
                                            const copy = [...(b.finishIds || [])];
                                            if (e.target.checked) {
                                              copy.push(fin.id);
                                            } else {
                                              const i = copy.indexOf(fin.id);
                                              if (i !== -1) copy.splice(i, 1);
                                            }
                                            updateBlockField(b.id, 'finishIds', copy);
                                          }}
                                          className="rounded border-line bg-ink-2 focus:ring-0 w-3.5 h-3.5"
                                        />
                                        <span className="text-[10px] text-stone-dim truncate">{fin.name}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {b.type === 'cta' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Button label</label>
                                  <input
                                    type="text"
                                    value={b.label || ''}
                                    onChange={(e) => updateBlockField(b.id, 'label', e.target.value)}
                                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono tracking-wider text-stone-dim uppercase">Enquiry Prefill Note</label>
                                  <input
                                    type="text"
                                    value={b.prefillNote || ''}
                                    onChange={(e) => updateBlockField(b.id, 'prefillNote', e.target.value)}
                                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm"
                                  />
                                </div>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Block Selector list */}
                <div className="border-t border-line/45 pt-4 space-y-2">
                  <span className="text-[9px] font-mono uppercase text-stone-dim block">Add Content Block:</span>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                    <button onClick={() => handleAddBlock('richText')} className="border border-line hover:border-brass/40 py-2 rounded-sm uppercase tracking-wider flex items-center justify-center gap-1 bg-ink cursor-pointer hover:bg-brass/5">
                      <FileText className="w-3.5 h-3.5 text-brass" /> Text
                    </button>
                    <button onClick={() => handleAddBlock('image')} className="border border-line hover:border-brass/40 py-2 rounded-sm uppercase tracking-wider flex items-center justify-center gap-1 bg-ink cursor-pointer hover:bg-brass/5">
                      <Plus className="w-3.5 h-3.5 text-brass" /> Image
                    </button>
                    <button onClick={() => handleAddBlock('gallery')} className="border border-line hover:border-brass/40 py-2 rounded-sm uppercase tracking-wider flex items-center justify-center gap-1 bg-ink cursor-pointer hover:bg-brass/5">
                      <PlusCircle className="w-3.5 h-3.5 text-brass" /> Gallery
                    </button>
                    <button onClick={() => handleAddBlock('video')} className="border border-line hover:border-brass/40 py-2 rounded-sm uppercase tracking-wider flex items-center justify-center gap-1 bg-ink cursor-pointer hover:bg-brass/5">
                      <Video className="w-3.5 h-3.5 text-brass" /> Video
                    </button>
                    <button onClick={() => handleAddBlock('graph')} className="border border-line hover:border-brass/40 py-2 rounded-sm uppercase tracking-wider flex items-center justify-center gap-1 bg-ink cursor-pointer hover:bg-brass/5">
                      <BarChart2 className="w-3.5 h-3.5 text-brass" /> Graph
                    </button>
                    <button onClick={() => handleAddBlock('stat')} className="border border-line hover:border-brass/40 py-2 rounded-sm uppercase tracking-wider flex items-center justify-center gap-1 bg-ink cursor-pointer hover:bg-brass/5">
                      <Percent className="w-3.5 h-3.5 text-brass" /> Stat Callout
                    </button>
                    <button onClick={() => handleAddBlock('quote')} className="border border-line hover:border-brass/40 py-2 rounded-sm uppercase tracking-wider flex items-center justify-center gap-1 bg-ink cursor-pointer hover:bg-brass/5">
                      <Quote className="w-3.5 h-3.5 text-brass" /> Quote
                    </button>
                    <button onClick={() => handleAddBlock('materialsUsed')} className="border border-line hover:border-brass/40 py-2 rounded-sm uppercase tracking-wider flex items-center justify-center gap-1 bg-ink cursor-pointer hover:bg-brass/5">
                      <Layers className="w-3.5 h-3.5 text-brass" /> Materials
                    </button>
                    <button onClick={() => handleAddBlock('cta')} className="border border-line hover:border-brass/40 py-2 rounded-sm uppercase tracking-wider flex items-center justify-center gap-1 bg-ink cursor-pointer hover:bg-brass/5">
                      <Check className="w-3.5 h-3.5 text-brass" /> CTA Button
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Canvas Preview Panel (Right Side-by-Side) */}
            <div className="xl:col-span-6 bg-ink border border-line rounded-sm p-6 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar select-none pointer-events-none">
              <div className="flex items-center gap-2 border-b border-line pb-2 mb-4">
                <Eye className="w-4 h-4 text-brass" />
                <span className="text-[10px] font-mono uppercase text-brass tracking-wider">Live Lookbook Preview</span>
              </div>
              
              <div className="space-y-6">
                {editorBlocks.map((b) => {
                  if (b.type === 'hero') {
                    return (
                      <div key={b.id} className="relative h-[200px] flex items-center justify-center bg-zinc-950 overflow-hidden border border-line rounded-sm">
                        <img src={b.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-25" />
                        <div className="relative z-10 text-center space-y-2 p-4">
                          <h2 className="text-xl font-display font-medium text-parchment">{b.title || 'Untitled Project'}</h2>
                          <div className="text-[9px] font-mono text-stone-dim uppercase tracking-widest flex justify-center gap-3">
                            <span>{b.location}</span>
                            <span>{b.credit}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (b.type === 'richText') {
                    return (
                      <div key={b.id} className="text-xs text-stone-dim space-y-1.5 font-sans whitespace-pre-line border-l border-line/45 pl-3">
                        {b.content}
                      </div>
                    );
                  }

                  if (b.type === 'image') {
                    return (
                      <div key={b.id} className="space-y-1 text-center">
                        <div className="h-[120px] bg-zinc-900 border border-line rounded-sm overflow-hidden">
                          <img src={b.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[9px] font-mono text-stone/50 block">{b.caption}</span>
                      </div>
                    );
                  }

                  if (b.type === 'gallery') {
                    return (
                      <div key={b.id} className="grid grid-cols-3 gap-2">
                        {b.images?.map((img, idx) => (
                          <div key={idx} className="aspect-square bg-zinc-900 border border-line rounded-sm overflow-hidden">
                            {img.url && <img src={img.url} className="w-full h-full object-cover" />}
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (b.type === 'stat') {
                    return (
                      <div key={b.id} className="bg-ink-2 border border-line p-4 rounded-sm text-center">
                        <div className="text-2xl font-display text-ember-light font-bold">{b.value}</div>
                        <div className="text-[9px] font-mono uppercase text-stone-dim">{b.label}</div>
                      </div>
                    );
                  }

                  if (b.type === 'quote') {
                    return (
                      <blockquote key={b.id} className="border-l-2 border-brass pl-3 italic text-xs text-stone-dim">
                        "{b.quoteText}" <span className="block text-[9px] font-mono uppercase text-stone/50 mt-1">— {b.quoteAuthor}</span>
                      </blockquote>
                    );
                  }

                  if (b.type === 'materialsUsed') {
                    return (
                      <div key={b.id} className="space-y-2">
                        <span className="text-[9px] font-mono uppercase text-brass block">SPECIFIED MATERIALS</span>
                        <div className="flex flex-wrap gap-1.5">
                          {b.finishIds?.map(fid => {
                            const match = finishesCatalog.find(f => f.id === fid);
                            return (
                              <span key={fid} className="bg-ink-2 border border-line py-1 px-2 rounded-sm text-[9px] font-mono text-stone-dim">
                                {match ? match.name : fid}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  if (b.type === 'cta') {
                    return (
                      <div key={b.id} className="text-center">
                        <span className="bg-ember border border-ember text-parchment text-[9px] font-mono uppercase px-4 py-2 rounded-sm">
                          {b.label}
                        </span>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-9 border border-dashed border-line p-24 text-center text-stone-dim font-mono text-sm">
            Select a case study or add a new one to open the block-based editor and canvas layout.
          </div>
        )}
      </div>
    </div>
  );
}
