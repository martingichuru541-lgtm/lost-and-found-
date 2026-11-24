import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  MapPin,
  Calendar,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  Dog,
  EyeOff
} from 'lucide-react';
import { LostFoundItem, ItemCategory, ReportType } from '../types';
import { CATEGORY_LABELS, KENYA_COUNTIES } from '../data/mockData';
import { maskSensitiveNumber } from '../utils/handoverLogic';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  onSubmit: (item: LostFoundItem) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportType,
  onSubmit
}) => {
  const [category, setCategory] = useState<ItemCategory>('phone_electronics');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [county, setCounty] = useState('Nairobi');
  const [town, setTown] = useState('Nairobi CBD');
  const [area, setArea] = useState('');
  const [dateOccurred, setDateOccurred] = useState(new Date().toISOString().split('T')[0]);
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');
  const [hiddenFeature, setHiddenFeature] = useState('');
  const [serialOrIdNumber, setSerialOrIdNumber] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petMicrochip, setPetMicrochip] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [custodyArrangement, setCustodyArrangement] = useState<'with_finder' | 'institution_locker'>('with_finder');
  const [institutionName, setInstitutionName] = useState('');

  if (!isOpen) return null;

  const isSensitive = ['national_id', 'passport', 'driving_licence', 'birth_academic_cert', 'bank_card'].includes(category);
  const isPet = category === 'pet_animal';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !reporterName.trim()) {
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refNum = `KE-LF-2026-${randomSuffix}`;

    const newItem: LostFoundItem = {
      id: `item-${Date.now()}`,
      referenceNumber: refNum,
      type: reportType,
      title: title.trim(),
      category,
      description: description.trim(),
      distinguishingFeatures: distinguishingFeatures.trim(),
      hiddenIdentifyingFeature: hiddenFeature.trim() || 'Internal proof checkpoint on file',
      serialNumberMasked: serialOrIdNumber ? maskSensitiveNumber(serialOrIdNumber, 3) : undefined,
      fullIdentifierProtected: isSensitive && serialOrIdNumber ? serialOrIdNumber : undefined,
      county,
      town: town.trim() || county,
      area: area.trim() || `${town}, ${county}`,
      coordinates: { lat: -1.286389, lng: 36.817223 }, // approximate
      dateOccurred: new Date(dateOccurred).toISOString(),
      dateReported: new Date().toISOString(),
      status: 'reported',
      images: imageUrl ? [imageUrl] : [],
      contactPreference: 'kenyaone_chat',
      reporterName: reporterName.trim(),
      reporterPhoneMasked: reporterPhone ? maskSensitiveNumber(reporterPhone, 3) : '+254 7** *** ***',
      isSensitiveDocument: isSensitive,
      custodyStatus: reportType === 'found' ? custodyArrangement : undefined,
      institutionDetails: institutionName ? {
        name: institutionName,
        branch: `${town} Office`,
        officerName: reporterName,
        lockerBin: `BIN-${Math.floor(10 + Math.random() * 90)}`
      } : undefined,
      petDetails: isPet ? {
        breed: petBreed || 'Domestic',
        color: distinguishingFeatures || 'Standard',
        microchipMasked: petMicrochip ? maskSensitiveNumber(petMicrochip, 3) : undefined
      } : undefined
    };

    onSubmit(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-800 ${
          reportType === 'lost' ? 'bg-rose-950/40' : 'bg-sky-950/40'
        }`}>
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              reportType === 'lost'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
            }`}>
              {reportType === 'lost' ? 'Report Lost Property' : 'Report Found Property'}
            </span>
            <h2 className="text-lg font-bold text-white mt-1">
              {reportType === 'lost' ? 'What have you lost?' : 'What have you found?'}
            </h2>
            <p className="text-xs text-slate-400">
              Submit your report to KenyaOne's national matching registry.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Sensitive Document Banner */}
          {isSensitive && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Government Document Privacy Protection Active</strong>
                <span>
                  National ID and passport numbers are automatically masked in all public search results. Only verified owners during official handover will be matched.
                </span>
              </div>
            </div>
          )}

          {/* Category & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1 font-medium">Item Title *</label>
              <input
                type="text"
                placeholder="e.g. Samsung Galaxy S23 Ultra Black or National ID (Jane Doe)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Public Description *</label>
            <textarea
              rows={2}
              placeholder="Describe where it was lost/found, circumstances, general appearance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">County *</label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {KENYA_COUNTIES.filter(c => c !== 'All Counties').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Town / Sub-county *</label>
              <input
                type="text"
                placeholder="e.g. Westlands, Nyali, Milimani"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Specific Area / Landmark</label>
              <input
                type="text"
                placeholder="e.g. Super Metro stage, Sarit Mall"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Date & Serial number / ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Date {reportType === 'lost' ? 'Lost' : 'Found'} *</label>
              <input
                type="date"
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isSensitive ? 'Document ID Number (Encrypted/Masked)' : 'Serial Number / IMEI (Masked)'}
              </label>
              <input
                type="text"
                placeholder={isSensitive ? 'e.g. 38491023 (Masked as ******23)' : 'e.g. IMEI ending in 4920'}
                value={serialOrIdNumber}
                onChange={(e) => setSerialOrIdNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Distinguishing features vs Hidden identifying feature (PRIVATE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Visible Distinguishing Features</label>
              <input
                type="text"
                placeholder="e.g. Red case, scratch on screen, Kenya sticker"
                value={distinguishingFeatures}
                onChange={(e) => setDistinguishingFeatures(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-emerald-400 mb-1 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Secret Identifying Feature (Kept Private) *
              </label>
              <input
                type="text"
                placeholder="e.g. Lockscreen wallpaper photo, secret mark, engraving"
                value={hiddenFeature}
                onChange={(e) => setHiddenFeature(e.target.value)}
                required
                className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Never shown publicly. Only genuine owners can verify this during handover.
              </p>
            </div>
          </div>

          {/* Pet Specific Details */}
          {isPet && (
            <div className="p-3 bg-pink-950/30 border border-pink-500/30 rounded-xl space-y-2">
              <span className="text-pink-300 font-semibold flex items-center gap-1.5">
                <Dog className="w-4 h-4" /> Pet Identification
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Breed (e.g. Golden Retriever)"
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Microchip / Collar tag (Optional)"
                  value={petMicrochip}
                  onChange={(e) => setPetMicrochip(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Custody arrangement for Found Items */}
          {reportType === 'found' && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-slate-300 font-medium">Current Custody Status</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="custody"
                    checked={custodyArrangement === 'with_finder'}
                    onChange={() => setCustodyArrangement('with_finder')}
                  />
                  <span>Safe in my custody</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="custody"
                    checked={custodyArrangement === 'institution_locker'}
                    onChange={() => setCustodyArrangement('institution_locker')}
                  />
                  <span>Handed to SACCO / Mall Security</span>
                </label>
              </div>

              {custodyArrangement === 'institution_locker' && (
                <input
                  type="text"
                  placeholder="Name of SACCO, Mall, or Station (e.g. Super Metro Odeon Desk)"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 mt-2"
                />
              )}
            </div>
          )}

          {/* Reporter Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800 pt-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Your Name *</label>
              <input
                type="text"
                placeholder="e.g. John Kamau"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Phone Number (Protected)</label>
              <input
                type="text"
                placeholder="e.g. +254 712 345 678"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Image URL (Optional) */}
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Item Photo URL (Optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or paste image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                reportType === 'lost'
                  ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit {reportType === 'lost' ? 'Lost' : 'Found'} Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
