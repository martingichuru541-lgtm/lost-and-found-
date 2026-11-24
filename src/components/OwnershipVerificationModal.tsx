import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  FileCheck,
  AlertCircle,
  Camera,
  QrCode,
  CheckCircle2,
  Building2,
  MapPin
} from 'lucide-react';
import { LostFoundItem, HandoverReceipt } from '../types';
import { generateVerificationHash, createHandoverQRPayload, maskSensitiveNumber } from '../utils/handoverLogic';

interface OwnershipVerificationModalProps {
  item: LostFoundItem | null;
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess: (newReceipt: HandoverReceipt) => void;
  onOpenScanner: (receiptId: string) => void;
}

export const OwnershipVerificationModal: React.FC<OwnershipVerificationModalProps> = ({
  item,
  isOpen,
  onClose,
  onVerificationSuccess,
  onOpenScanner
}) => {
  const [claimantName, setClaimantName] = useState('Brian Otieno');
  const [claimantPhone, setClaimantPhone] = useState('+254 712 345 314');
  const [claimantIdNumber, setClaimantIdNumber] = useState('38941022');
  const [secretIdentifyingProof, setSecretIdentifyingProof] = useState('');
  const [serialOrImeiProof, setSerialOrImeiProof] = useState('');
  const [handoverLocation, setHandoverLocation] = useState('');
  const [hasReceiptProof, setHasReceiptProof] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const defaultHandoverLoc = item.institutionDetails
    ? `${item.institutionDetails.name} - ${item.institutionDetails.branch}`
    : `${item.town} Police Station or Public Administration Hub`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!claimantName.trim() || !secretIdentifyingProof.trim()) {
      setErrorMsg('Please describe the hidden identifying marks or proof to verify ownership.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const receiptId = `REC-2026-${item.county.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const scheduledTime = new Date(Date.now() + 3600 * 1000).toISOString();
      const claimantId = `usr_claimant_${Date.now()}`;
      const custodianId = `usr_custodian_${item.reporterName.replace(/\s+/g, '_').toLowerCase()}`;

      const verificationHash = generateVerificationHash(
        receiptId,
        item.id,
        claimantId,
        custodianId,
        scheduledTime
      );

      const newReceipt: HandoverReceipt = {
        receiptId,
        itemId: item.id,
        itemReference: item.referenceNumber,
        itemTitle: item.title,
        itemCategory: item.category,
        handoverLocation: handoverLocation.trim() || defaultHandoverLoc,
        handoverCounty: item.county,
        scheduledTime,
        status: 'PENDING_SCAN',
        claimant: {
          id: claimantId,
          name: claimantName.trim(),
          phoneMasked: maskSensitiveNumber(claimantPhone, 3),
          nationalIdMasked: maskSensitiveNumber(claimantIdNumber, 2)
        },
        custodian: {
          id: custodianId,
          name: item.institutionDetails?.officerName || item.reporterName,
          role: item.institutionDetails ? 'Designated Property Custodian' : 'Item Finder & Verified Citizen',
          organization: item.institutionDetails?.name || 'KenyaOne Verified Recovery Network',
          phoneMasked: item.reporterPhoneMasked
        },
        qrPayloadString: '',
        verificationHash,
        collectionNotes: `Ownership proof verified: "${secretIdentifyingProof}". Verified against registered listing.`,
        auditTrail: [
          {
            timestamp: new Date().toISOString(),
            action: 'OWNERSHIP_CLAIM_VERIFIED',
            actor: `${claimantName} (Claimant)`,
            note: 'Submitted ownership evidence matching secret item attributes. Handover Pass authorized.'
          }
        ]
      };

      // Set serialized QR payload
      newReceipt.qrPayloadString = createHandoverQRPayload(newReceipt);

      setIsSubmitting(false);
      onVerificationSuccess(newReceipt);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Claim Ownership & Verify Property</h2>
              <p className="text-xs text-slate-400 font-mono">Item Ref: {item.referenceNumber}</p>
            </div>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Item summary banner */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
              <p className="text-slate-400 text-[11px]">Found in {item.area}, {item.county}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium text-[11px]">
              Ready for Verification
            </span>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Fraud Prevention Protocol
            </p>
            <p className="text-[11px] text-slate-300">
              To safeguard property, the claimant must provide identifying details that only the true owner would know (e.g. lockscreen PIN prefix, wallpaper description, purchase invoice, serial numbers).
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Claimant Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Claimant Full Name *</label>
              <input
                type="text"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Claimant Phone Number *</label>
              <input
                type="text"
                value={claimantPhone}
                onChange={(e) => setClaimantPhone(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">National ID / Passport Number (For Handover Receipt)</label>
            <input
              type="text"
              value={claimantIdNumber}
              onChange={(e) => setClaimantIdNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Secret identifying proof */}
          <div>
            <label className="block text-emerald-400 mb-1 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Secret Identifying Evidence / Hidden Marks *
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Wallpaper shows Lake Nakuru flamingos, PIN starts with 8, small dent under power button..."
              value={secretIdentifyingProof}
              onChange={(e) => setSecretIdentifyingProof(e.target.value)}
              required
              className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Compared with the custodian's private notes before issuing the Handover Pass.
            </p>
          </div>

          {/* Serial number / IMEI */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">
              Serial Number / IMEI / Document Number (if available)
            </label>
            <input
              type="text"
              placeholder="e.g. IMEI ending in 4920 or Purchase receipt #ST-8912"
              value={serialOrImeiProof}
              onChange={(e) => setSerialOrImeiProof(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Safe handover location */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Safe Public Collection Point</label>
            <input
              type="text"
              placeholder={defaultHandoverLoc}
              value={handoverLocation}
              onChange={(e) => setHandoverLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              All handovers must occur at authorized SACCO offices, shopping mall security desks, or police stations.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying...' : 'Authorize & Issue Handover Pass'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
