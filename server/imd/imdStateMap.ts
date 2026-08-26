/**
 * Complete Indian States (28) and Union Territories (8) database
 * Maintained with official IMD state codes and representative observatory station IDs.
 */

export interface IMDStateRecord {
  id: string;
  name: string;
  code: string;
  type: 'STATE' | 'UT';
  capitalCity: string;
  representativeStationId: string;
  representativeCityForecastId: string;
  lat: number;
  lng: number;
}

export const IMD_STATES_AND_UTS: IMDStateRecord[] = [
  // 28 STATES
  { id: 'andhra-pradesh', name: 'Andhra Pradesh', code: 'AP', type: 'STATE', capitalCity: 'Amaravati', representativeStationId: '43189', representativeCityForecastId: '43189', lat: 15.9129, lng: 79.7400 },
  { id: 'arunachal-pradesh', name: 'Arunachal Pradesh', code: 'AR', type: 'STATE', capitalCity: 'Itanagar', representativeStationId: '42410', representativeCityForecastId: '42410', lat: 27.0844, lng: 93.6053 },
  { id: 'assam', name: 'Assam', code: 'AS', type: 'STATE', capitalCity: 'Dispur / Guwahati', representativeStationId: '42410', representativeCityForecastId: '42410', lat: 26.1445, lng: 91.7362 },
  { id: 'bihar', name: 'Bihar', code: 'BR', type: 'STATE', capitalCity: 'Patna', representativeStationId: '42492', representativeCityForecastId: '42492', lat: 25.5941, lng: 85.1376 },
  { id: 'chhattisgarh', name: 'Chhattisgarh', code: 'CG', type: 'STATE', capitalCity: 'Raipur', representativeStationId: '42971', representativeCityForecastId: '42971', lat: 21.2514, lng: 81.6296 },
  { id: 'goa', name: 'Goa', code: 'GA', type: 'STATE', capitalCity: 'Panaji', representativeStationId: '43192', representativeCityForecastId: '43192', lat: 15.4909, lng: 73.8278 },
  { id: 'gujarat', name: 'Gujarat', code: 'GJ', type: 'STATE', capitalCity: 'Gandhinagar / Ahmedabad', representativeStationId: '42647', representativeCityForecastId: '42647', lat: 23.2156, lng: 72.6369 },
  { id: 'haryana', name: 'Haryana', code: 'HR', type: 'STATE', capitalCity: 'Chandigarh / Ambala', representativeStationId: '42182', representativeCityForecastId: '42182', lat: 29.0588, lng: 76.0856 },
  { id: 'himachal-pradesh', name: 'Himachal Pradesh', code: 'HP', type: 'STATE', capitalCity: 'Shimla', representativeStationId: '42083', representativeCityForecastId: '42083', lat: 31.1048, lng: 77.1734 },
  { id: 'jharkhand', name: 'Jharkhand', code: 'JH', type: 'STATE', capitalCity: 'Ranchi', representativeStationId: '42701', representativeCityForecastId: '42701', lat: 23.3441, lng: 85.3096 },
  { id: 'karnataka', name: 'Karnataka', code: 'KA', type: 'STATE', capitalCity: 'Bengaluru', representativeStationId: '43295', representativeCityForecastId: '43295', lat: 12.9716, lng: 77.5946 },
  { id: 'kerala', name: 'Kerala', code: 'KL', type: 'STATE', capitalCity: 'Thiruvananthapuram', representativeStationId: '43371', representativeCityForecastId: '43371', lat: 8.5241, lng: 76.9366 },
  { id: 'madhya-pradesh', name: 'Madhya Pradesh', code: 'MP', type: 'STATE', capitalCity: 'Bhopal', representativeStationId: '42667', representativeCityForecastId: '42667', lat: 23.2599, lng: 77.4126 },
  { id: 'maharashtra', name: 'Maharashtra', code: 'MH', type: 'STATE', capitalCity: 'Mumbai', representativeStationId: '43003', representativeCityForecastId: '43003', lat: 19.0760, lng: 72.8777 },
  { id: 'manipur', name: 'Manipur', code: 'MN', type: 'STATE', capitalCity: 'Imphal', representativeStationId: '42623', representativeCityForecastId: '42623', lat: 24.8170, lng: 93.9368 },
  { id: 'meghalaya', name: 'Meghalaya', code: 'ML', type: 'STATE', capitalCity: 'Shillong', representativeStationId: '42516', representativeCityForecastId: '42516', lat: 25.5788, lng: 91.8933 },
  { id: 'mizoram', name: 'Mizoram', code: 'MZ', type: 'STATE', capitalCity: 'Aizawl', representativeStationId: '42624', representativeCityForecastId: '42624', lat: 23.7271, lng: 92.7176 },
  { id: 'nagaland', name: 'Nagaland', code: 'NL', type: 'STATE', capitalCity: 'Kohima', representativeStationId: '42527', representativeCityForecastId: '42527', lat: 25.6751, lng: 94.1086 },
  { id: 'odisha', name: 'Odisha', code: 'OR', type: 'STATE', capitalCity: 'Bhubaneswar', representativeStationId: '42971', representativeCityForecastId: '42971', lat: 20.2961, lng: 85.8245 },
  { id: 'punjab', name: 'Punjab', code: 'PB', type: 'STATE', capitalCity: 'Amritsar', representativeStationId: '42071', representativeCityForecastId: '42071', lat: 31.1471, lng: 75.3412 },
  { id: 'rajasthan', name: 'Rajasthan', code: 'RJ', type: 'STATE', capitalCity: 'Jaipur', representativeStationId: '42348', representativeCityForecastId: '42348', lat: 26.9124, lng: 75.7873 },
  { id: 'sikkim', name: 'Sikkim', code: 'SK', type: 'STATE', capitalCity: 'Gangtok', representativeStationId: '42299', representativeCityForecastId: '42299', lat: 27.3389, lng: 88.6065 },
  { id: 'tamil-nadu', name: 'Tamil Nadu', code: 'TN', type: 'STATE', capitalCity: 'Chennai', representativeStationId: '43279', representativeCityForecastId: '43279', lat: 13.0827, lng: 80.2707 },
  { id: 'telangana', name: 'Telangana', code: 'TS', type: 'STATE', capitalCity: 'Hyderabad', representativeStationId: '43128', representativeCityForecastId: '43128', lat: 17.3850, lng: 78.4867 },
  { id: 'tripura', name: 'Tripura', code: 'TR', type: 'STATE', capitalCity: 'Agartala', representativeStationId: '42724', representativeCityForecastId: '42724', lat: 23.8315, lng: 91.2868 },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh', code: 'UP', type: 'STATE', capitalCity: 'Lucknow', representativeStationId: '42369', representativeCityForecastId: '42369', lat: 26.8467, lng: 80.9462 },
  { id: 'uttarakhand', name: 'Uttarakhand', code: 'UK', type: 'STATE', capitalCity: 'Dehradun', representativeStationId: '42111', representativeCityForecastId: '42111', lat: 30.3165, lng: 78.0322 },
  { id: 'west-bengal', name: 'West Bengal', code: 'WB', type: 'STATE', capitalCity: 'Kolkata', representativeStationId: '42807', representativeCityForecastId: '42807', lat: 22.5726, lng: 88.3639 },

  // 8 UNION TERRITORIES
  { id: 'andaman-and-nicobar', name: 'Andaman and Nicobar Islands', code: 'AN', type: 'UT', capitalCity: 'Port Blair', representativeStationId: '43333', representativeCityForecastId: '43333', lat: 11.6234, lng: 92.7265 },
  { id: 'chandigarh', name: 'Chandigarh', code: 'CH', type: 'UT', capitalCity: 'Chandigarh', representativeStationId: '42182', representativeCityForecastId: '42182', lat: 30.7333, lng: 76.7794 },
  { id: 'dadra-and-nagar-haveli-and-daman-and-diu', name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DD', type: 'UT', capitalCity: 'Daman', representativeStationId: '42921', representativeCityForecastId: '42921', lat: 20.3974, lng: 72.8328 },
  { id: 'delhi', name: 'Delhi (NCT)', code: 'DL', type: 'UT', capitalCity: 'New Delhi (Safdarjung)', representativeStationId: '42182', representativeCityForecastId: '42182', lat: 28.6139, lng: 77.2090 },
  { id: 'jammu-and-kashmir', name: 'Jammu and Kashmir', code: 'JK', type: 'UT', capitalCity: 'Srinagar / Jammu', representativeStationId: '42027', representativeCityForecastId: '42027', lat: 34.0837, lng: 74.7973 },
  { id: 'ladakh', name: 'Ladakh', code: 'LA', type: 'UT', capitalCity: 'Leh', representativeStationId: '42007', representativeCityForecastId: '42007', lat: 34.1526, lng: 77.5771 },
  { id: 'lakshadweep', name: 'Lakshadweep', code: 'LD', type: 'UT', capitalCity: 'Kavaratti', representativeStationId: '43311', representativeCityForecastId: '43311', lat: 10.5667, lng: 72.6417 },
  { id: 'puducherry', name: 'Puducherry', code: 'PY', type: 'UT', capitalCity: 'Puducherry', representativeStationId: '43285', representativeCityForecastId: '43285', lat: 11.9416, lng: 79.8083 },
];

export function findIMDState(nameOrId: string): IMDStateRecord | undefined {
  const clean = (nameOrId || '').toLowerCase().trim();
  return IMD_STATES_AND_UTS.find(
    (s) =>
      s.id === clean ||
      s.name.toLowerCase() === clean ||
      s.code.toLowerCase() === clean ||
      clean.includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(clean)
  );
}
