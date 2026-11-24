import React, { useState } from 'react';
import {
  Building2,
  X,
  Plus,
  ShieldCheck,
  PackageCheck,
  CheckCircle2,
  Camera,
  QrCode,
  Lock,
  Layers,
  Search,
  FileText
} from 'lucide-react';
import { LostFoundItem, HandoverReceipt } from '../types';

interface InstitutionalDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: LostFoundItem[];
  receipts: HandoverReceipt[];
  onOpenReportModal: (type: 'found') => void;
  onOpenScanner: (receiptId?: string) => void;
  onSelectReceipt: (receipt: HandoverReceipt) => void;
}

export const InstitutionalDashboardModal: React.FC<InstitutionalDashboardModalProps> = ({
  isOpen,
  onClose,
  items,
  receipts,
  onOpenReportModal,
  onOpenScanner,
  onSelectReceipt
}) => {
  const [selectedOrg, setSelectedOrg] = useState('Super Metro Transport SACCO');

  if (!isOpen) return null;

  const institutions = [
    { name: 'Super Metro Transport SACCO', type: 'Matatu & Fleet SACCO', branch: 'Two Rivers & Westlands Terminal', count: 6 },
    { name: 'Two Rivers Mall Customer Desk', type: 'Shopping Mall Security', branch: 'Limuru Road Hub', count: 4 },
    { name: 'Kenya Airports Authority (KAA)', type: 'National Aviation Port', branch: 'JKIA Terminal 1A', count: 8 },
    { name: 'Sarit Centre Security Desk', type: 'Commercial Mall', branch: 'Westlands Mall', count: 3 },
    { name: 'Kenya Police Service', type: 'Law Enforcement', branch: 'Central Police Station Moi Ave', count: 12 }
  ];

  const orgItems = items.filter(
    (i) => i.institutionDetails?.name.toLowerCase().includes(selectedOrg.toLowerCase().split(' ')[0])
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Institutional Custody & Handover Portal
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                  SACCOs • Airports • Malls • Police
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official property custody management, storage locker inventory, and digital QR handover clearance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close portal"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          
          {/* Institution Selector */}
          <div>
            <label className="block text-slate-400 font-semibold mb-2">Switch Active Facility / Operator Desk:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {institutions.slice(0, 3).map((org) => (
                <button
                  key={org.name}
                  onClick={() => setSelectedOrg(org.name)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedOrg === org.name
                      ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-950/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold truncate text-white">{org.name}</p>
                  <p className="text-[11px] text-amber-400/80">{org.type}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{org.branch}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">In Secure Storage</span>
              <span className="text-xl font-bold text-white font-mono">14</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Assigned to bins</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Claims Pending Review</span>
              <span className="text-xl font-bold text-amber-400 font-mono">3</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Verification required</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Ready for QR Handover</span>
              <span className="text-xl font-bold text-sky-400 font-mono">2</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Passes active</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Signed Handover Clearances</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">28</span>
              <span className="text-[10px] text-emerald-400/80 block mt-0.5">100% verified</span>
            </div>
          </div>

          {/* Custody Inventory for Selected Org */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                Custody Inventory & Handover Clearance Queue
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenReportModal('found');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Recovered Item
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenScanner();
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" /> Staff Camera QR Scanner
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {receipts.map((rec) => (
                <div
                  key={rec.receiptId}
                  className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{rec.itemTitle}</span>
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        {rec.receiptId}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Claimant: <strong className="text-slate-200">{rec.claimant.name}</strong> • Collection at {rec.handoverLocation}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectReceipt(rec);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" /> View Pass
                    </button>
                    {rec.status === 'PENDING_SCAN' ? (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenScanner(rec.receiptId);
                        }}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition flex items-center gap-1 shadow-md shadow-emerald-500/20"
                      >
                        <Camera className="w-3.5 h-3.5" /> Scan QR to Sign
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-[11px] font-bold border border-emerald-500/30">
                        ✓ Verified & Handed Over
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>KenyaOne Institutional Safeguarding Framework v2.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition font-medium"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
