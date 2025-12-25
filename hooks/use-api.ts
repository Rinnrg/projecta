import { useState, useEffect } from 'react'

export function useCourses() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      const data = await response.json()
      
      if (response.ok) {
        setCourses(data.courses)
      } else {
        setError(data.error || 'Gagal mengambil data courses')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data')
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return { courses, loading, error, refetch: fetchCourses }
}

export function useUsers(role?: string) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const url = role ? `/api/users?role=${role}` : '/api/users'
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
      } else {
        setError(data.error || 'Gagal mengambil data users')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [role])

  return { users, loading, error, refetch: fetchUsers }
}

export function useProyek(guruId?: string) {
  const [proyek, setProyek] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProyek = async () => {
    try {
      setLoading(true)
      const url = guruId ? `/api/proyek?guruId=${guruId}` : '/api/proyek'
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setProyek(data.proyek)
      } else {
        setError(data.error || 'Gagal mengambil data proyek')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data')
      console.error('Error fetching proyek:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProyek()
  }, [guruId])

  return { proyek, loading, error, refetch: fetchProyek }
}

export function useAsesmen(courseId?: string) {
  const [asesmen, setAsesmen] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAsesmen = async () => {
    try {
      setLoading(true)
      const url = courseId ? `/api/asesmen?courseId=${courseId}` : '/api/asesmen'
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setAsesmen(data.asesmen)
      } else {
        setError(data.error || 'Gagal mengambil data asesmen')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data')
      console.error('Error fetching asesmen:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAsesmen()
  }, [courseId])

  return { asesmen, loading, error, refetch: fetchAsesmen }
}

export function useStats(userId?: string, role?: string) {
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)
      if (role) params.append('role', role)
      
      const response = await fetch(`/api/stats?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setStats(data.stats)
      } else {
        setError(data.error || 'Gagal mengambil data statistik')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId && role) {
      fetchStats()
    }
  }, [userId, role])

  return { stats, loading, error, refetch: fetchStats }
}
