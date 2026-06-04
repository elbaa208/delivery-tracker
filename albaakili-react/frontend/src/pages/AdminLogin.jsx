import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaLock, FaUser, FaStar } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/admin', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.username, form.password)
    setLoading(false)
    if (result.success) {
      navigate('/admin', { replace: true })
    } else {
      setError(result.error || 'بيانات الدخول غير صحيحة')
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="login-logo">
          <img src="/logo.png" alt="" onError={e => e.target.style.display='none'} style={{ height: 60, marginBottom: 12 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: 'var(--primary)' }}>
            <FaStar style={{ fontSize: '.7rem' }} />
            <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>لوحة التحكم</span>
            <FaStar style={{ fontSize: '.7rem' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--dark)', marginTop: 8 }}>البعقيلي للحجاب</h1>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, marginBottom: 24, color: 'var(--muted)' }}>
          تسجيل الدخول
        </h2>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">اسم المستخدم</label>
            <div className="input-icon-wrap">
              <FaUser className="input-icon" />
              <input
                className="form-control"
                style={{ paddingRight: 36 }}
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="admin"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <div className="input-icon-wrap">
              <FaLock className="input-icon" />
              <input
                className="form-control"
                style={{ paddingRight: 36 }}
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
