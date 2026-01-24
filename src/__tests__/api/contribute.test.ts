import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the modules before importing the route handler
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/claude', () => ({
  checkContentSafety: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 9, resetIn: 60000 })),
  RATE_LIMITS: {
    contribute: { windowMs: 60000, maxRequests: 10 },
  },
}))

describe('POST /api/contribute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never)

    const { POST } = await import('@/app/api/contribute/route')

    const request = new Request('http://localhost/api/contribute', {
      method: 'POST',
      body: JSON.stringify({ problem_id: 'test', content: 'test content' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('should return 400 if required fields are missing', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
    } as never)

    const { POST } = await import('@/app/api/contribute/route')

    const request = new Request('http://localhost/api/contribute', {
      method: 'POST',
      body: JSON.stringify({ problem_id: 'test' }), // Missing content
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe('Missing required fields')
  })

  it('should return 400 if content is too long', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
    } as never)

    const { POST } = await import('@/app/api/contribute/route')

    const longContent = 'a'.repeat(10001) // Over 10000 character limit
    const request = new Request('http://localhost/api/contribute', {
      method: 'POST',
      body: JSON.stringify({ problem_id: 'test', content: longContent }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toContain('10000 characters')
  })

  it('should return 400 if content is too short', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
    } as never)

    const { POST } = await import('@/app/api/contribute/route')

    const request = new Request('http://localhost/api/contribute', {
      method: 'POST',
      body: JSON.stringify({ problem_id: 'test', content: 'short' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toContain('at least 10 characters')
  })

  it('should return 429 when rate limited', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const { checkRateLimit } = await import('@/lib/rate-limit')

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
      },
    } as never)

    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetIn: 30000,
    })

    // Re-import to pick up new mock
    vi.resetModules()
    const { POST } = await import('@/app/api/contribute/route')

    const request = new Request('http://localhost/api/contribute', {
      method: 'POST',
      body: JSON.stringify({ problem_id: 'test', content: 'valid content here' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('30')
  })
})
