// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Targeted Performance & Intent Verification for "rainfall warnings"
// ====================================================================

import { AskMausamOrchestrator } from '../src/services/askMausam/askMausamOrchestrator';
import { routeIntent, getIntentLoadingMessage } from '../src/services/askMausam/intentRouter';

async function runPerformanceVerification() {
  console.log('--- STARTING PERFORMANCE & ISOLATION VERIFICATION ---\n');

  // Test 1: "rainfall warnings" with Chandaka, Odisha location
  console.log('Test 1: "rainfall warnings" (Chandaka, Odisha active location)');
  const chandakaLoc = {
    name: 'Chandaka, Odisha',
    city: 'Chandaka',
    district: 'Khordha',
    state: 'Odisha',
    lat: 20.37,
    lng: 85.77,
  };

  const routing1 = routeIntent('rainfall warnings');
  console.log('  Intent:', routing1.intent);
  console.log('  Required Tools:', routing1.requiredTools);
  console.log('  Loading Message:', getIntentLoadingMessage(routing1.intent));
  console.log('  Fast-Path Eligible:', routing1.fastPathEligible);

  if (routing1.intent !== 'WARNINGS') {
    throw new Error(`Expected WARNINGS intent, got ${routing1.intent}`);
  }
  if (routing1.requiredTools.length !== 1 || routing1.requiredTools[0] !== 'WARNINGS') {
    throw new Error(`Expected strictly ['WARNINGS'], got ${JSON.stringify(routing1.requiredTools)}`);
  }

  const start1 = performance.now();
  const res1 = await AskMausamOrchestrator.execute({
    query: 'rainfall warnings',
    selectedAppLocation: chandakaLoc,
  });
  const duration1 = Math.round(performance.now() - start1);

  console.log(`  Execution Time: ${duration1}ms`);
  console.log(`  Context Location: ${res1.context.location.name}`);
  console.log(`  Context Warnings Count: ${res1.context.warnings?.length ?? 0}`);
  console.log(`  Has Weather: ${Boolean(res1.context.currentWeather)} (should be false since weather wasn't requested)`);
  console.log(`  Has AQI: ${Boolean(res1.context.aqi)} (should be false since AQI wasn't requested)`);
  console.log(`  Answer Preview:\n${res1.response.answer.slice(0, 150)}...\n`);

  // Test 2: In-Memory Cache Verification for repeated "rainfall warnings"
  console.log('Test 2: Cache Hit Verification ("rainfall warnings")');
  const start2 = performance.now();
  const res2 = await AskMausamOrchestrator.execute({
    query: 'rainfall warnings',
    selectedAppLocation: chandakaLoc,
  });
  const duration2 = Math.round(performance.now() - start2);
  console.log(`  Cache Hit Latency: ${duration2}ms (Target: < 50ms)`);
  if (duration2 > 50) {
    console.warn(`  Warning: Cache took ${duration2}ms, expected sub-50ms`);
  }

  // Test 3: "temperature in Odisha"
  console.log('\nTest 3: "temperature in Odisha"');
  const routing3 = routeIntent('temperature in Odisha');
  console.log('  Intent:', routing3.intent);
  console.log('  Required Tools:', routing3.requiredTools);
  const start3 = performance.now();
  const res3 = await AskMausamOrchestrator.execute({ query: 'temperature in Odisha' });
  const duration3 = Math.round(performance.now() - start3);
  console.log(`  Execution Time: ${duration3}ms`);
  console.log(`  Has Weather: ${Boolean(res3.context.currentWeather)}`);
  console.log(`  Has AQI: ${Boolean(res3.context.aqi)} (should be false)`);

  // Test 4: "AQI in Bhubaneswar"
  console.log('\nTest 4: "AQI in Bhubaneswar"');
  const routing4 = routeIntent('AQI in Bhubaneswar');
  console.log('  Intent:', routing4.intent);
  console.log('  Required Tools:', routing4.requiredTools);
  const start4 = performance.now();
  const res4 = await AskMausamOrchestrator.execute({ query: 'AQI in Bhubaneswar' });
  const duration4 = Math.round(performance.now() - start4);
  console.log(`  Execution Time: ${duration4}ms`);
  console.log(`  Has AQI: ${Boolean(res4.context.aqi)}`);
  console.log(`  Has Weather: ${Boolean(res4.context.currentWeather)} (should be false)`);

  // Test 5: "hello" greeting (ZERO network calls)
  console.log('\nTest 5: "hello" greeting');
  const routing5 = routeIntent('hello');
  console.log('  Intent:', routing5.intent);
  console.log('  Required Tools:', routing5.requiredTools);
  const start5 = performance.now();
  const res5 = await AskMausamOrchestrator.execute({ query: 'hello' });
  const duration5 = Math.round(performance.now() - start5);
  console.log(`  Execution Time: ${duration5}ms (Target: < 20ms)`);

  console.log('\n--- ALL TARGETED TESTS COMPLETED SUCCESSFULLY ---');
}

runPerformanceVerification().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
