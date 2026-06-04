import { useState, useEffect } from 'react'
import { getSettings } from '../services/api'

let cached = null

export function useSettings() {
  const [settings, setSettings] = useState(cached || {})
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    if (cached) { setSettings(cached); setLoading(false); return; }
    getSettings()
      .then(r => { cached = r.data; setSettings(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { settings, loading }
}
