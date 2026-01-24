import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('allows requests under the limit', () => {
    const config = { windowMs: 60000, maxRequests: 5 }

    const result1 = checkRateLimit('test-user-1', config)
    expect(result1.allowed).toBe(true)
    expect(result1.remaining).toBe(4)

    const result2 = checkRateLimit('test-user-1', config)
    expect(result2.allowed).toBe(true)
    expect(result2.remaining).toBe(3)
  })

  it('blocks requests over the limit', () => {
    const config = { windowMs: 60000, maxRequests: 2 }

    checkRateLimit('test-user-2', config)
    checkRateLimit('test-user-2', config)

    const result = checkRateLimit('test-user-2', config)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('resets after the time window', () => {
    const config = { windowMs: 60000, maxRequests: 2 }

    checkRateLimit('test-user-3', config)
    checkRateLimit('test-user-3', config)

    // Move time forward past the window
    vi.advanceTimersByTime(60001)

    const result = checkRateLimit('test-user-3', config)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('tracks different identifiers separately', () => {
    const config = { windowMs: 60000, maxRequests: 2 }

    checkRateLimit('user-a', config)
    checkRateLimit('user-a', config)

    const resultA = checkRateLimit('user-a', config)
    expect(resultA.allowed).toBe(false)

    const resultB = checkRateLimit('user-b', config)
    expect(resultB.allowed).toBe(true)
  })

  it('returns correct resetIn time', () => {
    const config = { windowMs: 60000, maxRequests: 2 }

    const result = checkRateLimit('test-user-4', config)
    expect(result.resetIn).toBe(60000)

    vi.advanceTimersByTime(30000)

    checkRateLimit('test-user-4', config)
    const result2 = checkRateLimit('test-user-4', config)
    expect(result2.resetIn).toBeLessThanOrEqual(30000)
  })
})

describe('RATE_LIMITS', () => {
  it('has contribute limits defined', () => {
    expect(RATE_LIMITS.contribute).toBeDefined()
    expect(RATE_LIMITS.contribute.windowMs).toBeGreaterThan(0)
    expect(RATE_LIMITS.contribute.maxRequests).toBeGreaterThan(0)
  })

  it('has synthesise limits defined', () => {
    expect(RATE_LIMITS.synthesise).toBeDefined()
    expect(RATE_LIMITS.synthesise.windowMs).toBeGreaterThan(0)
    expect(RATE_LIMITS.synthesise.maxRequests).toBeGreaterThan(0)
  })

  it('has submit limits defined', () => {
    expect(RATE_LIMITS.submit).toBeDefined()
    expect(RATE_LIMITS.submit.windowMs).toBeGreaterThan(0)
    expect(RATE_LIMITS.submit.maxRequests).toBeGreaterThan(0)
  })
})
