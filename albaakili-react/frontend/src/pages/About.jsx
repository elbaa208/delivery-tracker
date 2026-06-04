import { Link } from 'react-router-dom'
import { FaStar, FaGem, FaAward, FaHandsHelping, FaLeaf } from 'react-icons/fa'
import { useSettings } from '../hooks/useSettings'

const values = [
  { icon: FaGem, title: 'الجودة أولاً', desc: 'نختار أجود الأقمشة وأرقى التصاميم لنضمن رضاكِ التام' },
  { icon: FaAward, title: 'التميز والحصرية', desc: 'مجموعات حصرية لا تجدينها في أي مكان آخر' },
  { icon: FaHandsHelping, title: 'خدمة متميزة', desc: 'فريقنا دائماً في خدمتكِ لضمان تجربة تسوق سلسة' },
  { icon: FaLeaf, title: 'مواد طبيعية', desc: 'نفضل استخدام المواد الطبيعية الصديقة للبشرة' },
]

export default function About() {
  const { settings } = useSettings()

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>من نحن</h1>
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span>من نحن</span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <h2 className="section-title">قصة <span>متجرنا</span></h2>
          <div className="gold-divider"><FaStar /></div>
          <div style={{ lineHeight: 2, color: 'var(--muted)', fontSize: '1.05rem', marginBottom: 40, textAlign: 'center' }}>
            {settings.aboutText || `متجر ${settings.storeName || 'البعقيلي للحجاب'} هو وجهتكِ الأولى للأناقة المحتشمة. نقدم تشكيلة متنوعة من الحجابات والعبايات والجلابيب المصنوعة من أجود الأقمشة، بتصاميم عصرية تجمع بين الأصالة والحداثة. نحن ملتزمون بتقديم أعلى معايير الجودة وخدمة العملاء الاستثنائية لكل عميلة كريمة.`}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, textAlign: 'center', marginBottom: 60 }}>
            {[['+ 500', 'منتج متوفر'], ['+ 2000', 'عميلة سعيدة'], ['5 ★', 'تقييم المتجر']].map(([num, label]) => (
              <div key={label} className="stat-card">
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--primary)' }}>{num}</div>
                <div style={{ color: 'var(--muted)', fontSize: '.9rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-beige">
        <div className="container">
          <h2 className="section-title">قيمنا <span>ومبادئنا</span></h2>
          <div className="gold-divider"><FaStar /></div>
          <div className="features-grid">
            {values.map((v, i) => (
              <div key={i} className="feature-card" style={{ background: '#fff' }}>
                <div className="feature-icon"><v.icon /></div>
                <h3 className="feature-title">{v.title}</h3>
                <p className="feature-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">هل تريدين <span>التواصل معنا؟</span></h2>
          <p style={{ color: 'var(--muted)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
            نحن سعداء بالإجابة على جميع استفساراتكِ
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn btn-primary btn-lg">تواصلي معنا</Link>
            <Link to="/products" className="btn btn-outline btn-lg">تسوقي الآن</Link>
          </div>
        </div>
      </section>
    </>
  )
}
