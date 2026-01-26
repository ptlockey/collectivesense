/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or Upstash for distributed rate limiting
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (e.g., IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed and remaining quota
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = identifier

  const entry = rateLimitStore.get(key)

  // If no entry or expired, create new one
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      success: true,
      remaining: config.limit - 1,
      resetIn: config.windowSeconds,
    }
  }

  // If within limit, increment and allow
  if (entry.count < config.limit) {
    entry.count++
    return {
      success: true,
      remaining: config.limit - entry.count,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    }
  }

  // Rate limited
  return {
    success: false,
    remaining: 0,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  }
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header (for proxies) or falls back to a default
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  // Fallback - in production behind a proxy, this should not happen
  return 'unknown-client'
}

// Pre-configured rate limiters for different endpoints
export const rateLimits = {
  // Contribute: 20 contributions per minute per user
  contribute: { limit: 20, windowSeconds: 60 },
  // Synthesise: 5 per minute (expensive operation)
  synthesise: { limit: 5, windowSeconds: 60 },
  // Auth: 10 attempts per minute (prevent brute force)
  auth: { limit: 10, windowSeconds: 60 },
  // General API: 100 requests per minute
  general: { limit: 100, windowSeconds: 60 },
}
