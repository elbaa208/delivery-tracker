import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaWhatsapp, FaStar, FaShippingFast, FaAward, FaHeadset, FaGem } from 'react-icons/fa'
import { MdFiberNew } from 'react-icons/md'
import { getProducts, getCategories } from '../services/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { whatsappUrl } from '../components/WhatsAppButton'
import { useSettings } from '../hooks/useSettings'

const testimonials = [
  { id: 1, name: 'فاطمة الزهراء', city: 'الدار البيضاء', rating: 5, text: 'جودة استثنائية وخدمة رائعة. الحجاب تجاوز توقعاتي تماماً.' },
  { id: 2, name: 'أمينة بنعلي', city: 'الرباط', rating: 5, text: 'متجر متميز بتشكيلة واسعة وأسعار مناسبة. أنصح به كل الأخوات.' },
  { id: 3, name: 'خديجة المرابط', city: 'مراكش', rating: 5, text: 'التوصيل سريع والتغليف أنيق جداً. سأعود للشراء بالتأكيد.' },
]

const features = [
  { icon: FaShippingFast, title: 'توصيل سريع', desc: 'توصيل لجميع أنحاء المملكة خلال 24-48 ساعة' },
  { icon: FaAward, title: 'جودة مضمونة', desc: 'أقمشة فاخرة مختارة بعناية من أجود المصادر' },
  { icon: FaHeadset, title: 'دعم مستمر', desc: 'فريق خدمة العملاء متاح على مدار الساعة' },
  { icon: FaGem, title: 'تصاميم حصرية', desc: 'مجموعات موسمية حصرية لا تجدينها في أي مكان آخر' },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const { settings } = useSettings()

  useEffect(() => {
    Promise.all([
      getProducts({ featured: true, limit: 8 }),
      getCategories({ active: true })
    ])
      .then(([pr, cr]) => {
        setProducts(pr.data.products || pr.data || [])
        setCategories(cr.data.categories || cr.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-pattern"></div>
        <div className="container hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <FaStar style={{ color: 'var(--gold)' }} />
              وجهتكِ الأولى للأناقة المحتشمة
            </div>
            <h1 className="hero-title">
              {settings.storeName || 'البعقيلي للحجاب'}<br />
              <span className="highlight">أناقة لا حدود لها</span>
            </h1>
            <p className="hero-desc">
              {settings.heroDesc || 'اكتشفي أرقى تشكيلات الحجاب والعبايات المصنوعة من أجود الأقمشة، بتصاميم عصرية تجمع بين الأصالة والحداثة.'}
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">تسوقي الآن</Link>
              <a
                href={whatsappUrl(settings.whatsapp || '212600000000')}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-whatsapp btn-lg"
              >
                <FaWhatsapp /> تواصلي معنا
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">+500</div>
                <div className="stat-label">منتج متوفر</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">+2K</div>
                <div className="stat-label">عميلة سعيدة</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5★</div>
                <div className="stat-label">تقييم المتجر</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-placeholder">
              <MdFiberNew style={{ fontSize: '4rem', color: 'var(--primary)', opacity: .4 }} />
              <p>أناقة فاخرة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section section-beige">
          <div className="container">
            <h2 className="section-title">تسوقي حسب <span>التصنيف</span></h2>
            <div className="gold-divider"><FaStar /></div>
            <div className="categories-grid">
              {categories.map(cat => (
                <Link key={cat.id} to={`/products?category=${cat.id}`} className="category-card">
                  <div className="category-icon">{cat.icon || '🧕'}</div>
                  <div className="category-name">{cat.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">المنتجات <span>المميزة</span></h2>
          <p className="section-subtitle">تشكيلة مختارة بعناية من أرقى منتجاتنا</p>
          <div className="gold-divider"><FaStar /></div>
          {loading ? <Loader /> : (
            <>
              <div className="products-grid">
                {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {products.length === 0 && (
                <div className="empty-state">
                  <MdFiberNew />
                  <p>لا توجد منتجات بعد</p>
                </div>
              )}
              {products.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <Link to="/products" className="btn btn-primary btn-lg">عرض جميع المنتجات</Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="section section-dark">
        <div className="container">
          <h2 className="section-title" style={{ color: '#fff' }}>لماذا تختارين <span>متجرنا؟</span></h2>
          <div className="gold-divider"><FaStar /></div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon"><f.icon /></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section section-beige">
        <div className="container">
          <h2 className="section-title">آراء <span>عميلاتنا</span></h2>
          <div className="gold-divider"><FaStar /></div>
          <div className="testimonials-grid">
            {testimonials.map(t => (
              <div key={t.id} className="testimonial-card">
                <div className="stars">{'★'.repeat(t.rating)}</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.name[0]}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-city">{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 900, marginBottom: 16 }}>
            هل أنتِ مستعدة للتسوق؟
          </h2>
          <p style={{ color: 'rgba(255,255,255,.8)', marginBottom: 32, fontSize: '1.05rem' }}>
            تصفحي أحدث مجموعاتنا واحصلي على الأناقة التي تستحقينها
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn" style={{ background: '#fff', color: 'var(--primary-dark)', fontWeight: 700 }}>
              تسوقي الآن
            </Link>
            <a
              href={whatsappUrl(settings.whatsapp || '212600000000')}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <FaWhatsapp /> تواصلي معنا
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
