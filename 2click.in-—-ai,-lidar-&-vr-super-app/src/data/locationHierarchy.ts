export interface AreaDetail {
  areaName: string;
  pincode: string;
}

export interface SubDistrictMandal {
  name: string;
  areas: AreaDetail[];
}

export interface DistrictDetail {
  name: string;
  subDistricts: SubDistrictMandal[];
}

export interface StateDetail {
  name: string;
  districts: DistrictDetail[];
}

export const INDIAN_LOCATION_HIERARCHY: StateDetail[] = [
  {
    name: 'Uttar Pradesh (उत्तर प्रदेश)',
    districts: [
      {
        name: 'Lucknow (लखनऊ)',
        subDistricts: [
          {
            name: 'Lucknow Sadar (लखनऊ सदर)',
            areas: [
              { areaName: 'Hazratganj (हजरतगंज)', pincode: '226001' },
              { areaName: 'Gomti Nagar (गोमती नगर)', pincode: '226010' },
              { areaName: 'Alambagh (आलमबाग)', pincode: '226005' },
              { areaName: 'Indira Nagar (इंद्रा नगर)', pincode: '226016' },
              { areaName: 'Mahanagar (महानगर)', pincode: '226006' },
              { areaName: 'Charbagh (चारबाग)', pincode: '226004' },
              { areaName: 'Chowk (चौक)', pincode: '226003' },
              { areaName: 'Jankipuram (जानकीपुरम)', pincode: '226021' }
            ]
          },
          {
            name: 'Sarojini Nagar (सरोजिनी नगर)',
            areas: [
              { areaName: 'Amausi Airport Zone (अमौसी एयरपोर्ट)', pincode: '226009' },
              { areaName: 'Transport Nagar (ट्रांसपोर्ट नगर)', pincode: '226012' },
              { areaName: 'Ashiyana (आशियाना)', pincode: '226012' },
              { areaName: 'Kanpur Road Housing Board', pincode: '226023' }
            ]
          },
          {
            name: 'Bakshi Ka Talab - BKT (बख्शी का तालाब)',
            areas: [
              { areaName: 'BKT Market (बीकेटी मार्केट)', pincode: '226201' },
              { areaName: 'Sitapur Road Knowledge Park', pincode: '226021' },
              { areaName: 'IIM Road Hub', pincode: '226013' }
            ]
          },
          {
            name: 'Mohanlalganj (मोहनलालगंज)',
            areas: [
              { areaName: 'SGI Industrial Hub', pincode: '226301' },
              { areaName: 'PGI Raebareli Road', pincode: '226014' }
            ]
          },
          {
            name: 'Malihabad (मलिहाबाद)',
            areas: [
              { areaName: 'Malihabad Town (मलिहाबाद कस्बा)', pincode: '226102' },
              { areaName: 'Rahimabad (रहीमाबाद)', pincode: '226103' }
            ]
          }
        ]
      },
      {
        name: 'Gorakhpur (गोरखपुर)',
        subDistricts: [
          {
            name: 'Campierganj (कैंपियरगंज)',
            areas: [
              { areaName: 'Campierganj Main Market', pincode: '273212' },
              { areaName: 'Rawatganj Bazar', pincode: '273212' },
              { areaName: 'Peppeganj', pincode: '273165' }
            ]
          },
          {
            name: 'Gorakhpur Sadar (गोरखपुर सदर)',
            areas: [
              { areaName: 'Golghar / Town Hall', pincode: '273001' },
              { areaName: 'GDA Colony & AIIMS Zone', pincode: '273015' },
              { areaName: 'Medical College Zone', pincode: '273013' },
              { areaName: 'Taramandal Lake View', pincode: '273010' }
            ]
          },
          {
            name: 'Bansgaon (बांसगांव)',
            areas: [
              { areaName: 'Bansgaon Market', pincode: '273403' },
              { areaName: 'Khajani Bazar', pincode: '273211' }
            ]
          }
        ]
      },
      {
        name: 'Varanasi (वाराणसी)',
        subDistricts: [
          {
            name: 'Varanasi Sadar (वाराणसी सदर)',
            areas: [
              { areaName: 'Godowlia Ghat Zone', pincode: '221001' },
              { areaName: 'Lanka BHU Campus', pincode: '221005' },
              { areaName: 'Shivpur Industrial Area', pincode: '221003' }
            ]
          },
          {
            name: 'Pindra (पिंडरा)',
            areas: [
              { areaName: 'Babatpur Airport Belt', pincode: '221006' }
            ]
          }
        ]
      },
      {
        name: 'Kanpur Nagar (कानपुर नगर)',
        subDistricts: [
          {
            name: 'Kanpur Sadar (कानपुर सदर)',
            areas: [
              { areaName: 'Mall Road / Civil Lines', pincode: '208001' },
              { areaName: 'Kidwai Nagar', pincode: '208011' },
              { areaName: 'Panki Industrial Corridor', pincode: '208020' }
            ]
          }
        ]
      },
      {
        name: 'Prayagraj - Allahabad (प्रयागराज)',
        subDistricts: [
          {
            name: 'Prayagraj Sadar (प्रयागराज सदर)',
            areas: [
              { areaName: 'Civil Lines', pincode: '211001' },
              { areaName: 'Katra Commercial Hub', pincode: '211002' },
              { areaName: 'Naini Industrial Zone', pincode: '211008' }
            ]
          }
        ]
      },
      {
        name: 'Basti (बस्ती)',
        subDistricts: [
          {
            name: 'Basti Sadar (बस्ती सदर)',
            areas: [
              { areaName: 'Basti Town Central', pincode: '272001' },
              { areaName: 'Harraiya Market', pincode: '272155' }
            ]
          }
        ]
      },
      {
        name: 'Deoria (देवरिया)',
        subDistricts: [
          {
            name: 'Deoria Sadar (देवरिया सदर)',
            areas: [
              { areaName: 'Deoria Main Market', pincode: '274001' },
              { areaName: 'Salempur', pincode: '274509' }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Karnataka (कर्नाटक)',
    districts: [
      {
        name: 'Bengaluru Urban',
        subDistricts: [
          {
            name: 'Bengaluru East',
            areas: [
              { areaName: 'Whitefield Tech Belt', pincode: '560066' },
              { areaName: 'MG Road / Indiranagar', pincode: '560001' }
            ]
          },
          {
            name: 'Bengaluru South',
            areas: [
              { areaName: 'Jayanagar / JP Nagar', pincode: '560011' },
              { areaName: 'Electronic City Phase 1', pincode: '560100' }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Maharashtra (महाराष्ट्र)',
    districts: [
      {
        name: 'Mumbai Suburban',
        subDistricts: [
          {
            name: 'Andheri Tehsil',
            areas: [
              { areaName: 'Andheri West Link Road', pincode: '400058' },
              { areaName: 'Bandra West Hill Road', pincode: '400050' },
              { areaName: 'BKC Financial Center', pincode: '400051' }
            ]
          }
        ]
      },
      {
        name: 'Pune',
        subDistricts: [
          {
            name: 'Haveli Tehsil',
            areas: [
              { areaName: 'Hinjewadi IT Park', pincode: '411057' },
              { areaName: 'Wakad / Baner', pincode: '411045' },
              { areaName: 'Shivajinagar Central', pincode: '411005' }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Delhi NCR (दिल्ली एनसीआर)',
    districts: [
      {
        name: 'New Delhi',
        subDistricts: [
          {
            name: 'Central Delhi',
            areas: [
              { areaName: 'Connaught Place Central', pincode: '110001' },
              { areaName: 'Okhla Industrial Estate', pincode: '110020' },
              { areaName: 'Dwarka Sector 21', pincode: '110075' }
            ]
          }
        ]
      },
      {
        name: 'Gurugram',
        subDistricts: [
          {
            name: 'Gurugram North / Cyber City',
            areas: [
              { areaName: 'DLF Cyber City Phase 3', pincode: '122002' },
              { areaName: 'Golf Course Road Hub', pincode: '122003' }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Bihar (बिहार)',
    districts: [
      {
        name: 'Patna (पटना)',
        subDistricts: [
          {
            name: 'Patna Sadar',
            areas: [
              { areaName: 'Boring Road Commercial', pincode: '800001' },
              { areaName: 'Kankarbagh Colony', pincode: '800020' }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Nepal (नेपाल - Cross-Border Zone)',
    districts: [
      {
        name: 'Kathmandu (काठमाडौं)',
        subDistricts: [
          {
            name: 'Kathmandu Central Metro',
            areas: [
              { areaName: 'New Road Commercial Hub', pincode: '44600' },
              { areaName: 'Thamel Tourist Zone', pincode: '44600' },
              { areaName: 'Baneshwor Corporate Hub', pincode: '44600' }
            ]
          }
        ]
      },
      {
        name: 'Birgunj (वीरगञ्ज)',
        subDistricts: [
          {
            name: 'Parsa District Customs Corridor',
            areas: [
              { areaName: 'Dry Port Customs Zone', pincode: '44300' },
              { areaName: 'Adarsh Nagar Main Market', pincode: '44300' }
            ]
          }
        ]
      },
      {
        name: 'Bhairahawa / Siddharthanagar (भैरहवा)',
        subDistricts: [
          {
            name: 'Rupandehi Lumbini Border Hub',
            areas: [
              { areaName: 'Siddharthanagar Industrial Zone', pincode: '32900' },
              { areaName: 'Sunoali Customs Transit Point', pincode: '32900' }
            ]
          }
        ]
      },
      {
        name: 'Pokhara (पोखरा)',
        subDistricts: [
          {
            name: 'Kaski District Valley',
            areas: [
              { areaName: 'Lakeside Commercial Hub', pincode: '33700' },
              { areaName: 'Mahendrapool Market', pincode: '33700' }
            ]
          }
        ]
      }
    ]
  }
];
