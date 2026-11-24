import test from 'node:test';
import assert from 'node:assert/strict';
import {
  maskSensitiveNumber,
  generateVerificationHash,
  createHandoverQRPayload,
  parseHandoverQR,
  signHandoverReceipt,
  calculateAIMatchScore
} from './handoverLogic';
import { HandoverReceipt, LostFoundItem } from '../types';

test('maskSensitiveNumber obscures sensitive documents', () => {
  assert.equal(maskSensitiveNumber('38491023', 2), '******23');
  assert.equal(maskSensitiveNumber('A1298453', 3), '*****453');
  assert.equal(maskSensitiveNumber('12', 3), '***');
});

test('generateVerificationHash produces deterministic anti-tamper hash', () => {
  const hash1 = generateVerificationHash('REC-1', 'ITEM-1', 'C-1', 'K-1', '2026-11-09T10:00:00Z');
  const hash2 = generateVerificationHash('REC-1', 'ITEM-1', 'C-1', 'K-1', '2026-11-09T10:00:00Z');
  assert.equal(hash1, hash2);
  assert.ok(hash1.startsWith('0xKE1_'));
});

test('createHandoverQRPayload and parseHandoverQR round-trip correctly', () => {
  const mockReceipt: HandoverReceipt = {
    receiptId: 'REC-2026-NBI-1001',
    itemId: 'ITEM-88',
    itemReference: 'KE-LF-88',
    itemTitle: 'iPhone 15 Pro Titanium Blue',
    itemCategory: 'phone_electronics',
    handoverLocation: 'Super Metro Office, Odeon Cinema, Tom Mboya St',
    handoverCounty: 'Nairobi',
    scheduledTime: '2026-11-09T14:30:00Z',
    status: 'PENDING_SCAN',
    claimant: {
      id: 'usr_c_1',
      name: 'Wanjiku Mwangi',
      phoneMasked: '+254 7** *** 419',
      nationalIdMasked: '******72'
    },
    custodian: {
      id: 'usr_k_1',
      name: 'Samuel Kiprop',
      role: 'Fleet Security & Lost Property Officer',
      organization: 'Super Metro Transport SACCO',
      phoneMasked: '+254 7** *** 800'
    },
    qrPayloadString: '',
    verificationHash: '0xKE1_TEST_HASH',
    auditTrail: []
  };

  const payloadString = createHandoverQRPayload(mockReceipt);
  const parseResult = parseHandoverQR(payloadString);

  assert.equal(parseResult.success, true);
  assert.ok(parseResult.data);
  assert.equal(parseResult.data?.receiptId, 'REC-2026-NBI-1001');
  assert.equal(parseResult.data?.itemRef, 'KE-LF-88');
  assert.equal(parseResult.data?.type, 'KENYAONE_HANDOVER');
});

test('parseHandoverQR rejects non-KenyaOne QR code', () => {
  const randomQR = JSON.stringify({ url: 'https://example.com', product: 'random' });
  const result = parseHandoverQR(randomQR);
  assert.equal(result.success, false);
  assert.ok(result.error?.includes('not a KenyaOne recovery handover pass'));
});

test('signHandoverReceipt transitions receipt status to SIGNED_AND_VERIFIED with dual signatures', () => {
  const mockReceipt: HandoverReceipt = {
    receiptId: 'REC-2026-NBI-1001',
    itemId: 'ITEM-88',
    itemReference: 'KE-LF-88',
    itemTitle: 'iPhone 15 Pro Titanium Blue',
    itemCategory: 'phone_electronics',
    handoverLocation: 'Super Metro Office, Odeon Cinema',
    handoverCounty: 'Nairobi',
    scheduledTime: '2026-11-09T14:30:00Z',
    status: 'PENDING_SCAN',
    claimant: {
      id: 'usr_c_1',
      name: 'Wanjiku Mwangi',
      phoneMasked: '+254 7** *** 419',
      nationalIdMasked: '******72'
    },
    custodian: {
      id: 'usr_k_1',
      name: 'Samuel Kiprop',
      role: 'Officer',
      organization: 'Super Metro SACCO',
      phoneMasked: '+254 7** *** 800'
    },
    qrPayloadString: '',
    verificationHash: '0xKE1_TEST_HASH',
    auditTrail: []
  };

  const signed = signHandoverReceipt(mockReceipt, 'claimant', 'Wanjiku Mwangi');
  assert.equal(signed.status, 'SIGNED_AND_VERIFIED');
  assert.ok(signed.claimant.signatureHash);
  assert.ok(signed.custodian.signatureHash);
  assert.ok(signed.completedAt);
  assert.equal(signed.auditTrail.length, 1);
  assert.equal(signed.auditTrail[0].action, 'QR_SCAN_AND_DUAL_SIGNATURE_EXECUTED');
});

test('calculateAIMatchScore correctly calculates high match for same category and county', () => {
  const lostItem: LostFoundItem = {
    id: 'L1',
    referenceNumber: 'KE-LF-L1',
    type: 'lost',
    title: 'Black HP EliteBook Laptop 14-inch',
    category: 'laptop_computer',
    description: 'Black HP EliteBook with silver hinge and scratch on top left lid',
    distinguishingFeatures: 'Scratch on top left lid, Kenyan flag sticker on bottom',
    hiddenIdentifyingFeature: 'Asset Tag KE-FIN-9921 on bottom vent',
    county: 'Nairobi',
    town: 'Westlands',
    area: 'Sarit Centre Food Court',
    coordinates: { lat: -1.2618, lng: 36.8041 },
    dateOccurred: '2026-11-06T12:00:00Z',
    dateReported: '2026-11-06T15:00:00Z',
    status: 'reported',
    images: [],
    contactPreference: 'kenyaone_chat',
    reporterName: 'John Kamau',
    reporterPhoneMasked: '+254 7** *** 102',
    isSensitiveDocument: false
  };

  const foundItem: LostFoundItem = {
    id: 'F1',
    referenceNumber: 'KE-LF-F1',
    type: 'found',
    title: 'HP EliteBook Laptop with Kenyan sticker',
    category: 'laptop_computer',
    description: 'Black HP laptop recovered at Sarit Centre. Has small scratch and Kenya sticker',
    distinguishingFeatures: 'Sticker and scratch',
    hiddenIdentifyingFeature: 'Asset tag on bottom',
    county: 'Nairobi',
    town: 'Westlands',
    area: 'Sarit Centre Security Desk',
    coordinates: { lat: -1.2618, lng: 36.8041 },
    dateOccurred: '2026-11-06T16:00:00Z',
    dateReported: '2026-11-06T17:00:00Z',
    status: 'reported',
    images: [],
    contactPreference: 'safeguarded_custodian',
    reporterName: 'Sarit Security Desk',
    reporterPhoneMasked: '+254 20 *** ***',
    isSensitiveDocument: false
  };

  const match = calculateAIMatchScore(lostItem, foundItem);
  assert.ok(match.score >= 80, `Expected match score >= 80, got ${match.score}`);
  assert.equal(match.attributes.category, true);
  assert.equal(match.attributes.location, true);
});
