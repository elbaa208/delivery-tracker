import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  MdDashboard, MdInventory, MdCategory, MdLocalOffer,
  MdEmail, MdSettings, MdLogout, MdMenu, MdStore
} from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'

const navItems = [
  { label: 'لوحة المعلومات', icon: MdDashboard, to: '/admin' },
  { label: 'المنتجات', icon: MdInventory, to: '/admin/products' },
  { label: 'التصنيفات', icon: MdCategory, to: '/admin/categories' },
  { label: 'العروض', icon: MdLocalOffer, to: '/admin/offers' },
  { label: 'الرسائل', icon: MdEmail, to: '/admin/messages' },
  { label: 'الإعدادات', icon: MdSettings, to: '/admin/settings' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { showToast, ToastContainer } = useToast()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/logo.png" alt="" onError={e => e.target.style.display='none'} style={{ height: 36, margin: '0 auto 10px' }} />
          <div className="logo-text">
            <span style={{ color: '#fff', display: 'block', fontSize: '.95rem', fontWeight: 700 }}>البعقيلي للحجاب</span>
            <small style={{ color: 'var(--gold-light)' }}>لوحة التحكم</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">القائمة الرئيسية</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon style={{ fontSize: '1.1rem' }} />
              {item.label}
            </NavLink>
          ))}
          <div style={{ marginTop: 24, padding: '0 12px' }}>
            <a href="/" target="_blank" rel="noopener noreferrer" className="sidebar-link" style={{ borderBottom: '1px solid rgba(176,138,91,.2)' }}>
              <MdStore style={{ fontSize: '1.1rem' }} /> عرض الموقع
            </a>
            <button className="sidebar-link" onClick={handleLogout} style={{ color: 'rgba(214,65,65,.8)', marginTop: 4 }}>
              <MdLogout style={{ fontSize: '1.1rem' }} /> تسجيل الخروج
            </button>
          </div>
        </nav>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="action-btn" style={{ display: 'none', background: 'var(--beige)' }} id="sidebarToggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MdMenu style={{ fontSize: '1.2rem' }} />
            </button>
            <h2 className="topbar-title">لوحة التحكم</h2>
          </div>
          <div className="topbar-actions">
            <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{user?.name}</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>خروج</button>
          </div>
        </div>
        <div className="admin-content">
          <Outlet context={{ showToast }} />
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
