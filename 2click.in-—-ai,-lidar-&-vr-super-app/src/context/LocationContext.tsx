import React, { createContext, useContext, useState, useEffect } from 'react';

export type LocationScopeMode = 'hyperlocal' | 'radius' | 'domestic' | 'global';

export interface DistanceResult {
  distanceKm: number;
  badgeLabel: string;
  locationName: string;
  isInScope: boolean;
}

export interface LocationContextType {
  scopeMode: LocationScopeMode;
  setScopeMode: (mode: LocationScopeMode) => void;
  pinCode: string;
  setPinCode: (pin: string) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  pinLocationLabel: string;
  getDistanceInfo: (itemPin?: string, itemCity?: string, isDomesticBrand?: boolean, isGlobalVendor?: boolean) => DistanceResult;
  formatDistanceBadge: (itemPin?: string, itemCity?: string) => string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// PIN Code to City/Area Mapping Dictionary for hyper-local Indian regional lookup
const PIN_DICTIONARY: Record<string, { city: string; subArea: string; baseLat: number; baseLng: number }> = {
  '273212': { city: 'Gorakhpur', subArea: 'Campierganj', baseLat: 26.9634, baseLng: 83.2751 },
  '273001': { city: 'Gorakhpur', subArea: 'Gorakhpur City', baseLat: 26.7606, baseLng: 83.3732 },
  '273015': { city: 'Gorakhpur', subArea: 'GDA Colony & AIIMS', baseLat: 26.7210, baseLng: 83.4110 },
  '272001': { city: 'Basti', subArea: 'Basti Sadar', baseLat: 26.7995, baseLng: 82.7381 },
  '274001': { city: 'Deoria', subArea: 'Deoria Town', baseLat: 26.5020, baseLng: 83.7790 },
  '560001': { city: 'Bengaluru', subArea: 'MG Road / Central', baseLat: 12.9716, baseLng: 77.5946 },
  '560066': { city: 'Bengaluru', subArea: 'Whitefield Tech Belt', baseLat: 12.9698, baseLng: 77.7500 },
  '400001': { city: 'Mumbai', subArea: 'Fort / South Mumbai', baseLat: 18.9322, baseLng: 72.8347 },
  '110001': { city: 'Delhi NCR', subArea: 'Connaught Place', baseLat: 28.6315, baseLng: 77.2167 },
  '600001': { city: 'Chennai', subArea: 'Parrys / Central', baseLat: 13.0827, baseLng: 80.2707 },
  '411001': { city: 'Pune', subArea: 'Pune Station / Camp', baseLat: 18.5204, baseLng: 73.8567 },
  '500001': { city: 'Hyderabad', subArea: 'Abids / Secunderabad', baseLat: 17.3850, baseLng: 78.4867 },
  '226001': { city: 'Lucknow', subArea: 'Hazratganj', baseLat: 26.8467, baseLng: 80.9462 },
  '302001': { city: 'Jaipur', subArea: 'Pink City Central', baseLat: 26.9124, baseLng: 75.7873 },
  '700001': { city: 'Kolkata', subArea: 'BBD Bagh Central', baseLat: 22.5726, baseLng: 88.3639 },
  '380001': { city: 'Ahmedabad', subArea: 'Lal Darwaja', baseLat: 23.0225, baseLng: 72.5714 }
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scopeMode, setScopeMode] = useState<LocationScopeMode>(() => {
    return (localStorage.getItem('2click_scope_mode') as LocationScopeMode) || 'radius';
  });

  const [pinCode, setPinCodeState] = useState<string>(() => {
    return localStorage.getItem('2click_pincode') || '226001';
  });

  const [radiusKm, setRadiusKmState] = useState<number>(() => {
    return Number(localStorage.getItem('2click_radius_km')) || 25;
  });

  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem('2click_selected_city') || 'Lucknow';
  });

  const setPinCode = (pin: string) => {
    const cleaned = pin.trim();
    setPinCodeState(cleaned);
    localStorage.setItem('2click_pincode', cleaned);

    if (PIN_DICTIONARY[cleaned]) {
      const info = PIN_DICTIONARY[cleaned];
      setSelectedCityState(info.city);
      localStorage.setItem('2click_selected_city', info.city);
    }
  };

  const setRadiusKm = (rad: number) => {
    setRadiusKmState(rad);
    localStorage.setItem('2click_radius_km', String(rad));
  };

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    localStorage.setItem('2click_selected_city', city);
  };

  const handleSetScopeMode = (mode: LocationScopeMode) => {
    setScopeMode(mode);
    localStorage.setItem('2click_scope_mode', mode);
  };

  // Derive pin code location label
  const pinDetails = PIN_DICTIONARY[pinCode];
  const pinLocationLabel = pinDetails 
    ? `${pinDetails.subArea}, ${pinDetails.city} (${pinCode})`
    : `PIN ${pinCode} (${selectedCity})`;

  // Calculate distance & scope matching for any item (vendor, shop, contractor)
  const getDistanceInfo = (
    itemPin?: string,
    itemCity?: string,
    isDomesticBrand?: boolean,
    isGlobalVendor?: boolean
  ): DistanceResult => {
    // 1. Scope mode overrides
    if (scopeMode === 'global') {
      return {
        distanceKm: isGlobalVendor ? 4500 : 120,
        badgeLabel: isGlobalVendor ? '🌐 Global Imported Brand' : '🌐 NRI / Global Scope',
        locationName: itemCity || 'International',
        isInScope: true
      };
    }

    if (scopeMode === 'domestic') {
      return {
        distanceKm: isDomesticBrand ? 450 : 220,
        badgeLabel: '🇮🇳 PAN-India Brand / National Scope',
        locationName: itemCity || 'India HQ',
        isInScope: true
      };
    }

    // 2. Compute Deterministic Distance based on PIN/City comparison
    let distance = 3.5;
    let targetArea = itemCity || 'Campierganj';

    if (itemPin && PIN_DICTIONARY[itemPin] && PIN_DICTIONARY[pinCode]) {
      const src = PIN_DICTIONARY[pinCode];
      const dest = PIN_DICTIONARY[itemPin];
      if (itemPin === pinCode) {
        distance = 1.2;
        targetArea = dest.subArea;
      } else if (src.city === dest.city) {
        distance = Math.round((Math.abs(src.baseLat - dest.baseLat) * 110 + 4.2) * 10) / 10;
        targetArea = dest.subArea;
      } else {
        distance = Math.round((Math.abs(src.baseLat - dest.baseLat) * 110 + Math.abs(src.baseLng - dest.baseLng) * 85 + 15) * 10) / 10;
        targetArea = dest.city;
      }
    } else {
      // Deterministic fallback based on character hash of names
      const hash = (itemPin || itemCity || 'Local').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const isSameCity = (itemCity || '').toLowerCase() === selectedCity.toLowerCase();
      
      if (scopeMode === 'hyperlocal') {
        distance = isSameCity ? (hash % 4) + 1.2 : (hash % 12) + 6.5;
      } else {
        distance = isSameCity ? (hash % 18) + 2.5 : (hash % 60) + 18;
      }
      distance = Math.round(distance * 10) / 10;
    }

    // Check scope limit criteria
    let isInScope = true;
    if (scopeMode === 'hyperlocal') {
      isInScope = distance <= 5;
    } else if (scopeMode === 'radius') {
      isInScope = distance <= radiusKm;
    }

    const badgeLabel = `📍 ${distance} Km away in ${targetArea}`;

    return {
      distanceKm: distance,
      badgeLabel,
      locationName: targetArea,
      isInScope
    };
  };

  const formatDistanceBadge = (itemPin?: string, itemCity?: string): string => {
    return getDistanceInfo(itemPin, itemCity).badgeLabel;
  };

  return (
    <LocationContext.Provider
      value={{
        scopeMode,
        setScopeMode: handleSetScopeMode,
        pinCode,
        setPinCode,
        radiusKm,
        setRadiusKm,
        selectedCity,
        setSelectedCity,
        pinLocationLabel,
        getDistanceInfo,
        formatDistanceBadge
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationScope = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationScope must be used within a LocationProvider');
  }
  return context;
};
