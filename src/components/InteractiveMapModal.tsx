import React, { useState } from 'react';
import {
  X,
  MapPin,
  Filter,
  Eye,
  ShieldCheck,
  Search,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { LostFoundItem, ItemCategory } from '../types';
import { KENYA_COUNTIES, CATEGORY_LABELS } from '../data/mockData';

interface InteractiveMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LostFoundItem[];
  onSelectItem: (item: LostFoundItem) => void;
}

export const InteractiveMapModal: React.FC<InteractiveMapModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem
}) => {
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [activePinItem, setActivePinItem] = useState<LostFoundItem | null>(null);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (selectedCounty !== 'All Counties' && item.county !== selectedCounty) {
      return false;
    }
    if (filterType !== 'all' && item.type !== filterType) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Kenya Regional Lost & Found Map
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {filteredItems.length} Pinned Reports
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Approximate regional cluster locations. Exact private residences are never exposed.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close map"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Filter className="w-3.5 h-3.5" /> County:
            </span>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              {KENYA_COUNTIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md transition ${filterType === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('lost')}
              className={`px-3 py-1 rounded-md transition ${filterType === 'lost' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-rose-400'}`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setFilterType('found')}
              className={`px-3 py-1 rounded-md transition ${filterType === 'found' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-sky-400'}`}
            >
              Found Only
            </button>
          </div>
        </div>

        {/* Map Body: Stylized Kenya Map Canvas */}
        <div className="relative flex-1 bg-slate-950 min-h-[380px] p-6 overflow-hidden flex items-center justify-center">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          {/* Stylized Kenya Regional Outline Vector */}
          <svg viewBox="0 0 600 500" className="w-full max-w-xl h-auto opacity-20 pointer-events-none stroke-emerald-500/40 fill-emerald-950/20">
            {/* Kenya approximate regional boundary path */}
            <path d="M 280 40 L 370 70 L 480 120 L 520 220 L 440 330 L 410 440 L 320 470 L 250 410 L 190 350 L 170 280 L 180 200 L 230 110 Z" strokeWidth="2" />
            <path d="M 280 250 Q 300 320 380 400" strokeWidth="1" strokeDasharray="4 4" />
          </svg>

          {/* Map Pins */}
          <div className="absolute inset-0 p-8">
            {filteredItems.map((item, idx) => {
              // Pseudo-geo placement offsets for visual map representation
              const basePositions: Record<string, { top: string; left: string }> = {
                'Nairobi': { top: '56%', left: '46%' },
                'Mombasa': { top: '80%', left: '72%' },
                'Kisumu': { top: '52%', left: '28%' },
                'Nakuru': { top: '48%', left: '38%' },
                'Kiambu': { top: '53%', left: '48%' },
                'Uasin Gishu': { top: '40%', left: '32%' },
                'Machakos': { top: '62%', left: '54%' }
              };

              const base = basePositions[item.county] || { top: '50%', left: '50%' };
              // Slight random jitter per item
              const jitterY = (idx % 4) * 4 - 6;
              const jitterX = (idx % 3) * 6 - 8;

              const isLost = item.type === 'lost';

              return (
                <div
                  key={item.id}
                  style={{
                    top: `calc(${base.top} + ${jitterY}%)`,
                    left: `calc(${base.left} + ${jitterX}%)`
                  }}
                  onClick={() => setActivePinItem(item)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
                >
                  <div
                    className={`p-2 rounded-full shadow-lg transition-transform transform group-hover:scale-125 border ${
                      isLost
                        ? 'bg-rose-500/90 text-slate-950 border-rose-300 ring-4 ring-rose-500/20'
                        : 'bg-emerald-400 text-slate-950 border-emerald-200 ring-4 ring-emerald-500/20'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-900 border border-slate-700 p-2.5 rounded-xl shadow-xl text-left z-20 pointer-events-none">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      isLost ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {isLost ? 'Lost Property' : 'Found in Custody'}
                    </span>
                    <p className="text-xs font-bold text-white truncate mt-1">{item.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{item.area}, {item.county}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Item Drawer */}
          {activePinItem && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-30 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  activePinItem.type === 'lost'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {activePinItem.type === 'lost' ? 'Lost Property' : 'Found & Secured'}
                </span>
                <button
                  onClick={() => setActivePinItem(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-bold text-white text-sm">{activePinItem.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-2 my-1">{activePinItem.description}</p>
              
              <div className="text-[11px] text-slate-400 space-y-1 my-2">
                <p>📍 {activePinItem.area}, {activePinItem.county}</p>
                <p>🗓️ {new Date(activePinItem.dateOccurred).toLocaleDateString()}</p>
                {activePinItem.institutionDetails && (
                  <p className="text-emerald-400">🏢 Custody: {activePinItem.institutionDetails.name}</p>
                )}
              </div>

              <button
                onClick={() => {
                  onSelectItem(activePinItem);
                  onClose();
                }}
                className="w-full mt-2 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>View Full Details & Handover</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Lost Reports
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Found & Safe in Custody
            </span>
          </div>
          <span className="text-slate-500">KenyaOne Spatial Privacy Protection Active</span>
        </div>
      </div>
    </div>
  );
};
