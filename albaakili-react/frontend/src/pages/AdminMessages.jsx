import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { MdEmail, MdDelete, MdMarkEmailRead } from 'react-icons/md'
import { FaWhatsapp } from 'react-icons/fa'
import { getMessages, updateMessage, deleteMessage } from '../services/api'
import { useSettings } from '../hooks/useSettings'
import { whatsappUrl } from '../components/WhatsAppButton'
import Loader from '../components/Loader'

const statusLabels = { new: 'جديدة', read: 'مقروءة', replied: 'تم الرد' }
const statusColors = { new: 'badge-danger', read: 'badge-warning', replied: 'badge-success' }

export default function AdminMessages() {
  const { showToast } = useOutletContext()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { settings } = useSettings()

  const load = () => {
    setLoading(true)
    const params = filter !== 'all' ? { status: filter } : {}
    getMessages(params)
      .then(r => setMessages(r.data.messages || r.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const markRead = async (id) => {
    try {
      await updateMessage(id, { status: 'read' })
      setMessages(ms => ms.map(m => m.id === id ? { ...m, status: 'read' } : m))
    } catch {
      showToast('حدث خطأ', 'error')
    }
  }

  const markReplied = async (id) => {
    try {
      await updateMessage(id, { status: 'replied' })
      setMessages(ms => ms.map(m => m.id === id ? { ...m, status: 'replied' } : m))
    } catch {
      showToast('حدث خطأ', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('حذف هذه الرسالة نهائياً؟')) return
    try {
      await deleteMessage(id)
      showToast('تم الحذف', 'success')
      load()
    } catch {
      showToast('فشل الحذف', 'error')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">الرسائل</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'new', 'read', 'replied'].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'الكل' : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="empty-state">
              <MdEmail style={{ fontSize: '3rem', color: 'var(--primary)', opacity: .3 }} />
              <p>لا توجد رسائل</p>
            </div>
          ) : messages.map(msg => (
            <div key={msg.id} className={`message-card ${msg.status === 'new' ? 'is-new' : ''}`}>
              <div className="message-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="message-avatar">{msg.name?.[0] || '؟'}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{msg.name}</div>
                    {msg.phone && <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{msg.phone}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`badge ${statusColors[msg.status]}`}>{statusLabels[msg.status]}</span>
                  <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>
                    {new Date(msg.createdAt).toLocaleDateString('ar-MA')}
                  </span>
                </div>
              </div>
              {msg.subject && <div style={{ fontWeight: 600, marginBottom: 6 }}>{msg.subject}</div>}
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 16 }}>{msg.message}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {msg.status === 'new' && (
                  <button className="action-btn" title="تحديد كمقروءة" onClick={() => markRead(msg.id)}>
                    <MdMarkEmailRead /> مقروءة
                  </button>
                )}
                {msg.status !== 'replied' && (
                  <button className="action-btn" style={{ color: 'var(--success)' }} onClick={() => markReplied(msg.id)}>
                    تم الرد
                  </button>
                )}
                {msg.phone && (
                  <a
                    href={whatsappUrl(msg.phone.replace(/\D/g, ''), null)}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-whatsapp btn-sm"
                  >
                    <FaWhatsapp /> رد عبر واتساب
                  </a>
                )}
                <button className="action-btn danger" onClick={() => handleDelete(msg.id)}>
                  <MdDelete /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
