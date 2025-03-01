import { afterAll, afterEach, vi } from 'vitest'

process.env.TZ = 'UTC'

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

afterAll(() => {
  vi.restoreAllMocks()
})
