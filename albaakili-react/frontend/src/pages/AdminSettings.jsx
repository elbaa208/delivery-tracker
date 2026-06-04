import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getSettings, updateSettings } from '../services/api'
import Loader from '../components/Loader'

const fields = [
  { key: 'storeName', label: 'اسم المتجر', type: 'text' },
  { key: 'whatsapp', label: 'رقم واتساب (بدون +)', type: 'text', placeholder: '212600000000' },
  { key: 'phone', label: 'رقم الهاتف', type: 'text' },
  { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
  { key: 'address', label: 'العنوان', type: 'text' },
  { key: 'city', label: 'المدينة', type: 'text' },
  { key: 'country', label: 'الدولة', type: 'text' },
  { key: 'workingHours', label: 'أوقات العمل', type: 'text', placeholder: 'مثال: الاثنين - السبت، 9ص - 9م' },
  { key: 'currency', label: 'العملة', type: 'text', placeholder: 'MAD' },
  { key: 'instagram', label: 'إنستغرام (رابط كامل)', type: 'url' },
  { key: 'facebook', label: 'فيسبوك (رابط كامل)', type: 'url' },
  { key: 'tiktok', label: 'تيك توك (رابط كامل)', type: 'url' },
  { key: 'heroDesc', label: 'وصف البانر الرئيسي', type: 'textarea' },
  { key: 'aboutText', label: 'نص "من نحن"', type: 'textarea' },
]

export default function AdminSettings() {
  const { showToast } = useOutletContext()
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSettings()
      .then(r => setForm(r.data || {}))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSettings(form)
      showToast('تم حفظ الإعدادات بنجاح', 'success')
    } catch {
      showToast('حدث خطأ', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">الإعدادات</h2>
      </div>

      <div className="admin-card" style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            {fields.map(f => (
              <div key={f.key} className="form-group" style={f.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
                <label className="form-label">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form[f.key] || ''}
                    onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                ) : (
                  <input
                    className="form-control"
                    type={f.type}
                    value={form[f.key] || ''}
                    onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
