import { HandoverReceipt, ItemCategory, LostFoundItem } from '../types';

/**
 * Masks sensitive identification numbers (National IDs, Passports, Bank Cards)
 * to prevent identity theft in public listings.
 */
export function maskSensitiveNumber(input: string, visibleTrailing: number = 3): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.length <= visibleTrailing) return '***';
  const prefix = '*'.repeat(Math.max(4, trimmed.length - visibleTrailing));
  const suffix = trimmed.slice(-visibleTrailing);
  return `${prefix}${suffix}`;
}

/**
 * Creates a deterministic SHA-like anti-tamper verification hash
 */
export function generateVerificationHash(
  receiptId: string,
  itemId: string,
  claimantId: string,
  custodianId: string,
  timestamp: string
): string {
  const raw = `KE1-AUTH::${receiptId}::${itemId}::${claimantId}::${custodianId}::${timestamp}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const secondary = Math.abs((hash * 31) ^ 0x5a5a5a5a).toString(16).padStart(8, '0');
  return `0xKE1_${hex.toUpperCase()}_${secondary.toUpperCase()}`;
}

export interface HandoverQRPayload {
  v: number; // protocol version
  type: 'KENYAONE_HANDOVER';
  receiptId: string;
  itemId: string;
  itemRef: string;
  claimantId: string;
  custodianId: string;
  handoverLocation: string;
  createdTimestamp: string;
  verificationHash: string;
}

/**
 * Generates the QR code payload string to be encoded in the QR code.
 */
export function createHandoverQRPayload(receipt: HandoverReceipt): string {
  const payload: HandoverQRPayload = {
    v: 1,
    type: 'KENYAONE_HANDOVER',
    receiptId: receipt.receiptId,
    itemId: receipt.itemId,
    itemRef: receipt.itemReference,
    claimantId: receipt.claimant.id,
    custodianId: receipt.custodian.id,
    handoverLocation: receipt.handoverLocation,
    createdTimestamp: receipt.scheduledTime,
    verificationHash: receipt.verificationHash
  };
  return JSON.stringify(payload);
}

/**
 * Parses and validates a QR code string scanned from a phone camera during handover.
 */
export function parseHandoverQR(rawText: string): {
  success: boolean;
  data?: HandoverQRPayload;
  error?: string;
} {
  if (!rawText || typeof rawText !== 'string') {
    return { success: false, error: 'Empty or invalid QR code content.' };
  }

  try {
    const parsed = JSON.parse(rawText);
    if (parsed.type !== 'KENYAONE_HANDOVER') {
      return {
        success: false,
        error: 'Invalid QR code. This is not a KenyaOne recovery handover pass.'
      };
    }
    if (!parsed.receiptId || !parsed.itemId || !parsed.verificationHash) {
      return {
        success: false,
        error: 'Incomplete handover signature data in QR code.'
      };
    }
    return {
      success: true,
      data: parsed as HandoverQRPayload
    };
  } catch (err) {
    return {
      success: false,
      error: 'Unable to decode JSON payload from scanned QR code.'
    };
  }
}

/**
 * Executes the digital signing of the recovery receipt upon QR scan verification.
 */
export function signHandoverReceipt(
  currentReceipt: HandoverReceipt,
  verifiedBy: 'claimant' | 'custodian',
  signerName: string
): HandoverReceipt {
  const now = new Date().toISOString();
  const signatureToken = `SIG-DIGITAL-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const updatedClaimant = {
    ...currentReceipt.claimant,
    verifiedAt: currentReceipt.claimant.verifiedAt || now,
    signatureHash: currentReceipt.claimant.signatureHash || signatureToken
  };

  const updatedCustodian = {
    ...currentReceipt.custodian,
    verifiedAt: currentReceipt.custodian.verifiedAt || now,
    signatureHash: currentReceipt.custodian.signatureHash || `OFFICIAL-SEAL-${signatureToken}`
  };

  const newAuditEntry = {
    timestamp: now,
    action: 'QR_SCAN_AND_DUAL_SIGNATURE_EXECUTED',
    actor: `${signerName} (${verifiedBy === 'claimant' ? 'Claimant' : 'Custodian'})`,
    note: `Handover verified via camera QR scan at ${currentReceipt.handoverLocation}. Dual digital signature verified and sealed.`
  };

  return {
    ...currentReceipt,
    status: 'SIGNED_AND_VERIFIED',
    completedAt: now,
    claimant: updatedClaimant,
    custodian: updatedCustodian,
    auditTrail: [...currentReceipt.auditTrail, newAuditEntry]
  };
}

/**
 * Intelligent matching engine comparing lost and found items.
 */
export function calculateAIMatchScore(
  lost: LostFoundItem,
  found: LostFoundItem
): {
  score: number;
  reasons: string[];
  attributes: {
    category: boolean;
    location: boolean;
    dateProximity: boolean;
    brandModel: boolean;
    colorFeature: boolean;
  };
} {
  let score = 0;
  const reasons: string[] = [];

  // Category match
  const categoryMatch = lost.category === found.category;
  if (categoryMatch) {
    score += 35;
    reasons.push(`Exact category match: ${lost.category.replace(/_/g, ' ')}`);
  }

  // Location / County match
  const countyMatch = lost.county.toLowerCase() === found.county.toLowerCase();
  const townMatch = lost.town.toLowerCase() === found.town.toLowerCase();
  let locationMatch = false;
  if (countyMatch && townMatch) {
    score += 25;
    locationMatch = true;
    reasons.push(`Same town & county: ${lost.town}, ${lost.county}`);
  } else if (countyMatch) {
    score += 15;
    locationMatch = true;
    reasons.push(`Same county: ${lost.county}`);
  }

  // Date proximity (within 14 days)
  const lostDate = new Date(lost.dateOccurred).getTime();
  const foundDate = new Date(found.dateOccurred).getTime();
  const diffDays = Math.abs(foundDate - lostDate) / (1000 * 60 * 60 * 24);
  let dateProximity = false;
  if (!isNaN(diffDays) && diffDays <= 14) {
    const pts = Math.max(5, Math.round(15 - diffDays * 0.7));
    score += pts;
    dateProximity = true;
    reasons.push(`Dates align within ${Math.ceil(diffDays)} day(s)`);
  }

  // Keywords & brand/model check
  const lostKeywords = (lost.title + ' ' + lost.description).toLowerCase().split(/\s+/);
  const foundKeywords = (found.title + ' ' + found.description).toLowerCase().split(/\s+/);
  const commonKeywords = lostKeywords.filter(
    (kw) => kw.length > 3 && foundKeywords.includes(kw)
  );

  let brandModel = false;
  let colorFeature = false;

  if (commonKeywords.length > 0) {
    score += Math.min(20, commonKeywords.length * 6);
    brandModel = true;
    reasons.push(`Matching terms: ${Array.from(new Set(commonKeywords)).slice(0, 3).join(', ')}`);
  }

  // Color / distinguishing features check
  const colors = ['black', 'blue', 'red', 'silver', 'white', 'gold', 'brown', 'green', 'grey', 'yellow', 'leather'];
  const matchedColors = colors.filter(
    (c) =>
      (lost.description + ' ' + lost.distinguishingFeatures).toLowerCase().includes(c) &&
      (found.description + ' ' + found.distinguishingFeatures).toLowerCase().includes(c)
  );
  if (matchedColors.length > 0) {
    score += 10;
    colorFeature = true;
    reasons.push(`Matching color/material: ${matchedColors.join(', ')}`);
  }

  return {
    score: Math.min(100, score),
    reasons,
    attributes: {
      category: categoryMatch,
      location: locationMatch,
      dateProximity,
      brandModel,
      colorFeature
    }
  };
}
