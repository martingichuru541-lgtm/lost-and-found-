import React from 'react';
import {
  MapPin,
  Calendar,
  Lock,
  ShieldCheck,
  Building2,
  Camera,
  QrCode,
  CheckCircle2,
  ChevronRight,
  Eye,
  Dog,
  ExternalLink
} from 'lucide-react';
import { LostFoundItem, HandoverReceipt } from '../types';
import { CATEGORY_LABELS } from '../data/mockData';

interface ItemCardProps {
  item: LostFoundItem;
  receipt?: HandoverReceipt;
  onSelectItem: (item: LostFoundItem) => void;
  onClaimItem: (item: LostFoundItem) => void;
  onOpenReceipt: (receipt: HandoverReceipt) => void;
  onOpenScanner: (receiptId: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  receipt,
  onSelectItem,
  onClaimItem,
  onOpenReceipt,
  onOpenScanner
}) => {
  const isLost = item.type === 'lost';
  const categoryConfig = CATEGORY_LABELS[item.category] || CATEGORY_LABELS['other'];
  const hasActiveReceipt = Boolean(receipt);
  const isReceiptSigned = receipt?.status === 'SIGNED_AND_VERIFIED';

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-emerald-950/20">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isLost
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
              }`}
            >
              {isLost ? 'Lost Property' : 'Found in Custody'}
            </span>

            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${categoryConfig.badgeColor}`}>
              {categoryConfig.label}
            </span>
          </div>

          <span className="font-mono text-[10px] text-slate-500">
            {item.referenceNumber}
          </span>
        </div>

        {/* Thumbnail Image (if exists) */}
        {item.images && item.images.length > 0 && (
          <div className="relative aspect-video w-full mb-3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {item.status === 'verified_handover_ready' && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full shadow-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Handover Ready</span>
              </div>
            )}
          </div>
        )}

        {/* Item Title & Description */}
        <h3
          onClick={() => onSelectItem(item)}
          className="text-base font-bold text-white hover:text-emerald-400 cursor-pointer transition line-clamp-1"
        >
          {item.title}
        </h3>

        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Distinguishing Features / Masked ID */}
        <div className="mt-3 space-y-1 text-xs">
          {item.serialNumberMasked && (
            <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Masked ID/Serial: {item.serialNumberMasked}</span>
            </div>
          )}

          {item.petDetails && (
            <div className="flex items-center gap-1.5 text-pink-300 text-[11px]">
              <Dog className="w-3.5 h-3.5 shrink-0" />
              <span>Breed: {item.petDetails.breed} • Color: {item.petDetails.color}</span>
            </div>
          )}

          {item.institutionDetails && (
            <div className="flex items-center gap-1.5 text-amber-300 text-[11px]">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Custody: {item.institutionDetails.name} ({item.institutionDetails.lockerBin})</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Metadata & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
          <div className="flex items-center gap-1 truncate max-w-[170px]">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{item.town}, {item.county}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 font-mono text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(item.dateOccurred).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {hasActiveReceipt && receipt ? (
            <div className="flex items-center gap-1.5 w-full">
              <button
                onClick={() => onOpenReceipt(receipt)}
                className="flex-1 py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">{isReceiptSigned ? 'View Receipt' : 'Handover Pass'}</span>
              </button>

              {!isReceiptSigned ? (
                <button
                  onClick={() => onOpenScanner(receipt.receiptId)}
                  className="flex-1 py-2 px-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
                  title="Scan recovery receipt QR code to sign handover"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="truncate">Scan QR Sign</span>
                </button>
              ) : (
                <span className="px-2.5 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Handed Over
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => onSelectItem(item)}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Details</span>
              </button>

              {!isLost ? (
                <button
                  onClick={() => onClaimItem(item)}
                  className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-sm cursor-pointer active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Claim Item</span>
                </button>
              ) : (
                <button
                  onClick={() => onSelectItem(item)}
                  className="flex-1 py-2 px-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Found This?</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
