import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { MdAdd, MdEdit, MdDelete, MdClose, MdCloudUpload } from 'react-icons/md'
import { FaStar } from 'react-icons/fa'
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, uploadImages
} from '../services/api'
import Loader from '../components/Loader'

const empty = { name: '', shortDescription: '', description: '', price: '', categoryId: '', colors: [], sizes: [], material: '', featured: false, available: true, images: [] }

function TagsInput({ label, tags, onChange }) {
  const [val, setVal] = useState('')
  const add = () => {
    const t = val.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
    setVal('')
  }
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="tags-container">
        {tags.map(t => (
          <span key={t} className="tag">
            {t}
            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="tag-remove">×</button>
          </span>
        ))}
        <input
          className="tag-input"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="اكتبي ثم Enter"
        />
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const { showToast } = useOutletContext()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const load = () => {
    setLoading(true)
    Promise.all([
      getProducts({ skipAvailableFilter: 1, limit: 200 }),
      getCategories()
    ]).then(([pr, cr]) => {
      setProducts(pr.data.products || pr.data || [])
      setCategories(cr.data.categories || cr.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (p) => { setEditing(p); setForm({ ...p }); setModal(true) }
  const closeModal = () => setModal(false)

  const handleImages = async (e) => {
    const files = e.target.files
    if (!files.length) return
    setUploading(true)
    try {
      const r = await uploadImages(files)
      const urls = r.data.urls || r.data || []
      setForm(f => ({ ...f, images: [...(f.images || []), ...urls] }))
    } catch {
      showToast('فشل رفع الصور', 'error')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (idx) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price) }
      if (editing) {
        await updateProduct(editing.id, payload)
        showToast('تم تعديل المنتج بنجاح', 'success')
      } else {
        await createProduct(payload)
        showToast('تم إضافة المنتج بنجاح', 'success')
      }
      closeModal()
      load()
    } catch {
      showToast('حدث خطأ', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا المنتج؟')) return
    try {
      await deleteProduct(id)
      showToast('تم حذف المنتج', 'success')
      load()
    } catch {
      showToast('فشل الحذف', 'error')
    }
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">المنتجات</h2>
        <button className="btn btn-primary" onClick={openNew}>
          <MdAdd /> إضافة منتج
        </button>
      </div>

      <div className="admin-card">
        <div className="card-toolbar">
          <input
            className="form-control"
            style={{ maxWidth: 300 }}
            placeholder="بحث..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{filtered.length} منتج</span>
        </div>

        {loading ? <Loader /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>الاسم</th>
                  <th>التصنيف</th>
                  <th>السعر</th>
                  <th>مميز</th>
                  <th>متاح</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                        : <div style={{ width: 48, height: 48, background: 'var(--beige)', borderRadius: 8 }} />
                      }
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{categories.find(c => c.id === p.categoryId)?.name || p.categoryId || '—'}</td>
                    <td>{p.price?.toLocaleString('ar-MA')} MAD</td>
                    <td><span className={`badge ${p.featured ? 'badge-primary' : ''}`}>{p.featured ? '★ مميز' : '—'}</span></td>
                    <td><span className={`badge ${p.available !== false ? 'badge-success' : 'badge-danger'}`}>{p.available !== false ? 'متاح' : 'غير متاح'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="action-btn" title="تعديل" onClick={() => openEdit(p)}><MdEdit /></button>
                        <button className="action-btn danger" title="حذف" onClick={() => handleDelete(p.id)}><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>لا توجد منتجات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
              <button className="modal-close" onClick={closeModal}><MdClose /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">اسم المنتج *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">التصنيف</label>
                    <select className="form-control" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                      <option value="">-- اختاري تصنيفاً --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">السعر (MAD)</label>
                    <input className="form-control" type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الخامة</label>
                    <input className="form-control" value={form.material || ''} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">وصف مختصر</label>
                  <input className="form-control" value={form.shortDescription || ''} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">الوصف التفصيلي</label>
                  <textarea className="form-control" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <TagsInput label="الألوان" tags={form.colors || []} onChange={v => setForm(f => ({ ...f, colors: v }))} />
                <TagsInput label="المقاسات" tags={form.sizes || []} onChange={v => setForm(f => ({ ...f, sizes: v }))} />
                <div className="form-row">
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" id="featured" checked={!!form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                    <label htmlFor="featured">منتج مميز</label>
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" id="available" checked={form.available !== false} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} />
                    <label htmlFor="available">متاح للبيع</label>
                  </div>
                </div>

                {/* Images */}
                <div className="form-group">
                  <label className="form-label">الصور</label>
                  <div
                    className="upload-zone"
                    onClick={() => fileRef.current?.click()}
                  >
                    <MdCloudUpload style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: 8 }} />
                    <p>{uploading ? 'جاري رفع الصور...' : 'انقري لرفع صور'}</p>
                    <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImages} />
                  </div>
                  {form.images?.length > 0 && (
                    <div className="images-preview">
                      {form.images.map((img, i) => (
                        <div key={i} className="img-thumb">
                          <img src={img} alt="" />
                          <button type="button" className="img-remove" onClick={() => removeImage(i)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={closeModal}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة المنتج')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
