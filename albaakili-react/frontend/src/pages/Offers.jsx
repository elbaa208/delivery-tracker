import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaStar, FaWhatsapp, FaTag } from 'react-icons/fa'
import { getOffers } from '../services/api'
import Loader from '../components/Loader'
import { whatsappUrl } from '../components/WhatsAppButton'
import { useSettings } from '../hooks/useSettings'

export default function Offers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()

  useEffect(() => {
    getOffers()
      .then(r => setOffers(r.data.offers || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>العروض الخاصة</h1>
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span>العروض</span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <h2 className="section-title">أحدث <span>العروض</span></h2>
          <div className="gold-divider"><FaStar /></div>

          {loading ? <Loader /> : offers.length === 0 ? (
            <div className="empty-state">
              <FaTag style={{ fontSize: '3rem', color: 'var(--primary)', opacity: .3 }} />
              <p>لا توجد عروض حالياً. تابعينا للاطلاع على آخر العروض.</p>
            </div>
          ) : (
            <div className="offers-grid">
              {offers.map(offer => (
                <div key={offer.id} className="offer-card">
                  {offer.image && (
                    <div className="offer-img">
                      <img src={offer.image} alt={offer.title} />
                    </div>
                  )}
                  <div className="offer-body">
                    <div className="offer-badge">
                      <FaTag style={{ marginLeft: 4 }} />
                      {offer.discount ? `خصم ${offer.discount}%` : 'عرض خاص'}
                    </div>
                    <h3 className="offer-title">{offer.title}</h3>
                    <p className="offer-desc">{offer.description}</p>
                    {offer.expiresAt && (
                      <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 8 }}>
                        ينتهي العرض: {new Date(offer.expiresAt).toLocaleDateString('ar-MA')}
                      </p>
                    )}
                    <a
                      href={whatsappUrl(settings.whatsapp || '212600000000', offer.title)}
                      target="_blank" rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                      style={{ marginTop: 16 }}
                    >
                      <FaWhatsapp /> اطلبي العرض
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
