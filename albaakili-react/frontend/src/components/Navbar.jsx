import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FaBars, FaTimes, FaWhatsapp } from 'react-icons/fa'
import { useSettings } from '../hooks/useSettings'
import { whatsappUrl } from './WhatsAppButton'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { settings } = useSettings()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const links = [
    { to: '/', label: 'الرئيسية' },
    { to: '/products', label: 'المنتجات' },
    { to: '/offers', label: 'العروض' },
    { to: '/about', label: 'من نحن' },
    { to: '/contact', label: 'تواصلي معنا' },
  ]

  return (
    <>
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="logo">
            <img src="/logo.png" alt={settings.storeName || 'البعقيلي'} onError={e => e.target.style.display='none'} />
            <div className="logo-text">
              {settings.storeName || 'البعقيلي للحجاب'}
              <small>Luxury Modest Fashion</small>
            </div>
          </Link>

          <nav className="nav">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to==='/'} className={({isActive}) => `nav-link${isActive?' active':''}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <a href={whatsappUrl(settings.whatsapp || '212600000000')} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
              <FaWhatsapp /> واتساب
            </a>
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="القائمة">
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <nav className="nav">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to==='/'} className={({isActive}) => `nav-link${isActive?' active':''}`} onClick={() => setMenuOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}
