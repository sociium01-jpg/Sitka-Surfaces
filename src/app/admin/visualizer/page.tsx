'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Edit2, Sliders, Check, Settings, Copy, Image as ImageIcon, ArrowUp, ArrowDown, Upload, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { VisualizerScene, VisualizerZone, Finish } from '@/types/visualizer';

export default function VisualizerAdmin() {
  // CMS state
  const [scenes, setScenes] = useState<VisualizerScene[]>([]);
  const [finishes, setFinishes] = useState<Finish[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; displayOrder: number; defaultEdgeStyle?: string; defaultRoughness?: number; defaultMetalness?: number }[]>([]);

  // Selection states
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  // Tab views
  const [activeTab, setActiveTab] = useState<'scenes' | 'finishes' | 'categories' | 'hubs'>('scenes');

  // Form states
  const [editingFinish, setEditingFinish] = useState<Partial<Finish> | null>(null);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    displayOrder: number;
    defaultEdgeStyle?: string;
    defaultRoughness?: number;
    defaultMetalness?: number;
    deckImage?: string | null;
    tagline?: string | null;
    description?: string | null;
    metaLine?: string | null;
  } | null>(null);

  // Interaction logs
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Hubs page config states
  const [hubConfigs, setHubConfigs] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [currentMatrix, setCurrentMatrix] = useState<any | null>(null);
  const [activeHubCategory, setActiveHubCategory] = useState<string>('plywood');
  const [editingFaq, setEditingFaq] = useState<any | null>(null);
  const [uploadingMatrix, setUploadingMatrix] = useState<boolean>(false);
  const [unconfirmedLowConfidenceCells, setUnconfirmedLowConfidenceCells] = useState<string[]>([]);

  // Canvas references for dragging corner points
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const [draggedPointIdx, setDraggedPointIdx] = useState<number | null>(null);

  useEffect(() => {
    async function loadCMSData() {
      try {
        const [scenesRes, finishesRes, categoriesRes] = await Promise.all([
          fetch('/api/visualizer/scenes'),
          fetch('/api/visualizer/finishes'),
          fetch('/api/visualizer/categories'),
        ]);

        const [scenesData, finishesData, categoriesData] = await Promise.all([
          scenesRes.json(),
          finishesRes.json(),
          categoriesRes.json(),
        ]);

        if (scenesData.success) setScenes(scenesData.scenes);
        if (finishesData.success) setFinishes(finishesData.finishes);
        if (categoriesData.success) setCategories(categoriesData.categories);
      } catch (err) {
        console.error('Error loading visualizer CMS config', err);
        setErrorMsg('Failed to load Visualizer configuration from server.');
      }
    }
    loadCMSData();
  }, []);

  // Load hubs configuration, FAQs, and Comparison Matrix for selected category
  useEffect(() => {
    if (activeTab !== 'hubs') return;
    async function loadHubCMSData() {
      try {
        const [configRes, faqsRes, matrixRes] = await Promise.all([
          fetch(`/api/visualizer/hub-configs?category=${activeHubCategory}`),
          fetch(`/api/visualizer/faqs?category=${activeHubCategory}`),
          fetch(`/api/visualizer/matrix?category=${activeHubCategory}`),
        ]);

        const [configData, faqsData, matrixData] = await Promise.all([
          configRes.json(),
          faqsRes.json(),
          matrixRes.json(),
        ]);

        if (configData.success && configData.config) {
          setHubConfigs([configData.config]);
        }
        if (faqsData.success) {
          setFaqs(faqsData.faqs);
        }
        if (matrixData.success) {
          setCurrentMatrix(matrixData.matrix);
          // Auto-load low-confidence cells into confirmation queue
          if (matrixData.matrix && matrixData.matrix.extractionConfidence) {
            const lowCells: string[] = [];
            Object.entries(matrixData.matrix.extractionConfidence).forEach(([cellRef, score]: any) => {
              if (score < 0.8) {
                lowCells.push(cellRef);
              }
            });
            setUnconfirmedLowConfidenceCells(lowCells);
          } else {
            setUnconfirmedLowConfidenceCells([]);
          }
        }
      } catch (err) {
        console.error('Error loading hubs config data:', err);
      }
    }
    loadHubCMSData();
  }, [activeHubCategory, activeTab]);

  // Save Outline configurations to API
  const handleSaveOutlineConfig = async (configToSave: any) => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/visualizer/hub-configs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configToSave),
      });
      const data = await res.json();
      if (data.success) {
        setHubConfigs([data.config]);
        setSuccessMsg('Section order & visibility outlines updated successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to update section order.');
      }
    } catch {
      setErrorMsg('Failed to connect to section config endpoint.');
    } finally {
      setSaving(false);
    }
  };

  // FAQ operations
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq?.question || !editingFaq?.answer) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const method = editingFaq.id ? 'PUT' : 'POST';
      const res = await fetch('/api/visualizer/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingFaq, category: activeHubCategory }),
      });
      const data = await res.json();
      if (data.success) {
        if (method === 'POST') {
          setFaqs([...faqs, data.faq]);
        } else {
          setFaqs(faqs.map((f) => (f.id === data.faq.id ? data.faq : f)));
        }
        setEditingFaq(null);
        setSuccessMsg('FAQ item saved successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to save FAQ.');
      }
    } catch {
      setErrorMsg('Error saving FAQ item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/visualizer/faqs?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFaqs(faqs.filter((f) => f.id !== id));
        setSuccessMsg('FAQ item deleted.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch {
      setErrorMsg('Failed to delete FAQ item.');
    }
  };

  // Matrix actions
  const handleUploadMatrix = async (file: File) => {
    setUploadingMatrix(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', activeHubCategory);
      
      const res = await fetch('/api/visualizer/matrix', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCurrentMatrix(data.matrix);
        // Queue low-confidence cells
        const lowCells: string[] = [];
        if (data.matrix.extractionConfidence) {
          Object.entries(data.matrix.extractionConfidence).forEach(([cellRef, score]: any) => {
            if (score < 0.8) {
              lowCells.push(cellRef);
            }
          });
        }
        setUnconfirmedLowConfidenceCells(lowCells);
        setSuccessMsg(`Document successfully parsed into draft matrix (version ${data.matrix.version}).`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to extract table from file.');
      }
    } catch (err) {
      setErrorMsg('Error uploading spec document.');
    } finally {
      setUploadingMatrix(false);
    }
  };

  const handleVerifyCell = (cellRef: string) => {
    setUnconfirmedLowConfidenceCells(unconfirmedLowConfidenceCells.filter((ref) => ref !== cellRef));
  };

  const handleSaveMatrix = async (matrixToSave: any) => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/visualizer/matrix', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matrixToSave),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentMatrix(data.matrix);
        setSuccessMsg(`Matrix draft saved successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to save matrix.');
      }
    } catch {
      setErrorMsg('Network error updating matrix.');
    } finally {
      setSaving(false);
    }
  };

  const activeScene = scenes[activeSceneIdx];
  const activeZoneObj = activeScene?.zones.find((z) => z.id === activeZoneId);

  // Save Scene to Database API
  const handleSaveScene = async (sceneToSave: VisualizerScene) => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch('/api/visualizer/scenes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sceneToSave),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Scene successfully saved to CMS database.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to save scene.');
      }
    } catch (err) {
      setErrorMsg('Network error saving scene configuration.');
    } finally {
      setSaving(false);
    }
  };

  // Add a new scene
  const handleCreateScene = async () => {
    const name = prompt('Enter a name for the new Room Scene:');
    if (!name) return;

    try {
      const res = await fetch('/api/visualizer/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          roomImage: '/visualizer-room.png',
          status: 'DRAFT',
          displayOrder: scenes.length,
          whereShown: ['HOMEPAGE', 'VISUALIZER'],
          overlaySettings: { opacity: 0.75 },
          zones: [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setScenes([...scenes, data.scene]);
        setActiveSceneIdx(scenes.length);
        setSuccessMsg('New Scene created successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch {
      setErrorMsg('Failed to create new scene.');
    }
  };

  // Delete scene
  const handleDeleteScene = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scene? This is irreversible.')) return;
    try {
      const res = await fetch(`/api/visualizer/scenes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScenes(scenes.filter((s) => s.id !== id));
        setActiveSceneIdx(0);
        setSuccessMsg('Scene deleted successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch {
      setErrorMsg('Failed to delete scene.');
    }
  };

  // Duplicate scene
  const handleDuplicateScene = (scene: VisualizerScene) => {
    const duplicated: VisualizerScene = {
      ...scene,
      id: `scene-${Date.now()}`,
      name: `${scene.name} (Copy)`,
      slug: `${scene.slug}-copy`,
      zones: scene.zones.map((z) => ({ ...z, id: `zone-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` })),
    };
    setScenes([...scenes, duplicated]);
    setActiveSceneIdx(scenes.length);
  };

  // Add Zone to active scene
  const handleAddZone = () => {
    if (!activeScene) return;
    const label = prompt('Enter name for the new Surface Zone:');
    if (!label) return;

    const newZone: VisualizerZone = {
      id: `zone-${Date.now()}`,
      label,
      mask: null,
      shadingLayer: null,
      corners: [
        [100, 100], // TL
        [300, 100], // TR
        [300, 300], // BR
        [100, 300], // BL
      ],
      widthCm: 200,
      heightCm: 150,
      allowedCategories: ['Laminates', 'Plywood'],
      defaultFinish: finishes[0] || (null as any),
      displayOrder: activeScene.zones.length + 1,
    };

    const updatedZones = [...activeScene.zones, newZone];
    const updatedScene = { ...activeScene, zones: updatedZones };
    const updatedScenes = [...scenes];
    updatedScenes[activeSceneIdx] = updatedScene;

    setScenes(updatedScenes);
    setActiveZoneId(newZone.id);
  };

  // Delete Zone
  const handleDeleteZone = (zoneId: string) => {
    if (!activeScene) return;
    const updatedZones = activeScene.zones.filter((z) => z.id !== zoneId);
    const updatedScene = { ...activeScene, zones: updatedZones };
    const updatedScenes = [...scenes];
    updatedScenes[activeSceneIdx] = updatedScene;
    setScenes(updatedScenes);
    if (activeZoneId === zoneId) setActiveZoneId(null);
  };

  // Drag handles configuration on room image
  const handleHandleMouseDown = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    setDraggedPointIdx(idx);
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (draggedPointIdx === null || !activeScene || !activeZoneObj || !imgContainerRef.current) return;

    const container = imgContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to 1024x1024 natural coordinate space
    const naturalX = Math.max(0, Math.min(1024, Math.round((x * activeScene.naturalWidth) / rect.width)));
    const naturalY = Math.max(0, Math.min(1024, Math.round((y * activeScene.naturalHeight) / rect.height)));

    const updatedCorners = [...activeZoneObj.corners];
    updatedCorners[draggedPointIdx] = [naturalX, naturalY];

    const updatedZones = activeScene.zones.map((z) => (z.id === activeZoneId ? { ...z, corners: updatedCorners as any } : z));
    const updatedScene = { ...activeScene, zones: updatedZones };
    const updatedScenes = [...scenes];
    updatedScenes[activeSceneIdx] = updatedScene;
    setScenes(updatedScenes);
  };

  const handleContainerMouseUp = () => {
    setDraggedPointIdx(null);
  };

  // Finish Save CRUD
  const handleSaveFinish = async () => {
    if (!editingFinish) return;
    try {
      const isNew = !editingFinish.id;
      const url = '/api/visualizer/finishes';
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFinish),
      });
      const data = await res.json();
      if (data.success) {
        if (isNew) {
          setFinishes([...finishes, data.finish]);
        } else {
          setFinishes(finishes.map((f) => (f.id === editingFinish.id ? data.finish : f)));
        }
        setEditingFinish(null);
        setSuccessMsg('Material finish stored in database catalog successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch {
      setErrorMsg('Failed to save finish product.');
    }
  };

  // Finish Delete CRUD
  const handleDeleteFinish = async (id: string) => {
    if (!confirm('Are you sure you want to delete this finish?')) return;
    try {
      const res = await fetch(`/api/visualizer/finishes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFinishes(finishes.filter((f) => f.id !== id));
        setSuccessMsg('Finish deleted successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch {
      setErrorMsg('Failed to delete finish.');
    }
  };

  // Category Save CRUD
  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    try {
      const isNew = !editingCategory.id;
      const url = '/api/visualizer/categories';
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });
      const data = await res.json();
      if (data.success) {
        if (isNew) {
          setCategories([...categories, data.category]);
        } else {
          setCategories(categories.map((c) => (c.id === editingCategory.id ? data.category : c)));
        }
        setEditingCategory(null);
        setSuccessMsg('Category saved successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch {
      setErrorMsg('Failed to save category.');
    }
  };

  // Category Delete CRUD
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Finishes belonging to this category will be detached/deleted.')) return;
    try {
      const res = await fetch(`/api/visualizer/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        setSuccessMsg('Category deleted.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch {
      setErrorMsg('Failed to delete category.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-line pb-4">
        <div>
          <span className="block text-[8px] font-mono tracking-widest text-brass uppercase">
            3D Visualizer Configuration
          </span>
          <h1 className="text-2xl font-display font-medium text-parchment">
            Visualizer Scene & Product Manager
          </h1>
        </div>

        <div className="flex gap-2">
          {activeTab === 'scenes' && activeScene && (
            <button
              onClick={() => handleSaveScene(activeScene)}
              disabled={saving}
              className="flex items-center gap-1.5 bg-ember hover:bg-ember-light text-ember-text font-mono text-[10px] tracking-wider uppercase font-semibold py-2.5 px-5 rounded-sm transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Current Scene'}
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-ember/10 border border-ember text-ember-light p-3 text-xs font-mono rounded-sm">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-950/20 border border-red-500 text-red-400 p-3 text-xs font-mono rounded-sm">
          {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-line/40">
        <button
          onClick={() => setActiveTab('scenes')}
          className={`px-6 py-3 text-xs font-mono uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === 'scenes'
              ? 'border-ember text-ember font-bold'
              : 'border-transparent text-stone-dim hover:text-stone'
          }`}
        >
          Room Scenes
        </button>
        <button
          onClick={() => setActiveTab('finishes')}
          className={`px-6 py-3 text-xs font-mono uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === 'finishes'
              ? 'border-ember text-ember font-bold'
              : 'border-transparent text-stone-dim hover:text-stone'
          }`}
        >
          Product Swatches
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 text-xs font-mono uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === 'categories'
              ? 'border-ember text-ember font-bold'
              : 'border-transparent text-stone-dim hover:text-stone'
          }`}
        >
          Material Verticals
        </button>
        <button
          onClick={() => setActiveTab('hubs')}
          className={`px-6 py-3 text-xs font-mono uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
            activeTab === 'hubs'
              ? 'border-ember text-ember font-bold'
              : 'border-transparent text-stone-dim hover:text-stone'
          }`}
        >
          Hub Pages
        </button>
      </div>

      {/* ===================================================================
          TAB 1: ROOM SCENES
      =================================================================== */}
      {activeTab === 'scenes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: scenes list and settings */}
          <div className="lg:col-span-8 space-y-6">
            {/* Mock Schema & Configurations Guide Banner */}
            <div className="bg-ink-2 border border-line p-5 rounded-sm space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-mono uppercase tracking-wider text-brass flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 text-brass" /> Mock Visualizer Schema Guide
                </h4>
                <span className="text-[9px] font-mono bg-ember-light/10 border border-ember-light/20 text-ember-light py-0.5 px-1.5 rounded-sm uppercase">
                  Ease of Understanding
                </span>
              </div>
              <p className="text-[11px] text-stone-dim leading-relaxed font-sans normal-case">
                To map room image hotspots and lighting overlays accurately, follow this sample configuration format inside the manager forms:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-ink/40 border border-line/45 p-3 rounded-sm space-y-1">
                  <span className="text-[9px] font-mono text-brass block uppercase">1. Coordinates (Polygons)</span>
                  <p className="text-[10px] text-stone-dim leading-relaxed font-sans normal-case">
                    For hot-zones (like a Cabinetry front), enter 2D coordinates mapping the corners in percentages:
                  </p>
                  <code className="block text-[9px] font-mono bg-ink p-1.5 rounded-sm text-parchment overflow-x-auto truncate">
                    {"[[10,20], [60,20], [60,80], [10,80]]"}
                  </code>
                </div>

                <div className="bg-ink/40 border border-line/45 p-3 rounded-sm space-y-1">
                  <span className="text-[9px] font-mono text-brass block uppercase">2. Homography Matrix</span>
                  <p className="text-[10px] text-stone-dim leading-relaxed font-sans normal-case">
                    To warp woodgrain textures onto angled surfaces, specify a 3x3 projective transform list:
                  </p>
                  <code className="block text-[9px] font-mono bg-ink p-1.5 rounded-sm text-parchment overflow-x-auto truncate">
                    {"[1.08, -0.05, 12, 0.02, 0.94, -8, 0, 0]"}
                  </code>
                </div>

                <div className="bg-ink/40 border border-line/45 p-3 rounded-sm space-y-1">
                  <span className="text-[9px] font-mono text-brass block uppercase">3. Lighting Settings</span>
                  <p className="text-[10px] text-stone-dim leading-relaxed font-sans normal-case">
                    For realistic overlay composites, adjust light intensity, ambient coefficients, and shadow blurs:
                  </p>
                  <code className="block text-[9px] font-mono bg-ink p-1.5 rounded-sm text-parchment overflow-x-auto truncate">
                    {"{ \"ambient\": 0.25, \"shadowBlur\": 12 }"}
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-ink-2/40 border border-line p-4 rounded-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">
                  Published Rooms
                </span>
                <button
                  onClick={handleCreateScene}
                  className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-brass hover:text-parchment cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New Scene
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {scenes.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`flex items-center border rounded-sm overflow-hidden bg-ink ${
                      activeSceneIdx === idx ? 'border-ember' : 'border-line'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveSceneIdx(idx);
                        setActiveZoneId(null);
                      }}
                      className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        activeSceneIdx === idx
                          ? 'bg-ember text-ember-text font-semibold'
                          : 'text-stone hover:text-parchment'
                      }`}
                    >
                      {s.name}
                    </button>
                    <button
                      onClick={() => handleDuplicateScene(s)}
                      className="p-2 text-stone-dim hover:text-parchment border-l border-line/40 cursor-pointer"
                      title="Duplicate Scene"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteScene(s.id)}
                      disabled={scenes.length === 1}
                      className="p-2 text-stone-dim hover:text-red-400 border-l border-line/40 disabled:opacity-30 cursor-pointer"
                      title="Delete Scene"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {activeScene && (
              <>
                {/* Scene configurations */}
                <div className="bg-ink-2/40 border border-line p-6 rounded-sm space-y-4">
                  <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">
                    Scene Properties
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                        Scene Name
                      </label>
                      <input
                        type="text"
                        value={activeScene.name}
                        onChange={(e) => {
                          const updated = [...scenes];
                          updated[activeSceneIdx].name = e.target.value;
                          setScenes(updated);
                        }}
                        className="w-full bg-ink border border-line p-2.5 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                        Background Image URL
                      </label>
                      <input
                        type="text"
                        value={activeScene.roomImage}
                        onChange={(e) => {
                          const updated = [...scenes];
                          updated[activeSceneIdx].roomImage = e.target.value;
                          setScenes(updated);
                        }}
                        className="w-full bg-ink border border-line p-2.5 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                        Publish Status
                      </label>
                      <select
                        value={activeScene.status}
                        onChange={(e) => {
                          const updated = [...scenes];
                          updated[activeSceneIdx].status = e.target.value as any;
                          setScenes(updated);
                        }}
                        className="w-full bg-ink border border-line p-2.5 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={activeScene.displayOrder}
                        onChange={(e) => {
                          const updated = [...scenes];
                          updated[activeSceneIdx].displayOrder = Number(e.target.value);
                          setScenes(updated);
                        }}
                        className="w-full bg-ink border border-line p-2.5 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Perspective Drag Canvas Overlay */}
                {activeZoneId && activeZoneObj && (
                  <div className="bg-ink-2/40 border border-line p-6 rounded-sm space-y-4">
                    <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">
                      Perspective Corners Editor
                    </span>
                    <p className="text-[10px] text-stone-dim">
                      Drag the 4 corner handles directly on the room image below to configure the quad skew coordinates for zone <strong>{activeZoneObj.label}</strong>.
                    </p>

                    <div
                      ref={imgContainerRef}
                      onMouseMove={handleContainerMouseMove}
                      onMouseUp={handleContainerMouseUp}
                      onMouseLeave={handleContainerMouseUp}
                      className="relative w-full aspect-square bg-black border border-line overflow-hidden select-none"
                      style={{ maxHeight: '500px' }}
                    >
                      <img
                        src={activeScene.roomImage}
                        alt="Scene room"
                        className="w-full h-full object-cover pointer-events-none"
                      />

                      {/* Quad visual outline */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <polygon
                          points={activeZoneObj.corners
                            .map(([x, y]) => {
                              if (!imgContainerRef.current) return '0,0';
                              const rect = imgContainerRef.current.getBoundingClientRect();
                              const px = (x / activeScene.naturalWidth) * rect.width;
                              const py = (y / activeScene.naturalHeight) * rect.height;
                              return `${px},${py}`;
                            })
                            .join(' ')}
                          fill="rgba(245, 184, 0, 0.15)"
                          stroke="#F5B800"
                          strokeWidth="2"
                        />
                      </svg>

                      {/* Handles */}
                      {activeZoneObj.corners.map(([x, y], idx) => {
                        if (!imgContainerRef.current) return null;
                        const rect = imgContainerRef.current.getBoundingClientRect();
                        const left = (x / activeScene.naturalWidth) * rect.width;
                        const top = (y / activeScene.naturalHeight) * rect.height;

                        return (
                          <div
                            key={idx}
                            onMouseDown={(e) => handleHandleMouseDown(e, idx)}
                            className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border border-parchment bg-ember flex items-center justify-center cursor-move text-[8px] font-bold text-ember-text shadow-lg z-20"
                            style={{ left: `${left}px`, top: `${top}px` }}
                          >
                            {idx + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column: Zones list details */}
          <div className="lg:col-span-4 space-y-6">
            {activeScene && (
              <div className="bg-ink-2/40 border border-line p-5 rounded-sm space-y-4">
                <div className="flex justify-between items-center border-b border-line/30 pb-2">
                  <span className="block text-[9px] font-mono tracking-widest text-brass uppercase font-semibold">
                    Surface Zones ({activeScene.zones.length})
                  </span>
                  <button
                    onClick={handleAddZone}
                    className="text-[9px] font-mono uppercase text-brass hover:text-ember flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {activeScene.zones.map((z) => (
                    <div
                      key={z.id}
                      onClick={() => setActiveZoneId(z.id)}
                      className={`p-3 border rounded-sm flex items-center justify-between cursor-pointer transition-all ${
                        activeZoneId === z.id
                          ? 'border-ember bg-ember/5'
                          : 'border-line hover:border-stone-dim'
                      }`}
                    >
                      <div>
                        <span className="block text-xs font-semibold text-parchment leading-tight">
                          {z.label}
                        </span>
                        <span className="text-[8px] font-mono text-stone-dim uppercase tracking-wider block mt-1">
                          Allowed: {z.allowedCategories.join(', ')}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteZone(z.id);
                        }}
                        className="text-stone-dim hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Edit active zone properties */}
                {activeZoneId && activeZoneObj && (
                  <div className="border-t border-line/30 pt-4 space-y-3">
                    <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">
                      Edit Zone: {activeZoneObj.label}
                    </span>

                    <div>
                      <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                        Zone Label
                      </label>
                      <input
                        type="text"
                        value={activeZoneObj.label}
                        onChange={(e) => {
                          const updatedZones = activeScene.zones.map((z) =>
                            z.id === activeZoneId ? { ...z, label: e.target.value } : z
                          );
                          const updatedScenes = [...scenes];
                          updatedScenes[activeSceneIdx].zones = updatedZones;
                          setScenes(updatedScenes);
                        }}
                        className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                          Width (cm)
                        </label>
                        <input
                          type="number"
                          value={activeZoneObj.widthCm || ''}
                          onChange={(e) => {
                            const updatedZones = activeScene.zones.map((z) =>
                              z.id === activeZoneId ? { ...z, widthCm: Number(e.target.value) } : z
                            );
                            const updatedScenes = [...scenes];
                            updatedScenes[activeSceneIdx].zones = updatedZones;
                            setScenes(updatedScenes);
                          }}
                          className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          value={activeZoneObj.heightCm || ''}
                          onChange={(e) => {
                            const updatedZones = activeScene.zones.map((z) =>
                              z.id === activeZoneId ? { ...z, heightCm: Number(e.target.value) } : z
                            );
                            const updatedScenes = [...scenes];
                            updatedScenes[activeSceneIdx].zones = updatedZones;
                            setScenes(updatedScenes);
                          }}
                          className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                        Allowed Categories
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {categories.map((c) => {
                          const isAllowed = activeZoneObj.allowedCategories.includes(c.name);
                          return (
                            <label
                              key={c.id}
                              className="flex items-center gap-1.5 text-[10px] text-stone-dim cursor-pointer hover:text-stone"
                            >
                              <input
                                type="checkbox"
                                checked={isAllowed}
                                onChange={() => {
                                  const cats = isAllowed
                                    ? activeZoneObj.allowedCategories.filter((cat) => cat !== c.name)
                                    : [...activeZoneObj.allowedCategories, c.name];
                                  const updatedZones = activeScene.zones.map((z) =>
                                    z.id === activeZoneId ? { ...z, allowedCategories: cats } : z
                                  );
                                  const updatedScenes = [...scenes];
                                  updatedScenes[activeSceneIdx].zones = updatedZones;
                                  setScenes(updatedScenes);
                                }}
                                className="accent-ember"
                              />
                              {c.name}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                        Default Finish
                      </label>
                      <select
                        value={activeZoneObj.defaultFinish?.id || ''}
                        onChange={(e) => {
                          const fin = finishes.find((f) => f.id === e.target.value);
                          if (!fin) return;
                          const updatedZones = activeScene.zones.map((z) =>
                            z.id === activeZoneId ? { ...z, defaultFinish: fin } : z
                          );
                          const updatedScenes = [...scenes];
                          updatedScenes[activeSceneIdx].zones = updatedZones;
                          setScenes(updatedScenes);
                        }}
                        className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                      >
                        <option value="">Select Swatch</option>
                        {finishes
                          .filter((f) => activeZoneObj.allowedCategories.includes(f.category))
                          .map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name} ({f.sku})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 2: PRODUCT SWATCHES
      =================================================================== */}
      {activeTab === 'finishes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-ink-2/40 border border-line p-4 rounded-sm">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase font-semibold">
              Product Finish Swatches ({finishes.length})
            </span>

            <button
              onClick={() =>
                setEditingFinish({
                  name: '',
                  sku: '',
                  specLine: '',
                  category: categories[0]?.name || 'Laminates',
                  thumbnailImage: '',
                  tileableTexture: '',
                  materialType: 'matte',
                  tags: [],
                  modelType: 'generated',
                  modelAsset: '',
                  realWidthMm: 1220,
                  realHeightMm: 2440,
                  realThicknessMm: 18,
                  roughness: 0.5,
                  metalness: 0.0,
                })
              }
              className="bg-ember hover:bg-ember-light text-ember-text font-mono text-[9px] tracking-wider uppercase font-semibold py-2 px-4 rounded-sm flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Finish Swatch
            </button>
          </div>

          {/* Form Modal/Section */}
          {editingFinish && (
            <div className="bg-ink-2/40 border border-line p-6 rounded-sm space-y-4 max-w-2xl">
              <span className="block text-[10px] font-mono tracking-widest text-brass uppercase">
                {editingFinish.id ? 'Edit Finish Swatch' : 'New Finish Swatch'}
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Finish Name
                  </label>
                  <input
                    type="text"
                    value={editingFinish.name}
                    onChange={(e) => setEditingFinish({ ...editingFinish, name: e.target.value })}
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. Matte Obsidian Charcoal"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={editingFinish.sku}
                    onChange={(e) => setEditingFinish({ ...editingFinish, sku: e.target.value })}
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. LAM-CHAR-12"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Material Vertical (Category)
                  </label>
                  <select
                    value={editingFinish.category}
                    onChange={(e) => setEditingFinish({ ...editingFinish, category: e.target.value })}
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Specular Highlight Type
                  </label>
                  <select
                    value={editingFinish.materialType}
                    onChange={(e) =>
                      setEditingFinish({ ...editingFinish, materialType: e.target.value as any })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                  >
                    <option value="matte">Matte</option>
                    <option value="gloss">Gloss (Adds reflection streak)</option>
                    <option value="satin">Satin (Soft reflection)</option>
                    <option value="wood">Wood Grain Texture</option>
                    <option value="stone">Stone/Concrete Texture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Specification Detail Line
                  </label>
                  <input
                    type="text"
                    value={editingFinish.specLine}
                    onChange={(e) => setEditingFinish({ ...editingFinish, specLine: e.target.value })}
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. BWR Grade · 18mm"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Solid Color Fallback (optional)
                  </label>
                  <input
                    type="text"
                    value={editingFinish.color || ''}
                    onChange={(e) => setEditingFinish({ ...editingFinish, color: e.target.value })}
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. #2C2825"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Thumbnail Image URL
                  </label>
                  <input
                    type="text"
                    value={editingFinish.thumbnailImage || ''}
                    onChange={(e) =>
                      setEditingFinish({ ...editingFinish, thumbnailImage: e.target.value })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Tileable Seamless Texture URL
                  </label>
                  <input
                    type="text"
                    value={editingFinish.tileableTexture || ''}
                    onChange={(e) =>
                      setEditingFinish({ ...editingFinish, tileableTexture: e.target.value })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Texture Tile Width (cm)
                  </label>
                  <input
                    type="number"
                    value={editingFinish.tileWidthCm || ''}
                    onChange={(e) =>
                      setEditingFinish({ ...editingFinish, tileWidthCm: Number(e.target.value) })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. 60"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Texture Tile Height (cm)
                  </label>
                  <input
                    type="number"
                    value={editingFinish.tileHeightCm || ''}
                    onChange={(e) =>
                      setEditingFinish({ ...editingFinish, tileHeightCm: Number(e.target.value) })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. 60"
                  />
                 </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    3D Inspector Mode
                  </label>
                  <select
                    value={editingFinish.modelType || 'generated'}
                    onChange={(e) =>
                      setEditingFinish({ ...editingFinish, modelType: e.target.value as any })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                  >
                    <option value="generated">Path B: Auto-generate from flat swatch</option>
                    <option value="uploadedModel">Path A: Uploaded GLB/GLTF model</option>
                  </select>
                </div>
                {editingFinish.modelType === 'uploadedModel' && (
                  <div>
                    <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                      Uploaded GLB/GLTF File URL
                    </label>
                    <input
                      type="text"
                      value={editingFinish.modelAsset || ''}
                      onChange={(e) =>
                        setEditingFinish({ ...editingFinish, modelAsset: e.target.value })
                      }
                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                      placeholder="e.g. /models/birch-board.glb"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Real Width (mm)
                  </label>
                  <input
                    type="number"
                    value={editingFinish.realWidthMm || ''}
                    onChange={(e) =>
                      setEditingFinish({ ...editingFinish, realWidthMm: Number(e.target.value) })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. 1220"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Real Height (mm)
                  </label>
                  <input
                    type="number"
                    value={editingFinish.realHeightMm || ''}
                    onChange={(e) =>
                      setEditingFinish({ ...editingFinish, realHeightMm: Number(e.target.value) })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. 2440"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Real Thickness (mm)
                  </label>
                  <input
                    type="number"
                    value={editingFinish.realThicknessMm || ''}
                    onChange={(e) =>
                      setEditingFinish({ ...editingFinish, realThicknessMm: Number(e.target.value) })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. 18"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Roughness Override (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={editingFinish.roughness !== undefined ? editingFinish.roughness : ''}
                    onChange={(e) =>
                      setEditingFinish({ ...editingFinish, roughness: Number(e.target.value) })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="Category default"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Metalness Override (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={editingFinish.metalness !== undefined ? editingFinish.metalness : ''}
                    onChange={(e) =>
                      setEditingFinish({ ...editingFinish, metalness: Number(e.target.value) })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="Category default"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-line/30">
                <button
                  onClick={() => setEditingFinish(null)}
                  className="bg-transparent border border-line hover:border-stone text-stone hover:text-parchment font-mono text-[9px] uppercase tracking-wider py-2 px-4 rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFinish}
                  className="bg-ember hover:bg-ember-light text-ember-text font-mono text-[9px] uppercase tracking-wider font-semibold py-2 px-5 rounded-sm cursor-pointer"
                >
                  Save Finish
                </button>
              </div>
            </div>
          )}

          {/* List of finishes */}
          <div className="bg-ink-2/40 border border-line rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line text-[8px] font-mono uppercase text-brass tracking-widest bg-black/40">
                  <th className="p-4">Swatch</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30 text-xs">
                {finishes.map((f) => (
                  <tr key={f.id} className="hover:bg-ink-2/20">
                    <td className="p-4">
                      {f.color ? (
                        <div className="w-8 h-8 rounded-sm" style={{ backgroundColor: f.color }} />
                      ) : (
                        <img
                          src={f.thumbnailImage}
                          alt={f.name}
                          className="w-8 h-8 rounded-sm object-cover"
                        />
                      )}
                    </td>
                    <td className="p-4 font-semibold text-parchment">{f.name}</td>
                    <td className="p-4 font-mono text-stone-dim text-[10px]">{f.sku}</td>
                    <td className="p-4 text-stone">{f.category}</td>
                    <td className="p-4 font-mono text-[10px] text-brass uppercase">{f.materialType}</td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => setEditingFinish(f)}
                        className="inline-flex p-1.5 border border-line/60 hover:border-parchment rounded-sm cursor-pointer transition-colors"
                        title="Edit Swatch"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFinish(f.id)}
                        className="inline-flex p-1.5 border border-line/60 hover:border-red-500 text-stone-dim hover:text-red-400 rounded-sm cursor-pointer transition-colors"
                        title="Delete Swatch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 3: MATERIAL VERTICALS
      =================================================================== */}
      {activeTab === 'categories' && (
        <div className="max-w-2xl space-y-6">
          <div className="flex justify-between items-center bg-ink-2/40 border border-line p-4 rounded-sm">
            <span className="text-[10px] font-mono tracking-widest text-brass uppercase font-semibold">
              Material Categories ({categories.length})
            </span>
            <button
              onClick={() => setEditingCategory({ id: '', name: '', displayOrder: categories.length, defaultEdgeStyle: 'flatSolid', defaultRoughness: 0.5, defaultMetalness: 0.0, deckImage: '', tagline: '', description: '', metaLine: '' })}
              className="bg-ember hover:bg-ember-light text-ember-text font-mono text-[9px] tracking-wider uppercase font-semibold py-2 px-4 rounded-sm flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </div>

          {editingCategory && (
            <div className="bg-ink-2/40 border border-line p-5 rounded-sm space-y-4">
              <span className="block text-[10px] font-mono tracking-widest text-brass uppercase">
                {editingCategory.id ? 'Edit Category' : 'New Category'}
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. Laminates"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingCategory.displayOrder}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, displayOrder: Number(e.target.value) })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Default Edge Style
                  </label>
                  <select
                    value={editingCategory.defaultEdgeStyle || 'flatSolid'}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, defaultEdgeStyle: e.target.value })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                  >
                    <option value="flatSolid">Flat Solid Edge</option>
                    <option value="layeredPly">Layered Plywood Core Stripe</option>
                    <option value="custom">Custom Pattern Strip</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Default Roughness (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={editingCategory.defaultRoughness !== undefined ? editingCategory.defaultRoughness : 0.5}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, defaultRoughness: Number(e.target.value) })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Default Metalness (0.0 - 1.0)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={editingCategory.defaultMetalness !== undefined ? editingCategory.defaultMetalness : 0.0}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, defaultMetalness: Number(e.target.value) })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Homepage Deck Image URL
                  </label>
                  <input
                    type="text"
                    value={editingCategory.deckImage || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, deckImage: e.target.value })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. /images/plywood-deck.jpg"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Homepage Deck Tagline
                  </label>
                  <input
                    type="text"
                    value={editingCategory.tagline || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, tagline: e.target.value })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. The structure underneath the beauty."
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Homepage Deck Description
                  </label>
                  <input
                    type="text"
                    value={editingCategory.description || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, description: e.target.value })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. Engineered core panels built for strength..."
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                    Homepage Deck Meta Line
                  </label>
                  <input
                    type="text"
                    value={editingCategory.metaLine || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, metaLine: e.target.value })
                    }
                    className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    placeholder="e.g. 8 grades · MR → Marine"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-line/30">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="bg-transparent border border-line text-stone text-[9px] font-mono uppercase py-1.5 px-4 rounded-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="bg-ember hover:bg-ember-light text-ember-text font-mono text-[9px] uppercase tracking-wider font-semibold py-1.5 px-5 rounded-sm cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </div>
          )}

          <div className="bg-ink-2/40 border border-line rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line text-[8px] font-mono uppercase text-brass tracking-widest bg-black/40">
                  <th className="p-4">Name</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Order</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/30 text-xs">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-ink-2/20">
                    <td className="p-4 font-semibold text-parchment">{c.name}</td>
                    <td className="p-4 font-mono text-stone-dim text-[10px]">{c.slug}</td>
                    <td className="p-4 text-stone">{c.displayOrder}</td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => setEditingCategory(c)}
                        className="inline-flex p-1.5 border border-line/60 hover:border-parchment rounded-sm cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="inline-flex p-1.5 border border-line/60 hover:border-red-500 text-stone-dim hover:text-red-400 rounded-sm cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 4: HUB PAGES MANAGER
      =================================================================== */}
      {activeTab === 'hubs' && (
        <div className="space-y-8">
          {/* Active Category Selector */}
          <div className="flex gap-2 border-b border-line/30 pb-4">
            {['plywood', 'laminates', 'veneer', 'decoratives'].map((vertical) => (
              <button
                key={vertical}
                onClick={() => {
                  setActiveHubCategory(vertical);
                  setEditingFaq(null);
                }}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                  activeHubCategory === vertical
                    ? 'bg-brass text-ink font-semibold'
                    : 'bg-ink border border-line text-stone-dim hover:text-stone'
                }`}
              >
                {vertical} Hub
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Outline Section Sequence and FAQs */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Outline configurations */}
              {hubConfigs.map((config) => (
                <div key={config.id} className="bg-ink-2/40 border border-line p-5 rounded-sm space-y-4">
                  <span className="block text-[10px] font-mono tracking-widest text-brass uppercase font-semibold">
                    Page outline sequence & visibility
                  </span>
                  <div className="space-y-2">
                    {config.sectionOrder.map((section: string, idx: number) => (
                      <div
                        key={section}
                        className="flex items-center justify-between p-3 border border-line bg-ink rounded-sm text-xs"
                      >
                        <div className="flex items-center gap-3">
                          {/* Visibility Checkbox */}
                          <input
                            type="checkbox"
                            checked={config.visibility[section] !== false}
                            onChange={(e) => {
                              const updatedVisibility = {
                                ...config.visibility,
                                [section]: e.target.checked,
                              };
                              const updatedConfigs = hubConfigs.map((c) =>
                                c.id === config.id ? { ...c, visibility: updatedVisibility } : c
                              );
                              setHubConfigs(updatedConfigs);
                            }}
                            className="w-3.5 h-3.5 border-line bg-ink-2 text-brass rounded-sm focus:ring-0"
                          />
                          <span className="font-mono uppercase tracking-wider text-parchment text-[11px]">
                            {section === 'swatches' && 'Interactive Swatches Grid'}
                            {section === 'catalogue' && 'Product Catalogue Card List'}
                            {section === 'matrix' && 'Comparison Matrix Specification'}
                            {section === 'faqs' && 'FAQ Accordions'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Re-order arrows */}
                          <button
                            onClick={() => {
                              if (idx === 0) return;
                              const newOrder = [...config.sectionOrder];
                              const temp = newOrder[idx];
                              newOrder[idx] = newOrder[idx - 1];
                              newOrder[idx - 1] = temp;
                              setHubConfigs(
                                hubConfigs.map((c) =>
                                  c.id === config.id ? { ...c, sectionOrder: newOrder } : c
                                )
                              );
                            }}
                            disabled={idx === 0}
                            className="p-1 text-stone-dim hover:text-parchment disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (idx === config.sectionOrder.length - 1) return;
                              const newOrder = [...config.sectionOrder];
                              const temp = newOrder[idx];
                              newOrder[idx] = newOrder[idx + 1];
                              newOrder[idx + 1] = temp;
                              setHubConfigs(
                                hubConfigs.map((c) =>
                                  c.id === config.id ? { ...c, sectionOrder: newOrder } : c
                                )
                              );
                            }}
                            disabled={idx === config.sectionOrder.length - 1}
                            className="p-1 text-stone-dim hover:text-parchment disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleSaveOutlineConfig(config)}
                      className="bg-ember hover:bg-ember-light text-ember-text font-mono text-[9px] uppercase tracking-wider font-semibold py-1.5 px-4 rounded-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Layout Outline
                    </button>
                  </div>
                </div>
              ))}

              {/* FAQ Editor */}
              <div className="bg-ink-2/40 border border-line p-5 rounded-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="block text-[10px] font-mono tracking-widest text-brass uppercase font-semibold">
                    Frequently Asked Questions ({faqs.length})
                  </span>
                  <button
                    onClick={() => setEditingFaq({ question: '', answer: '', displayOrder: faqs.length + 1 })}
                    className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-brass hover:text-parchment cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add FAQ
                  </button>
                </div>

                {editingFaq && (
                  <form onSubmit={handleSaveFaq} className="bg-ink border border-line p-4 rounded-sm space-y-3">
                    <span className="block text-[8px] font-mono tracking-widest text-brass uppercase">
                      {editingFaq.id ? 'Edit FAQ Item' : 'New FAQ Item'}
                    </span>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                          Question
                        </label>
                        <input
                          type="text"
                          value={editingFaq.question}
                          onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                          className="w-full bg-ink-2 border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                          Answer (Rich text or Plain text)
                        </label>
                        <textarea
                          value={editingFaq.answer}
                          onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                          className="w-full h-24 bg-ink-2 border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none resize-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={editingFaq.displayOrder}
                          onChange={(e) => setEditingFaq({ ...editingFaq, displayOrder: Number(e.target.value) })}
                          className="w-full bg-ink-2 border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingFaq(null)}
                        className="bg-transparent border border-line text-stone text-[9px] font-mono uppercase py-1 px-3 rounded-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-brass text-ink font-mono text-[9px] font-semibold uppercase tracking-wider py-1 px-4 rounded-sm cursor-pointer"
                      >
                        Save FAQ
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="p-3 border border-line/40 bg-ink-2/20 rounded-sm space-y-1 text-xs">
                      <div className="flex justify-between items-start gap-3">
                        <span className="font-semibold text-parchment leading-tight">{faq.question}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setEditingFaq(faq)}
                            className="p-1 border border-line/60 hover:border-parchment rounded-sm cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="p-1 border border-line/60 hover:border-red-500 text-stone-dim hover:text-red-400 rounded-sm cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-stone-dim leading-relaxed text-[11px]">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Comparison Matrix Extraction with Review UI */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-ink-2/40 border border-line p-5 rounded-sm space-y-4">
                <span className="block text-[10px] font-mono tracking-widest text-brass uppercase font-semibold">
                  Comparison Matrix Extractor
                </span>

                {/* Upload Section */}
                <div className="border border-dashed border-line hover:border-brass transition-colors p-6 rounded-sm text-center bg-ink-2/20 space-y-3 relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.docx,.pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadMatrix(file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={uploadingMatrix}
                  />
                  <Upload className="w-8 h-8 mx-auto text-brass animate-pulse" />
                  <div className="space-y-1">
                    <span className="block text-xs text-parchment font-medium">
                      {uploadingMatrix ? 'Uploading & parsing spec sheets...' : 'Upload Spec Sheet Document'}
                    </span>
                    <span className="block text-[10px] text-stone-dim">
                      Supports XLSX, CSV, DOCX, PDF, PNG, JPG (OCR Table Recognition)
                    </span>
                  </div>
                </div>

                {/* Extraction Matrix Panel */}
                {currentMatrix ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-ink p-3 border border-line rounded-sm text-[10px] font-mono">
                      <div>
                        <span className="block text-stone-dim">File: {currentMatrix.sourceDocumentName}</span>
                        <span className="block text-brass">Version: {currentMatrix.version} (Status: {currentMatrix.status.toUpperCase()})</span>
                      </div>
                      <span className="px-2 py-0.5 bg-line/60 rounded-sm uppercase text-[9px]">
                        {currentMatrix.status}
                      </span>
                    </div>

                    {/* Low Confidence Warning Box */}
                    {unconfirmedLowConfidenceCells.length > 0 && (
                      <div className="p-3 border border-amber/50 bg-amber/5 text-amber-light text-xs font-mono rounded-sm flex gap-2 items-start">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber" />
                        <div>
                          <span className="font-semibold block">Review Required: Low Confidence Cells Detected</span>
                          <span>We detected spelling noise or structural variations. Please click the highlighted cells below to review, correct, or verify their content before publishing.</span>
                        </div>
                      </div>
                    )}

                    {/* Side-by-Side Review Table */}
                    <div className="overflow-x-auto border border-line rounded-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-line bg-black/40 text-[9px] font-mono uppercase text-stone-dim">
                            <th className="p-2 border-r border-line">Product ID</th>
                            {currentMatrix.columns.map((col: any) => (
                              <th key={col.fieldKey} className="p-2 border-r border-line min-w-[120px]">
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentMatrix.rows.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="border-b border-line/40 hover:bg-ink-2/10">
                              <td className="p-2 border-r border-line font-mono text-[10px] text-brass">
                                {row.productId}
                              </td>
                              {currentMatrix.columns.map((col: any) => {
                                const cellRef = `${rIdx}-${col.fieldKey}`;
                                const isLowConf = currentMatrix.extractionConfidence?.[cellRef] < 0.8;
                                const isUnconfirmed = unconfirmedLowConfidenceCells.includes(cellRef);
                                
                                return (
                                  <td
                                    key={col.fieldKey}
                                    className={`p-2 border-r border-line relative group ${
                                      isUnconfirmed
                                        ? 'bg-amber-950/20 hover:bg-amber-950/30'
                                        : 'hover:bg-ink'
                                    }`}
                                  >
                                    <input
                                      type="text"
                                      value={row.values[col.fieldKey] || ''}
                                      onChange={(e) => {
                                        const updatedRows = [...currentMatrix.rows];
                                        updatedRows[rIdx].values[col.fieldKey] = e.target.value;
                                        setCurrentMatrix({
                                          ...currentMatrix,
                                          rows: updatedRows,
                                        });
                                      }}
                                      className="w-full bg-transparent text-parchment outline-none text-xs"
                                    />
                                    {isUnconfirmed && (
                                      <button
                                        onClick={() => handleVerifyCell(cellRef)}
                                        className="absolute right-1 top-1 p-0.5 bg-amber border border-amber-light text-ink text-[8px] font-mono uppercase font-bold rounded-sm cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Verify cell"
                                      >
                                        Verify
                                      </button>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Matrix Save/Publish CTAs */}
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => {
                          if (confirm('Revert all extraction draft edits?')) {
                            setCurrentMatrix(null);
                          }
                        }}
                        className="bg-transparent border border-line text-stone text-[9px] font-mono uppercase py-1.5 px-3 rounded-sm cursor-pointer"
                      >
                        Reset Matrix
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveMatrix({ ...currentMatrix, status: 'draft' })}
                          className="bg-ink border border-line text-stone hover:text-parchment font-mono text-[9px] uppercase tracking-wider font-semibold py-1.5 px-4 rounded-sm cursor-pointer"
                        >
                          Save Draft
                        </button>
                        
                        <button
                          onClick={() => {
                            if (unconfirmedLowConfidenceCells.length > 0) {
                              alert('Please confirm all low-confidence highlighted cells before publishing.');
                              return;
                            }
                            handleSaveMatrix({ ...currentMatrix, status: 'published' });
                          }}
                          className="bg-brass text-ink font-mono text-[9px] uppercase tracking-wider font-bold py-1.5 px-5 rounded-sm cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Publish Specs Table
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] font-mono text-stone-dim italic text-center py-4">
                    No comparison specs catalog loaded yet. Upload a document above to extract comparison values.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
