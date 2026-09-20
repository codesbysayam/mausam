// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// SACHET / NDMA CAP & RSS Integration Service (Unified Provider)
// Canonical re-export to enforce single source of truth across
// AI Studio server, Vercel functions, and internal provider services.
// ====================================================================

export * from '../../api/warnings.ts';
export { sachetService as default } from '../../api/warnings.ts';
