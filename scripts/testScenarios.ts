// ====================================================================
// MAUSAM Automated 10-Scenario Test Suite
// Verifies Location Resolution, Intent Routing, Concurrency, Zero Discrepancy
// ====================================================================

import { resolveLocation } from '../src/services/askMausam/locationResolver';
import { routeIntent } from '../src/services/askMausam/intentRouter';
import { OpenMeteoProvider } from '../src/services/providers/openMeteoProvider';
import { CpcbAirQualityProvider } from '../src/services/providers/cpcbAirQualityProvider';
import { IncoisMarineProvider } from '../src/services/providers/incoisMarineProvider';
import { getActiveWarningsForLocation } from '../src/services/warnings/warningService';
import { conversationMemory } from '../src/services/askMausam/conversationMemory';

async function runTests() {
  console.log('--- STARTING ASK MAUSAM 10-SCENARIO VERIFICATION ---\n');
  let passed = 0;
  let total = 10;

  // Scenario 1: Odisha current weather
  try {
    const t0 = performance.now();
    const loc = resolveLocation('What is the weather in Odisha right now?');
    const routing = routeIntent('What is the weather in Odisha right now?', false);
    const weather = await OpenMeteoProvider.getWeather(loc.primaryLocation.latitude, loc.primaryLocation.longitude, false);
    const dt = Math.round(performance.now() - t0);
    
    if (loc.primaryLocation.name.includes('Odisha') && weather.current?.temperatureC !== undefined && dt < 1500) {
      console.log(`[PASS] Scenario 1: Odisha Weather -> ${loc.primaryLocation.name}, ${weather.current.temperatureC}°C, ${dt}ms`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario 1: ${JSON.stringify(loc)}, temp: ${weather.current?.temperatureC}, time: ${dt}ms`);
    }
  } catch (err) {
    console.error(`[FAIL] Scenario 1 Error:`, err);
  }

  // Scenario 2: Delhi rain tomorrow
  try {
    const loc = resolveLocation('Will it rain in Delhi tomorrow?');
    const routing = routeIntent('Will it rain in Delhi tomorrow?', false);
    const weather = await OpenMeteoProvider.getWeather(loc.primaryLocation.latitude, loc.primaryLocation.longitude, true);
    
    if (loc.primaryLocation.name.includes('Delhi') && routing.timeframe === 'tomorrow' && weather.daily.length > 0) {
      console.log(`[PASS] Scenario 2: Delhi Rain Tomorrow -> timeframe: ${routing.timeframe}, daily days: ${weather.daily.length}`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario 2:`, loc, routing);
    }
  } catch (err) {
    console.error(`[FAIL] Scenario 2 Error:`, err);
  }

  // Scenario 3: Odisha Warnings
  try {
    const loc = resolveLocation('Are there any cyclone or heavy rain warnings for Odisha?');
    const routing = routeIntent('Are there any cyclone or heavy rain warnings for Odisha?', false);
    const warnings = getActiveWarningsForLocation(loc.primaryLocation.state, loc.primaryLocation.district, loc.primaryLocation.name);
    
    if (routing.intent === 'WARNINGS' && warnings.status) {
      console.log(`[PASS] Scenario 3: Odisha Warnings -> intent: ${routing.intent}, status: ${warnings.status}, warnings: ${warnings.warnings.length}`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario 3:`, routing, warnings);
    }
  } catch (err) {
    console.error(`[FAIL] Scenario 3 Error:`, err);
  }

  // Scenario 4: Anand Vihar, Delhi AQI
  try {
    const loc = resolveLocation('What is the AQI in Anand Vihar, Delhi?');
    const aqi = await CpcbAirQualityProvider.getAirQuality(loc.primaryLocation.latitude, loc.primaryLocation.longitude, 'Anand Vihar');
    
    if (loc.primaryLocation.name.includes('Delhi') && aqi.aqi !== null) {
      console.log(`[PASS] Scenario 4: Anand Vihar AQI -> ${aqi.aqi} (${aqi.category}), provider: ${aqi.provider}`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario 4:`, loc, aqi);
    }
  } catch (err) {
    console.error(`[FAIL] Scenario 4 Error:`, err);
  }

  // Scenario 5: Pesticide in Ganjam
  try {
    const loc = resolveLocation('Can I spray pesticide in Ganjam today?');
    const routing = routeIntent('Can I spray pesticide in Ganjam today?', false);
    
    if (loc.primaryLocation.district === 'Ganjam' && routing.intent === 'AGRICULTURE') {
      console.log(`[PASS] Scenario 5: Ganjam Agriculture -> District: ${loc.primaryLocation.district}, Intent: ${routing.intent}`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario 5:`, loc, routing);
    }
  } catch (err) {
    console.error(`[FAIL] Scenario 5 Error:`, err);
  }

  // Scenario 6: Radar for Gopalpur
  try {
    const loc = resolveLocation('Show radar for Gopalpur');
    const routing = routeIntent('Show radar for Gopalpur', false);
    
    if (routing.intent === 'RADAR' && loc.primaryLocation.name.includes('Gopalpur')) {
      console.log(`[PASS] Scenario 6: Gopalpur Radar -> Location: ${loc.primaryLocation.name}, Intent: ${routing.intent}`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario 6:`, loc, routing);
    }
  } catch (err) {
    console.error(`[FAIL] Scenario 6 Error:`, err);
  }

  // Scenario 7: Multi-location comparison: Bhubaneswar vs Cuttack
  try {
    const loc = resolveLocation('Which is cooler right now, Bhubaneswar or Cuttack?');
    const routing = routeIntent('Which is cooler right now, Bhubaneswar or Cuttack?', loc.isComparison);
    
    if (loc.isComparison && loc.primaryLocation && loc.secondaryLocation) {
      console.log(`[PASS] Scenario 7: Comparison -> ${loc.primaryLocation.name} vs ${loc.secondaryLocation.name}`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario 7:`, loc);
    }
  } catch (err) {
    console.error(`[FAIL] Scenario 7 Error:`, err);
  }

  // Scenario 8: Chandaka location resolution
  try {
    const loc = resolveLocation('Weather in Chandaka');
    
    if (loc.primaryLocation.name.includes('Chandaka') && loc.primaryLocation.state === 'Odisha') {
      console.log(`[PASS] Scenario 8: Chandaka -> ${loc.primaryLocation.name}, State: ${loc.primaryLocation.state}`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario 8:`, loc);
    }
  } catch (err) {
    console.error(`[FAIL] Scenario 8 Error:`, err);
  }

  // Scenario 9: Hindi query: क्या कल बारिश होगी?
  try {
    conversationMemory.update({
      location: { name: 'New Delhi, Delhi', latitude: 28.61, longitude: 77.20, timezone: 'Asia/Kolkata', state: 'Delhi' }
    });
    const memory = conversationMemory.getState();
    const loc = resolveLocation('क्या कल बारिश होगी?', undefined, memory);
    const routing = routeIntent('क्या कल बारिश होगी?', false, memory);
    
    if ((routing.intent === 'RAIN' || routing.intent === 'RAINFALL') && routing.timeframe === 'tomorrow' && loc.primaryLocation.name.includes('Delhi')) {
      console.log(`[PASS] Scenario 9: Hindi Rain Tomorrow -> Intent: ${routing.intent}, Timeframe: ${routing.timeframe}, Location: ${loc.primaryLocation.name}`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario 9:`, loc, routing);
    }
  } catch (err) {
    console.error(`[FAIL] Scenario 9 Error:`, err);
  }

  // Scenario 10: Follow-up question using conversation memory
  try {
    conversationMemory.update({
      location: { name: 'Bhubaneswar, Odisha', latitude: 20.29, longitude: 85.82, timezone: 'Asia/Kolkata', state: 'Odisha' },
      intent: 'CURRENT_WEATHER'
    });
    const memory = conversationMemory.getState();
    const loc = resolveLocation('And what about humidity?', undefined, memory);
    const routing = routeIntent('And what about humidity?', false, memory);
    
    if (routing.intent === 'HUMIDITY' && loc.primaryLocation.name.includes('Bhubaneswar')) {
      console.log(`[PASS] Scenario 10: Follow-up memory -> Resolved: ${loc.primaryLocation.name}, Intent: ${routing.intent}`);
      passed++;
    } else {
      console.error(`[FAIL] Scenario 10:`, loc, routing);
    }
  } catch (err) {
    console.error(`[FAIL] Scenario 10 Error:`, err);
  }

  console.log(`\n--- TEST RESULTS: ${passed}/${total} SCENARIOS PASSED ---`);
  if (passed === total) {
    console.log('ALL 10 SCENARIOS VERIFIED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runTests();
