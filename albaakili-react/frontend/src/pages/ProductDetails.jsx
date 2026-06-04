import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaWhatsapp, FaStar, FaChevronRight, FaChevronLeft } from 'react-icons/fa'
import { MdFiberNew } from 'react-icons/md'
import { getProduct, getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { whatsappUrl } from '../components/WhatsAppButton'
import { useSettings } from '../hooks/useSettings'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const { settings } = useSettings()

  useEffect(() => {
    setLoading(true)
    setImgIdx(0)
    getProduct(id)
      .then(r => {
        const p = r.data
        setProduct(p)
        if (p.categoryId) {
          return getProducts({ categoryId: p.categoryId, limit: 4 })
            .then(sr => setSimilar((sr.data.products || sr.data || []).filter(x => x.id !== id)))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader />
  if (!product) return (
    <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <p>المنتج غير موجود.</p>
      <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>العودة للمنتجات</Link>
    </div>
  )

  const imgs = product.images || []

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>{product.name}</h1>
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <Link to="/products">المنتجات</Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="product-detail-grid">
            {/* Gallery */}
            <div className="product-gallery">
              <div className="gallery-main">
                {imgs.length > 0 ? (
                  <img src={imgs[imgIdx]} alt={product.name} />
                ) : (
                  <div className="product-img-placeholder" style={{ height: 400 }}>
                    <MdFiberNew style={{ fontSize: '4rem', color: 'var(--primary)', opacity: .3 }} />
                    <span>لا توجد صورة</span>
                  </div>
                )}
                {imgs.length > 1 && (
                  <>
                    <button className="gallery-nav prev" onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}>
                      <FaChevronRight />
                    </button>
                    <button className="gallery-nav next" onClick={() => setImgIdx(i => (i + 1) % imgs.length)}>
                      <FaChevronLeft />
                    </button>
                  </>
                )}
              </div>
              {imgs.length > 1 && (
                <div className="gallery-thumbs">
                  {imgs.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className={i === imgIdx ? 'active' : ''}
                      onClick={() => setImgIdx(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="product-detail-info">
              {product.featured && (
                <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-block' }}>
                  <FaStar style={{ fontSize: '.6rem', marginLeft: 4 }} />مميز
                </span>
              )}
              <h1 className="product-detail-name">{product.name}</h1>
              <div className="product-detail-category">{product.categoryId}</div>
              <div className="product-detail-price">
                {product.price?.toLocaleString('ar-MA')} <span>{settings.currency || 'MAD'}</span>
              </div>

              {product.shortDescription && (
                <p style={{ color: 'var(--muted)', marginBottom: 16, lineHeight: 1.7 }}>{product.shortDescription}</p>
              )}

              {product.description && (
                <div className="product-description" style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>الوصف التفصيلي</h3>
                  <p style={{ color: 'var(--muted)', lineHeight: 1.8 }}>{product.description}</p>
                </div>
              )}

              {product.colors?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <strong>الألوان المتاحة: </strong>
                  {product.colors.map(c => (
                    <span key={c} className="tag" style={{ marginRight: 4 }}>{c}</span>
                  ))}
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <strong>المقاسات المتاحة: </strong>
                  {product.sizes.map(s => (
                    <span key={s} className="tag" style={{ marginRight: 4 }}>{s}</span>
                  ))}
                </div>
              )}

              {product.material && (
                <div style={{ marginBottom: 16 }}>
                  <strong>الخامة: </strong>
                  <span style={{ color: 'var(--muted)' }}>{product.material}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
                <a
                  href={whatsappUrl(settings.whatsapp || '212600000000', product.name)}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-lg"
                >
                  <FaWhatsapp /> اطلبي عبر واتساب
                </a>
                <Link to="/products" className="btn btn-outline btn-lg">العودة للمنتجات</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="section section-beige">
          <div className="container">
            <h2 className="section-title">منتجات <span>مشابهة</span></h2>
            <div className="products-grid">
              {similar.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
