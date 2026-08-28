export interface MeteorologicalPublication {
  id: string;
  title: string;
  category: 'National Weather Observation' | 'Sub-Divisional Report' | 'Climatological Study' | 'Environmental Registry' | 'Agricultural Meteorology' | 'Severe Weather & Cyclones' | 'Scientific Monograph';
  type: 'PDF Bulletin' | 'Technical Monograph' | 'Government Publication' | 'GKMS Bulletin' | 'Research Article' | 'Scientific Monograph';
  date: string;
  size: string;
  issuingAuthority: string;
  documentNumber: string;
  author: string;
  abstract: string;
  keywords: string[];
  sections: {
    title: string;
    content: string;
    tableData?: {
      headers: string[];
      rows: (string | number)[][];
    };
  }[];
  synopticSummary?: string;
  recommendations?: string[];
}

export const OFFICIAL_PUBLICATIONS: MeteorologicalPublication[] = [
  {
    id: 'dwr-all-india-20260826',
    title: 'Daily Weather Report (All-India Summary)',
    category: 'National Weather Observation',
    type: 'PDF Bulletin',
    date: '26 August 2026',
    size: '2.4 MB',
    issuingAuthority: 'National Weather Forecasting Centre, IMD New Delhi',
    documentNumber: 'IMD-NWFC-DWR-2026/08/26-01',
    author: 'National Synoptic Weather Analysis Group',
    abstract: 'Comprehensive 24-hour synoptic meteorological analysis covering monsoon trough positioning, off-shore troughs, low-pressure cyclonic vortex distributions, maximum and minimum temperature anomalies, and 24-hour recorded rainfall across all 36 meteorological subdivisions of India.',
    keywords: ['Monsoon Trough', 'Synoptic Analysis', 'Subdivision Rainfall', 'Temperature Anomalies', 'Nowcast Verification'],
    synopticSummary: 'The monsoon trough at mean sea level passes through Bikaner, Sikar, Gwalior, Sidhi, Ambikapur, and Balasore, extending southeastwards into east-central Bay of Bengal. A cyclonic circulation lies over north Odisha and adjoining Gangetic West Bengal extending up to 5.8 km above mean sea level tilting southwestwards with height.',
    recommendations: [
      'Fishermen along North Odisha, West Bengal, and Andhra coasts are advised not to venture into deep sea due to squally winds reaching 45-55 kmph gusting to 65 kmph.',
      'Disaster management authorities in Konkan & Goa and Coastal Karnataka should maintain vigilance against localized flash flooding in low-lying riparian corridors.',
      'Aviation operators over Central and Eastern sectors should anticipate moderate to severe turbulence in convective cumulonimbus clusters above FL250.'
    ],
    sections: [
      {
        title: '1. Synoptic Weather Features & Regional Troughs',
        content: 'The low pressure area over Northwest Bay of Bengal and adjoining coastal areas of West Bengal and Odisha has persisted and organized. Associated cyclonic circulation extends up to mid-tropospheric levels. An off-shore trough at mean sea level runs from South Gujarat coast to Kerala coast. Under its influence, widespread rainfall with isolated heavy to very heavy falls is very likely over Konkan, Goa, Ghat areas of Madhya Maharashtra, and Coastal Karnataka over the next 48 hours.'
      },
      {
        title: '2. 24-Hour Subdivision Rainfall & Meteorological Distribution',
        content: 'Rainfall occurred at most places over Konkan & Goa, Coastal Karnataka, Kerala, Odisha, and Gangetic West Bengal; at many places over Chhattisgarh, Vidarbha, and Assam & Meghalaya; and at isolated places over West Rajasthan, Haryana, and Tamil Nadu.',
        tableData: {
          headers: ['Meteorological Sub-Division', 'Actual Rain (mm)', 'Normal Rain (mm)', 'Departure (%)', 'Category'],
          rows: [
            ['Coastal Karnataka', '84.2', '32.1', '+162%', 'Excess'],
            ['Konkan & Goa', '96.5', '41.0', '+135%', 'Excess'],
            ['Odisha', '54.0', '18.4', '+193%', 'Large Excess'],
            ['Gangetic West Bengal', '38.2', '14.6', '+161%', 'Excess'],
            ['Telangana', '24.5', '12.0', '+104%', 'Excess'],
            ['East Madhya Pradesh', '19.8', '15.2', '+30%', 'Normal'],
            ['West Rajasthan', '2.1', '5.4', '-61%', 'Deficient']
          ]
        }
      },
      {
        title: '3. Extreme Recorded Precipitation (Stations Recording ≥ 7 cm in 24h)',
        content: 'Matheran (Konkan) 18 cm, Agumbe (Coastal Karnataka) 16 cm, Puri (Odisha) 14 cm, Mahabaleshwar (Maharashtra) 13 cm, Cherrapunji (Meghalaya) 12 cm, Digha (Gangetic West Bengal) 11 cm, Panjim (Goa) 9 cm, Honavar (Karnataka) 8 cm.'
      }
    ]
  },
  {
    id: 'district-bulletin-regional',
    title: 'District Meteorological Bulletin — Regional Observatory Analysis',
    category: 'Sub-Divisional Report',
    type: 'PDF Bulletin',
    date: '26 August 2026',
    size: '1.1 MB',
    issuingAuthority: 'Regional Meteorological Centre & State Meteorological Observatory',
    documentNumber: 'IMD-RMC-DMB-2026/08/26-DIST',
    author: 'State Meteorological & Aviation Services Division',
    abstract: 'High-resolution district-level surface and upper-air diagnostic bulletin containing hourly Automatic Weather Station (AWS) telemetry, boundary layer thermodynamic indices, soil moisture status, and 72-hour quantitative precipitation forecasts (QPF).',
    keywords: ['District Nowcast', 'Surface AWS', 'Thermodynamic Indices', 'QPF', 'Local Forecast'],
    synopticSummary: 'Atmospheric boundary layer over the urban domain exhibits elevated equivalent potential temperature (Theta-E > 352 K) and high convective available potential energy (CAPE > 1850 J/kg), indicative of strong local convective storm triggering potential during late afternoon heating cycles.',
    recommendations: [
      'Municipal drainage teams should ensure storm water conduits are desilted ahead of the forecast convective shower peaks.',
      'Public is advised to avoid sheltering under isolated trees or metal structures during active lightning and thunder alerts.'
    ],
    sections: [
      {
        title: '1. Local Station Atmospheric Diagnostics',
        content: 'Diagnostic parameters derived from thermodynamic soundings and surface Doppler Weather Radar reflectivity gradients over the 50km radius.'
      },
      {
        title: '2. Micro-Scale Surface Observations',
        content: 'Continuous measurements recorded by the Primary Regional Surface Observatory:',
        tableData: {
          headers: ['Diagnostic Parameter', 'Recorded Value', 'Climatological Normal', 'Unit'],
          rows: [
            ['Barometric Pressure (MSL)', '1004.2', '1006.5', 'hPa'],
            ['Dew Point Temperature', '24.6', '23.8', '°C'],
            ['Lifting Condensation Level (LCL)', '740', '820', 'meters AGL'],
            ['Convective Inhibition (CIN)', '22', '45', 'J/kg'],
            ['Precipitable Water Content (PWC)', '58.4', '52.0', 'mm']
          ]
        }
      }
    ]
  },
  {
    id: 'monsoon-seasonal-distribution-2026',
    title: 'Southwest Monsoon Seasonal Rainfall Distribution Report',
    category: 'Climatological Study',
    type: 'Technical Monograph',
    date: 'August 2026',
    size: '8.6 MB',
    issuingAuthority: 'Climate Research & Services (CRS), IMD Pune',
    documentNumber: 'IMD-CRS-MON-2026/SPEC-04',
    author: 'Dr. R. K. Jenamani, Climate Diagnostics Research Group',
    abstract: 'An empirical and dynamic evaluation of the 2026 Southwest Monsoon across the four homogeneous regions of India (Northwest India, Central India, South Peninsula, and East & Northeast India), examining El Niño-Southern Oscillation (ENSO) neutral conditions and positive Indian Ocean Dipole (IOD) teleconnections.',
    keywords: ['Monsoon 2026', 'ENSO Neutral', 'Positive IOD', 'Intra-seasonal Oscillation', 'MJO Phase'],
    synopticSummary: 'Cumulative country-wide rainfall from 1st June to 25th August 2026 stands at 712.4 mm against the Long Period Average (LPA) of 678.2 mm, registering an overall departure of +5.0% (categorized as Normal to Above Normal). Central India and South Peninsula recorded surplus precipitation driven by quasi-biweekly oscillatory vortex passages.',
    recommendations: [
      'State Irrigation and Dam Management boards should regulate reservoir outflow schedules based on multi-model ensemble 15-day extended range forecasts.',
      'Agricultural planning for late Kharif cropping should prioritize water-harvesting check dams across rain-shadow sub-districts.'
    ],
    sections: [
      {
        title: '1. Macro-Scale Oceanic & Atmospheric Boundary Forcings',
        content: 'Sea Surface Temperature (SST) anomalies over equatorial Pacific Ocean reflect persistent ENSO-neutral state with Oceanic Niño Index (ONI) hovering between -0.2°C and +0.1°C. Concurrently, the Indian Ocean Dipole index turned moderately positive (+0.42°C), creating favorable baroclinic instability and enhanced moisture convergence over the Arabian Sea and Bay of Bengal.'
      },
      {
        title: '2. Homogeneous Region-wise Performance Analysis',
        content: 'Detailed seasonal cumulative totals and standard deviations compared against the 1971–2020 climatological normal period:',
        tableData: {
          headers: ['Homogeneous Region', 'Actual Rainfall (mm)', 'LPA Normal (mm)', 'Departure (%)', 'Status'],
          rows: [
            ['Central India', '842.6', '748.0', '+12.6%', 'Above Normal'],
            ['South Peninsula', '568.2', '498.4', '+14.0%', 'Above Normal'],
            ['Northwest India', '442.1', '458.0', '-3.5%', 'Normal'],
            ['East & Northeast India', '885.3', '1012.5', '-12.6%', 'Below Normal'],
            ['All-India Total', '712.4', '678.2', '+5.0%', 'Normal']
          ]
        }
      }
    ]
  },
  {
    id: 'cpcb-air-quality-annual-2026',
    title: 'National Ambient Air Quality Annual Summary (CPCB / SAFAR)',
    category: 'Environmental Registry',
    type: 'Government Publication',
    date: '2025-2026',
    size: '14.2 MB',
    issuingAuthority: 'Central Pollution Control Board & Ministry of Environment, Forest and Climate Change',
    documentNumber: 'CPCB-AQM-PUB-2026-VOL8',
    author: 'Continuous Ambient Air Quality Monitoring (CAAQMS) Technical Committee',
    abstract: 'Comprehensive nationwide assessment of ambient criteria pollutants (PM2.5, PM10, NO2, SO2, CO, O3, NH3, and Lead) across 412 continuous monitoring stations in 184 cities under the National Clean Air Programme (NCAP).',
    keywords: ['Air Quality Index', 'PM2.5 Speciation', 'NCAP Targets', 'Urban Dispersion', 'Boundary Layer Inversion'],
    synopticSummary: 'Annual average PM2.5 concentrations in Tier-1 cities demonstrated a 9.2% reduction compared to the 2019 baseline, attributed to industrial fuel transitions, mechanical road sweeping, and green buffer development.',
    recommendations: [
      'Intensify dust mitigation protocols on transport corridors when planetary boundary layer height collapses below 400 meters during winter nights.',
      'Promote public adoption of N95 filtration during prolonged periods when PM2.5 levels cross 150 µg/m³.'
    ],
    sections: [
      {
        title: '1. National Clean Air Monitoring Framework',
        content: 'The CAAQMS network operates high-precision beta attenuation monitors (BAM) and chemiluminescence analyzers calibrated in accordance with USEPA and IS 5182 guidelines.'
      },
      {
        title: '2. Major Megacity AQI Performance Summary (Annual Metrics)',
        content: 'Comparative air quality indices across metropolitan clusters:',
        tableData: {
          headers: ['Metropolitan Center', 'Mean AQI', 'Dominant Pollutant', 'Good/Satisfactory Days', 'Severe Days'],
          rows: [
            ['National Capital Territory (Delhi)', '198', 'PM2.5', '142 Days', '28 Days'],
            ['Greater Mumbai (Maharashtra)', '118', 'PM10', '224 Days', '4 Days'],
            ['Kolkata (West Bengal)', '134', 'PM2.5', '198 Days', '9 Days'],
            ['Bengaluru (Karnataka)', '68', 'PM10', '312 Days', '0 Days'],
            ['Chennai (Tamil Nadu)', '74', 'PM2.5', '298 Days', '1 Day'],
            ['Bhubaneswar (Odisha)', '88', 'PM10', '276 Days', '2 Days']
          ]
        }
      }
    ]
  },
  {
    id: 'agromet-advisory-gkms-odisha-india',
    title: 'State Agrometeorological Advisory Bulletin (Odisha / All-India)',
    category: 'Agricultural Meteorology',
    type: 'GKMS Bulletin',
    date: '24 August 2026',
    size: '1.8 MB',
    issuingAuthority: 'Gramin Krishi Mausam Sewa (GKMS) Division, IMD & ICAR',
    documentNumber: 'GKMS-AGMET-2026/08/W4',
    author: 'Agro-Advisory Expert Committee, Odisha University of Agriculture & Technology (OUAT)',
    abstract: 'District-wise agro-meteorological advisories for Kharif paddy, pulses, sugarcane, and horticultural plantations based on medium-range numerical weather prediction forecasts and soil moisture profiles.',
    keywords: ['Kharif Paddy', 'Soil Moisture', 'Pest Surveillance', 'Water Management', 'GKMS Advisory'],
    synopticSummary: 'Moderate to heavy rainfall forecast over the next 5 days across coastal and western districts is highly conducive for transplanting and tillering stages in medium and long-duration rice cultivars. Farmers are advised to withhold chemical spraying during rain spells.',
    recommendations: [
      'Provide drainage channels in pulse and vegetable fields to prevent root asphyxiation from standing water.',
      'Maintain 3–5 cm water depth in transplanted paddy fields; do not apply urea or top-dressing fertilizers when rain is imminent.'
    ],
    sections: [
      {
        title: '1. Crop-Specific Stage & Weather Action Matrix',
        content: 'Operational guidance for major regional agrarian zones based on precipitation probability and humidity forecasts:',
        tableData: {
          headers: ['Crop & Phenological Stage', 'Agro-Meteorological Risk', 'Recommended Action / Remedial Measure'],
          rows: [
            ['Rice (Tillering stage)', 'Stem Borer & Leaf Folder', 'Install pheromone traps @ 8/ha; apply Cartap Hydrochloride only after rain ceases.'],
            ['Cotton (Square formation)', 'Waterlogging / Root Rot', 'Drain surplus runoff immediately; spray 2% DAP solution to prevent square drop.'],
            ['Groundnut (Pegging stage)', 'Tikka Leaf Spot', 'Ensure loose soil texture for peg penetration; avoid heavy irrigation.'],
            ['Vegetables (Flowering)', 'Fruit Borer & Powdery Mildew', 'Provide trellis support against gusty winds; harvest mature fruits before downpours.']
          ]
        }
      }
    ]
  },
  {
    id: 'tropical-cyclone-climatology-nio',
    title: 'Climatological Study of Tropical Cyclones in North Indian Ocean (1990–2025)',
    category: 'Scientific Monograph',
    type: 'Research Article',
    date: 'July 2026',
    size: '6.3 MB',
    issuingAuthority: 'Cyclone Warning Division, Regional Specialized Meteorological Centre (RSMC) New Delhi',
    documentNumber: 'IMD-RSMC-MONOGRAPH-CYCLONE-2026',
    author: 'Dr. M. Mohapatra, Cyclone Forecasting & Warning Directorate',
    abstract: 'Comprehensive spatial-temporal frequency and intensity trend analysis of tropical cyclonic disturbances in the Bay of Bengal and Arabian Sea over a 35-year climatological baseline. Evaluates rapid intensification (RI) dynamics driven by upper ocean heat content (UOHC > 80 kJ/cm²).',
    keywords: ['Tropical Cyclones', 'Bay of Bengal', 'Arabian Sea', 'Rapid Intensification', 'Storm Surge Modeling'],
    synopticSummary: 'Long-term decadal records reveal a statistically significant increase in post-monsoon intense cyclonic storms in the Arabian Sea (+34%), while Bay of Bengal landfall tracking errors have decreased by 62% due to high-resolution WRF and HWRF ensemble modeling.',
    recommendations: [
      'Coastal infrastructure development must adopt design wind speeds of 220 kmph for High Hazard Zones (Zone-I) along the East Coast.',
      'Automated Coastal Tide Gauges and Wave Rider Buoys must be integrated with dynamic ADCIRC storm surge warning systems.'
    ],
    sections: [
      {
        title: '1. Decadal Frequency of Severe Cyclonic Storms (SCS+)',
        content: 'Historical tracking of Cyclonic Storms, Very Severe Cyclonic Storms (VSCS), and Extremely Severe Cyclonic Storms (ESCS):',
        tableData: {
          headers: ['Decadal Epoch', 'Bay of Bengal Systems', 'Arabian Sea Systems', 'Landfalling Storms', 'Mean 24h Track Error (km)'],
          rows: [
            ['1991–2000', '48', '14', '39', '142 km'],
            ['2001–2010', '42', '16', '36', '98 km'],
            ['2011–2020', '44', '22', '38', '64 km'],
            ['2021–2025 (5-yr)', '23', '12', '21', '41 km']
          ]
        }
      }
    ]
  },
  {
    id: 'doppler-radar-nowcasting-techniques',
    title: 'Doppler Weather Radar (DWR) Nowcasting Methodologies for Convective Storms',
    category: 'Scientific Monograph',
    type: 'Research Article',
    date: 'June 2026',
    size: '5.1 MB',
    issuingAuthority: 'Radar Operations & Hydrometeorology Directorate, IMD',
    documentNumber: 'IMD-RADAR-TECH-2026/02',
    author: 'Dr. S. C. Bhan & DWR Technical Operations Team',
    abstract: 'Operational integration of S-band and C-band dual-polarization Doppler Weather Radars for automated cell tracking (TITAN algorithm), Vertically Integrated Liquid (VIL) density estimation, and severe microburst early warning.',
    keywords: ['Doppler Radar', 'Dual-Pol', 'TITAN Algorithm', 'VIL Density', 'Severe Thunderstorm Nowcast'],
    synopticSummary: 'Dual-polarization radar parameters (Z_DR, K_DP, and Rho_HV) enable precise discrimination between hail cores and heavy liquid precipitation, increasing nowcast lead-time for urban severe convective events to 45–90 minutes.',
    recommendations: [
      'Aviation towers should integrate DWR radial velocity shear alerts into Terminal Aerodrome Forecast (TAF) automated feeds.'
    ],
    sections: [
      {
        title: '1. Polarimetric Hydrometeor Classification Matrix',
        content: 'Radar signature criteria for real-time convective storm categorization:',
        tableData: {
          headers: ['Hydrometeor Class', 'Reflectivity Z_H (dBZ)', 'Diff. Reflectivity Z_DR (dB)', 'Co-pol Correlation Rho_HV'],
          rows: [
            ['Heavy Rain', '45 to 55', '+1.8 to +3.5', '> 0.97'],
            ['Hail / Rain Mixture', '55 to 68', '-0.5 to +1.2', '0.88 to 0.94'],
            ['Graupel', '35 to 45', '-0.2 to +0.8', '0.94 to 0.98'],
            ['Biological Scatterers', '< 25', '> +3.0', '< 0.80']
          ]
        }
      }
    ]
  },
  {
    id: 'urban-heat-island-indian-megacities',
    title: 'Urban Heat Island (UHI) Microclimates in Indian Megacities: Satellite & AWS Analysis',
    category: 'Climatological Study',
    type: 'Research Article',
    date: 'May 2026',
    size: '4.7 MB',
    issuingAuthority: 'Centre for Climate Change Research (CCCR), IITM & IMD',
    documentNumber: 'CCCR-UHI-STUDY-2026/03',
    author: 'Urban Climatology Collaborative Group',
    abstract: 'High-resolution MODIS and INSAT-3D thermal infrared land surface temperature (LST) mapping coupled with dense urban micro-AWS networks across Delhi, Mumbai, Bengaluru, Hyderabad, and Kolkata.',
    keywords: ['Urban Heat Island', 'Land Surface Temperature', 'MODIS', 'INSAT-3D', 'Cool Roof Initiatives'],
    synopticSummary: 'Nocturnal urban-rural thermal gradients reached peak differentials of up to 5.4°C in dense commercial concrete corridors, exacerbating heat stress index and nighttime cooling delays during pre-monsoon heatwaves.',
    recommendations: [
      'Municipal planning commissions should mandate cool reflective roofs and urban green canopy expansion in high thermal inertia zones.'
    ],
    sections: [
      {
        title: '1. Urban-Rural Temperature Differentials (UHI Peak Intensity)',
        content: 'Observed nocturnal surface and 2m air temperature deviations across megacity transects:',
        tableData: {
          headers: ['City Domain', 'Core Urban LST (°C)', 'Peri-Urban LST (°C)', 'Max Nocturnal UHI (°C)', 'Vegetation Cover (%)'],
          rows: [
            ['Delhi (Connaught Place vs Asola)', '36.8', '31.4', '+5.4°C', '14.2%'],
            ['Mumbai (Bandra vs Sanjay Gandhi NP)', '34.2', '29.8', '+4.4°C', '21.0%'],
            ['Bengaluru (CBD vs Hesaraghatta)', '31.5', '27.6', '+3.9°C', '18.6%'],
            ['Kolkata (BBD Bagh vs Vedic Village)', '35.1', '30.9', '+4.2°C', '11.8%']
          ]
        }
      }
    ]
  },
  {
    id: 'ncmrwf-unified-model-nwp',
    title: 'NCMRWF Global & Regional Numerical Weather Prediction (Unified Model)',
    category: 'Scientific Monograph',
    type: 'Research Article',
    date: 'August 2026',
    size: '7.8 MB',
    issuingAuthority: 'National Centre for Medium Range Weather Forecasting (NCMRWF), MoES',
    documentNumber: 'NCMRWF-NWP-UM-2026/04',
    author: 'Dr. E. N. Rajagopal & NCMRWF Modeling Consortium',
    abstract: 'Operational configuration and assimilation framework of the NCMRWF Unified Model (NCUM-G 12km) and regional high-resolution convection-permitting model (NCUM-R 4km). Incorporates 4D-Var hybrid ensemble-variational data assimilation of satellite radiances, radar reflectivity profiles, and surface AWS observations over the Indian monsoon domain.',
    keywords: ['NCMRWF', 'Unified Model', '4D-Var Assimilation', 'Global Ensemble (NEPS)', 'Monsoon Prediction'],
    synopticSummary: 'The NCUM global model operating at 12km horizontal grid with 70 vertical levels demonstrates superior skill in capturing tropical cyclogenesis timing in the Bay of Bengal with 120-hour forecast lead times, and accurately predicting monsoon active-break cycles.',
    recommendations: [
      'Operational forecasters should cross-verify precipitation spatial footprints using the 33-member NCMRWF Ensemble Prediction System (NEPS).',
      'Hydrological dam gate operators should utilize NCUM 7-day river basin runoff products for proactive flood routing.'
    ],
    sections: [
      {
        title: '1. Model Architecture & Grid Resolution Specs',
        content: 'Technical specifications for NCMRWF operational deterministic and ensemble assimilation pipelines:',
        tableData: {
          headers: ['Model System', 'Horizontal Resolution', 'Vertical Levels', 'Assimilation Cycle', 'Forecast Horizon'],
          rows: [
            ['NCUM-Global Deterministic', '12 km Global Grid', '70 Levels (Surface to 80 km)', '00Z & 12Z 4D-Var', '10 Days (240 Hours)'],
            ['NCUM-Regional (South Asia)', '4 km Domain Grid', '70 Levels (Convection-Permitting)', '00Z, 06Z, 12Z, 18Z 3D-Var', '3 Days (72 Hours)'],
            ['NEPS Ensemble Prediction', '12 km Global Grid', '70 Levels (33 Ensemble Members)', '00Z & 12Z Ensemble 4D-En-Var', '10 Days Probabilistic']
          ]
        }
      },
      {
        title: '2. Satellite Radiance Data Assimilation Pipeline',
        content: 'Over 2.5 million observations assimilated per 6-hour cycle including INSAT-3D/3DR sounders, CrIS, ATMS, IASI, and MetOp-SG microwave radiance streams.'
      }
    ]
  },
  {
    id: 'isro-mosdac-satellite-meteorology',
    title: 'ISRO MOSDAC Earth Observation & INSAT-3D/3DR Multi-Spectral Radiometry',
    category: 'National Weather Observation',
    type: 'Technical Monograph',
    date: 'August 2026',
    size: '9.2 MB',
    issuingAuthority: 'Space Applications Centre (SAC), ISRO & MOSDAC Data Centre',
    documentNumber: 'ISRO-SAC-MOSDAC-2026/MET-02',
    author: 'Satellite Meteorology Division, Space Applications Centre Ahmedabad',
    abstract: 'Comprehensive operational telemetry protocol of the Meteorological & Oceanographic Satellite Data Archival Centre (MOSDAC). Integrates INSAT-3D/3DR geostationary Imager & Sounder channels, Oceansat-3 scatterometer ocean surface wind vectors, and Megha-Tropiques microwave payloads for real-time cloud-top temperature, convective precipitation estimation, and atmospheric motion vectors (AMVs).',
    keywords: ['ISRO MOSDAC', 'INSAT-3D/3DR', 'Cloud Top Temperature', 'Ocean Surface Winds', 'Hydro-Estimator (HEM)'],
    synopticSummary: 'Continuous 15-minute rapid-scan thermal infrared (TIR-1: 10.8 µm, TIR-2: 12.0 µm, WV: 6.8 µm) imagery from INSAT-3DR provides high-cadence tracking of deep convective clusters, cloud-burst signatures, and tropical depression vorticity centers across the Indian subcontinent.',
    recommendations: [
      'Disaster response cells should monitor the ISRO Hydro-Estimator Precipitation product (HEM) for instantaneous rain-rate spikes exceeding 50 mm/hr.',
      'Maritime ports and coast guard fleets should access Oceansat-3 scatterometer wind fields for gale warning verification.'
    ],
    sections: [
      {
        title: '1. INSAT-3D/3DR Geostationary Sensor Channels',
        content: 'Spectral waveband channels utilized for subcontinental atmospheric telemetry and nowcasting:',
        tableData: {
          headers: ['Spectral Channel', 'Wavelength Band', 'Spatial Resolution', 'Meteorological Application'],
          rows: [
            ['Visible (VIS)', '0.55 – 0.75 µm', '1.0 km at Nadir', 'Daytime Cloud Albedo, Fog & Snow Extent'],
            ['Shortwave Infrared (SWIR)', '1.55 – 1.70 µm', '1.0 km at Nadir', 'Cloud Phase Discrimination (Ice vs Water)'],
            ['Water Vapour (WV)', '6.50 – 7.10 µm', '8.0 km at Nadir', 'Upper Tropospheric Moisture & Jet Streams'],
            ['Thermal Infrared-1 (TIR-1)', '10.3 – 11.3 µm', '4.0 km at Nadir', 'Cloud Top Temperature (CTT) & Height'],
            ['Thermal Infrared-2 (TIR-2)', '11.5 – 12.5 µm', '4.0 km at Nadir', 'Split-Window Low-Level Moisture & SST']
          ]
        }
      }
    ]
  },
  {
    id: 'aero-allergen-pollen-surveillance',
    title: 'National Aero-Allergen & Bio-Atmospheric Pollen Surveillance Protocol',
    category: 'Environmental Registry',
    type: 'Scientific Monograph',
    date: 'July 2026',
    size: '5.8 MB',
    issuingAuthority: 'National Institute of Environmental Health & IMD Aerobiology Unit',
    documentNumber: 'NIEH-IMD-POLLEN-2026/01',
    author: 'Dr. P. Sharma & Inter-Agency Aerobiology Taskforce',
    abstract: 'Standardized national methodology for Burkard volumetric spore trap sampling, optical microscopy spore counting, and real-time laser-induced fluorescence (LIF) aero-allergen monitoring. Maps seasonal allergen calendars for Poaceae grasses, Parthenium hysterophorus, Betula, and fungal spores across Indian biogeographic zones.',
    keywords: ['Pollen Count', 'Aero-Allergens', 'Burkard Spore Trap', 'Allergic Rhinitis', 'Parthenium Index'],
    synopticSummary: 'High relative humidity combined with post-rain convective downdrafts significantly triggers osmotic pollen rupture (sub-pollen particles < 2.5 µm), resulting in heightened bronchial hyper-responsiveness and thunderstorm asthma episodes.',
    recommendations: [
      'Sensitive individuals with allergic rhinitis or asthma should limit early morning outdoor activity when pollen counts exceed 50 grains/m³.',
      'Urban horticulture departments should phase out high-pollen allergenic ornamental trees in residential park belts.'
    ],
    sections: [
      {
        title: '1. National Pollen Risk Index Classification',
        content: 'Clinical threshold guidelines developed for the National Aero-Allergen Surveillance Network:',
        tableData: {
          headers: ['Risk Category', 'Grass/Weed Pollen (grains/m³)', 'Tree Pollen (grains/m³)', 'Fungal Spores (spores/m³)', 'Clinical Advisory'],
          rows: [
            ['Low (Green)', '0 – 15', '0 – 30', '0 – 1,000', 'Safe for all individuals; no preventive medication required.'],
            ['Moderate (Yellow)', '16 – 45', '31 – 80', '1,001 – 5,000', 'Mild symptoms in highly sensitive individuals.'],
            ['High (Orange)', '46 – 90', '81 – 150', '5,001 – 15,000', 'Moderate to severe symptoms; keep windows closed.'],
            ['Very High (Red)', '> 90', '> 150', '> 15,000', 'Severe symptoms likely; use HEPA filters and carry rescue inhaler.']
          ]
        }
      }
    ]
  },
  {
    id: 'wmo-instrument-calibration-ndma-standards',
    title: 'WMO-No. 8 Meteorological Instrument Calibration & NDMA Hazard Classification Standards',
    category: 'Scientific Monograph',
    type: 'Government Publication',
    date: 'August 2026',
    size: '11.4 MB',
    issuingAuthority: 'Instruments Division IMD, World Meteorological Organization & NDMA',
    documentNumber: 'WMO-IMD-NDMA-STD-2026/8-REV',
    author: 'National Meteorological Standardization Committee',
    abstract: 'Official operating standards adhering to WMO-No. 8 (Guide to Meteorological Instruments and Methods of Observation) and National Disaster Management Authority (NDMA) multi-hazard early warning protocols. Establishes traceabilities for platinum resistance thermometer (PRT) sensors, tipping-bucket rain gauges, ultrasonic anemometers, and color-coded alert matrix thresholds.',
    keywords: ['WMO-No. 8', 'NDMA Guidelines', 'Calibration Traceability', 'Color-Coded Alerts', 'Early Warning Systems'],
    synopticSummary: 'All automated surface observations on MAUSAM conform to WMO ISO/IEC 17025 accredited metrological traceability chains, ensuring ±0.1°C temperature precision, ±2% relative humidity accuracy, and standardized 4-tier NDMA disaster alert color definitions.',
    recommendations: [
      'State Disaster Management Authorities (SDMAs) must align incident response systems with the 4-stage color code (Green/Yellow/Orange/Red).',
      'All automated telemetry AWS stations must undergo bi-annual onsite recalibration against national transfer standards.'
    ],
    sections: [
      {
        title: '1. Standard 4-Stage National Hazard Warning Matrix',
        content: 'Institutional NDMA and IMD color alert definitions and required administrative preparedness levels:',
        tableData: {
          headers: ['Alert Level', 'Color Code', 'Operational Meaning', 'Recommended Response Action'],
          rows: [
            ['Stage 1 (Normal)', 'Green (No Warning)', 'No adverse weather expected; normal routine.', 'No action required; standard observation monitoring.'],
            ['Stage 2 (Watch)', 'Yellow (Be Updated)', 'Severely unsettled weather possible over 48–72 hours.', 'Stay informed through official departmental bulletins.'],
            ['Stage 3 (Alert)', 'Orange (Be Prepared)', 'High risk of severe weather impacting life & transport.', 'Prepare emergency supplies; protect crops & livestock.'],
            ['Stage 4 (Warning)', 'Red (Take Action)', 'Extremely severe weather imminent; risk to life & infrastructure.', 'Execute disaster evacuation plans; take immediate shelter.']
          ]
        }
      }
    ]
  }
];
