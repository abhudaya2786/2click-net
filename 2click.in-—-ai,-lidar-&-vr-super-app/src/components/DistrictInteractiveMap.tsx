import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Layers, 
  Compass, 
  Building2, 
  Users, 
  Store, 
  Search, 
  Filter, 
  ShieldCheck, 
  CheckCircle2, 
  Crosshair, 
  Sparkles, 
  Navigation, 
  Phone, 
  ArrowUpRight,
  TrendingUp,
  Zap,
  Globe,
  Radio,
  Eye
} from 'lucide-react';
import { User, ShopProduct } from '../types';
import { SAMPLE_PROJECTS } from '../data/initialData';
import { getAllStates } from '../utils/indianAdminHierarchy';

interface DistrictGeoData {
  id: string;
  district: string;
  state: string;
  zone: string;
  lat: number;
  lng: number;
  adminName: string;
  adminPhone: string;
  projectsCount: number;
  vendorsCount: number;
  usersCount: number;
  totalValuationINR: number;
  topCategories: string[];
  keyVendors: Array<{ name: string; role: string; phone: string; rating: number }>;
}

export const DISTRICT_MAP_NODES: DistrictGeoData[] = [
  {
    id: 'DIST-DELHI',
    district: 'Delhi NCR',
    state: 'Delhi',
    zone: 'North Zone',
    lat: 28.6139,
    lng: 77.2090,
    adminName: 'Shrinet Admin',
    adminPhone: '+91 98765 00001',
    projectsCount: 28,
    vendorsCount: 42,
    usersCount: 185,
    totalValuationINR: 142000000,
    topCategories: ['Solar Rooftop', 'Civil BOQ', 'Electrical MEP'],
    keyVendors: [
      { name: 'Licensed MEP Electrician', role: 'Electrician', phone: '+91 70072 54932', rating: 4.9 },
      { name: 'Apex Solar Solutions', role: 'Dukandar', phone: '+91 98110 54321', rating: 4.8 }
    ]
  },
  {
    id: 'DIST-LUCKNOW',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    zone: 'Central Zone',
    lat: 26.8467,
    lng: 80.9462,
    adminName: 'Lucknow District Admin',
    adminPhone: '+91 98765 00002',
    projectsCount: 19,
    vendorsCount: 29,
    usersCount: 112,
    totalValuationINR: 89000000,
    topCategories: ['Civil BOQ', 'Water & ETP/STP', 'Interior'],
    keyVendors: [
      { name: 'Avadh Hardware & Solar', role: 'Dukandar', phone: '+91 94150 11223', rating: 4.7 },
      { name: 'Awadh MEP Services', role: 'Electrician', phone: '+91 94150 99887', rating: 4.9 }
    ]
  },
  {
    id: 'DIST-VARANASI',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    zone: 'Central Zone',
    lat: 25.3176,
    lng: 82.9739,
    adminName: 'Varanasi Field Inspector',
    adminPhone: '+91 98765 00003',
    projectsCount: 14,
    vendorsCount: 21,
    usersCount: 88,
    totalValuationINR: 54000000,
    topCategories: ['Solar Rooftop', 'Civil BOQ', 'Plumbing'],
    keyVendors: [
      { name: 'Kashi Smart Solar Hub', role: 'Dukandar', phone: '+91 98390 44556', rating: 4.8 },
      { name: 'Purvanchal MEP Works', role: 'Plumber', phone: '+91 98390 12389', rating: 4.6 }
    ]
  },
  {
    id: 'DIST-MUMBAI',
    district: 'Mumbai',
    state: 'Maharashtra',
    zone: 'West Zone',
    lat: 19.0760,
    lng: 72.8777,
    adminName: 'Studio Design Architect',
    adminPhone: '+91 98765 00004',
    projectsCount: 35,
    vendorsCount: 58,
    usersCount: 240,
    totalValuationINR: 210000000,
    topCategories: ['VR Walkthrough', 'Interior', 'Civil BOQ'],
    keyVendors: [
      { name: 'Studio Design Architect', role: 'Architect', phone: '+91 98200 88776', rating: 5.0 },
      { name: 'SBI Solar Credit Officer', role: 'BankManager', phone: '+91 98200 11223', rating: 4.9 }
    ]
  },
  {
    id: 'DIST-PUNE',
    district: 'Pune',
    state: 'Maharashtra',
    zone: 'West Zone',
    lat: 18.5204,
    lng: 73.8567,
    adminName: 'Shree Ram Solar Dukandar',
    adminPhone: '+91 98765 00005',
    projectsCount: 22,
    vendorsCount: 34,
    usersCount: 145,
    totalValuationINR: 115000000,
    topCategories: ['Solar Rooftop', 'Wholesale B2B', 'Electrical MEP'],
    keyVendors: [
      { name: 'Shree Ram Solar Dukandar', role: 'Dukandar', phone: '+91 98220 33445', rating: 4.9 },
      { name: 'Sahyadri Electricals', role: 'Electrician', phone: '+91 98220 55667', rating: 4.7 }
    ]
  },
  {
    id: 'DIST-BENGALURU',
    district: 'Bengaluru',
    state: 'Karnataka',
    zone: 'South Zone',
    lat: 12.9716,
    lng: 77.5946,
    adminName: 'Aquafab Wholesale Supplier',
    adminPhone: '+91 98765 00006',
    projectsCount: 41,
    vendorsCount: 65,
    usersCount: 310,
    totalValuationINR: 280000000,
    topCategories: ['LiDAR 3D Survey', 'Civil BOQ', 'Water & ETP/STP'],
    keyVendors: [
      { name: 'Aquafab Wholesale Supplier', role: 'Supplier', phone: '+91 98450 77889', rating: 4.9 },
      { name: 'Deccan LiDAR Surveys', role: 'Surveyor', phone: '+91 98450 22334', rating: 4.8 }
    ]
  },
  {
    id: 'DIST-CHENNAI',
    district: 'Chennai',
    state: 'Tamil Nadu',
    zone: 'South Zone',
    lat: 13.0827,
    lng: 80.2707,
    adminName: 'ETP Sanitary Plumber',
    adminPhone: '+91 98765 00007',
    projectsCount: 18,
    vendorsCount: 27,
    usersCount: 125,
    totalValuationINR: 76000000,
    topCategories: ['Plumbing & Piping', 'Water & ETP/STP', 'Solar'],
    keyVendors: [
      { name: 'ETP Sanitary Plumber', role: 'Plumber', phone: '+91 98400 66778', rating: 4.8 },
      { name: 'Coromandel MEP Supplies', role: 'Supplier', phone: '+91 98400 99001', rating: 4.7 }
    ]
  },
  {
    id: 'DIST-HYDERABAD',
    district: 'Hyderabad',
    state: 'Telangana',
    zone: 'South Zone',
    lat: 17.3850,
    lng: 78.4867,
    adminName: 'Telangana Tech Admin',
    adminPhone: '+91 98765 00008',
    projectsCount: 26,
    vendorsCount: 38,
    usersCount: 175,
    totalValuationINR: 135000000,
    topCategories: ['LiDAR Survey', 'Civil BOQ', 'Solar Rooftop'],
    keyVendors: [
      { name: 'Charminar Electrical B2B', role: 'Dukandar', phone: '+91 98490 12345', rating: 4.8 },
      { name: 'Deccan Solar Grid', role: 'Vendor', phone: '+91 98490 67890', rating: 4.9 }
    ]
  },
  {
    id: 'DIST-AHMEDABAD',
    district: 'Ahmedabad',
    state: 'Gujarat',
    zone: 'West Zone',
    lat: 23.0225,
    lng: 72.5714,
    adminName: 'Gujarat Solar Officer',
    adminPhone: '+91 98765 00009',
    projectsCount: 24,
    vendorsCount: 36,
    usersCount: 160,
    totalValuationINR: 128000000,
    topCategories: ['Solar Rooftop', 'Civil BOQ', 'Wholesale'],
    keyVendors: [
      { name: 'Sabarmati Solar Power', role: 'Dukandar', phone: '+91 98250 11223', rating: 4.9 }
    ]
  },
  {
    id: 'DIST-JAIPUR',
    district: 'Jaipur',
    state: 'Rajasthan',
    zone: 'North Zone',
    lat: 26.9124,
    lng: 75.7873,
    adminName: 'Rajasthan Heritage Admin',
    adminPhone: '+91 98765 00010',
    projectsCount: 16,
    vendorsCount: 22,
    usersCount: 95,
    totalValuationINR: 64000000,
    topCategories: ['Interior Architecture', 'Solar', 'Civil'],
    keyVendors: [
      { name: 'PinkCity Interior Studio', role: 'Architect', phone: '+91 98290 44556', rating: 4.8 }
    ]
  },
  {
    id: 'DIST-KOLKATA',
    district: 'Kolkata',
    state: 'West Bengal',
    zone: 'East Zone',
    lat: 22.5726,
    lng: 88.3639,
    adminName: 'East Zone Coordinator',
    adminPhone: '+91 98765 00011',
    projectsCount: 17,
    vendorsCount: 25,
    usersCount: 105,
    totalValuationINR: 71000000,
    topCategories: ['Civil BOQ', 'Water Treatment', 'Electrical'],
    keyVendors: [
      { name: 'Hooghly Plumbing Hub', role: 'Plumber', phone: '+91 98300 55667', rating: 4.7 }
    ]
  }
];

interface DistrictInteractiveMapProps {
  userList?: User[];
  productsList?: ShopProduct[];
  onSelectDistrict?: (districtName: string) => void;
}

export const DistrictInteractiveMap: React.FC<DistrictInteractiveMapProps> = ({
  userList = [],
  productsList = [],
  onSelectDistrict
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Filter States
  const [showProjectsLayer, setShowProjectsLayer] = useState(true);
  const [showVendorsLayer, setShowVendorsLayer] = useState(true);
  const [showUsersLayer, setShowUsersLayer] = useState(true);
  const [showHeatCircles, setShowHeatCircles] = useState(true);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('All');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('DIST-DELHI');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('streets');

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Selected Node for Detail Sidebar/Card
  const [activeDistrictNode, setActiveDistrictNode] = useState<DistrictGeoData>(DISTRICT_MAP_NODES[0]);

  // Load Leaflet Stylesheet dynamically
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet Map centered on India (20.5937, 78.9629)
      const map = L.map(mapContainerRef.current, {
        center: [22.5937, 78.9629],
        zoom: 5,
        zoomControl: false,
        attributionControl: false
      });

      // Add Zoom Control to Top Right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Default Tile Layer
      const tileUrl = getTileUrl(mapStyle);
      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when mapStyle changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl = getTileUrl(mapStyle);
    L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);
  }, [mapStyle]);

  function getTileUrl(style: 'streets' | 'satellite' | 'dark'): string {
    switch (style) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'streets':
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  }

  // Render Pins & Heat Bubbles whenever state/filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    const filteredNodes = DISTRICT_MAP_NODES.filter(node => {
      const matchState = selectedStateFilter === 'All' || node.state === selectedStateFilter;
      const matchSearch = searchQuery === '' || 
        node.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.zone.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchSearch;
    });

    filteredNodes.forEach(node => {
      // 1. Optional Heat/Density Circle
      if (showHeatCircles) {
        const radiusMeters = Math.min(node.projectsCount * 2500 + 15000, 75000);
        const heatCircle = L.circle([node.lat, node.lng], {
          radius: radiusMeters,
          color: node.district === activeDistrictNode.district ? '#6366f1' : '#0d9488',
          fillColor: node.district === activeDistrictNode.district ? '#818cf8' : '#14b8a6',
          fillOpacity: 0.22,
          weight: 2
        });
        markersGroup.addLayer(heatCircle);
      }

      // 2. Custom HTML Marker Icon
      const isSelected = activeDistrictNode.district === node.district;
      const totalCombined = node.projectsCount + node.vendorsCount;

      const markerHtml = `
        <div class="relative group cursor-pointer flex items-center justify-center">
          ${isSelected ? '<div class="absolute -inset-2 bg-indigo-500/40 rounded-full animate-ping"></div>' : ''}
          <div class="px-2.5 py-1.5 rounded-2xl ${
            isSelected 
              ? 'bg-indigo-600 text-white ring-4 ring-indigo-300 dark:ring-indigo-900 shadow-xl scale-110' 
              : 'bg-slate-900/90 hover:bg-indigo-700 text-white border border-slate-700 shadow-lg'
          } flex items-center gap-1.5 transition-all duration-300">
            <span class="text-xs font-black">${node.district}</span>
            <span class="px-1.5 py-0.5 text-[10px] font-extrabold rounded-lg ${
              isSelected ? 'bg-amber-400 text-slate-950' : 'bg-teal-500 text-white'
            }">${totalCombined}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-district-pin',
        iconSize: [120, 36],
        iconAnchor: [60, 18]
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon });

      // Popup HTML content
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <div>
              <strong style="font-size: 14px; color: #0f172a; display: block;">📍 ${node.district}</strong>
              <span style="font-size: 10px; color: #6366f1; font-weight: 700;">${node.zone} • ${node.state}</span>
            </div>
            <span style="background: #ecfdf5; color: #047857; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px;">
              Active Hub
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; background: #f8fafc; padding: 6px; border-radius: 8px; margin-bottom: 8px; text-align: center;">
            <div>
              <span style="font-size: 10px; color: #64748b; display: block;">Projects</span>
              <strong style="font-size: 12px; color: #2563eb;">${node.projectsCount}</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #64748b; display: block;">Vendors</span>
              <strong style="font-size: 12px; color: #0d9488;">${node.vendorsCount}</strong>
            </div>
            <div>
              <span style="font-size: 10px; color: #64748b; display: block;">Users</span>
              <strong style="font-size: 12px; color: #7c3aed;">${node.usersCount}</strong>
            </div>
          </div>

          <div style="font-size: 11px; color: #334155; margin-bottom: 6px;">
            <strong>District Admin:</strong> ${node.adminName} (${node.adminPhone})
          </div>

          <div style="font-size: 11px; color: #166534; font-weight: 700; margin-bottom: 8px;">
            Asset Valuation: ₹${(node.totalValuationINR / 10000000).toFixed(2)} Cr
          </div>

          <button id="btn-select-${node.id}" style="width: 100%; background: #4f46e5; color: #ffffff; font-weight: 800; border: none; padding: 6px 12px; border-radius: 8px; font-size: 11px; cursor: pointer;">
            Explore District Details →
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setActiveDistrictNode(node);
        if (onSelectDistrict) onSelectDistrict(node.district);
      });

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`btn-select-${node.id}`);
          if (btn) {
            btn.onclick = () => {
              setActiveDistrictNode(node);
              if (onSelectDistrict) onSelectDistrict(node.district);
            };
          }
        }, 100);
      });

      markersGroup.addLayer(marker);
    });

    // 3. User Geolocation Pin if detected
    if (userLocation) {
      const userHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-3 bg-amber-500/50 rounded-full animate-ping"></div>
          <div class="px-3 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-1 border-2 border-white">
            <span class="animate-bounce">📍</span>
            <span>Your Live GPS Pin</span>
          </div>
        </div>
      `;
      const userIcon = L.divIcon({
        html: userHtml,
        className: 'user-geo-pin',
        iconSize: [120, 36],
        iconAnchor: [60, 18]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      userMarker.bindPopup(`
        <div style="font-family: system-ui; padding: 4px;">
          <strong style="font-size: 13px; color: #b45309;">📍 Your Exact Geolocation</strong><br/>
          <span style="font-size: 11px; color: #475569;">Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}</span><br/>
          <span style="font-size: 10px; color: #15803d; font-weight: 700;">Nearest District Admin Connected ✓</span>
        </div>
      `);
      markersGroup.addLayer(userMarker);
    }

  }, [
    showProjectsLayer, 
    showVendorsLayer, 
    showUsersLayer, 
    showHeatCircles, 
    selectedStateFilter, 
    searchQuery, 
    activeDistrictNode,
    userLocation
  ]);

  // Geolocation Handler
  const handleDetectUserLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);

        // Fly Map to user location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 11, {
            duration: 1.8
          });
        }
      },
      (error) => {
        setIsLocating(false);
        setLocationError('Unable to retrieve your location. Check browser location permissions.');
        console.warn('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Fly to specific district node
  const handleSelectDistrictNode = (node: DistrictGeoData) => {
    setActiveDistrictNode(node);
    setSelectedDistrictId(node.id);
    if (onSelectDistrict) onSelectDistrict(node.district);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([node.lat, node.lng], 9, {
        duration: 1.5
      });
    }
  };

  // Calculate totals across all district map nodes
  const totalProjectsSum = DISTRICT_MAP_NODES.reduce((acc, curr) => acc + curr.projectsCount, 0);
  const totalVendorsSum = DISTRICT_MAP_NODES.reduce((acc, curr) => acc + curr.vendorsCount, 0);
  const totalUsersSum = DISTRICT_MAP_NODES.reduce((acc, curr) => acc + curr.usersCount, 0);
  const totalValuationSum = DISTRICT_MAP_NODES.reduce((acc, curr) => acc + curr.totalValuationINR, 0);

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR & QUICK METRICS */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 animate-spin" />
              <span>GIS Interactive Location Map Engine</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-400" />
              District-wise Projects &amp; Vendor Distribution
            </h2>
            <p className="text-slate-300 text-xs max-w-2xl mt-1">
              Real-time geospatial distribution of active construction, solar rooftop, MEP vendors, and registered users across Indian districts with live GPS positioning.
            </p>
          </div>

          {/* Live Geolocation Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDetectUserLocation}
              disabled={isLocating}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2 border border-amber-300/40"
            >
              <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS Location...' : '📍 Detect My Current GPS Location'}</span>
            </button>
          </div>
        </div>

        {/* Top Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-indigo-300 font-bold block">Geolocated Projects</span>
            <span className="text-xl font-black text-white flex items-center gap-1 mt-0.5">
              <Building2 className="w-4 h-4 text-indigo-400" />
              {totalProjectsSum} Active
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-teal-300 font-bold block">Vendors &amp; Dukandars</span>
            <span className="text-xl font-black text-white flex items-center gap-1 mt-0.5">
              <Store className="w-4 h-4 text-teal-400" />
              {totalVendorsSum} Hubs
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-purple-300 font-bold block">Registered Users</span>
            <span className="text-xl font-black text-white flex items-center gap-1 mt-0.5">
              <Users className="w-4 h-4 text-purple-400" />
              {totalUsersSum} Verified
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-emerald-300 font-bold block">Total Asset Valuation</span>
            <span className="text-xl font-black text-emerald-300 flex items-center gap-1 mt-0.5">
              ₹{(totalValuationSum / 10000000).toFixed(1)} Cr
            </span>
          </div>
        </div>

        {locationError && (
          <div className="mt-3 p-2 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs font-bold">
            ⚠️ {locationError}
          </div>
        )}
      </div>

      {/* MAP CONTROLS & FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* State Selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600" /> State (राज्य):
            </span>
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:outline-none text-xs"
            >
              <option value="All">All States (सभी राज्य)</option>
              {getAllStates().map(st => (
                <option key={st.state} value={st.state}>{st.state} ({st.stateHindi})</option>
              ))}
            </select>
          </div>

          {/* District Quick Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search District or State..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
            />
          </div>

          {/* Map Tiles Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                mapStyle === 'streets' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              🗺️ Standard Map
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                mapStyle === 'satellite' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              🛰️ Satellite View
            </button>
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                mapStyle === 'dark' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              🌙 Dark Map
            </button>
          </div>

          {/* Heat Overlay Toggle */}
          <button
            onClick={() => setShowHeatCircles(!showHeatCircles)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition flex items-center gap-1.5 ${
              showHeatCircles
                ? 'bg-teal-100 dark:bg-teal-950 border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-200'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-teal-600" />
            <span>District Density Bubbles ({showHeatCircles ? 'ON' : 'OFF'})</span>
          </button>

        </div>
      </div>

      {/* MAIN MAP CONTAINER AND DISTRICT DETAIL PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEAFLET CANVAS MAP CONTAINER (2 COLS) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl relative min-h-[520px] h-[520px]">
          
          <div ref={mapContainerRef} className="w-full h-full z-10"></div>

          {/* Floating Live Map Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-white text-[11px] space-y-1.5 shadow-xl pointer-events-auto max-w-xs">
            <div className="font-extrabold text-xs text-indigo-300 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>Interactive Map Legend</span>
              <span className="text-[10px] text-emerald-400 font-bold">100% Real GIS Coordinates</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Selected District Hub</span>
              <span className="font-bold text-indigo-400">Click to Fly</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Active Vendors / Dukandars</span>
              <span className="font-bold text-teal-400">Verified</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Your GPS Live Position</span>
              <span className="font-bold text-amber-400">Radar Pin</span>
            </div>
          </div>

        </div>

        {/* SELECTED DISTRICT SIDEBAR DETAILS (1 COL) */}
        <div className="space-y-4">
          
          {/* Active District Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  {activeDistrictNode.zone} • {activeDistrictNode.state}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  {activeDistrictNode.district} District
                </h3>
              </div>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-xs rounded-xl border border-emerald-300 dark:border-emerald-800">
                Active Node
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Projects</span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  {activeDistrictNode.projectsCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Vendors</span>
                <span className="text-base font-black text-teal-600 dark:text-teal-400">
                  {activeDistrictNode.vendorsCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Users</span>
                <span className="text-base font-black text-purple-600 dark:text-purple-400">
                  {activeDistrictNode.usersCount}
                </span>
              </div>
            </div>

            {/* District Admin Details */}
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 space-y-1.5">
              <span className="text-[10px] font-black uppercase text-indigo-800 dark:text-indigo-300 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Assigned District Admin Officer
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 dark:text-white">{activeDistrictNode.adminName}</span>
                <a href={`tel:${activeDistrictNode.adminPhone}`} className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline">
                  <Phone className="w-3 h-3" /> {activeDistrictNode.adminPhone}
                </a>
              </div>
            </div>

            {/* Valuation & Top Categories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>District Project Valuation:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  ₹{(activeDistrictNode.totalValuationINR / 10000000).toFixed(2)} Cr
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Top Demand Modules:</span>
                <div className="flex flex-wrap gap-1">
                  {activeDistrictNode.topCategories.map((cat, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                      ⚡ {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Verified Key Local Vendors */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-teal-600" />
                Key Empanelled Vendors in {activeDistrictNode.district}:
              </span>

              <div className="space-y-1.5">
                {activeDistrictNode.keyVendors.map((vendor, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">{vendor.name}</span>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">{vendor.role} • ★ {vendor.rating}</span>
                    </div>
                    <a href={`tel:${vendor.phone}`} className="p-1.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-lg font-bold text-[10px] flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* QUICK DISTRICT SELECTION LIST */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-indigo-600" />
                All District Hubs ({DISTRICT_MAP_NODES.length})
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Click to Fly</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {DISTRICT_MAP_NODES.map((node) => {
                const isCur = node.district === activeDistrictNode.district;
                return (
                  <button
                    key={node.id}
                    onClick={() => handleSelectDistrictNode(node)}
                    className={`w-full p-2.5 rounded-2xl text-left transition flex items-center justify-between text-xs border ${
                      isCur
                        ? 'bg-indigo-600 text-white border-indigo-600 font-black shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 font-bold'
                    }`}
                  >
                    <div>
                      <span className="block">{node.district}</span>
                      <span className={`text-[10px] ${isCur ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {node.zone} • {node.projectsCount} Projects
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      isCur ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {node.vendorsCount} Vendors
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
