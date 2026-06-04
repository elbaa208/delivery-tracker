import { FaWhatsapp } from 'react-icons/fa'
import { useSettings } from '../hooks/useSettings'

export function whatsappUrl(whatsapp, productName = null) {
  const msg = productName
    ? `السلام عليكم، أرغب في الاستفسار عن المنتج: ${productName}`
    : 'السلام عليكم، أرغب في الاستفسار عن منتجاتكم.'
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`
}

export default function WhatsAppButton() {
  const { settings } = useSettings()
  return (
    <div className="whatsapp-float">
      <a href={whatsappUrl(settings.whatsapp || '212600000000')} target="_blank" rel="noopener noreferrer">
        <span className="whatsapp-pulse"></span>
        <FaWhatsapp />
      </a>
    </div>
  )
}
