import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MdInventory, MdCategory, MdLocalOffer, MdEmail } from 'react-icons/md'
import { FaStar } from 'react-icons/fa'
import { getStats, getMessages } from '../services/api'
import Loader from '../components/Loader'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getStats().catch(() => ({ data: {} })),
      getMessages().catch(() => ({ data: [] }))
    ]).then(([sr, mr]) => {
      setStats(sr.data)
      const msgs = mr.data.messages || mr.data || []
      setMessages(msgs.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  const cards = [
    { icon: MdInventory, label: 'المنتجات', value: stats?.products ?? '—', color: '#B08A5B', to: '/admin/products' },
    { icon: MdCategory, label: 'التصنيفات', value: stats?.categories ?? '—', color: '#6B8FB0', to: '/admin/categories' },
    { icon: MdLocalOffer, label: 'العروض', value: stats?.offers ?? '—', color: '#7DB0A0', to: '/admin/offers' },
    { icon: MdEmail, label: 'الرسائل', value: stats?.messages ?? '—', color: '#B07B8A', to: '/admin/messages' },
  ]

  if (loading) return <Loader />

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">لوحة المعلومات</h2>
        <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>مرحباً! إليكِ ملخص المتجر</p>
      </div>

      <div className="stats-grid">
        {cards.map(card => (
          <Link key={card.label} to={card.to} className="stat-card" style={{ textDecoration: 'none' }}>
            <div className="stat-icon" style={{ background: card.color + '20', color: card.color }}>
              <card.icon style={{ fontSize: '1.5rem' }} />
            </div>
            <div className="stat-number" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </Link>
        ))}
      </div>

      {messages.length > 0 && (
        <div className="admin-card" style={{ marginTop: 32 }}>
          <div className="card-header">
            <h3><MdEmail style={{ marginLeft: 8 }} />آخر الرسائل</h3>
            <Link to="/admin/messages" className="btn btn-outline btn-sm">عرض الكل</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الموضوع</th>
                <th>الحالة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(msg => (
                <tr key={msg.id}>
                  <td>{msg.name}</td>
                  <td>{msg.subject || '—'}</td>
                  <td>
                    <span className={`badge ${msg.status === 'new' ? 'badge-danger' : msg.status === 'read' ? 'badge-warning' : 'badge-success'}`}>
                      {msg.status === 'new' ? 'جديدة' : msg.status === 'read' ? 'مقروءة' : 'تم الرد'}
                    </span>
                  </td>
                  <td style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                    {new Date(msg.createdAt).toLocaleDateString('ar-MA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
