import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Copy,
  Check,
  Camera,
  Share2,
  Building2,
  Lock
} from 'lucide-react';
import { HandoverReceipt } from '../types';
import { generateQRCodeDataUrl } from '../utils/qrCodeCanvas';

interface DigitalReceiptModalProps {
  receipt: HandoverReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner: (receiptId: string) => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onOpenScanner
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (receipt && receipt.qrPayloadString) {
      generateQRCodeDataUrl(receipt.qrPayloadString).then(url => {
        setQrDataUrl(url);
      });
    }
  }, [receipt]);

  if (!isOpen || !receipt) return null;

  const isSigned = receipt.status === 'SIGNED_AND_VERIFIED';

  const copyHash = () => {
    if (receipt.verificationHash) {
      navigator.clipboard.writeText(receipt.verificationHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isSigned ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Digital Recovery Receipt
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isSigned 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isSigned ? 'OFFICIALLY SIGNED & VERIFIED' : 'PENDING QR HANDOVER SCAN'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">Ref: {receipt.receiptId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close receipt modal"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* QR Code Presentation Box */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Handover Authorization Pass</span>
            </div>

            {/* QR Image */}
            <div className="inline-block p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="KenyaOne Handover QR"
                  className="w-44 h-44 object-contain mx-auto"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs font-mono">
                  Generating QR...
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              {isSigned ? (
                <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> This receipt was scanned & signed electronically during physical handover.
                </span>
              ) : (
                'Present this QR code on your phone to the custodian during item collection. They will scan it using their phone camera to sign and complete the handover.'
              )}
            </p>

            {!isSigned && (
              <button
                onClick={() => onOpenScanner(receipt.receiptId)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera Scanner to Verify This Handover</span>
              </button>
            )}
          </div>

          {/* Item & Handover Details */}
          <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
              Transaction Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 text-[11px] block">Item Name & Model</span>
                <span className="text-white font-semibold">{receipt.itemTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Item Tracking Reference</span>
                <span className="text-emerald-400 font-mono">{receipt.itemReference}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Claimant (Verified Owner)</span>
                <span className="text-slate-200 font-medium">{receipt.claimant.name}</span>
                <span className="text-slate-500 block text-[10px] font-mono">
                  ID: {receipt.claimant.nationalIdMasked} | {receipt.claimant.phoneMasked}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Custodian & Facility</span>
                <span className="text-slate-200 font-medium">{receipt.custodian.name}</span>
                <span className="text-slate-500 block text-[10px]">
                  {receipt.custodian.organization}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-2 space-y-1">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{receipt.handoverLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Scheduled / Completed: {new Date(receipt.scheduledTime).toLocaleString()}</span>
              </div>
            </div>

            {receipt.collectionNotes && (
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                <strong>Verification Notes:</strong> {receipt.collectionNotes}
              </div>
            )}
          </div>

          {/* Cryptographic Verification Hashes */}
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Anti-Tamper Verification Hash
              </span>
              <button
                onClick={copyHash}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="font-mono text-[10px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800 break-all select-all">
              {receipt.verificationHash}
            </p>

            {isSigned && (
              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono space-y-1">
                <div className="text-emerald-400">
                  Claimant Signature: {receipt.claimant.signatureHash}
                </div>
                <div className="text-emerald-400">
                  Custodian Seal: {receipt.custodian.signatureHash}
                </div>
              </div>
            )}
          </div>

          {/* Audit trail */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Custody Audit Trail
            </h4>
            <div className="space-y-1">
              {receipt.auditTrail.map((log, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-slate-950/50 rounded-lg border border-slate-800/80 text-[10px] text-slate-400 flex items-start justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-300">{log.action}: </span>
                    <span>{log.note}</span>
                  </div>
                  <span className="text-slate-500 whitespace-nowrap ml-2 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print Receipt
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
