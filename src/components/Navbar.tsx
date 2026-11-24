import React from 'react';
import {
  Search,
  PlusCircle,
  Camera,
  MapPin,
  ShieldCheck,
  Building2,
  FileText,
  Dog,
  AlertTriangle,
  QrCode,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onOpenScannerModal: () => void;
  onOpenMapModal: () => void;
  onOpenInstitutionalModal: () => void;
  onOpenReceiptsList: () => void;
  onOpenMissingPersons: () => void;
  onFilterCategory: (category: string) => void;
  selectedCategory: string;
  activeReceiptCount: number;
  matchedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReportModal,
  onOpenScannerModal,
  onOpenMapModal,
  onOpenInstitutionalModal,
  onOpenReceiptsList,
  onOpenMissingPersons,
  onFilterCategory,
  selectedCategory,
  activeReceiptCount,
  matchedCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-950 to-slate-950 px-4 py-1.5 text-xs border-b border-emerald-950/40 text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">KenyaOne Official Network:</span>
          <span className="hidden sm:inline text-slate-300">
            Secure National Lost Property, Identity Document Recovery & Handover Verification.
          </span>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={onOpenMissingPersons}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition text-[11px]"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Missing Persons (Safeguarded)</span>
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 text-[11px]">Hotline: 0800 722 203 / 999</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onFilterCategory('all')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black tracking-tight text-white text-lg font-sans">KENYA<span className="text-emerald-400">ONE</span></span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Recovery
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5">Lost & Found National Registry</p>
          </div>
        </div>

        {/* Center Quick Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-300">
          <button
            onClick={() => onFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === 'all' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-white hover:bg-slate-850'}`}
          >
            All Reports
          </button>
          <button
            onClick={() => onFilterCategory('national_id')}
            className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === 'national_id' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-white hover:bg-slate-850'}`}
          >
            National IDs & Passports
          </button>
          <button
            onClick={() => onFilterCategory('pet_animal')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${selectedCategory === 'pet_animal' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-white hover:bg-slate-850'}`}
          >
            <Dog className="w-3.5 h-3.5 text-pink-400" />
            <span>Missing Pets</span>
          </button>
          <button
            onClick={onOpenMapModal}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Map View</span>
          </button>
          <button
            onClick={onOpenInstitutionalModal}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 text-amber-300"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>SACCO & Mall Custody</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* QR Handover Scanner Button - Prominently highlighted! */}
          <button
            onClick={onOpenScannerModal}
            className="py-2 px-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95 border border-emerald-400/40"
            title="Scan Recovery Receipt QR Code to automatically verify handover"
          >
            <div className="relative">
              <Camera className="w-4 h-4 text-slate-950" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            </div>
            <span className="hidden sm:inline">Scan Handover QR</span>
            <span className="sm:hidden font-mono text-[10px]">Scan QR</span>
          </button>

          {/* Handover Passes Badge */}
          <button
            onClick={onOpenReceiptsList}
            className="p-2 sm:px-3 sm:py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            title="View Handover Passes & Digital Receipts"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Receipts</span>
            {activeReceiptCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                {activeReceiptCount}
              </span>
            )}
          </button>

          {/* I Lost / I Found Action Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 pl-1 border-l border-slate-800">
            <button
              onClick={() => onOpenReportModal('lost')}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>I Lost Something</span>
            </button>
            <button
              onClick={() => onOpenReportModal('found')}
              className="px-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>I Found Something</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
