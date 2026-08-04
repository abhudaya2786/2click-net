// Indian Administrative Hierarchy: State (राज्य) -> Mandal / Division (मंडल) -> District (ज़िला)

export interface MandalDivision {
  name: string;        // English name e.g. "Gorakhpur Mandal"
  nameHindi: string;   // Hindi name e.g. "गोरखपुर मंडल"
  districts: string[]; // Districts e.g. ["Gorakhpur", "Deoria", "Maharajganj", "Kushinagar"]
}

export interface StateHierarchy {
  state: string;       // State name e.g. "Uttar Pradesh"
  stateHindi: string;  // e.g. "उत्तर प्रदेश"
  mandals: MandalDivision[];
}

export const INDIAN_ADMIN_HIERARCHY: StateHierarchy[] = [
  {
    state: 'Uttar Pradesh',
    stateHindi: 'उत्तर प्रदेश',
    mandals: [
      {
        name: 'Gorakhpur Mandal',
        nameHindi: 'गोरखपुर मंडल',
        districts: ['Gorakhpur', 'Deoria', 'Maharajganj', 'Kushinagar']
      },
      {
        name: 'Lucknow Mandal',
        nameHindi: 'लखनऊ मंडल',
        districts: ['Lucknow', 'Unnao', 'Rae Bareli', 'Sitapur', 'Hardoi', 'Lakhimpur Kheri']
      },
      {
        name: 'Varanasi Mandal',
        nameHindi: 'वाराणसी मंडल',
        districts: ['Varanasi', 'Chandauli', 'Ghazipur', 'Jaunpur']
      },
      {
        name: 'Ayodhya Mandal',
        nameHindi: 'अयोध्या मंडल',
        districts: ['Ayodhya', 'Sultanpur', 'Amethi', 'Ambedkar Nagar', 'Barabanki']
      },
      {
        name: 'Devipatan Mandal',
        nameHindi: 'देवीपाटन मंडल',
        districts: ['Gonda', 'Bahraich', 'Shravasti', 'Balrampur']
      },
      {
        name: 'Prayagraj Mandal',
        nameHindi: 'प्रयागराज मंडल',
        districts: ['Prayagraj', 'Kaushambi', 'Fatehpur', 'Pratapgarh']
      },
      {
        name: 'Kanpur Mandal',
        nameHindi: 'कानपुर मंडल',
        districts: ['Kanpur Nagar', 'Kanpur Dehat', 'Etawah', 'Farrukhabad', 'Kannauj', 'Auraiya']
      },
      {
        name: 'Agra Mandal',
        nameHindi: 'आगरा मंडल',
        districts: ['Agra', 'Mathura', 'Firozabad', 'Mainpuri']
      },
      {
        name: 'Meerut Mandal',
        nameHindi: 'मेरठ मंडल',
        districts: ['Meerut', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Bulandshahr', 'Baghpat', 'Hapur']
      },
      {
        name: 'Bareilly Mandal',
        nameHindi: 'बरेली मंडल',
        districts: ['Bareilly', 'Badaun', 'Pilibhit', 'Shahjahanpur']
      }
    ]
  },
  {
    state: 'Delhi NCR',
    stateHindi: 'दिल्ली एनसीआर',
    mandals: [
      {
        name: 'Central Delhi Division',
        nameHindi: 'सेंट्रल दिल्ली मंडल',
        districts: ['Central Delhi', 'New Delhi', 'North Delhi', 'South Delhi']
      },
      {
        name: 'NCR Satellite Division',
        nameHindi: 'एनसीआर सैटेलाइट मंडल',
        districts: ['Gurugram', 'Noida / Greater Noida', 'Faridabad', 'Ghaziabad']
      }
    ]
  },
  {
    state: 'Maharashtra',
    stateHindi: 'महाराष्ट्र',
    mandals: [
      {
        name: 'Konkan / Mumbai Division',
        nameHindi: 'कोंकण / मुंबई मंडल',
        districts: ['Mumbai City', 'Mumbai Suburban', 'Thane', 'Palghar', 'Raigad']
      },
      {
        name: 'Pune Division',
        nameHindi: 'पुणे मंडल',
        districts: ['Pune', 'Satara', 'Solapur', 'Kolhapur', 'Sangli']
      },
      {
        name: 'Nashik Division',
        nameHindi: 'नासिक मंडल',
        districts: ['Nashik', 'Ahmednagar', 'Jalgaon', 'Dhule']
      },
      {
        name: 'Nagpur Division',
        nameHindi: 'नागपुर मंडल',
        districts: ['Nagpur', 'Wardha', 'Bhandara', 'Chandrapur']
      }
    ]
  },
  {
    state: 'Bihar',
    stateHindi: 'बिहार',
    mandals: [
      {
        name: 'Patna Mandal',
        nameHindi: 'पटना मंडल',
        districts: ['Patna', 'Nalanda', 'Bhojpur', 'Buxar', 'Rohtas', 'Kaimur']
      },
      {
        name: 'Tirhut Mandal',
        nameHindi: 'तिरहुत मंडल',
        districts: ['Muzaffarpur', 'West Champaran', 'East Champaran', 'Sitamarhi', 'Vaishali', 'Sheohar']
      },
      {
        name: 'Mithila / Darbhanga Mandal',
        nameHindi: 'मिथिला / दरभंगा मंडल',
        districts: ['Darbhanga', 'Madhubani', 'Samastipur']
      },
      {
        name: 'Magadh Mandal',
        nameHindi: 'मगध मंडल',
        districts: ['Gaya', 'Nawada', 'Aurangabad', 'Jehanabad', 'Arwal']
      }
    ]
  },
  {
    state: 'Karnataka',
    stateHindi: 'कर्नाटक',
    mandals: [
      {
        name: 'Bengaluru Division',
        nameHindi: 'बेंगलुरु मंडल',
        districts: ['Bengaluru Urban', 'Bengaluru Rural', 'Ramanagara', 'Kolar', 'Tumakuru']
      },
      {
        name: 'Mysuru Division',
        nameHindi: 'मैसूरु मंडल',
        districts: ['Mysuru', 'Mandya', 'Hassan', 'Dakshina Kannada (Mangaluru)']
      }
    ]
  },
  {
    state: 'Telangana',
    stateHindi: 'तेलंगाना',
    mandals: [
      {
        name: 'Hyderabad Central Division',
        nameHindi: 'हैदराबाद मंडल',
        districts: ['Hyderabad', 'Ranga Reddy', 'Medchal-Malkajgiri', 'Sangareddy']
      }
    ]
  },
  {
    state: 'West Bengal',
    stateHindi: 'पश्चिम बंगाल',
    mandals: [
      {
        name: 'Presidency / Kolkata Division',
        nameHindi: 'कोलकाता / प्रेसीडेंसी मंडल',
        districts: ['Kolkata', 'Howrah', 'North 24 Parganas', 'South 24 Parganas']
      }
    ]
  },
  {
    state: 'Rajasthan',
    stateHindi: 'राजस्थान',
    mandals: [
      {
        name: 'Jaipur Division',
        nameHindi: 'जयपुर मंडल',
        districts: ['Jaipur', 'Alwar', 'Dausa', 'Sikar', 'Jhunjhunu']
      },
      {
        name: 'Jodhpur Division',
        nameHindi: 'जोधपुर मंडल',
        districts: ['Jodhpur', 'Pali', 'Barmer', 'Jaisalmer']
      }
    ]
  },
  {
    state: 'Gujarat',
    stateHindi: 'गुजरात',
    mandals: [
      {
        name: 'Ahmedabad Division',
        nameHindi: 'अहमदाबाद मंडल',
        districts: ['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Rajkot']
      }
    ]
  },
  {
    state: 'Madhya Pradesh',
    stateHindi: 'मध्य प्रदेश',
    mandals: [
      {
        name: 'Bhopal Division',
        nameHindi: 'भोपाल मंडल',
        districts: ['Bhopal', 'Raisen', 'Rajgarh', 'Sehore', 'Vidisha']
      },
      {
        name: 'Indore Division',
        nameHindi: 'इंदौर मंडल',
        districts: ['Indore', 'Dhar', 'Jhabua', 'Khargone', 'Ujjain']
      }
    ]
  },
  {
    state: 'Punjab & Haryana',
    stateHindi: 'पंजाब और हरियाणा',
    mandals: [
      {
        name: 'Chandigarh Capital Division',
        nameHindi: 'चंडीगढ़ मंडल',
        districts: ['Chandigarh', 'SAS Nagar (Mohali)', 'Panchkula', 'Ludhiana', 'Amritsar']
      }
    ]
  }
];

export function getAllStates(): { state: string; stateHindi: string }[] {
  return INDIAN_ADMIN_HIERARCHY.map(s => ({ state: s.state, stateHindi: s.stateHindi }));
}

export function getMandalsForState(stateName: string): MandalDivision[] {
  const match = INDIAN_ADMIN_HIERARCHY.find(s => s.state === stateName);
  return match ? match.mandals : [];
}

export function getDistrictsForMandal(stateName: string, mandalName: string): string[] {
  const stateObj = INDIAN_ADMIN_HIERARCHY.find(s => s.state === stateName);
  if (!stateObj) return [];
  const mandalObj = stateObj.mandals.find(m => m.name === mandalName);
  return mandalObj ? mandalObj.districts : [];
}

export function getAllDistrictsFlattened(): string[] {
  const districtsSet = new Set<string>();
  INDIAN_ADMIN_HIERARCHY.forEach(st => {
    st.mandals.forEach(m => {
      m.districts.forEach(d => districtsSet.add(d));
    });
  });
  return Array.from(districtsSet);
}
