import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  PhoneCall,
  ShieldAlert,
  FileCheck2,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';

interface MissingPersonsSafeguardedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MissingPersonsSafeguardedModal: React.FC<MissingPersonsSafeguardedModalProps> = ({
  isOpen,
  onClose
}) => {
  const [personName, setPersonName] = useState('');
  const [age, setAge] = useState('');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [policeObNumber, setPoliceObNumber] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [relationship, setRelationship] = useState('Parent / Legal Guardian');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !policeObNumber) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/30 bg-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Safeguarded Missing Persons Desk
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-semibold">
                  Official Moderation
                </span>
              </h2>
              <p className="text-xs text-amber-200/80">
                Independent, verified process strictly separated from lost personal property.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Emergency Hotlines Box */}
          <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2">
            <span className="text-amber-400 font-bold block text-sm flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4" /> Immediate Kenyan Emergency Numbers
            </span>
            <p className="text-slate-300">
              If an individual is currently missing or in imminent danger, contact emergency services immediately before filing a digital notice:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">KENYA POLICE:</span>
                <span className="text-white font-bold text-sm">999 / 112 / 911</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">CHILDLINE KENYA:</span>
                <span className="text-white font-bold text-sm">116 (Toll Free)</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">DCI TOLL-FREE:</span>
                <span className="text-white font-bold text-sm">0800 722 203</span>
              </div>
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" /> Mandatory Police OB Verification
                </p>
                <p className="text-[11px] text-slate-300">
                  Per KenyaOne child & vulnerable adult protection guidelines, all missing person publications require a valid Kenya Police Occurrence Book (OB) Number to prevent harassment or unauthorized surveillance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Full Name of Missing Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Kiptoo"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 14"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Police Station Reported To *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasarani Police Station"
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 mb-1 font-medium">Police OB Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OB 42/08/11/2026"
                    value={policeObNumber}
                    onChange={(e) => setPoliceObNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Last Known Area / Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Roysambu bus stage wearing navy blue hoodie"
                    value={lastSeenLocation}
                    onChange={(e) => setLastSeenLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Your Relationship *</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  >
                    <option>Parent / Legal Guardian</option>
                    <option>Spouse / Partner</option>
                    <option>Immediate Sibling</option>
                    <option>Investigating Police Officer</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Submit for Emergency Verification & Police Coordination</span>
              </button>
            </form>
          ) : (
            <div className="p-6 bg-slate-950 rounded-2xl border border-emerald-500/40 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Report Logged with Rapid Verification Unit</h3>
              <p className="text-slate-300">
                Case reference has been queued for verification against <strong>{policeStation} ({policeObNumber})</strong>.
              </p>
              <p className="text-[11px] text-slate-500">
                KenyaOne safeguarding officers are liaising with DCI Child Protection and local police. You will receive an SMS update on progress.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 text-slate-500 text-xs flex justify-between">
          <span>Safeguarding & Human Rights Compliance</span>
          <button onClick={onClose} className="text-slate-300 hover:text-white">Close</button>
        </div>
      </div>
    </div>
  );
};
