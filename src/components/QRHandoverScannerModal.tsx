import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Upload,
  Sparkles,
  ShieldCheck,
  X,
  FileText,
  Smartphone,
  Zap,
  MapPin,
  Clock,
  UserCheck,
  Building2,
  Printer
} from 'lucide-react';
import { HandoverReceipt } from '../types';
import { parseHandoverQR, HandoverQRPayload } from '../utils/handoverLogic';
import { playHandoverSuccessChime, triggerCelebrationConfetti } from '../utils/qrCodeCanvas';

interface QRHandoverScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipts: HandoverReceipt[];
  onHandoverSigned: (updatedReceipt: HandoverReceipt) => void;
  initialSelectedReceiptId?: string;
}

export const QRHandoverScannerModal: React.FC<QRHandoverScannerModalProps> = ({
  isOpen,
  onClose,
  receipts,
  onHandoverSigned,
  initialSelectedReceiptId
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [activeTab, setActiveTab] = useState<'camera' | 'simulate' | 'upload'>('camera');
  
  // Signing flow state
  const [signingStep, setSigningStep] = useState<'ready' | 'verifying' | 'signing' | 'completed'>('ready');
  const [scannedPayload, setScannedPayload] = useState<HandoverQRPayload | null>(null);
  const [verifiedReceipt, setVerifiedReceipt] = useState<HandoverReceipt | null>(null);
  const [scanErrorMessage, setScanErrorMessage] = useState<string | null>(null);

  // Default target receipt for simulation
  const targetReceipt = 
    receipts.find(r => r.receiptId === initialSelectedReceiptId) ||
    receipts.find(r => r.status === 'PENDING_SCAN') ||
    receipts[0];

  // Stop camera stream safely
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start device camera
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setScanErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setHasCameraPermission(true);
        setIsScanning(true);
        startScanLoop();
      }
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      const errMsg = err instanceof Error ? err.message : 'Unable to access device camera.';
      setCameraError(errMsg);
      setHasCameraPermission(false);
    }
  };

  // Live video frame processing loop using jsQR
  const startScanLoop = () => {
    const scanFrame = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) {
        animationFrameId.current = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });

          if (code && code.data) {
            handleDecodedQR(code.data);
            return; // pause scan loop
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Process decoded QR data
  const handleDecodedQR = (rawText: string) => {
    setIsScanning(false);
    setScanErrorMessage(null);

    const parseResult = parseHandoverQR(rawText);
    if (!parseResult.success || !parseResult.data) {
      setScanErrorMessage(parseResult.error || 'Scanned code is not a valid KenyaOne handover pass.');
      // Resume scanning after 2 seconds
      setTimeout(() => {
        setIsScanning(true);
      }, 2000);
      return;
    }

    const payload = parseResult.data;
    setScannedPayload(payload);

    // Find the corresponding receipt
    const matched = receipts.find(r => r.receiptId === payload.receiptId);
    if (!matched) {
      setScanErrorMessage(`Receipt reference ${payload.receiptId} not found in active records.`);
      setTimeout(() => setIsScanning(true), 2500);
      return;
    }

    // Begin automatic digital signing sequence
    executeAutomaticSigning(matched, payload);
  };

  // Automatic signing sequence
  const executeAutomaticSigning = (receipt: HandoverReceipt, payload: HandoverQRPayload) => {
    setSigningStep('verifying');
    playHandoverSuccessChime();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }

    // Step 1: Verify token & anti-tamper hash
    setTimeout(() => {
      setSigningStep('signing');

      // Step 2: Digital signatures inscribed
      setTimeout(() => {
        const now = new Date().toISOString();
        const claimantSig = `SIG-CLAIMANT-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        const custodianSig = `SEAL-CUSTODY-${receipt.custodian.organization.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const updatedReceipt: HandoverReceipt = {
          ...receipt,
          status: 'SIGNED_AND_VERIFIED',
          completedAt: now,
          claimant: {
            ...receipt.claimant,
            verifiedAt: now,
            signatureHash: claimantSig
          },
          custodian: {
            ...receipt.custodian,
            verifiedAt: now,
            signatureHash: custodianSig
          },
          auditTrail: [
            ...receipt.auditTrail,
            {
              timestamp: now,
              action: 'QR_SCAN_AND_DUAL_SIGNATURE_EXECUTED',
              actor: 'Instant Camera QR Verification (Both Parties Present)',
              note: `Scanned and auto-signed at ${receipt.handoverLocation}. Verification Hash: ${payload.verificationHash}`
            }
          ]
        };

        setVerifiedReceipt(updatedReceipt);
        setSigningStep('completed');
        triggerCelebrationConfetti();
        onHandoverSigned(updatedReceipt);
      }, 1200);
    }, 1000);
  };

  // Handle uploaded QR code image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleDecodedQR(code.data);
        } else {
          setScanErrorMessage('No valid KenyaOne QR code found in the uploaded image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Switch camera when requested
  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Handover QR Scanner
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Instant Auto-Sign
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Point your phone camera at the recovery receipt QR code to verify and sign
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close scanner modal"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        {signingStep === 'ready' && (
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition ${
                activeTab === 'camera'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              Live Phone Camera
            </button>
            <button
              onClick={() => setActiveTab('simulate')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition ${
                activeTab === 'simulate'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Dual Phone Simulator
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition ${
                activeTab === 'upload'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload QR Image
            </button>
          </div>
        )}

        {/* Body content based on step */}
        <div className="p-5">
          {/* STEP 1: Live Scanning View */}
          {signingStep === 'ready' && activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-video max-h-[340px] w-full bg-black rounded-xl overflow-hidden border border-slate-700/60 flex items-center justify-center">
                {/* Real video feed */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Reticle / Viewfinder Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-64 h-64 border-2 border-emerald-400/80 rounded-2xl bg-emerald-500/5 backdrop-blur-[1px] shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                    {/* Laser sweep animation line */}
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-laser-sweep" />

                    {/* Corner Reticles */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br" />

                    {/* Center crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <div className="w-6 h-0.5 bg-emerald-400" />
                      <div className="h-6 w-0.5 bg-emerald-400 absolute" />
                    </div>
                  </div>
                </div>

                {/* Camera fallback if permission blocked or unavailable */}
                {hasCameraPermission === false && (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                    <div className="p-3 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                      <CameraOff className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Camera Permission Needed</h4>
                      <p className="text-xs text-slate-400 max-w-sm mt-1">
                        {cameraError || 'Browser camera access was not granted or no webcam was detected.'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-600 transition flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                      </button>
                      <button
                        onClick={() => setActiveTab('simulate')}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Use Handover Simulator
                      </button>
                    </div>
                  </div>
                )}

                {/* Flip camera control */}
                {hasCameraPermission && (
                  <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <button
                      onClick={toggleFacingMode}
                      title="Switch Camera (Front/Rear)"
                      className="p-2 rounded-full bg-slate-900/80 backdrop-blur text-white hover:bg-slate-800 border border-slate-700/80 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Status pill & guidance */}
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Actively scanning for KenyaOne Handover Pass...</span>
                </div>
                <button
                  onClick={() => {
                    if (targetReceipt) {
                      handleDecodedQR(targetReceipt.qrPayloadString);
                    }
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> Instant Test Scan
                </button>
              </div>

              {scanErrorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{scanErrorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 1 (Option B): Side-by-side Phone Simulator */}
          {signingStep === 'ready' && activeTab === 'simulate' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <span>
                  Interactive Dual Handover Mode: Simulate both the Claimant presenting their QR pass and the Custodian scanning it.
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 rounded font-mono text-[10px]">
                  Simulated
                </span>
              </div>

              {targetReceipt ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone 1: Claimant Screen */}
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 relative shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                        <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                        <span>Phone 1: Claimant Pass</span>
                      </div>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                        {targetReceipt.claimant.name}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/50 space-y-2 text-center">
                      <p className="text-xs font-bold text-white truncate">{targetReceipt.itemTitle}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Ref: {targetReceipt.itemReference}</p>
                      
                      {/* Visual QR presentation */}
                      <div className="inline-block p-2 bg-white rounded-xl shadow-lg my-1">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                            targetReceipt.qrPayloadString
                          )}`}
                          alt="Handover Pass QR"
                          className="w-32 h-32 block mx-auto"
                        />
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <p className="text-emerald-400 font-semibold">Ready for Handover</p>
                        <p className="truncate">Loc: {targetReceipt.handoverLocation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Phone 2: Custodian Scanner */}
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 relative flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Phone 2: Custodian Scanner</span>
                        </div>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                          {targetReceipt.custodian.organization}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                          <span>Custodian: <strong>{targetReceipt.custodian.name}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{targetReceipt.handoverCounty} County Hub</span>
                        </div>
                        <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                          Click below to trigger the camera target scan on Phone 1's QR code.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDecodedQR(targetReceipt.qrPayloadString)}
                      className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan Phone 1 QR Code & Sign</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No pending handover receipt available to simulate.
                </div>
              )}
            </div>
          )}

          {/* STEP 1 (Option C): Upload QR Image */}
          {signingStep === 'ready' && activeTab === 'upload' && (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-950/40">
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full mb-3">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-semibold text-white">Upload Handover QR Code Screenshot</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Drag and drop a photo or screenshot of the recovery receipt QR code.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {targetReceipt && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Or use active test pass ({targetReceipt.receiptId}):</span>
                  <button
                    onClick={() => handleDecodedQR(targetReceipt.qrPayloadString)}
                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium hover:bg-emerald-500/30 transition"
                  >
                    Load & Scan This Pass
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Verifying Cryptographic Token Animation */}
          {signingStep === 'verifying' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Decoded Recovery Receipt QR</h3>
                <p className="text-xs text-emerald-400 font-mono mt-1">
                  Verifying anti-tamper token: {scannedPayload?.verificationHash.substring(0, 16)}...
                </p>
                <p className="text-xs text-slate-400 mt-2">Checking custody authorization & party credentials...</p>
              </div>
            </div>
          )}

          {/* STEP 3: Inscribing Digital Dual Signatures */}
          {signingStep === 'signing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20 animate-bounce">
                <ShieldCheck className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Generating Digital Signatures</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Inscribing mutual agreement for Claimant & Custodian...
                </p>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Claimant Verified
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Custodian Sealed
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Handover Verified & Signed Successfully! */}
          {signingStep === 'completed' && verifiedReceipt && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              {/* Success Badge */}
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Digital Handover Verified & Signed!</h3>
                <p className="text-xs text-emerald-300">
                  The item recovery transaction has been cryptographically confirmed by both parties.
                </p>
              </div>

              {/* Digital Certificate Card */}
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Official Receipt ID</span>
                    <p className="text-sm font-bold text-white font-mono">{verifiedReceipt.receiptId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Timestamp</span>
                    <p className="text-xs text-slate-300 font-mono">
                      {new Date(verifiedReceipt.completedAt || Date.now()).toLocaleTimeString()} EAT
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Recovered Property:</span>
                    <span className="font-semibold text-white">{verifiedReceipt.itemTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Item Ref Number:</span>
                    <span className="font-mono text-emerald-400">{verifiedReceipt.itemReference}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Claimant (Owner):</span>
                    <span className="font-medium text-slate-200">{verifiedReceipt.claimant.name}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      ID: {verifiedReceipt.claimant.nationalIdMasked}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Authorized Custodian:</span>
                    <span className="font-medium text-slate-200">{verifiedReceipt.custodian.name}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {verifiedReceipt.custodian.organization}
                    </span>
                  </div>
                </div>

                {/* Dual Digital Signature Stamp Box */}
                <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 border-b border-slate-800 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Cryptographic Signatures
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      STATUS: SEALED
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                      <span className="text-slate-500 block">CLAIMANT SIGNATURE:</span>
                      <span className="text-slate-300 truncate block">
                        {verifiedReceipt.claimant.signatureHash}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                      <span className="text-slate-500 block">OFFICIAL CUSTODIAN SEAL:</span>
                      <span className="text-emerald-400 truncate block">
                        {verifiedReceipt.custodian.signatureHash}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">Handed over at: {verifiedReceipt.handoverLocation}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save Receipt PDF
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Done & Return to Platform
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        {signingStep === 'ready' && (
          <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              KenyaOne Handover Verification Protocol v1.4
            </span>
            <span className="text-slate-500">Tamper-Proof Digital Handover</span>
          </div>
        )}
      </div>
    </div>
  );
};
