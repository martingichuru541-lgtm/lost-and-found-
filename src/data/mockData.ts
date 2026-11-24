import { HandoverReceipt, LostFoundItem, AIMatchResult } from '../types';
import { generateVerificationHash, createHandoverQRPayload } from '../utils/handoverLogic';

export const INITIAL_ITEMS: LostFoundItem[] = [
  {
    id: 'item-1',
    referenceNumber: 'KE-LF-2026-8912',
    type: 'found',
    title: 'iPhone 15 Pro Max (Titanium Blue, 256GB)',
    category: 'phone_electronics',
    description: 'Found on seat 4B of Super Metro matatu (KDA 482B) heading from CBD to Westlands. Battery is 68%, lock screen shows family photo on safari.',
    distinguishingFeatures: 'Matte translucent bumper case, micro-scratch near camera ring, Safaricom eSIM detected.',
    hiddenIdentifyingFeature: 'Lockscreen pin begins with 8, lockscreen wallpaper has Lake Nakuru flamingos, IMEI ending in 4920.',
    serialNumberMasked: '****4920',
    county: 'Nairobi',
    town: 'Westlands',
    area: 'Super Metro Westlands Terminal / Two Rivers Mall Custody',
    coordinates: { lat: -1.2644, lng: 36.8045 },
    dateOccurred: '2026-11-08T09:15:00Z',
    dateReported: '2026-11-08T10:30:00Z',
    status: 'verified_handover_ready',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80'
    ],
    contactPreference: 'safeguarded_custodian',
    reporterName: 'Super Metro Lost Property Desk',
    reporterPhoneMasked: '+254 7** *** 890',
    isSensitiveDocument: false,
    custodyStatus: 'institution_locker',
    institutionDetails: {
      name: 'Super Metro Transport SACCO',
      branch: 'Two Rivers Mall Customer Desk',
      officerName: 'Grace Nduta (Custody Officer)',
      lockerBin: 'LOCKER-B14'
    }
  },
  {
    id: 'item-2',
    referenceNumber: 'KE-LF-2026-7741',
    type: 'lost',
    title: 'iPhone 15 Pro Max Titanium Blue',
    category: 'phone_electronics',
    description: 'Left inside a morning matatu from Kencom to Westlands around 9:00 AM. Contains critical business data and photos.',
    distinguishingFeatures: 'Clear case with blue edges, tiny scratch near upper camera lens.',
    hiddenIdentifyingFeature: 'Wallpaper is Lake Nakuru flamingos taken December last year. Lockscreen PIN begins with 8.',
    serialNumberMasked: '****4920',
    county: 'Nairobi',
    town: 'Westlands',
    area: 'Matatu route Kencom - Westlands',
    coordinates: { lat: -1.2670, lng: 36.8110 },
    dateOccurred: '2026-11-08T09:10:00Z',
    dateReported: '2026-11-08T11:00:00Z',
    status: 'verified_handover_ready',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80'
    ],
    contactPreference: 'kenyaone_chat',
    reporterName: 'Brian Otieno',
    reporterPhoneMasked: '+254 7** *** 314',
    isSensitiveDocument: false,
    matchedItemId: 'item-1',
    matchScore: 97
  },
  {
    id: 'item-3',
    referenceNumber: 'KE-LF-2026-6632',
    type: 'found',
    title: 'Republic of Kenya National ID Card',
    category: 'national_id',
    description: 'National Identity Card found near Kenya National Archives, Moi Avenue. In clear plastic casing.',
    distinguishingFeatures: 'Holder born in Nyeri County, issued 2019.',
    hiddenIdentifyingFeature: 'Full National ID number 34891024, District of Birth Mukurweini.',
    fullIdentifierProtected: '34891024',
    county: 'Nairobi',
    town: 'Nairobi CBD',
    area: 'Moi Avenue near Archives',
    coordinates: { lat: -1.2841, lng: 36.8258 },
    dateOccurred: '2026-11-07T14:20:00Z',
    dateReported: '2026-11-07T15:00:00Z',
    status: 'matched',
    images: [],
    contactPreference: 'safeguarded_custodian',
    reporterName: 'Central Police Post Helpdesk',
    reporterPhoneMasked: '+254 20 *** ***',
    isSensitiveDocument: true,
    custodyStatus: 'police_station',
    institutionDetails: {
      name: 'Kenya Police Service - Central Station',
      branch: 'Moi Avenue Sub-post',
      officerName: 'Cpl. Kiprotich',
      lockerBin: 'DOC-VAULT-04'
    }
  },
  {
    id: 'item-4',
    referenceNumber: 'KE-LF-2026-6601',
    type: 'lost',
    title: 'National Identity Card (Wanjiku Mwangi)',
    category: 'national_id',
    description: 'Lost wallet containing National ID card when boarding a matatu at Tom Mboya Street.',
    distinguishingFeatures: 'Plastic card sleeve with slight crack on lower edge.',
    hiddenIdentifyingFeature: 'National ID number 34891024, Mukurweini origin.',
    fullIdentifierProtected: '34891024',
    county: 'Nairobi',
    town: 'Nairobi CBD',
    area: 'Tom Mboya Street / Archives',
    coordinates: { lat: -1.2845, lng: 36.8265 },
    dateOccurred: '2026-11-07T13:45:00Z',
    dateReported: '2026-11-07T16:15:00Z',
    status: 'matched',
    images: [],
    contactPreference: 'kenyaone_chat',
    reporterName: 'Wanjiku Mwangi',
    reporterPhoneMasked: '+254 7** *** 419',
    isSensitiveDocument: true,
    matchedItemId: 'item-3',
    matchScore: 94
  },
  {
    id: 'item-5',
    referenceNumber: 'KE-LF-2026-5519',
    type: 'lost',
    title: 'Golden Retriever Dog ("Simba")',
    category: 'pet_animal',
    description: 'Friendly golden retriever named Simba slipped through gate near Karen Country Club. Very gentle, answers to his name with a wagging tail.',
    distinguishingFeatures: 'Red nylon collar with small bell, microchipped.',
    hiddenIdentifyingFeature: 'Microchip number ending in 9821, small white patch under right front paw.',
    county: 'Nairobi',
    town: 'Karen',
    area: 'Karen Road near Country Club',
    coordinates: { lat: -1.3197, lng: 36.7065 },
    dateOccurred: '2026-11-07T18:00:00Z',
    dateReported: '2026-11-07T19:30:00Z',
    status: 'reported',
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80'
    ],
    contactPreference: 'kenyaone_chat',
    reporterName: 'Faith Muthoni',
    reporterPhoneMasked: '+254 7** *** 992',
    isSensitiveDocument: false,
    petDetails: {
      breed: 'Golden Retriever',
      color: 'Honey Golden',
      collarDescription: 'Red nylon collar with brass bell',
      microchipMasked: '****9821'
    }
  },
  {
    id: 'item-6',
    referenceNumber: 'KE-LF-2026-4402',
    type: 'found',
    title: 'HP EliteBook 840 G8 Laptop',
    category: 'laptop_computer',
    description: 'Found at Sarit Centre Food Court on table 12. Kept safely in management security locker.',
    distinguishingFeatures: 'Kenyan flag sticker on lid, slight dent on USB-C port.',
    hiddenIdentifyingFeature: 'Asset tag KE-FIN-9921 on ventilation grille.',
    serialNumberMasked: '****9921',
    county: 'Nairobi',
    town: 'Westlands',
    area: 'Sarit Centre Food Court',
    coordinates: { lat: -1.2618, lng: 36.8041 },
    dateOccurred: '2026-11-06T19:40:00Z',
    dateReported: '2026-11-06T20:10:00Z',
    status: 'claim_pending',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'
    ],
    contactPreference: 'safeguarded_custodian',
    reporterName: 'Sarit Centre Security Desk',
    reporterPhoneMasked: '+254 20 *** ***',
    isSensitiveDocument: false,
    custodyStatus: 'institution_locker',
    institutionDetails: {
      name: 'Sarit Centre Management',
      branch: 'Westlands Mall',
      officerName: 'Capt. Evans Omondi',
      lockerBin: 'SEC-L4'
    }
  },
  {
    id: 'item-7',
    referenceNumber: 'KE-LF-2026-3310',
    type: 'found',
    title: 'East African Passport (Republic of Kenya)',
    category: 'passport',
    description: 'Recovered at Jomo Kenyatta International Airport (JKIA) Terminal 1A departure lounge seating area.',
    distinguishingFeatures: 'Dark blue biometric 48-page passport.',
    hiddenIdentifyingFeature: 'Surname OCHIENG, passport number ending in 19.',
    fullIdentifierProtected: 'AK091819',
    county: 'Nairobi',
    town: 'Embakasi',
    area: 'JKIA Terminal 1A Gate 7',
    coordinates: { lat: -1.3192, lng: 36.9275 },
    dateOccurred: '2026-11-05T08:00:00Z',
    dateReported: '2026-11-05T08:30:00Z',
    status: 'reported',
    images: [],
    contactPreference: 'safeguarded_custodian',
    reporterName: 'KAA Lost Property Unit',
    reporterPhoneMasked: '+254 20 *** ***',
    isSensitiveDocument: true,
    custodyStatus: 'institution_locker',
    institutionDetails: {
      name: 'Kenya Airports Authority (KAA)',
      branch: 'JKIA Terminal 1A Custody',
      officerName: 'Sgt. Mary Wangari',
      lockerBin: 'VAULT-PASSPORTS-T1'
    }
  },
  {
    id: 'item-8',
    referenceNumber: 'KE-LF-2026-2209',
    type: 'found',
    title: 'Toyota Smart Car Key & Alarm Fob',
    category: 'keys',
    description: 'Found on walkway outside Westgate Mall near car park entrance 2.',
    distinguishingFeatures: 'Black leather braided keychain with brass ring and Toyota logo.',
    hiddenIdentifyingFeature: 'Emergency physical key blade inside fob has stamp "T-78".',
    county: 'Nairobi',
    town: 'Westlands',
    area: 'Westgate Mall Car Park',
    coordinates: { lat: -1.2588, lng: 36.8028 },
    dateOccurred: '2026-11-08T15:30:00Z',
    dateReported: '2026-11-08T16:00:00Z',
    status: 'reported',
    images: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80'
    ],
    contactPreference: 'kenyaone_chat',
    reporterName: 'Geoffrey Kibet',
    reporterPhoneMasked: '+254 7** *** 654',
    isSensitiveDocument: false,
    custodyStatus: 'with_finder'
  }
];

// Pre-create the ready-for-handover receipt
const RECEIPT_1_SCHEDULED = '2026-11-09T16:00:00Z';
const RECEIPT_1_HASH = generateVerificationHash(
  'REC-2026-NBI-4491',
  'item-1',
  'usr_claimant_brian',
  'usr_custodian_grace',
  RECEIPT_1_SCHEDULED
);

export const INITIAL_RECEIPTS: HandoverReceipt[] = [
  {
    receiptId: 'REC-2026-NBI-4491',
    itemId: 'item-1',
    itemReference: 'KE-LF-2026-8912',
    itemTitle: 'iPhone 15 Pro Max (Titanium Blue, 256GB)',
    itemCategory: 'phone_electronics',
    handoverLocation: 'Two Rivers Mall Customer Service & Security Desk, Limuru Rd, Nairobi',
    handoverCounty: 'Nairobi',
    scheduledTime: RECEIPT_1_SCHEDULED,
    status: 'PENDING_SCAN',
    claimant: {
      id: 'usr_claimant_brian',
      name: 'Brian Otieno',
      phoneMasked: '+254 712 *** 314',
      nationalIdMasked: '******89'
    },
    custodian: {
      id: 'usr_custodian_grace',
      name: 'Grace Nduta',
      role: 'Head of Lost Property & Customer Custody',
      organization: 'Two Rivers Mall & Super Metro SACCO Security',
      phoneMasked: '+254 722 *** 890'
    },
    qrPayloadString: '',
    verificationHash: RECEIPT_1_HASH,
    collectionNotes: 'Claimant provided verified purchase receipt from Apple Authorized Reseller (Salama Tech Nairobi) and correctly matched secret lockscreen wallpaper.',
    auditTrail: [
      {
        timestamp: '2026-11-08T11:45:00Z',
        action: 'CLAIM_SUBMITTED',
        actor: 'Brian Otieno (Claimant)',
        note: 'Submitted ownership claim with purchase invoice #ST-8912 and proof of IMEI.'
      },
      {
        timestamp: '2026-11-08T14:10:00Z',
        action: 'OWNERSHIP_VERIFIED',
        actor: 'Grace Nduta (Custodian Officer)',
        note: 'Verified purchase receipt against device IMEI. Authorized handover pass.'
      },
      {
        timestamp: '2026-11-08T14:15:00Z',
        action: 'HANDOVER_PASS_GENERATED',
        actor: 'KenyaOne Custody Engine',
        note: `Handover Pass REC-2026-NBI-4491 issued. QR verification cryptographic token generated.`
      }
    ]
  },
  {
    receiptId: 'REC-2026-MBS-2210',
    itemId: 'item-mbs-prev',
    itemReference: 'KE-LF-2026-1090',
    itemTitle: 'Brown Leather Handbag & Diploma Certificate',
    itemCategory: 'wallet_handbag',
    handoverLocation: 'Nyali Cinemax Management Office, Links Rd, Mombasa',
    handoverCounty: 'Mombasa',
    scheduledTime: '2026-11-06T11:00:00Z',
    status: 'SIGNED_AND_VERIFIED',
    completedAt: '2026-11-06T11:18:22Z',
    claimant: {
      id: 'usr_claimant_amina',
      name: 'Amina Hassan',
      phoneMasked: '+254 733 *** 129',
      nationalIdMasked: '******44',
      verifiedAt: '2026-11-06T11:18:22Z',
      signatureHash: 'SIG-DIGITAL-AMINA-88B19F'
    },
    custodian: {
      id: 'usr_custodian_khamis',
      name: 'Khamis Bakari',
      role: 'Operations Supervisor',
      organization: 'Nyali Cinemax & Commercial Centre',
      phoneMasked: '+254 720 *** 911',
      verifiedAt: '2026-11-06T11:18:22Z',
      signatureHash: 'OFFICIAL-SEAL-NYALICINEMAX-SEC-992'
    },
    qrPayloadString: '',
    verificationHash: '0xKE1_A90B12F_8829C11',
    collectionNotes: 'Successfully returned in presence of security supervisor. Physical identification checked and recorded.',
    auditTrail: [
      {
        timestamp: '2026-11-06T09:30:00Z',
        action: 'HANDOVER_PASS_GENERATED',
        actor: 'KenyaOne Custody Engine',
        note: 'Handover Pass generated.'
      },
      {
        timestamp: '2026-11-06T11:18:22Z',
        action: 'QR_SCAN_AND_DUAL_SIGNATURE_EXECUTED',
        actor: 'Amina Hassan (Claimant)',
        note: 'Scanned QR pass from phone camera. Both parties signed digitally.'
      }
    ]
  }
];

// Initialize QR payload strings
INITIAL_RECEIPTS.forEach((receipt) => {
  receipt.qrPayloadString = createHandoverQRPayload(receipt);
});

export const KENYA_COUNTIES = [
  'All Counties',
  'Nairobi',
  'Mombasa',
  'Kiambu',
  'Nakuru',
  'Kisumu',
  'Uasin Gishu',
  'Machakos',
  'Kilifi',
  'Kajiado',
  'Meru',
  'Nyeri',
  'Kericho',
  'Kakamega'
];

export const CATEGORY_LABELS: Record<string, { label: string; icon: string; badgeColor: string }> = {
  national_id: { label: 'National ID Card', icon: 'CreditCard', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  passport: { label: 'Passport', icon: 'BookOpen', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  driving_licence: { label: 'Driving Licence', icon: 'Car', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  birth_academic_cert: { label: 'Birth & Academic Cert', icon: 'GraduationCap', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  bank_card: { label: 'Bank Card', icon: 'CreditCard', badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  phone_electronics: { label: 'Phones & Electronics', icon: 'Smartphone', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  laptop_computer: { label: 'Laptops & Computers', icon: 'Laptop', badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  wallet_handbag: { label: 'Wallets & Handbags', icon: 'Briefcase', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  keys: { label: 'Keys & Fobs', icon: 'Key', badgeColor: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
  jewellery_watch: { label: 'Jewellery & Watches', icon: 'Watch', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  clothing_belongings: { label: 'Clothing & Personal', icon: 'Shirt', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  bags_luggage: { label: 'Bags & Luggage', icon: 'Luggage', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  vehicle_documents: { label: 'Vehicles & Logbooks', icon: 'Truck', badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30' },
  pet_animal: { label: 'Missing & Found Pets', icon: 'Dog', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  business_equipment: { label: 'Business Equipment', icon: 'Cpu', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  other: { label: 'Other Property', icon: 'Package', badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
};
