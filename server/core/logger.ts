// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Structured Production Logger
// Sanitizes and redacts secrets (API keys, tokens) automatically
// ====================================================================

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  provider?: string;
  message: string;
  meta?: Record<string, any>;
}

// Redact known sensitive keys and query parameters
function sanitizeMeta(meta: any): any {
  if (!meta || typeof meta !== 'object') return meta;
  if (Array.isArray(meta)) return meta.map(sanitizeMeta);

  const sanitized: Record<string, any> = {};
  const secretKeyPatterns = /key|token|secret|auth|password|credential/i;

  for (const [k, v] of Object.entries(meta)) {
    if (secretKeyPatterns.test(k) && typeof v === 'string') {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      sanitized[k] = sanitizeMeta(v);
    } else if (typeof v === 'string') {
      // Redact potential api keys in URLs
      sanitized[k] = v.replace(/(apikey|api_key|token|key|appid)=([^&]+)/gi, '$1=[REDACTED]');
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

export class Logger {
  private category: string;

  constructor(category: string) {
    this.category = category;
  }

  private log(level: LogLevel, message: string, provider?: string, meta?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category: this.category,
      provider,
      message,
      meta: meta ? sanitizeMeta(meta) : undefined,
    };

    const out = JSON.stringify(entry);
    if (level === 'ERROR') {
      console.error(out);
    } else if (level === 'WARN') {
      console.warn(out);
    } else {
      console.log(out);
    }
  }

  public debug(message: string, provider?: string, meta?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'DEBUG') {
      this.log('DEBUG', message, provider, meta);
    }
  }

  public info(message: string, provider?: string, meta?: Record<string, any>) {
    this.log('INFO', message, provider, meta);
  }

  public warn(message: string, provider?: string, meta?: Record<string, any>) {
    this.log('WARN', message, provider, meta);
  }

  public error(message: string, provider?: string, meta?: Record<string, any>) {
    this.log('ERROR', message, provider, meta);
  }
}

export const createLogger = (category: string) => new Logger(category);
export const logger = new Logger('App');
