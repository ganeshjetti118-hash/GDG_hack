import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  ScanLine, 
  UploadCloud, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  RefreshCw, 
  Leaf, 
  FlaskConical, 
  Activity,
  Image as ImageIcon
} from 'lucide-react';
import type { LeafDiagnosisResult, DiseaseSeverity } from '../types/diagnostics.js';

// Curated sample leaves for 1-click test
const SAMPLE_LEAF_PRESETS = [
  {
    name: 'Tomato Early Blight',
    crop: 'Tomato',
    badge: 'Fungal Lesion',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23927?auto=format&fit=crop&w=600&q=80',
    description: 'Target-board concentric dark spots with chlorotic halo on mature foliage.'
  },
  {
    name: 'Rice Blast (Magnaporthe)',
    crop: 'Paddy / Rice',
    badge: 'Spindle Spot',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    description: 'Elliptical necrotic lesions with gray centers threatening panicle neck.'
  },
  {
    name: 'Cotton Leaf Curl Virus',
    crop: 'Cotton',
    badge: 'Viral / Whitefly',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80',
    description: 'Upward leaf curling, thickened veins, and enations caused by whitefly vectors.'
  },
  {
    name: 'Healthy Orchard Foliage',
    crop: 'Citrus / Apple',
    badge: 'Healthy Control',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    description: 'Vibrant green chlorophyll density with zero observable pathogen damage.'
  }
];

export const CropDiagnostics: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<LeafDiagnosisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileObject(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setDiagnosisResult(null);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileObject(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setDiagnosisResult(null);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = async (preset: typeof SAMPLE_LEAF_PRESETS[0]) => {
    setSelectedImage(preset.imageUrl);
    setFileObject(null);
    setDiagnosisResult(null);
    setErrorMsg(null);
  };

  const runDiagnosis = async () => {
    if (!selectedImage) return;

    try {
      setIsScanning(true);
      setErrorMsg(null);

      let payload: any;
      if (fileObject) {
        const formData = new FormData();
        formData.append('image', fileObject);
        payload = formData;
      } else {
        payload = { imageBase64: selectedImage };
      }

      const res = await axios.post('/api/diagnose', payload, {
        headers: fileObject ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
      });

      if (res.data?.success && res.data?.data) {
        setDiagnosisResult(res.data.data);
      } else {
        throw new Error(res.data?.error || 'Diagnosis failed to parse result.');
      }
    } catch (err: any) {
      console.error('Diagnosis error:', err);
      setErrorMsg(err.response?.data?.details || err.message || 'Error communicating with Gemini Vision API.');
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityStyle = (sev: DiseaseSeverity) => {
    switch (sev) {
      case 'Critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'High': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Medium': return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30';
      default: return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Gemini Multimodal Crop Disease Diagnostics
          </h1>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
            Vision 3.5 Engine
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Upload or drag-and-drop any leaf photo to identify bacterial, fungal, or viral pathogens with organic and chemical agronomic treatments.
        </p>
      </div>

      {/* Main Interactive Scan Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Zone & Presets (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`glass-card rounded-3xl p-6 border-2 border-dashed cursor-pointer transition text-center relative overflow-hidden group ${
              selectedImage ? 'border-emerald-500/60 bg-emerald-950/10' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {selectedImage ? (
              <div className="space-y-4">
                <div className="relative aspect-video max-h-64 rounded-2xl overflow-hidden border border-slate-700 bg-black">
                  <img
                    src={selectedImage}
                    alt="Leaf specimen"
                    className="w-full h-full object-cover"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex flex-col items-center justify-center backdrop-blur-xs">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute animate-bounce" />
                      <div className="bg-slate-900/90 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/40 flex items-center space-x-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Gemini Vision Neural Scan in progress...</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400">Click or drag a new image to replace specimen</p>
              </div>
            ) : (
              <div className="py-8 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Upload Crop Leaf Photo</h3>
                  <p className="text-xs text-slate-400 mt-1">Drag & drop PNG, JPG, or WEBP (Max 15MB)</p>
                </div>
                <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold pt-2">
                  <span>Browse files from device</span>
                  <span>→</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {selectedImage && (
            <button
              onClick={runDiagnosis}
              disabled={isScanning}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Pathogen Structure...</span>
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4" />
                  <span>Run Gemini Vision Diagnostics</span>
                </>
              )}
            </button>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preset Sample Leaves Gallery */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Or Test With 1-Click Specimen Presets:</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_LEAF_PRESETS.map((preset) => (
                <div
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className="glass-card rounded-2xl p-3 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition text-left space-y-2 group"
                >
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                    <img
                      src={preset.imageUrl}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/80 text-white">
                      {preset.crop}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white line-clamp-1">{preset.name}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.badge}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Studio Card (7 Cols) */}
        <div className="lg:col-span-7">
          {diagnosisResult ? (
            <div className="glass-card rounded-3xl p-6 md:p-8 border border-emerald-500/30 space-y-6 shadow-2xl">
              {/* Header Diagnosis Title */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Crop: {diagnosisResult.cropName}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getSeverityStyle(diagnosisResult.severity)}`}>
                      Severity: {diagnosisResult.severity} ({diagnosisResult.severityScore}/100)
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {diagnosisResult.disease}
                  </h2>
                  {diagnosisResult.scientificName && (
                    <p className="text-xs text-slate-400 italic">
                      Pathogen: {diagnosisResult.scientificName}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-400">Confidence Score</div>
                  <div className="text-2xl font-black text-emerald-400">{diagnosisResult.confidence}%</div>
                </div>
              </div>

              {/* Observable Symptoms */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Observable Pathological Symptoms:</span>
                </div>
                <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  {diagnosisResult.symptoms.map((s, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two Column Treatments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organic / Bio-control Treatments */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Leaf className="w-4 h-4" />
                    <span>Organic & Bio-Control Remedies:</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {diagnosisResult.organicTreatments.map((t, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chemical / Fungicide Treatments */}
                <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30 space-y-2.5">
                  <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                    <FlaskConical className="w-4 h-4" />
                    <span>Chemical & Systemic Fungicides:</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {diagnosisResult.chemicalTreatments.map((t, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Preventive Cultural Protocols */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Preventive Cultural & Irrigation Practices:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {diagnosisResult.preventiveMeasures.map((pm, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{pm}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recovery Prognosis */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 text-xs space-y-1">
                <span className="font-bold text-emerald-400">Recovery Prognosis: </span>
                <span className="text-slate-200 leading-relaxed">{diagnosisResult.prognosis}</span>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-12 border border-slate-800 h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                <Leaf className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="font-bold text-base text-white">Diagnostic Report Awaiting Leaf Image</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload an image from your device or click any preset leaf specimen on the left to initiate the Gemini Vision deep diagnostic protocol.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
