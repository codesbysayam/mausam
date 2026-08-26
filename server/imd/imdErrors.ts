/**
 * IMD Error definitions and standard response formats
 */

export type IMDErrorCode =
  | 'IMD_TIMEOUT'
  | 'IMD_ACCESS_RESTRICTED'
  | 'IMD_RATE_LIMITED'
  | 'IMD_SERVER_ERROR'
  | 'IMD_INVALID_STATION'
  | 'IMD_NETWORK_ERROR'
  | 'IMD_DATA_UNAVAILABLE'
  | 'IMD_REQUEST_FAILED';

export interface IMDErrorPayload {
  code: IMDErrorCode;
  message: string;
  statusCode?: number;
  retryable: boolean;
  endpoint?: string;
}

export function classifyIMDError(status?: number, error?: any, endpoint?: string): IMDErrorPayload {
  if (status === 401 || status === 403) {
    return {
      code: 'IMD_ACCESS_RESTRICTED',
      message: 'IMD data unavailable — official authentication credentials required (contact IMD nodal officer).',
      statusCode: status,
      retryable: false,
      endpoint,
    };
  }

  if (status === 429) {
    return {
      code: 'IMD_RATE_LIMITED',
      message: 'IMD API rate limit reached. Polling backoff activated.',
      statusCode: 429,
      retryable: true,
      endpoint,
    };
  }

  if (status && status >= 500) {
    return {
      code: 'IMD_SERVER_ERROR',
      message: `IMD upstream server returned HTTP ${status}. Retrying via backoff.`,
      statusCode: status,
      retryable: true,
      endpoint,
    };
  }

  if (error?.name === 'AbortError' || /timeout/i.test(error?.message || '')) {
    return {
      code: 'IMD_TIMEOUT',
      message: 'IMD request timed out (10s threshold reached).',
      retryable: true,
      endpoint,
    };
  }

  return {
    code: 'IMD_REQUEST_FAILED',
    message: error?.message || 'Unable to retrieve data from official IMD endpoint.',
    statusCode: status,
    retryable: false,
    endpoint,
  };
}
