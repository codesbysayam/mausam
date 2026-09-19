// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Serverless API Utility Helpers
// Keeps /api directory free of non-route files
// ====================================================================

export function sendJson(res: any, status: number, data: any, headers: Record<string, string> = {}) {
  if (typeof res.status === 'function') {
    res.status(status);
  } else {
    res.statusCode = status;
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  for (const [key, val] of Object.entries(headers)) {
    res.setHeader(key, val);
  }

  if (typeof res.json === 'function') {
    res.json(data);
  } else {
    res.end(JSON.stringify(data));
  }
}

export function parseQuery(req: any): Record<string, any> {
  if (req.query && typeof req.query === 'object') {
    return req.query;
  }

  try {
    const url = new URL(req.url || '', 'http://localhost');
    const params: Record<string, any> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  } catch {
    return {};
  }
}

export async function parseBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return new Promise((resolve) => {
    let body = '';
    req.on?.('data', (chunk: any) => {
      body += chunk;
    });
    req.on?.('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on?.('error', () => resolve({}));
  });
}
