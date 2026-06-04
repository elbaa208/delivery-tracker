import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { FaChevronUp } from 'react-icons/fa'

export default function MainLayout() {
  const [showScroll, setShowScroll] = useState(false)
  useEffect(() => {
    const h = () => setShowScroll(window.scrollY > 300)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 70 }}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <button className={`scroll-top${showScroll ? ' visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <FaChevronUp />
      </button>
    </>
  )
}
