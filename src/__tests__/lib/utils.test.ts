import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  formatDate,
  formatRelativeTime,
  truncate,
  getStatusLabel,
  getProgressPercentage,
} from '@/lib/utils'

describe('cn (class name merge)', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('handles arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('handles objects', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })
})

describe('formatDate', () => {
  it('formats a date string correctly', () => {
    const result = formatDate('2024-01-15T10:30:00Z')
    expect(result).toBe('15 Jan 2024')
  })

  it('formats a Date object correctly', () => {
    const date = new Date('2024-06-20T15:00:00Z')
    const result = formatDate(date)
    expect(result).toBe('20 Jun 2024')
  })

  it('handles different months', () => {
    expect(formatDate('2024-12-25')).toBe('25 Dec 2024')
    expect(formatDate('2024-03-01')).toBe('1 Mar 2024')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for very recent times', () => {
    const result = formatRelativeTime('2024-06-15T11:59:45Z')
    expect(result).toBe('just now')
  })

  it('returns minutes for times within an hour', () => {
    const result = formatRelativeTime('2024-06-15T11:30:00Z')
    expect(result).toBe('30m ago')
  })

  it('returns hours for times within a day', () => {
    const result = formatRelativeTime('2024-06-15T06:00:00Z')
    expect(result).toBe('6h ago')
  })

  it('returns days for times within a week', () => {
    const result = formatRelativeTime('2024-06-12T12:00:00Z')
    expect(result).toBe('3d ago')
  })

  it('returns formatted date for older times', () => {
    const result = formatRelativeTime('2024-05-01T12:00:00Z')
    expect(result).toBe('1 May 2024')
  })
})

describe('truncate', () => {
  it('returns the original string if shorter than limit', () => {
    expect(truncate('Hello', 10)).toBe('Hello')
  })

  it('truncates with ellipsis if longer than limit', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...')
  })

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello')
  })

  it('handles edge case of length 3', () => {
    expect(truncate('Hello', 3)).toBe('...')
  })

  it('handles empty string', () => {
    expect(truncate('', 10)).toBe('')
  })
})

describe('getStatusLabel', () => {
  it('returns correct label for gathering', () => {
    expect(getStatusLabel('gathering')).toBe('Gathering thoughts')
  })

  it('returns correct label for synthesising', () => {
    expect(getStatusLabel('synthesising')).toBe('Creating synthesis')
  })

  it('returns correct label for complete', () => {
    expect(getStatusLabel('complete')).toBe('Synthesis ready')
  })

  it('returns correct label for closed', () => {
    expect(getStatusLabel('closed')).toBe('Closed')
  })

  it('returns the status itself for unknown statuses', () => {
    expect(getStatusLabel('unknown')).toBe('unknown')
  })
})

describe('getProgressPercentage', () => {
  it('calculates percentage correctly', () => {
    expect(getProgressPercentage(5, 10)).toBe(50)
    expect(getProgressPercentage(3, 10)).toBe(30)
    expect(getProgressPercentage(7, 10)).toBe(70)
  })

  it('caps at 100%', () => {
    expect(getProgressPercentage(15, 10)).toBe(100)
    expect(getProgressPercentage(100, 10)).toBe(100)
  })

  it('handles 0 count', () => {
    expect(getProgressPercentage(0, 10)).toBe(0)
  })

  it('rounds to nearest integer', () => {
    expect(getProgressPercentage(1, 3)).toBe(33)
    expect(getProgressPercentage(2, 3)).toBe(67)
  })
})
