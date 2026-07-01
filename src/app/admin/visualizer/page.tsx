'use client';

import React, { useState } from 'react';
import { Save, Plus, Trash2, Eye, Edit2, Sliders } from 'lucide-react';

type ZoneDef = {
  id: string;
  label: string;
  coords: string;
  defaultFinish: string;
};

type RoomScene = {
  id: string;
  name: string;
  imagePoster: string;
  zones: ZoneDef[];
};

export default function VisualizerSceneManager() {
  const [scenes, setScenes] = useState<RoomScene[]>([
    {
      id: 'scene-kitchen',
      name: 'Penthouse Kitchen Scene',
      imagePoster: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      zones: [
        { id: 'wall', label: 'Feature Wall', coords: '50,50 450,50 450,450 50,450', defaultFinish: 'American Walnut Core' },
        { id: 'floor', label: 'Floor', coords: '50,450 450,450 750,550 150,550', defaultFinish: 'Burmese Golden Teak' },
        { id: 'cabinet', label: 'Cabinetry', coords: '450,200 750,200 750,450 450,450', defaultFinish: 'Matte Obsidian Charcoal' },
        { id: 'countertop', label: 'Countertop', coords: '380,320 680,320 580,360 280,360', defaultFinish: 'Sitka Brand Yellow' },
      ],
    },
    {
      id: 'scene-lobby',
      name: 'Commercial Lobby Scene',
      imagePoster: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      zones: [
        { id: 'wall', label: 'Acoustic Slat Wall', coords: '100,50 500,50 500,400 100,400', defaultFinish: 'Oak Acoustic Slat' },
        { id: 'desk', label: 'Reception Desk', coords: '400,300 700,300 650,450 350,450', defaultFinish: 'American Walnut Core' },
      ],
    }
  ]);

  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [newSceneName, setNewSceneName] = useState('');

  const activeScene = scenes[activeSceneIdx];

  const handleUpdateZone = (zoneIdx: number, key: keyof ZoneDef, value: string) => {
    const updatedScenes = [...scenes];
    updatedScenes[activeSceneIdx].zones[zoneIdx] = {
      ...updatedScenes[activeSceneIdx].zones[zoneIdx],
      [key]: value
    };
    setScenes(updatedScenes);
  };

  const handleAddZone = () => {
    const updatedScenes = [...scenes];
    const newZone: ZoneDef = {
      id: `zone-${Date.now()}`,
      label: 'New Wall Zone',
      coords: '100,100 200,100 200,200 100,200',
      defaultFinish: 'Natural Birch Core'
    };
    updatedScenes[activeSceneIdx].zones.push(newZone);
    setScenes(updatedScenes);
  };

  const handleDeleteZone = (zoneId: string) => {
    const updatedScenes = [...scenes];
    updatedScenes[activeSceneIdx].zones = updatedScenes[activeSceneIdx].zones.filter(z => z.id !== zoneId);
    setScenes(updatedScenes);
  };

  const handleCreateScene = () => {
    if (!newSceneName) return;
    const newScene: RoomScene = {
      id: `scene-${Date.now()}`,
      name: newSceneName,
      imagePoster: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      zones: [
        { id: 'wall', label: 'Feature Wall', coords: '100,100 300,100 300,300 100,300', defaultFinish: 'Natural Birch Core' }
      ]
    };
    setScenes([...scenes, newScene]);
    setActiveSceneIdx(scenes.length);
    setNewSceneName('');
  };

  const handleDeleteScene = (id: string) => {
    if (scenes.length === 1) return;
    setScenes(scenes.filter(s => s.id !== id));
    setActiveSceneIdx(0);
  };

  const handleSave = () => {
    setSuccessMsg('Visualizer configuration stored successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-line pb-4">
        <div>
          <span className="block text-[8px] font-mono tracking-widest text-brass uppercase">3D Visualizer Configuration</span>
          <h1 className="text-2xl font-display font-medium text-parchment">Visualizer Scene Manager</h1>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-ember hover:bg-ember-light text-ember-text font-mono text-[10px] tracking-wider uppercase font-semibold py-2 px-5 rounded-sm transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" /> Save Configuration
        </button>
      </div>

      {successMsg && (
        <div className="bg-ember/10 border border-ember text-ember-light p-3 text-xs font-mono rounded-sm">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Scene Selector & Zone Editor */}
        <div className="lg:col-span-8 space-y-6">
          {/* Scene selector tabs */}
          <div className="bg-ink-2/40 border border-line p-4 rounded-sm space-y-3">
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Active Rooms / Scenes</span>
            <div className="flex flex-wrap gap-2">
              {scenes.map((s, idx) => (
                <div key={s.id} className="flex items-center border border-line rounded-sm overflow-hidden bg-ink">
                  <button
                    onClick={() => setActiveSceneIdx(idx)}
                    className={`px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                      activeSceneIdx === idx
                        ? 'bg-ember text-ember-text font-semibold'
                        : 'text-stone hover:text-parchment'
                    }`}
                  >
                    {s.name}
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

          {/* Room details */}
          <div className="bg-ink-2/40 border border-line p-6 rounded-sm space-y-4">
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Room Scene Properties</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Scene Name</label>
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
                <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Background Image URL</label>
                <input
                  type="text"
                  value={activeScene.imagePoster}
                  onChange={(e) => {
                    const updated = [...scenes];
                    updated[activeSceneIdx].imagePoster = e.target.value;
                    setScenes(updated);
                  }}
                  className="w-full bg-ink border border-line p-2.5 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                />
              </div>
            </div>
          </div>

          {/* Zones coordinates manager */}
          <div className="bg-ink-2/40 border border-line p-6 rounded-sm space-y-4">
            <div className="flex justify-between items-center border-b border-line/30 pb-3">
              <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Surface Mask Zones</span>
              <button
                onClick={handleAddZone}
                className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-brass hover:text-parchment cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Mask Zone
              </button>
            </div>

            <div className="space-y-6 divide-y divide-line/30">
              {activeScene.zones.map((zone, zIdx) => (
                <div key={zone.id} className={`pt-4 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-start`}>
                  <div className="md:col-span-3">
                    <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Zone Label</label>
                    <input
                      type="text"
                      value={zone.label}
                      onChange={(e) => handleUpdateZone(zIdx, 'label', e.target.value)}
                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">SVG Polygon Points</label>
                    <input
                      type="text"
                      value={zone.coords}
                      onChange={(e) => handleUpdateZone(zIdx, 'coords', e.target.value)}
                      className="w-full bg-ink border border-line p-2 text-xs font-mono text-ember-light rounded-sm focus:border-ember outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">Default Finish</label>
                    <input
                      type="text"
                      value={zone.defaultFinish}
                      onChange={(e) => handleUpdateZone(zIdx, 'defaultFinish', e.target.value)}
                      className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                    />
                  </div>

                  <div className="md:col-span-1 flex items-center justify-end mt-5">
                    <button
                      onClick={() => handleDeleteZone(zone.id)}
                      className="p-2 border border-line/50 hover:border-red-500 text-stone-dim hover:text-red-400 rounded-sm cursor-pointer transition-colors"
                      title="Delete Zone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mini live preview HUD & Create Scene */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mini Live Preview HUD */}
          <div className="bg-[#110E0C] border border-line p-6 rounded-sm space-y-4">
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase border-b border-line/30 pb-2">
              Zone Coordinates HUD
            </span>

            {/* SVG Render box displaying coordinates */}
            <div className="w-full h-48 bg-[#0a0806] border border-line/50 relative flex items-center justify-center">
              <svg viewBox="0 0 800 600" className="w-full h-full p-2">
                {activeScene.zones.map(zone => (
                  <polygon
                    key={zone.id}
                    points={zone.coords}
                    fill="rgba(245, 184, 0, 0.25)"
                    stroke="#F5B800"
                    strokeWidth="3"
                  />
                ))}
              </svg>
            </div>
            <p className="text-[9px] font-mono text-stone-dim leading-relaxed uppercase tracking-wider text-center">
              Active surface masks loaded from values.
            </p>
          </div>

          {/* Create scene box */}
          <div className="bg-ink-2/30 border border-line p-6 space-y-4">
            <span className="block text-[9px] font-mono tracking-widest text-brass uppercase">Create Room Scene</span>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[8px] font-mono uppercase text-stone-dim mb-1">New Scene Name</label>
                <input
                  type="text"
                  placeholder="e.g. Master Bedroom"
                  value={newSceneName}
                  onChange={(e) => setNewSceneName(e.target.value)}
                  className="w-full bg-ink border border-line p-2 text-xs text-parchment rounded-sm focus:border-ember outline-none"
                />
              </div>

              <button
                onClick={handleCreateScene}
                className="w-full flex items-center justify-center gap-1.5 bg-ink border border-line hover:border-ember text-parchment font-mono text-[9px] tracking-wider uppercase py-3 rounded-sm hover:bg-ember/10 transition-colors cursor-pointer mt-4"
              >
                <Plus className="w-4 h-4" /> Create Scene
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
