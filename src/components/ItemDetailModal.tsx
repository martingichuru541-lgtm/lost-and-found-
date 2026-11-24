import React from 'react';
import {
  X,
  MapPin,
  Calendar,
  Lock,
  ShieldCheck,
  Building2,
  Camera,
  QrCode,
  CheckCircle2,
  Phone,
  MessageSquare,
  AlertTriangle,
  Dog,
  Share2
} from 'lucide-react';
import { LostFoundItem, HandoverReceipt } from '../types';
import { CATEGORY_LABELS } from '../data/mockData';

interface ItemDetailModalProps {
  item: LostFoundItem | null;
  receipt?: HandoverReceipt;
  isOpen: boolean;
  onClose: () => void;
  onClaimItem: (item: LostFoundItem) => void;
  onOpenReceipt: (receipt: HandoverReceipt) => void;
  onOpenScanner: (receiptId: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  receipt,
  isOpen,
  onClose,
  onClaimItem,
  onOpenReceipt,
  onOpenScanner
}) => {
  if (!isOpen || !item) return null;

  const isLost = item.type === 'lost';
  const categoryConfig = CATEGORY_LABELS[item.category] || CATEGORY_LABELS['other'];
  const hasActiveReceipt = Boolean(receipt);
  const isReceiptSigned = receipt?.status === 'SIGNED_AND_VERIFIED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isLost
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
              }`}
            >
              {isLost ? 'Lost Property Report' : 'Found Property Report'}
            </span>
            <span className="font-mono text-xs text-slate-400">
              Ref: {item.referenceNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* Main Title & Image */}
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{item.title}</h2>
            <div className="flex flex-wrap items-center gap-2 text-slate-400 text-xs">
              <span className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${categoryConfig.badgeColor}`}>
                {categoryConfig.label}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {item.area}, {item.town}, {item.county}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(item.dateOccurred).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Photo if available */}
          {item.images && item.images.length > 0 && (
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Circumstances & Description
            </span>
            <p className="text-slate-200 text-sm leading-relaxed">{item.description}</p>
          </div>

          {/* Distinguishing marks */}
          {item.distinguishingFeatures && (
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Visible Characteristics
              </span>
              <p className="text-slate-300">{item.distinguishingFeatures}</p>
            </div>
          )}

          {/* Protected Privacy Warning */}
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 space-y-1">
            <span className="font-semibold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" /> Ownership Protection Guarantee
            </span>
            <p className="text-[11px] text-slate-300">
              KenyaOne conceals sensitive identifying features (such as internal engraving, serial prefixes, and secret wallpapers). To claim this property, the claimant must provide corroborating ownership proof during verification.
            </p>
          </div>

          {/* Custody Information */}
          {item.institutionDetails && (
            <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1.5">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> Institutional Custody Details
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                <div>Facility: <strong className="text-white">{item.institutionDetails.name}</strong></div>
                <div>Locker/Bin: <strong className="text-amber-400 font-mono">{item.institutionDetails.lockerBin}</strong></div>
                <div>Branch: {item.institutionDetails.branch}</div>
                <div>Custody Officer: {item.institutionDetails.officerName}</div>
              </div>
            </div>
          )}

          {/* Handover Pass Info (if already active) */}
          {hasActiveReceipt && receipt && (
            <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Handover Authorization Pass
                </span>
                <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {receipt.receiptId}
                </span>
              </div>
              <p className="text-slate-300 text-xs">
                Handover location: <strong>{receipt.handoverLocation}</strong>
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onOpenReceipt(receipt);
                  }}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" /> View QR Pass
                </button>
                {!isReceiptSigned && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenScanner(receipt.receiptId);
                    }}
                    className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <Camera className="w-3.5 h-3.5" /> Scan QR to Sign Handover
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Never pay a stranger unverified fees.</span>
          </div>

          <div className="flex gap-2">
            {!isLost && !hasActiveReceipt && (
              <button
                onClick={() => {
                  onClose();
                  onClaimItem(item);
                }}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Claim Ownership & Request Handover</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
