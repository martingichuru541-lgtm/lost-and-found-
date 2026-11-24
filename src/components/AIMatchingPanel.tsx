import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { LostFoundItem } from '../types';

interface AIMatchingPanelProps {
  lostItems: LostFoundItem[];
  foundItems: LostFoundItem[];
  onInitiateClaim: (foundItem: LostFoundItem) => void;
}

export const AIMatchingPanel: React.FC<AIMatchingPanelProps> = ({
  lostItems,
  foundItems,
  onInitiateClaim
}) => {
  // Identify items that have matching IDs or matching high similarity
  const pairs = lostItems
    .filter((l) => l.matchedItemId)
    .map((l) => {
      const found = foundItems.find((f) => f.id === l.matchedItemId);
      return { lost: l, found, score: l.matchScore || 92 };
    })
    .filter((pair): pair is { lost: LostFoundItem; found: LostFoundItem; score: number } => Boolean(pair.found));

  if (pairs.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl shadow-emerald-950/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40 animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              AI Intelligent Match Alerts
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                {pairs.length} Potential Matches
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              KenyaOne Neural Matching detected high correlation between reported lost & found items.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {pairs.map(({ lost, found, score }) => (
          <div
            key={`${lost.id}-${found.id}`}
            className="bg-slate-950/80 rounded-xl p-3 sm:p-4 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Lost side */}
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                Reported Lost ({lost.reporterName})
              </span>
              <h4 className="text-sm font-semibold text-white">{lost.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-1">{lost.description}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span>{lost.county}</span>
                <span>•</span>
                <span>Ref: {lost.referenceNumber}</span>
              </div>
            </div>

            {/* Match badge & arrow */}
            <div className="flex flex-col items-center justify-center px-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 font-bold text-xs shadow-inner">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{score}% Match</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">Category & Locality</span>
            </div>

            {/* Found side */}
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                Found in Custody ({found.institutionDetails?.name || found.reporterName})
              </span>
              <h4 className="text-sm font-semibold text-white">{found.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-1">{found.description}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span>{found.area}</span>
                <span>•</span>
                <span>Ref: {found.referenceNumber}</span>
              </div>
            </div>

            {/* Action */}
            <div className="flex md:flex-col justify-end">
              <button
                onClick={() => onInitiateClaim(found)}
                className="py-2 px-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
              >
                <span>Verify & Handover</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
