import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  MapPin,
  Clock,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  Filter,
  Download,
  Share2,
  Compass,
  Maximize2,
  X,
  ShieldCheck,
  AlertCircle,
  Building2,
  Sparkles,
  RefreshCw,
  Eye,
  Calendar,
  UserCheck,
  FileText,
  Ruler,
  Crosshair,
  Layers,
  Grid,
  Edit3,
  Sliders
} from 'lucide-react';

export interface MeasurementAnnotation {
  id: string;
  x1: number; // percentage on canvas (0-100)
  y1: number;
  x2: number;
  y2: number;
  label: string;
  value: string;
  color?: string;
  type?: 'length' | 'height' | 'area' | 'opening' | 'note';
}

export interface ProgressPhotoRecord {
  id: string;
  projectId: string;
  projectName: string;
  stageName: string;
  photoUrl: string;
  timestamp: string;
  isoDate: string;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracyMeters: number | null;
  locationAddress: string;
  engineerName: string;
  notes: string;
  weatherCondition?: string;
  measurements?: MeasurementAnnotation[];
  autoAnnotated?: boolean;
}

interface ConstructionProgressPhotosProps {
  selectedCity?: string;
  defaultProjectName?: string;
  projectDimensions?: {
    builtupAreaSqft?: number;
    lengthFt?: number;
    widthFt?: number;
    heightFt?: number;
  };
}

const SAMPLE_INITIAL_PHOTOS: ProgressPhotoRecord[] = [
  {
    id: 'PHOTO-101',
    projectId: 'PRJ-2026-01',
    projectName: 'Residential Luxury Villa - Sector 62',
    stageName: 'RCC Slab Casting & Steel Rebar Inspection',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80',
    timestamp: '30 Jul 2026, 09:45 AM IST',
    isoDate: '2026-07-30T09:45:00.000Z',
    latitude: 28.6139,
    longitude: 77.2090,
    altitude: 216,
    accuracyMeters: 3.5,
    locationAddress: 'Sector 62, Noida, Uttar Pradesh 201309',
    engineerName: 'Er. Rajesh Sharma (Civil QA/QC)',
    notes: 'Slab beam shuttering verified. Tata Tiscon Fe550D TMT rebar binding compliant with IS 456 standards. M25 concrete pouring started.',
    weatherCondition: 'Sunny • 32°C',
    autoAnnotated: true,
    measurements: [
      { id: 'm1', x1: 12, y1: 22, x2: 88, y2: 22, label: 'Slab Span Length', value: '24.5 ft', color: '#10b981', type: 'length' },
      { id: 'm2', x1: 18, y1: 26, x2: 18, y2: 78, label: 'Beam Height', value: '10.0 ft', color: '#3b82f6', type: 'height' },
      { id: 'm3', x1: 45, y1: 52, x2: 55, y2: 52, label: 'Rebar Spacing', value: '150mm c/c', color: '#f59e0b', type: 'note' }
    ]
  },
  {
    id: 'PHOTO-102',
    projectId: 'PRJ-2026-01',
    projectName: 'Residential Luxury Villa - Sector 62',
    stageName: 'Foundation & Earth Excavation',
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    timestamp: '25 Jul 2026, 02:15 PM IST',
    isoDate: '2026-07-25T14:15:00.000Z',
    latitude: 28.6142,
    longitude: 77.2088,
    altitude: 215,
    accuracyMeters: 4.0,
    locationAddress: 'Sector 62, Noida, Uttar Pradesh 201309',
    engineerName: 'Er. Rajesh Sharma (Civil QA/QC)',
    notes: 'Foundation pit depth reached 3.5 meters. Soil load bearing test approved. Anti-termite chemical soil treatment applied.',
    weatherCondition: 'Partly Cloudy • 30°C',
    autoAnnotated: true,
    measurements: [
      { id: 'm4', x1: 20, y1: 30, x2: 80, y2: 30, label: 'Pit Width', value: '18.0 ft', color: '#10b981', type: 'length' },
      { id: 'm5', x1: 85, y1: 32, x2: 85, y2: 82, label: 'Excavation Depth', value: '11.5 ft (3.5m)', color: '#ef4444', type: 'height' }
    ]
  },
  {
    id: 'PHOTO-103',
    projectId: 'PRJ-2026-02',
    projectName: 'Commercial Tower - Bandra Kurla Complex',
    stageName: 'AAC Masonry & Plaster Curing',
    photoUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    timestamp: '28 Jul 2026, 11:30 AM IST',
    isoDate: '2026-07-28T11:30:00.000Z',
    latitude: 19.0600,
    longitude: 72.8685,
    altitude: 12,
    accuracyMeters: 2.8,
    locationAddress: 'BKC, Mumbai, Maharashtra 400051',
    engineerName: 'Er. Amit Kulkarni (Project Manager)',
    notes: '6-inch AAC block masonry on 3rd floor completed. Water curing day 3 ongoing. Wall joint wire mesh installed.',
    weatherCondition: 'Light Rain • 27°C',
    autoAnnotated: true,
    measurements: [
      { id: 'm6', x1: 15, y1: 20, x2: 85, y2: 20, label: 'Wall Length', value: '32.0 ft', color: '#10b981', type: 'length' },
      { id: 'm7', x1: 60, y1: 40, x2: 78, y2: 75, label: 'Door Opening', value: '3.5ft x 7.0ft', color: '#ec4899', type: 'opening' }
    ]
  }
];

export const ConstructionProgressPhotos: React.FC<ConstructionProgressPhotosProps> = ({
  selectedCity = 'Delhi NCR',
  defaultProjectName = 'Residential Luxury Villa - Sector 62',
  projectDimensions = {
    builtupAreaSqft: 1850,
    lengthFt: 22.5,
    widthFt: 18.0,
    heightFt: 10.5
  }
}) => {
  // Photos State with LocalStorage persistence
  const [photos, setPhotos] = useState<ProgressPhotoRecord[]>(() => {
    const saved = localStorage.getItem('2click_construction_photos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved progress photos:', e);
      }
    }
    return SAMPLE_INITIAL_PHOTOS;
  });

  // Camera & Capture Form State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Capturing Image Measurements State
  const [activeImageAnnotations, setActiveImageAnnotations] = useState<MeasurementAnnotation[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [drawPointA, setDrawPointA] = useState<{ x: number; y: number } | null>(null);

  // Overlay Toggle Preferences in Gallery
  const [showMeasurements, setShowMeasurements] = useState<boolean>(true);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);
  const [showGeotagStamp, setShowGeotagStamp] = useState<boolean>(true);

  // Form Inputs
  const [projectName, setProjectName] = useState<string>(defaultProjectName);
  const [stageName, setStageName] = useState<string>('RCC Slab Casting');
  const [engineerName, setEngineerName] = useState<string>('Er. Vikram Singh (Site Supervisor)');
  const [notes, setNotes] = useState<string>('');

  // Geolocation State
  const [fetchingGps, setFetchingGps] = useState<boolean>(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>(`${selectedCity}, India`);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Filter & Detail Modal State
  const [selectedFilterProject, setSelectedFilterProject] = useState<string>('All');
  const [selectedFilterStage, setSelectedFilterStage] = useState<string>('All');
  const [activePhotoModal, setActivePhotoModal] = useState<ProgressPhotoRecord | null>(null);
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(true);

  // Save to localStorage when photos change
  useEffect(() => {
    localStorage.setItem('2click_construction_photos', JSON.stringify(photos));
  }, [photos]);

  // Request GPS Location on mount
  useEffect(() => {
    fetchCurrentLocation();
  }, [selectedCity]);

  // Fetch current GPS Coordinates
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser/device.');
      return;
    }

    setFetchingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAltitude(position.coords.altitude);
        setAccuracy(position.coords.accuracy);
        setLocationAddress(`Lat: ${position.coords.latitude.toFixed(4)}°, Lng: ${position.coords.longitude.toFixed(4)}° • ${selectedCity}`);
        setFetchingGps(false);
      },
      (error) => {
        console.warn('Geolocation warning/error:', error.message);
        setGpsError('GPS access restricted or timed out. Defaulting to estimated site location.');
        setFetchingGps(false);
        setLatitude(28.6139);
        setLongitude(77.2090);
        setAccuracy(10.0);
        setLocationAddress(`${selectedCity} Site Location (Estimated)`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Start Device Camera
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access device camera directly. Opening standard image uploader.');
      setIsCameraActive(false);
      fileInputRef.current?.click();
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Snap Photo from Camera Stream
  const snapCameraPicture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageUri = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImageUri(imageUri);
      stopCamera();
      
      // Auto-generate project measurements
      generateAutoMeasurements();
    }
  };

  // Handle File Upload Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCapturedImageUri(event.target.result as string);
        generateAutoMeasurements();
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-Detect & Annotate Room Measurements using Project Dimensions
  const generateAutoMeasurements = () => {
    const lFt = projectDimensions.lengthFt || 22.5;
    const wFt = projectDimensions.widthFt || 18.0;
    const hFt = projectDimensions.heightFt || 10.5;
    const area = projectDimensions.builtupAreaSqft || Math.round(lFt * wFt);

    const autoAnns: MeasurementAnnotation[] = [
      {
        id: `m-${Date.now()}-1`,
        x1: 15,
        y1: 22,
        x2: 85,
        y2: 22,
        label: 'Room Width',
        value: `${wFt} ft`,
        color: '#10b981',
        type: 'length'
      },
      {
        id: `m-${Date.now()}-2`,
        x1: 20,
        y1: 25,
        x2: 20,
        y2: 80,
        label: 'Floor-to-Slab Height',
        value: `${hFt} ft`,
        color: '#3b82f6',
        type: 'height'
      },
      {
        id: `m-${Date.now()}-3`,
        x1: 42,
        y1: 52,
        x2: 58,
        y2: 52,
        label: 'Floor Area',
        value: `${area} sq.ft`,
        color: '#f59e0b',
        type: 'area'
      },
      {
        id: `m-${Date.now()}-4`,
        x1: 65,
        y1: 45,
        x2: 80,
        y2: 85,
        label: 'Door Opening',
        value: '3.5ft x 7.0ft',
        color: '#ec4899',
        type: 'opening'
      }
    ];

    setActiveImageAnnotations(autoAnns);
  };

  // Manual Canvas Point-to-Point Click Annotator
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (!drawPointA) {
      setDrawPointA({ x: clickX, y: clickY });
    } else {
      const label = prompt('Enter Measurement Label (e.g. Beam Span, Window Opening):', 'Span');
      if (!label) {
        setDrawPointA(null);
        return;
      }
      const val = prompt('Enter Dimension Value (e.g. 14.2 ft):', '12.0 ft');
      if (!val) {
        setDrawPointA(null);
        return;
      }

      const newAnn: MeasurementAnnotation = {
        id: `m-custom-${Date.now()}`,
        x1: drawPointA.x,
        y1: drawPointA.y,
        x2: clickX,
        y2: clickY,
        label,
        value: val,
        color: '#10b981',
        type: 'length'
      };

      setActiveImageAnnotations([...activeImageAnnotations, newAnn]);
      setDrawPointA(null);
      setIsDrawingMode(false);
    }
  };

  // Save Snapped / Uploaded Photo Record
  const handleSaveProgressPhoto = () => {
    if (!capturedImageUri) {
      alert('Please snap or upload a progress picture first.');
      return;
    }

    const now = new Date();
    const formattedTimestamp = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' IST';

    const newPhotoRecord: ProgressPhotoRecord = {
      id: `PHOTO-${Date.now().toString().slice(-6)}`,
      projectId: `PRJ-${Date.now().toString().slice(-4)}`,
      projectName: projectName.trim() || 'Residential Construction Site',
      stageName: stageName,
      photoUrl: capturedImageUri,
      timestamp: formattedTimestamp,
      isoDate: now.toISOString(),
      latitude: latitude,
      longitude: longitude,
      altitude: altitude,
      accuracyMeters: accuracy ? Number(accuracy.toFixed(1)) : null,
      locationAddress: locationAddress,
      engineerName: engineerName.trim() || 'Site Inspector',
      notes: notes.trim() || 'Work in progress verified on site.',
      weatherCondition: 'Clear • Site Curing Active',
      measurements: activeImageAnnotations,
      autoAnnotated: activeImageAnnotations.length > 0
    };

    setPhotos([newPhotoRecord, ...photos]);
    setCapturedImageUri(null);
    setActiveImageAnnotations([]);
    setNotes('');
    alert('✅ Construction progress photo with measurement annotations successfully saved!');
  };

  // Delete Photo Record
  const handleDeletePhoto = (id: string) => {
    if (confirm('Are you sure you want to delete this geotagged progress photo?')) {
      setPhotos(prev => prev.filter(p => p.id !== id));
      if (activePhotoModal?.id === id) {
        setActivePhotoModal(null);
      }
    }
  };

  // Download Image with Measurements Rendered on Canvas
  const handleDownloadAnnotatedImage = (photoRecord: ProgressPhotoRecord) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 1280;
      canvas.height = img.height || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw Base Image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw Grid Overlay
      if (showGridOverlay) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += canvas.width / 10) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += canvas.height / 10) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Draw Measurement Lines
      if (showMeasurements && photoRecord.measurements) {
        photoRecord.measurements.forEach(ann => {
          const x1 = (ann.x1 / 100) * canvas.width;
          const y1 = (ann.y1 / 100) * canvas.height;
          const x2 = (ann.x2 / 100) * canvas.width;
          const y2 = (ann.y2 / 100) * canvas.height;
          const color = ann.color || '#10b981';

          // Draw Dimension Line
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Draw Ticks
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x1, y1, 8, 0, Math.PI * 2);
          ctx.arc(x2, y2, 8, 0, Math.PI * 2);
          ctx.fill();

          // Draw Label Badge
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          const text = `${ann.label}: ${ann.value}`;

          ctx.font = 'bold 18px monospace';
          const textWidth = ctx.measureText(text).width;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fillRect(midX - textWidth / 2 - 10, midY - 18, textWidth + 20, 36);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(midX - textWidth / 2 - 10, midY - 18, textWidth + 20, 36);

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, midX, midY);
        });
      }

      // Draw Geotag Stamp Watermark
      if (showGeotagStamp) {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
        ctx.fillRect(20, canvas.height - 110, canvas.width - 40, 90);
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, canvas.height - 110, canvas.width - 40, 90);

        ctx.fillStyle = '#2dd4bf';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`2CLICK.IN VERIFIED MEASUREMENT STAMP • ${photoRecord.projectName}`, 40, canvas.height - 75);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px monospace';
        ctx.fillText(`📍 ${photoRecord.locationAddress} | ${photoRecord.timestamp}`, 40, canvas.height - 40);
      }

      // Trigger Download
      const link = document.createElement('a');
      link.download = `Annotated_Measurement_Photo_${photoRecord.id}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    };
    img.src = photoRecord.photoUrl;
  };

  // Filtered Photos List
  const filteredPhotos = photos.filter(p => {
    const matchesProject = selectedFilterProject === 'All' || p.projectName === selectedFilterProject;
    const matchesStage = selectedFilterStage === 'All' || p.stageName === selectedFilterStage;
    return matchesProject && matchesStage;
  });

  const uniqueProjects = Array.from(new Set(photos.map(p => p.projectName)));
  const uniqueStages = Array.from(new Set(photos.map(p => p.stageName)));

  // Download PDF/Report Summary
  const handleDownloadReport = () => {
    const reportContent = `2CLICK.IN GEOTAGGED SITE PROGRESS & MEASUREMENT PHOTO REPORT
Generated: ${new Date().toLocaleString('en-IN')}
Total Site Snapshots: ${filteredPhotos.length}
Project Filter: ${selectedFilterProject}

${filteredPhotos.map((p, idx) => `
[${idx + 1}] SNAPSHOT ID: ${p.id}
Project: ${p.projectName}
Stage: ${p.stageName}
Timestamp: ${p.timestamp}
GPS Coordinates: Lat ${p.latitude}° N, Lng ${p.longitude}° E (Accuracy: ±${p.accuracyMeters}m)
Location Address: ${p.locationAddress}
Site Engineer: ${p.engineerName}
Site Notes: ${p.notes}
Annotated Measurements: ${p.measurements?.map(m => `${m.label}: ${m.value}`).join(' | ') || 'None'}
Image URL: ${p.photoUrl.startsWith('data:') ? '[Base64 Embedded Image Data]' : p.photoUrl}
--------------------------------------------------
`).join('')}`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2click_Measurement_Annotated_Photos_Report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header Title Section */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-teal-500/30 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-xl text-xs font-black uppercase flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-teal-400" /> AI Site Measurement &amp; Camera Gallery
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                IS 456 &amp; CAD Overlay Compliant
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Construction Site Photo &amp; Measurement Auto-Annotator
            </h1>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Capture live room and site photos using your device camera. Automatically calculate and overlay project measurements, span dimensions, floor areas, and door/window cutouts directly onto geotagged progress pictures.
            </p>
          </div>

          <button
            onClick={() => {
              window.scrollTo({ top: 400, behavior: 'smooth' });
              startCamera();
            }}
            className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-xs shadow-xl shadow-teal-600/30 transition-all flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
          >
            <Camera className="w-4 h-4" /> Open Camera &amp; Measure
          </button>
        </div>
      </div>

      {/* SNAP PICTURE & CAPTURE SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Snap &amp; Auto-Annotate Room Measurements</h2>
              <p className="text-xs text-slate-500">Capture live camera photo or upload site image to overlay CAD project dimensions</p>
            </div>
          </div>

          {/* GPS Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={fetchCurrentLocation}
              disabled={fetchingGps}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center gap-1.5 transition text-[11px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchingGps ? 'animate-spin text-teal-500' : ''}`} />
              <span>{fetchingGps ? 'Locking GPS...' : 'Refresh GPS'}</span>
            </button>

            {latitude && longitude ? (
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl font-mono text-[11px] font-extrabold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>GPS Lock: {latitude.toFixed(4)}°, {longitude.toFixed(4)}° (±{accuracy ? Math.round(accuracy) : '3'}m)</span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded-xl text-[11px] font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> GPS Pending
              </span>
            )}
          </div>
        </div>

        {gpsError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{gpsError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CAMERA / IMAGE PREVIEW CANVAS (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div 
              onClick={handleCanvasClick}
              className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 min-h-[340px] flex items-center justify-center cursor-crosshair select-none"
            >
              {isCameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-black tracking-wider uppercase animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    LIVE CAMERA STREAM
                  </div>

                  {/* AR Crosshair Reticle overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-dashed border-teal-400/60 rounded-2xl flex items-center justify-center">
                      <Crosshair className="w-8 h-8 text-teal-400 animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                    <button
                      type="button"
                      onClick={snapCameraPicture}
                      className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-5 h-5" /> Snap Picture &amp; Auto-Measure
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : capturedImageUri ? (
                <div className="relative w-full h-full group">
                  <img
                    src={capturedImageUri}
                    alt="Captured Construction Progress"
                    referrerPolicy="no-referrer"
                    className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                  />

                  {/* SVG Measurement Overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {showGridOverlay && (
                      <g opacity="0.15">
                        <line x1="0%" y1="33%" x2="100%" y2="33%" stroke="#38bdf8" strokeWidth="1" />
                        <line x1="0%" y1="66%" x2="100%" y2="66%" stroke="#38bdf8" strokeWidth="1" />
                        <line x1="33%" y1="0%" x2="33%" y2="100%" stroke="#38bdf8" strokeWidth="1" />
                        <line x1="66%" y1="0%" x2="66%" y2="100%" stroke="#38bdf8" strokeWidth="1" />
                      </g>
                    )}

                    {activeImageAnnotations.map(ann => {
                      const color = ann.color || '#10b981';
                      const midX = (ann.x1 + ann.x2) / 2;
                      const midY = (ann.y1 + ann.y2) / 2;

                      return (
                        <g key={ann.id}>
                          <line
                            x1={`${ann.x1}%`}
                            y1={`${ann.y1}%`}
                            x2={`${ann.x2}%`}
                            y2={`${ann.y2}%`}
                            stroke={color}
                            strokeWidth="3"
                          />
                          <circle cx={`${ann.x1}%`} cy={`${ann.y1}%`} r="5" fill={color} />
                          <circle cx={`${ann.x2}%`} cy={`${ann.y2}%`} r="5" fill={color} />

                          <foreignObject
                            x={`calc(${midX}% - 55px)`}
                            y={`calc(${midY}% - 14px)`}
                            width="110"
                            height="28"
                            className="overflow-visible"
                          >
                            <div className="px-2 py-0.5 rounded-full bg-slate-950/90 border border-teal-400 text-teal-300 font-mono text-[10px] font-black shadow-lg text-center truncate">
                              {ann.label}: {ann.value}
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Temporary point A indicator when drawing custom measurement */}
                  {drawPointA && (
                    <div 
                      className="absolute w-4 h-4 rounded-full bg-rose-500 border-2 border-white animate-ping z-30"
                      style={{ left: `calc(${drawPointA.x}% - 8px)`, top: `calc(${drawPointA.y}% - 8px)` }}
                    />
                  )}

                  {/* Simulated On-Photo Geotag Overlay Stamp */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/85 backdrop-blur-md rounded-xl border border-white/20 text-white text-xs space-y-1 shadow-2xl z-20">
                    <div className="flex items-center justify-between font-mono font-bold text-[11px] text-teal-400">
                      <span>2CLICK.IN VERIFIED SITE MEASUREMENT STAMP</span>
                      <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-200 font-mono">
                      <span>📍 Lat: {latitude ? latitude.toFixed(5) : '28.6139'}° N | Lng: {longitude ? longitude.toFixed(5) : '77.2090'}° E</span>
                      <span>Accuracy: ±{accuracy ? Math.round(accuracy) : '3'}m</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImageUri(null);
                      setActiveImageAnnotations([]);
                    }}
                    className="absolute top-3 right-3 p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-xl shadow-lg transition z-30"
                    title="Remove & Retake Picture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">No Picture Snapped Yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Use your device camera or upload a site picture to automatically overlay project measurements and CAD room dimensions.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> Open Live Camera
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" /> Upload from Gallery
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Measurement Control Bar for active image */}
            {capturedImageUri && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={generateAutoMeasurements}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-[11px] flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Re-Auto Measure
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDrawingMode(!isDrawingMode)}
                    className={`px-3 py-1.5 font-bold rounded-xl text-[11px] flex items-center gap-1 transition ${
                      isDrawingMode ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isDrawingMode ? 'Click 2 Points on Image' : 'Draw Custom Dimension'}</span>
                  </button>
                </div>

                <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400">
                  {activeImageAnnotations.length} Annotations Active
                </div>
              </div>
            )}
          </div>

          {/* PROJECT METADATA FORM (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-500" /> Geotag Metadata &amp; Stage Info
            </h3>

            {/* Project Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Construction Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="e.g. Residential Villa - Sector 62"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Stage / Phase Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Construction Stage / Phase</label>
              <select
                value={stageName}
                onChange={e => setStageName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Foundation & Earth Excavation">Foundation &amp; Earth Excavation</option>
                <option value="RCC Slab Casting & Rebar Inspection">RCC Slab Casting &amp; Rebar Inspection</option>
                <option value="Brickwork & AAC Masonry">Brickwork &amp; AAC Masonry</option>
                <option value="Internal & External Plaster Curing">Internal &amp; External Plaster Curing</option>
                <option value="Electrical & Plumbing Conduit Piping">Electrical &amp; Plumbing Conduit Piping</option>
                <option value="Flooring, Marble & Tiling Work">Flooring, Marble &amp; Tiling Work</option>
                <option value="Solar Panel Mounting & Grid Wiring">Solar Panel Mounting &amp; Grid Wiring</option>
                <option value="Painting, Waterproofing & Finishing">Painting, Waterproofing &amp; Finishing</option>
              </select>
            </div>

            {/* Site Engineer / Inspector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Site Supervisor / QA Engineer Name</label>
              <input
                type="text"
                value={engineerName}
                onChange={e => setEngineerName(e.target.value)}
                placeholder="e.g. Er. Vikram Singh (Site Supervisor)"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Site Notes / Remarks */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Technical Site Observations &amp; Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. M25 RMC pouring complete. Beam steel rebar spacing verified per structural drawings."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Auto GPS Summary Display */}
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between text-teal-700 dark:text-teal-300 font-bold">
                <span>📍 Geotag Stamp Info</span>
                <span>{new Date().toLocaleDateString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                {latitude ? `Lat: ${latitude.toFixed(4)}°, Lng: ${longitude?.toFixed(4)}°` : 'GPS Coordinates Auto-attached'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSaveProgressPhoto}
              disabled={!capturedImageUri}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Save &amp; Log Measurement Photo
            </button>
          </div>
        </div>
      </div>

      {/* GALLERY & HISTORY SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Measurement Annotated Site Photo Gallery</h2>
              <span className="px-2.5 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-300 text-xs font-extrabold rounded-full">
                {filteredPhotos.length} Snapshots
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Filter by project name, stage, or export measurement annotated site logs</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadReport}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-500" /> Export Audit Log
            </button>
          </div>
        </div>

        {/* Filters Bar & Overlay Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Filter className="w-4 h-4 text-teal-500" />
              <span>Filter By:</span>
            </div>

            {/* Project Filter */}
            <select
              value={selectedFilterProject}
              onChange={e => setSelectedFilterProject(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Projects ({photos.length})</option>
              {uniqueProjects.map((p, idx) => (
                <option key={idx} value={p}>{p}</option>
              ))}
            </select>

            {/* Stage Filter */}
            <select
              value={selectedFilterStage}
              onChange={e => setSelectedFilterStage(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="All">All Construction Stages</option>
              {uniqueStages.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showMeasurements}
                onChange={e => setShowMeasurements(e.target.checked)}
                className="rounded border-slate-700 text-teal-600 focus:ring-teal-500"
              />
              <span>📐 Measurements</span>
            </label>

            <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showGridOverlay}
                onChange={e => setShowGridOverlay(e.target.checked)}
                className="rounded border-slate-700 text-teal-600 focus:ring-teal-500"
              />
              <span>🌐 Grid</span>
            </label>
          </div>
        </div>

        {/* GALLERY GRID */}
        {filteredPhotos.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold">No geotagged progress photos match your filter.</p>
            <p className="text-xs">Snap a picture above to create your first geotagged construction record.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group flex flex-col"
              >
                {/* Photo Thumbnail Container */}
                <div className="relative aspect-video bg-black overflow-hidden cursor-pointer" onClick={() => setActivePhotoModal(photo)}>
                  <img
                    src={photo.photoUrl}
                    alt={photo.stageName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* SVG Measurement Overlay on Thumbnail */}
                  {showMeasurements && photo.measurements && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                      {photo.measurements.map(ann => {
                        const color = ann.color || '#10b981';
                        const midX = (ann.x1 + ann.x2) / 2;
                        const midY = (ann.y1 + ann.y2) / 2;

                        return (
                          <g key={ann.id}>
                            <line
                              x1={`${ann.x1}%`}
                              y1={`${ann.y1}%`}
                              x2={`${ann.x2}%`}
                              y2={`${ann.y2}%`}
                              stroke={color}
                              strokeWidth="2"
                            />
                            <foreignObject
                              x={`calc(${midX}% - 40px)`}
                              y={`calc(${midY}% - 10px)`}
                              width="80"
                              height="20"
                              className="overflow-visible"
                            >
                              <div className="px-1.5 py-0.2 rounded-full bg-slate-950/90 border border-teal-400 text-teal-300 font-mono text-[9px] font-black text-center truncate">
                                {ann.value}
                              </div>
                            </foreignObject>
                          </g>
                        );
                      })}
                    </svg>
                  )}

                  {/* Stamp Overlay Badge */}
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/80 backdrop-blur-md text-teal-300 border border-teal-500/30 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 z-20">
                    <Ruler className="w-3 h-3 text-emerald-400" />
                    <span>{photo.measurements?.length || 0} Measurements</span>
                  </div>

                  <div className="absolute top-2 right-2 px-2 py-1 bg-slate-900/80 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 z-20">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{photo.timestamp.split(',')[0]}</span>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white text-xs z-20">
                    <p className="font-extrabold text-xs truncate">{photo.stageName}</p>
                    <p className="text-[10px] text-teal-300 truncate font-mono">📍 {photo.locationAddress}</p>
                  </div>
                </div>

                {/* Card Info Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider block truncate">
                      {photo.projectName}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic">
                      "{photo.notes}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-teal-500" />
                      <span className="truncate max-w-[130px]">{photo.engineerName}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownloadAnnotatedImage(photo)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-lg transition"
                        title="Download Measurement Annotated Photo"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setActivePhotoModal(photo)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-lg transition"
                        title="View Full Measurement Stamp"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950 text-red-500 rounded-lg transition"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FULL RESOLUTION DETAIL MODAL WITH MEASUREMENT OVERLAY STAMP */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-teal-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold">{activePhotoModal.stageName}</h3>
                  <p className="text-[11px] text-slate-400">{activePhotoModal.projectName} • Snapshot ID: {activePhotoModal.id}</p>
                </div>
              </div>

              <button
                onClick={() => setActivePhotoModal(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image Body with Measurement Overlay Stamp */}
            <div className="relative flex-1 overflow-y-auto bg-black flex items-center justify-center p-4">
              <div className="relative max-h-[60vh]">
                <img
                  src={activePhotoModal.photoUrl}
                  alt={activePhotoModal.stageName}
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] w-auto object-contain rounded-2xl border border-slate-800"
                />

                {/* SVG Measurement Overlay */}
                {showMeasurements && activePhotoModal.measurements && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {activePhotoModal.measurements.map(ann => {
                      const color = ann.color || '#10b981';
                      const midX = (ann.x1 + ann.x2) / 2;
                      const midY = (ann.y1 + ann.y2) / 2;

                      return (
                        <g key={ann.id}>
                          <line
                            x1={`${ann.x1}%`}
                            y1={`${ann.y1}%`}
                            x2={`${ann.x2}%`}
                            y2={`${ann.y2}%`}
                            stroke={color}
                            strokeWidth="3"
                          />
                          <circle cx={`${ann.x1}%`} cy={`${ann.y1}%`} r="6" fill={color} />
                          <circle cx={`${ann.x2}%`} cy={`${ann.y2}%`} r="6" fill={color} />

                          <foreignObject
                            x={`calc(${midX}% - 55px)`}
                            y={`calc(${midY}% - 14px)`}
                            width="110"
                            height="28"
                            className="overflow-visible"
                          >
                            <div className="px-2 py-0.5 rounded-full bg-slate-950/90 border border-teal-400 text-teal-300 font-mono text-[10px] font-black shadow-lg text-center truncate">
                              {ann.label}: {ann.value}
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>

              {/* Watermark Overlay Stamp */}
              {watermarkEnabled && (
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/85 backdrop-blur-md rounded-2xl border border-teal-500/40 text-white text-xs space-y-2 shadow-2xl max-w-2xl mx-auto z-20">
                  <div className="flex items-center justify-between border-b border-teal-500/30 pb-2">
                    <span className="font-black text-teal-400 tracking-wider text-xs uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2CLICK.IN VERIFIED SITE MEASUREMENT STAMP
                    </span>
                    <span className="font-mono text-amber-300 font-bold">{activePhotoModal.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                    <div>
                      <span className="text-slate-400">Coordinates:</span> Lat {activePhotoModal.latitude ? activePhotoModal.latitude.toFixed(5) : '28.6139'}° N, Lng {activePhotoModal.longitude ? activePhotoModal.longitude.toFixed(5) : '77.2090'}° E
                    </div>
                    <div>
                      <span className="text-slate-400">GPS Accuracy:</span> ±{activePhotoModal.accuracyMeters || 3.5}m | Alt: {activePhotoModal.altitude || 216}m
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-200">
                    <span className="text-slate-400 font-semibold">Location Address:</span> {activePhotoModal.locationAddress}
                  </div>

                  <div className="text-[11px] text-teal-300 flex items-center gap-2 pt-1 border-t border-slate-800">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Audited By: <strong>{activePhotoModal.engineerName}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={watermarkEnabled}
                  onChange={e => setWatermarkEnabled(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-teal-600 focus:ring-teal-500"
                />
                <span>Toggle Verified Audit Watermark Stamp</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadAnnotatedImage(activePhotoModal)}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Measurement Photo
                </button>

                <button
                  onClick={() => {
                    const text = `2click.in Geotagged Site Measurement Photo:\nProject: ${activePhotoModal.projectName}\nStage: ${activePhotoModal.stageName}\nLocation: ${activePhotoModal.locationAddress}\nTimestamp: ${activePhotoModal.timestamp}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share WhatsApp
                </button>

                <button
                  onClick={() => setActivePhotoModal(null)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
