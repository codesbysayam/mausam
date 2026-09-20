// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Consolidated AI Intelligence Gateway (/api/ai)
// Multiplexed via mode query parameter: ask
// Graceful fallback, no 429 retry loops, secrets protected server-side
// ====================================================================

import { aiService } from '../src/server/services/aiService.ts';
import { sendJson, parseQuery, parseBody } from '../src/server/apiUtils.ts';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, {});
  }

  const query = parseQuery(req);
  const mode = (query.mode || 'ask').toString().toLowerCase();

  try {
    const body = await parseBody(req);
    const params = {
      ...query,
      ...body,
    };

    switch (mode) {
      case 'ask':
      default: {
        const result = await aiService.ask(params);
        return sendJson(res, 200, result);
      }
    }
  } catch (err: any) {
    return sendJson(res, 200, {
      response: 'Meteorological AI analysis is operating under local telemetry advisory.',
      source: 'Mausam Automated Fallback',
      groundingSources: [],
      modeUsed: 'offline',
      error: err?.message,
    });
  }
}
