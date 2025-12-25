// API Cache Utility untuk Next.js
// Membantu optimasi performa dengan caching responses

interface CacheEntry {
  data: any
  timestamp: number
  etag: string
}

class APICache {
  private cache: Map<string, CacheEntry>
  private defaultTTL: number // Time to live in milliseconds

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // Default 5 menit
    this.cache = new Map()
    this.defaultTTL = defaultTTL
  }

  // Generate cache key dari request
  generateKey(path: string, params?: Record<string, any>): string {
    if (!params) return path
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    return `${path}?${sortedParams}`
  }

  // Generate ETag untuk cache validation
  generateETag(data: any): string {
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `W/"${hash.toString(36)}"`
  }

  // Simpan data ke cache
  set(key: string, data: any, ttl?: number): void {
    const etag = this.generateETag(data)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      etag,
    })

    // Auto cleanup setelah TTL
    const cacheTTL = ttl || this.defaultTTL
    setTimeout(() => {
      this.cache.delete(key)
    }, cacheTTL)
  }

  // Ambil data dari cache
  get(key: string, ttl?: number): CacheEntry | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const cacheTTL = ttl || this.defaultTTL
    const age = Date.now() - entry.timestamp

    // Cek apakah cache masih valid
    if (age > cacheTTL) {
      this.cache.delete(key)
      return null
    }

    return entry
  }

  // Hapus cache tertentu
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Hapus semua cache
  clear(): void {
    this.cache.clear()
  }

  // Hapus cache berdasarkan pattern
  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  // Cek apakah cache valid berdasarkan ETag
  isValid(key: string, etag: string): boolean {
    const entry = this.cache.get(key)
    return entry?.etag === etag
  }
}

// Singleton instance
export const apiCache = new APICache()

// Helper untuk Next.js API Routes
export function createCachedResponse(data: any, options?: {
  ttl?: number
  revalidate?: number
}) {
  const headers = new Headers()
  const etag = apiCache.generateETag(data)
  
  headers.set('ETag', etag)
  headers.set('Cache-Control', `public, max-age=${options?.revalidate || 300}, stale-while-revalidate=60`)
  
  return {
    data,
    headers,
    etag,
  }
}

// Wrapper untuk Next.js API handler dengan cache
export function withCache(
  handler: (req: Request) => Promise<Response>,
  options?: { ttl?: number; revalidate?: number }
) {
  return async (req: Request) => {
    const url = new URL(req.url)
    const cacheKey = apiCache.generateKey(url.pathname, Object.fromEntries(url.searchParams))
    
    // Cek If-None-Match header untuk conditional request
    const ifNoneMatch = req.headers.get('If-None-Match')
    
    // Coba ambil dari cache
    const cached = apiCache.get(cacheKey, options?.ttl)
    
    if (cached) {
      // Jika ETag match, return 304 Not Modified
      if (ifNoneMatch === cached.etag) {
        return new Response(null, {
          status: 304,
          headers: {
            'ETag': cached.etag,
            'Cache-Control': `public, max-age=${options?.revalidate || 300}`,
          },
        })
      }
      
      // Return cached data
      return Response.json(cached.data, {
        headers: {
          'ETag': cached.etag,
          'Cache-Control': `public, max-age=${options?.revalidate || 300}, stale-while-revalidate=60`,
          'X-Cache': 'HIT',
        },
      })
    }
    
    // Execute handler dan cache hasil
    const response = await handler(req)
    
    if (response.ok) {
      const data = await response.json()
      const { etag } = createCachedResponse(data, options)
      apiCache.set(cacheKey, data, options?.ttl)
      
      return Response.json(data, {
        headers: {
          'ETag': etag,
          'Cache-Control': `public, max-age=${options?.revalidate || 300}, stale-while-revalidate=60`,
          'X-Cache': 'MISS',
        },
      })
    }
    
    return response
  }
}

export default apiCache
