import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { MdAdd, MdEdit, MdDelete, MdClose, MdCloudUpload } from 'react-icons/md'
import { getOffers, createOffer, updateOffer, deleteOffer, uploadSingleImage } from '../services/api'
import Loader from '../components/Loader'

const empty = { title: '', description: '', discount: '', image: '', expiresAt: '', active: true }

export default function AdminOffers() {
  const { showToast } = useOutletContext()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const load = () => {
    setLoading(true)
    getOffers({ all: 1 })
      .then(r => setOffers(r.data.offers || r.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (o) => { setEditing(o); setForm({ ...o, expiresAt: o.expiresAt?.substring(0, 10) || '' }); setModal(true) }
  const closeModal = () => setModal(false)

  const handleImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const r = await uploadSingleImage(file)
      setForm(f => ({ ...f, image: r.data.url || r.data || '' }))
    } catch {
      showToast('فشل رفع الصورة', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, discount: form.discount ? Number(form.discount) : undefined }
      if (editing) {
        await updateOffer(editing.id, payload)
        showToast('تم تعديل العرض', 'success')
      } else {
        await createOffer(payload)
        showToast('تم إضافة العرض', 'success')
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
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا العرض؟')) return
    try {
      await deleteOffer(id)
      showToast('تم الحذف', 'success')
      load()
    } catch {
      showToast('فشل الحذف', 'error')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">العروض</h2>
        <button className="btn btn-primary" onClick={openNew}><MdAdd /> إضافة عرض</button>
      </div>

      <div className="admin-card">
        {loading ? <Loader /> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>الصورة</th>
                <th>العنوان</th>
                <th>الخصم</th>
                <th>تاريخ الانتهاء</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {offers.map(o => (
                <tr key={o.id}>
                  <td>
                    {o.image
                      ? <img src={o.image} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                      : <div style={{ width: 48, height: 48, background: 'var(--beige)', borderRadius: 8 }} />
                    }
                  </td>
                  <td style={{ fontWeight: 600 }}>{o.title}</td>
                  <td>{o.discount ? `${o.discount}%` : '—'}</td>
                  <td style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{o.expiresAt ? new Date(o.expiresAt).toLocaleDateString('ar-MA') : '—'}</td>
                  <td><span className={`badge ${o.active !== false ? 'badge-success' : 'badge-danger'}`}>{o.active !== false ? 'نشط' : 'مخفي'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="action-btn" onClick={() => openEdit(o)}><MdEdit /></button>
                      <button className="action-btn danger" onClick={() => handleDelete(o.id)}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>لا توجد عروض</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'تعديل العرض' : 'إضافة عرض جديد'}</h3>
              <button className="modal-close" onClick={closeModal}><MdClose /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">عنوان العرض *</label>
                  <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">نسبة الخصم (%)</label>
                    <input className="form-control" type="number" min="0" max="100" value={form.discount || ''} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">تاريخ الانتهاء</label>
                    <input className="form-control" type="date" value={form.expiresAt || ''} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">الوصف</label>
                  <textarea className="form-control" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">صورة العرض</label>
                  <div className="upload-zone" onClick={() => fileRef.current?.click()}>
                    {form.image
                      ? <img src={form.image} alt="" style={{ maxHeight: 120, borderRadius: 8 }} />
                      : <><MdCloudUpload style={{ fontSize: '2rem', color: 'var(--primary)' }} /><p>{uploading ? 'جاري الرفع...' : 'انقري لرفع صورة'}</p></>
                    }
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                  </div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="offerActive" checked={form.active !== false} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                  <label htmlFor="offerActive">عرض نشط</label>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={closeModal}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'جاري الحفظ...' : (editing ? 'حفظ' : 'إضافة')}
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
