export type ReportType = 'lost' | 'found';

export type ItemStatus = 
  | 'reported'
  | 'matched'
  | 'claim_pending'
  | 'verified_handover_ready'
  | 'recovered';

export type ItemCategory =
  | 'national_id'
  | 'passport'
  | 'driving_licence'
  | 'birth_academic_cert'
  | 'bank_card'
  | 'phone_electronics'
  | 'laptop_computer'
  | 'wallet_handbag'
  | 'keys'
  | 'jewellery_watch'
  | 'clothing_belongings'
  | 'bags_luggage'
  | 'vehicle_documents'
  | 'pet_animal'
  | 'business_equipment'
  | 'other';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LostFoundItem {
  id: string;
  referenceNumber: string; // e.g. KE-LF-2026-7821
  type: ReportType;
  title: string;
  category: ItemCategory;
  description: string;
  distinguishingFeatures: string;
  hiddenIdentifyingFeature: string; // Kept private for ownership verification
  serialNumberMasked?: string;
  fullIdentifierProtected?: string; // e.g. ID card number masked in public
  county: string;
  town: string;
  area: string;
  coordinates: Coordinates;
  dateOccurred: string;
  dateReported: string;
  status: ItemStatus;
  images: string[];
  contactPreference: 'kenyaone_chat' | 'phone_call' | 'safeguarded_custodian';
  reporterName: string;
  reporterPhoneMasked: string;
  isSensitiveDocument: boolean;
  custodyStatus?: 'with_finder' | 'institution_locker' | 'police_station' | 'sacco_office';
  institutionDetails?: {
    name: string;
    branch: string;
    officerName: string;
    lockerBin: string;
  };
  petDetails?: {
    breed: string;
    color: string;
    collarDescription?: string;
    microchipMasked?: string;
  };
  matchedItemId?: string;
  matchScore?: number;
}

export interface HandoverReceipt {
  receiptId: string; // e.g. REC-2026-NBI-9012
  itemId: string;
  itemReference: string;
  itemTitle: string;
  itemCategory: ItemCategory;
  handoverLocation: string;
  handoverCounty: string;
  scheduledTime: string;
  status: 'PENDING_SCAN' | 'SIGNING_IN_PROGRESS' | 'SIGNED_AND_VERIFIED';
  claimant: {
    id: string;
    name: string;
    phoneMasked: string;
    nationalIdMasked: string;
    verifiedAt?: string;
    signatureHash?: string;
  };
  custodian: {
    id: string;
    name: string;
    role: string;
    organization: string;
    phoneMasked: string;
    verifiedAt?: string;
    signatureHash?: string;
  };
  qrPayloadString: string;
  verificationHash: string;
  completedAt?: string;
  collectionNotes?: string;
  auditTrail: {
    timestamp: string;
    action: string;
    actor: string;
    note: string;
  }[];
}

export interface AIMatchResult {
  id: string;
  lostItem: LostFoundItem;
  foundItem: LostFoundItem;
  confidenceScore: number; // 0 - 100
  matchReasons: string[];
  matchedAttributes: {
    category: boolean;
    location: boolean;
    dateProximity: boolean;
    brandModel: boolean;
    colorFeature: boolean;
  };
  status: 'pending_review' | 'claim_initiated' | 'dismissed';
}
