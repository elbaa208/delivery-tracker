import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { sendMessage } from '../services/api'
import { useSettings } from '../hooks/useSettings'
import { whatsappUrl } from '../components/WhatsAppButton'

export default function Contact() {
  const { settings } = useSettings()
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' })
  const [status, setStatus] = useState(null)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.message) return
    setSending(true)
    setStatus(null)
    try {
      await sendMessage(form)
      setStatus('success')
      setForm({ name: '', phone: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>تواصلي معنا</h1>
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span>تواصلي معنا</span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Info side */}
            <div>
              <h2 style={{ fontWeight: 800, marginBottom: 24 }}>معلومات <span style={{ color: 'var(--primary)' }}>التواصل</span></h2>
              <div className="contact-items">
                {settings.phone && (
                  <div className="contact-item">
                    <div className="contact-icon"><FaPhone /></div>
                    <div>
                      <strong>الهاتف</strong>
                      <p>{settings.phone}</p>
                    </div>
                  </div>
                )}
                {settings.email && (
                  <div className="contact-item">
                    <div className="contact-icon"><MdEmail /></div>
                    <div>
                      <strong>البريد الإلكتروني</strong>
                      <p>{settings.email}</p>
                    </div>
                  </div>
                )}
                {settings.address && (
                  <div className="contact-item">
                    <div className="contact-icon"><FaMapMarkerAlt /></div>
                    <div>
                      <strong>العنوان</strong>
                      <p>{settings.address}</p>
                    </div>
                  </div>
                )}
                {settings.workingHours && (
                  <div className="contact-item">
                    <div className="contact-icon"><FaClock /></div>
                    <div>
                      <strong>أوقات العمل</strong>
                      <p>{settings.workingHours}</p>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 32 }}>
                <h4 style={{ marginBottom: 16 }}>تابعينا على</h4>
                <div className="footer-social">
                  {settings.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>}
                  {settings.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>}
                  {settings.tiktok && <a href={settings.tiktok} target="_blank" rel="noopener noreferrer"><FaTiktok /></a>}
                  <a href={whatsappUrl(settings.whatsapp || '212600000000')} target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
                </div>
              </div>

              <a
                href={whatsappUrl(settings.whatsapp || '212600000000')}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
                style={{ marginTop: 32 }}
              >
                <FaWhatsapp /> تواصلي عبر واتساب
              </a>
            </div>

            {/* Form */}
            <div className="contact-form-wrap">
              <h3 style={{ fontWeight: 800, marginBottom: 24 }}>أرسلي <span style={{ color: 'var(--primary)' }}>رسالة</span></h3>
              {status === 'success' && (
                <div className="alert alert-success" style={{ marginBottom: 20 }}>
                  تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
                </div>
              )}
              {status === 'error' && (
                <div className="alert alert-error" style={{ marginBottom: 20 }}>
                  حدث خطأ أثناء إرسال الرسالة. حاولي مرة أخرى.
                </div>
              )}
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الاسم *</label>
                    <input
                      className="form-control"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الهاتف</label>
                    <input
                      className="form-control"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">الموضوع</label>
                  <input
                    className="form-control"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">الرسالة *</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={sending} style={{ width: '100%' }}>
                  {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
