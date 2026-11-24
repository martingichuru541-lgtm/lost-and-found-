import React from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Camera,
  QrCode,
  MapPin,
  ChevronRight,
  ExternalLink,
  Printer
} from 'lucide-react';
import { HandoverReceipt } from '../types';

interface ReceiptsManagerProps {
  receipts: HandoverReceipt[];
  onSelectReceipt: (receipt: HandoverReceipt) => void;
  onOpenScanner: (receiptId: string) => void;
}

export const ReceiptsManager: React.FC<ReceiptsManagerProps> = ({
  receipts,
  onSelectReceipt,
  onOpenScanner
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Digital Recovery Receipts & Handover Passes
          </h2>
          <p className="text-xs text-slate-400">
            Cryptographically sealed verification passes and signed completion certificates.
          </p>
        </div>

        <button
          onClick={() => onOpenScanner('')}
          className="py-2 px-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Any Handover QR Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {receipts.map((receipt) => {
          const isSigned = receipt.status === 'SIGNED_AND_VERIFIED';

          return (
            <div
              key={receipt.receiptId}
              className={`rounded-2xl p-4 border transition ${
                isSigned
                  ? 'bg-slate-950/70 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-950/90 border-slate-700/80 hover:border-emerald-500/50'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="font-mono text-xs font-bold text-slate-200">
                  {receipt.receiptId}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isSigned
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  }`}
                >
                  {isSigned ? 'SIGNED & SEALED' : 'PENDING CAMERA SCAN'}
                </span>
              </div>

              {/* Item info */}
              <div className="my-3 space-y-1 text-xs">
                <h4 className="font-bold text-white text-sm">{receipt.itemTitle}</h4>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span className="font-mono text-emerald-400">Ref: {receipt.itemReference}</span>
                  <span>•</span>
                  <span className="truncate">{receipt.handoverCounty} County</span>
                </div>
              </div>

              {/* Parties */}
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/80 text-[11px] space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Claimant:</span>
                  <span className="text-slate-200 font-medium">{receipt.claimant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Custodian:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[200px]">
                    {receipt.custodian.organization}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-800/60">
                  <span>Location:</span>
                  <span className="truncate max-w-[220px]">{receipt.handoverLocation}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectReceipt(receipt)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSigned ? 'View Certificate' : 'Show QR Pass'}</span>
                </button>

                {!isSigned ? (
                  <button
                    onClick={() => onOpenScanner(receipt.receiptId)}
                    className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan to Sign</span>
                  </button>
                ) : (
                  <button
                    onClick={() => window.print()}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
