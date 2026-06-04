import { Link } from 'react-router-dom'
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp, FaHeart } from 'react-icons/fa'
import { useSettings } from '../hooks/useSettings'
import { whatsappUrl } from './WhatsAppButton'

export default function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ marginBottom: 16 }}>
              <img src="/logo.png" alt="" onError={e => e.target.style.display='none'} style={{ height: 40 }} />
              <div className="logo-text" style={{ color: '#fff' }}>
                {settings.storeName || 'البعقيلي للحجاب'}
                <small style={{ color: 'var(--gold-light)' }}>Luxury Modest Fashion</small>
              </div>
            </div>
            <p className="footer-about">{settings.aboutText?.substring(0, 120) || 'وجهتكِ الأولى للأناقة المحتشمة.'}</p>
            <div className="footer-social">
              {settings.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer"><FaInstagram /></a>}
              {settings.facebook && <a href={settings.facebook} target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>}
              {settings.tiktok && <a href={settings.tiktok} target="_blank" rel="noopener noreferrer"><FaTiktok /></a>}
              <a href={whatsappUrl(settings.whatsapp || '212600000000')} target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>روابط سريعة</h4>
            <ul>
              {[['/', 'الرئيسية'], ['/products', 'المنتجات'], ['/offers', 'العروض'], ['/about', 'من نحن'], ['/contact', 'تواصلي معنا']].map(([to, label]) => (
                <li key={to}><Link to={to}>{label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>التصنيفات</h4>
            <ul>
              {[['حجابات', 'hijabs'], ['عبايات', 'abayas'], ['جلابيب', 'djellabas'], ['خُمُر', 'khimars'], ['إكسسوارات', 'hijab-accessories']].map(([name, slug]) => (
                <li key={slug}><Link to={`/products?category=${slug}`}>{name}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>تواصلي معنا</h4>
            <ul>
              {settings.phone && <li style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>{settings.phone}</li>}
              {settings.address && <li style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>{settings.address}</li>}
              {settings.workingHours && <li style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.6)' }}>{settings.workingHours}</li>}
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span>© {new Date().getFullYear()} {settings.storeName || 'البعقيلي للحجاب'}. جميع الحقوق محفوظة.</span>
          <span>صُنع بـ <FaHeart style={{ color: 'var(--gold)', verticalAlign: 'middle' }} /> للمرأة الأنيقة</span>
        </div>
      </div>
    </footer>
  )
}
