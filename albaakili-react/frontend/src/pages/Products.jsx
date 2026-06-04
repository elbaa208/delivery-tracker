import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { FaSearch, FaStar } from 'react-icons/fa'
import { MdFiberNew } from 'react-icons/md'
import { getProducts, getCategories } from '../services/api'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || 'all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    getCategories({ active: true })
      .then(r => setCategories(r.data.categories || r.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (selectedCat !== 'all') params.categoryId = selectedCat
    if (sortBy === 'price-asc') params.sort = 'price_asc'
    if (sortBy === 'price-desc') params.sort = 'price_desc'
    if (sortBy === 'featured') params.featured = true

    getProducts(params)
      .then(r => setProducts(r.data.products || r.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [search, selectedCat, sortBy])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(e.target.search.value)
  }

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <h1>منتجاتنا</h1>
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span>المنتجات</span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Filters */}
          <div className="filters-bar">
            <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 360 }}>
              <div className="search-wrap">
                <FaSearch />
                <input name="search" defaultValue={search} placeholder="ابحثي عن منتج..." />
              </div>
            </form>
            <div className="filter-group">
              <label>الترتيب:</label>
              <select className="form-control" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">الأحدث</option>
                <option value="price-asc">السعر: الأقل</option>
                <option value="price-desc">السعر: الأعلى</option>
                <option value="featured">المميزة</option>
              </select>
            </div>
          </div>

          {/* Category chips */}
          <div className="filter-chips">
            <button className={`filter-chip${selectedCat === 'all' ? ' active' : ''}`} onClick={() => setSelectedCat('all')}>
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-chip${selectedCat === cat.id ? ' active' : ''}`}
                onClick={() => setSelectedCat(cat.id)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {loading ? <Loader /> : (
            <>
              <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: 20 }}>
                {products.length} منتج
              </p>
              <div className="products-grid">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {products.length === 0 && (
                <div className="empty-state">
                  <MdFiberNew />
                  <p>لا توجد منتجات تطابق بحثك</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
