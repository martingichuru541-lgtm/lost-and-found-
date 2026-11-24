import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ChevronDown
} from 'lucide-react';
import { LostFoundItem, HandoverReceipt, ItemCategory, ReportType } from './types';
import { INITIAL_ITEMS, INITIAL_RECEIPTS, CATEGORY_LABELS, KENYA_COUNTIES } from './data/mockData';
import { Navbar } from './components/Navbar';
import { ItemCard } from './components/ItemCard';
import { QRHandoverScannerModal } from './components/QRHandoverScannerModal';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { ReportModal } from './components/ReportModal';
import { OwnershipVerificationModal } from './components/OwnershipVerificationModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AIMatchingPanel } from './components/AIMatchingPanel';
import { InteractiveMapModal } from './components/InteractiveMapModal';
import { InstitutionalDashboardModal } from './components/InstitutionalDashboardModal';
import { MissingPersonsSafeguardedModal } from './components/MissingPersonsSafeguardedModal';
import { ReceiptsManager } from './components/ReceiptsManager';

export const App: React.FC = () => {
  // Main states
  const [items, setItems] = useState<LostFoundItem[]>(INITIAL_ITEMS);
  const [receipts, setReceipts] = useState<HandoverReceipt[]>(INITIAL_RECEIPTS);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCounty, setSelectedCounty] = useState<string>('All Counties');
  const [activeTab, setActiveTab] = useState<'items' | 'receipts'>('items');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerInitialReceiptId, setScannerInitialReceiptId] = useState<string | undefined>();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('lost');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<HandoverReceipt | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedItemToClaim, setSelectedItemToClaim] = useState<LostFoundItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<LostFoundItem | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isInstitutionalOpen, setIsInstitutionalOpen] = useState(false);
  const [isMissingPersonsOpen, setIsMissingPersonsOpen] = useState(false);

  // Handover signing handler (triggers automatic receipt update)
  const handleHandoverSigned = (updatedReceipt: HandoverReceipt) => {
    setReceipts((prev) =>
      prev.map((r) => (r.receiptId === updatedReceipt.receiptId ? updatedReceipt : r))
    );

    // Also update item status to recovered
    setItems((prev) =>
      prev.map((item) =>
        item.id === updatedReceipt.itemId ? { ...item, status: 'recovered' } : item
      )
    );
  };

  // New report submit handler
  const handleReportSubmit = (newItem: LostFoundItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  // Ownership verification authorized handler
  const handleVerificationAuthorized = (newReceipt: HandoverReceipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
    setSelectedReceipt(newReceipt);
    setIsReceiptModalOpen(true);

    // Update item status
    setItems((prev) =>
      prev.map((i) =>
        i.id === newReceipt.itemId ? { ...i, status: 'verified_handover_ready' } : i
      )
    );
  };

  // Launch camera QR scanner for a specific receipt
  const handleOpenScanner = (receiptId?: string) => {
    setScannerInitialReceiptId(receiptId);
    setIsScannerOpen(true);
  };

  // View receipt
  const handleViewReceipt = (receipt: HandoverReceipt) => {
    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  // Claim item
  const handleClaimItem = (item: LostFoundItem) => {
    setSelectedItemToClaim(item);
    setIsClaimModalOpen(true);
  };

  // Open item detail
  const handleSelectItemDetail = (item: LostFoundItem) => {
    setSelectedItemDetail(item);
    setIsDetailModalOpen(true);
  };

  // Filtered items list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedCounty !== 'All Counties' && item.county !== selectedCounty) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesArea = item.area.toLowerCase().includes(query);
        const matchesCounty = item.county.toLowerCase().includes(query);
        const matchesRef = item.referenceNumber.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesArea && !matchesCounty && !matchesRef) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedType, selectedCategory, selectedCounty, searchQuery]);

  const lostCount = items.filter((i) => i.type === 'lost').length;
  const foundCount = items.filter((i) => i.type === 'found').length;
  const activeReceiptCount = receipts.filter((r) => r.status === 'PENDING_SCAN').length;

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        onOpenReportModal={(type) => {
          setReportType(type);
          setIsReportOpen(true);
        }}
        onOpenScannerModal={() => handleOpenScanner()}
        onOpenMapModal={() => setIsMapOpen(true)}
        onOpenInstitutionalModal={() => setIsInstitutionalOpen(true)}
        onOpenReceiptsList={() => setActiveTab('receipts')}
        onOpenMissingPersons={() => setIsMissingPersonsOpen(true)}
        onFilterCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveTab('items');
        }}
        selectedCategory={selectedCategory}
        activeReceiptCount={activeReceiptCount}
        matchedCount={2}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* HERO SECTION */}
        <section className="relative rounded-3xl overflow-hidden p-6 sm:p-10 border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 shadow-2xl">
          {/* Subtle glow orb */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>National Unified Lost Property & Verified Handover Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Reuniting Kenyans With Their Belongings. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Safely & Instantly.</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Report lost or recovered items across 47 counties. When an item is found, verify ownership securely and complete physical handovers using real-time camera QR scanning with dual digital signing.
            </p>

            {/* Main Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setReportType('lost');
                  setIsReportOpen(true);
                }}
                className="py-3 px-6 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-rose-950/30 cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>I Lost Something</span>
              </button>

              <button
                onClick={() => {
                  setReportType('found');
                  setIsReportOpen(true);
                }}
                className="py-3 px-6 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-sky-950/30 cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>I Found Something</span>
              </button>

              <button
                onClick={() => handleOpenScanner()}
                className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl font-extrabold text-sm transition flex items-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Handover QR Code</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">National Registrations</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">14,290+</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Verified Handovers</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">11,840+</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Partner SACCOs & Malls</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">530+</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Recovery Success Rate</span>
              <span className="text-xl sm:text-2xl font-black text-sky-400 font-mono">89.4%</span>
            </div>
          </div>
        </section>

        {/* AI Intelligent Match Alerts */}
        <AIMatchingPanel
          lostItems={items.filter((i) => i.type === 'lost')}
          foundItems={items.filter((i) => i.type === 'found')}
          onInitiateClaim={handleClaimItem}
        />

        {/* FEATURE HIGHLIGHT: QR Handover Instant Signing Callout */}
        <section className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-950/10">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl shadow-lg shadow-emerald-500/20 shrink-0">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Phone QR Code Handover Scanner</h3>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  Live Camera + Dual-Phone Mode
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Ready to return or collect property? Scan the recovery receipt QR code from your phone camera during physical handover to automatically sign the digital receipt and complete the transaction.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => handleOpenScanner('REC-2026-NBI-4491')}
              className="w-full md:w-auto py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Handover Scanner</span>
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>View Active Receipts</span>
            </button>
          </div>
        </section>

        {/* VIEW TABS: Registry Items vs Handover Receipts */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('items')}
              className={`pb-2 px-3 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'items'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Lost & Found Registry</span>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-mono">
                {filteredItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('receipts')}
              className={`pb-2 px-3 border-b-2 transition flex items-center gap-2 ${
                activeTab === 'receipts'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Digital Recovery Receipts & Passes</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                {receipts.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsMapOpen(true)}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              <MapPin className="w-3.5 h-3.5" /> Open Kenya Map
            </button>
          </div>
        </div>

        {/* TAB 1: ITEMS REGISTRY */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by keywords, model, county, serial number, reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Type filter (All / Lost / Found) */}
              <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    selectedType === 'all' ? 'bg-slate-750 text-white font-bold bg-slate-800' : 'text-slate-400'
                  }`}
                >
                  All ({items.length})
                </button>
                <button
                  onClick={() => setSelectedType('lost')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    selectedType === 'lost' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-rose-400'
                  }`}
                >
                  Lost ({lostCount})
                </button>
                <button
                  onClick={() => setSelectedType('found')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    selectedType === 'found' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-sky-400'
                  }`}
                >
                  Found ({foundCount})
                </button>
              </div>

              {/* County selector */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none py-1.5 cursor-pointer"
                >
                  {KENYA_COUNTIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-slate-200">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Quick Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition border ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                All Categories
              </button>
              {Object.entries(CATEGORY_LABELS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition border ${
                    selectedCategory === key
                      ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map((item) => {
                  const receipt = receipts.find((r) => r.itemId === item.id);
                  return (
                    <ItemCard
                      key={item.id}
                      item={item}
                      receipt={receipt}
                      onSelectItem={handleSelectItemDetail}
                      onClaimItem={handleClaimItem}
                      onOpenReceipt={handleViewReceipt}
                      onOpenScanner={handleOpenScanner}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-3">
                <Search className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No Matching Reports Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search keywords, county filter, or category. You can also file a new report.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedCounty('All Counties');
                      setSelectedType('all');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => {
                      setReportType('lost');
                      setIsReportOpen(true);
                    }}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-xl text-xs font-bold"
                  >
                    Report Item Now
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECEIPTS & HANDOVER PASSES */}
        {activeTab === 'receipts' && (
          <ReceiptsManager
            receipts={receipts}
            onSelectReceipt={handleViewReceipt}
            onOpenScanner={handleOpenScanner}
          />
        )}

        {/* TRUST & SAFETY GUIDANCE SECTION */}
        <section className="mt-12 bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">KenyaOne Official Safety & Fraud Prevention Rules</h3>
              <p className="text-xs text-slate-400">Strict community recovery standards across Kenya.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Unverified Fees</span>
              </div>
              <p className="text-slate-300">
                Never send M-Pesa or funds to unverified individuals claiming to hold your lost item. Genuine returns are coordinated at public institutional partner desks.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <Building2 className="w-4 h-4" />
                <span>Safe Public Collection Points</span>
              </div>
              <p className="text-slate-300">
                All item handovers should be conducted at registered SACCO offices (e.g. Super Metro), mall customer desks, or authorized police stations.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <QrCode className="w-4 h-4" />
                <span>Cryptographic QR Handover</span>
              </div>
              <p className="text-slate-300">
                Always ensure both parties scan the digital recovery receipt QR code. This locks the transaction with dual digital signatures and seals the legal custody transfer.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">KenyaOne Lost & Found Platform</span>
            <span>•</span>
            <span>Republic of Kenya Official Recovery Registry</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Security Hotline: 0800 722 203</span>
            <span>•</span>
            <span>Police: 999 / 112</span>
            <span>•</span>
            <span>Childline: 116</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Camera QR Handover Scanner Modal (The user's requested feature) */}
      <QRHandoverScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        receipts={receipts}
        onHandoverSigned={handleHandoverSigned}
        initialSelectedReceiptId={scannerInitialReceiptId}
      />

      {/* 2. Digital Recovery Receipt Modal */}
      <DigitalReceiptModal
        isOpen={isReceiptModalOpen}
        receipt={selectedReceipt}
        onClose={() => setIsReceiptModalOpen(false)}
        onOpenScanner={handleOpenScanner}
      />

      {/* 3. Report Lost / Found Item Modal */}
      <ReportModal
        isOpen={isReportOpen}
        reportType={reportType}
        onClose={() => setIsReportOpen(false)}
        onSubmit={handleReportSubmit}
      />

      {/* 4. Ownership Verification Claim Modal */}
      <OwnershipVerificationModal
        isOpen={isClaimModalOpen}
        item={selectedItemToClaim}
        onClose={() => setIsClaimModalOpen(false)}
        onVerificationSuccess={handleVerificationAuthorized}
        onOpenScanner={handleOpenScanner}
      />

      {/* 5. Item Detail Modal */}
      <ItemDetailModal
        isOpen={isDetailModalOpen}
        item={selectedItemDetail}
        receipt={receipts.find((r) => r.itemId === selectedItemDetail?.id)}
        onClose={() => setIsDetailModalOpen(false)}
        onClaimItem={handleClaimItem}
        onOpenReceipt={handleViewReceipt}
        onOpenScanner={handleOpenScanner}
      />

      {/* 6. Interactive Kenya Map Modal */}
      <InteractiveMapModal
        isOpen={isMapOpen}
        items={items}
        onClose={() => setIsMapOpen(false)}
        onSelectItem={handleSelectItemDetail}
      />

      {/* 7. Institutional Dashboard Modal */}
      <InstitutionalDashboardModal
        isOpen={isInstitutionalOpen}
        items={items}
        receipts={receipts}
        onClose={() => setIsInstitutionalOpen(false)}
        onOpenReportModal={(type) => {
          setReportType(type);
          setIsReportOpen(true);
        }}
        onOpenScanner={handleOpenScanner}
        onSelectReceipt={handleViewReceipt}
      />

      {/* 8. Safeguarded Missing Persons Modal */}
      <MissingPersonsSafeguardedModal
        isOpen={isMissingPersonsOpen}
        onClose={() => setIsMissingPersonsOpen(false)}
      />
    </div>
  );
};
