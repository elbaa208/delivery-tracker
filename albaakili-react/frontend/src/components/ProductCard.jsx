import { Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { BsStarFill } from 'react-icons/bs'
import { MdFiberNew } from 'react-icons/md'
import { whatsappUrl } from './WhatsAppButton'
import { useSettings } from '../hooks/useSettings'

export default function ProductCard({ product }) {
  const { settings } = useSettings()
  const img = product.images?.[0]

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        {img ? (
          <img src={img} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-img-placeholder">
            <MdFiberNew style={{ fontSize: '2.5rem', color: 'var(--primary)', opacity: .4 }} />
            <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>لا توجد صورة</span>
          </div>
        )}
        {product.featured && <span className="product-featured-badge"><BsStarFill style={{ fontSize: '.6rem', marginLeft: 3 }} />مميز</span>}
      </div>
      <div className="product-info">
        <div className="product-category">{product.categoryId}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.shortDescription}</p>
        <div className="product-price">
          {product.price?.toLocaleString('ar-MA')} <span>{settings.currency || 'MAD'}</span>
        </div>
        <div className="product-actions">
          <Link to={`/products/${product.id}`} className="btn btn-outline btn-sm">التفاصيل</Link>
          <a
            href={whatsappUrl(settings.whatsapp || '212600000000', product.name)}
            target="_blank" rel="noopener noreferrer"
            className="btn btn-whatsapp btn-sm"
          >
            <FaWhatsapp /> واتساب
          </a>
        </div>
      </div>
    </div>
  )
}
