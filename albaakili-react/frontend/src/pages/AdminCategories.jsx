import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api'
import Loader from '../components/Loader'

const empty = { name: '', icon: '', description: '', order: 0, active: true }

export default function AdminCategories() {
  const { showToast } = useOutletContext()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getCategories()
      .then(r => setCategories(r.data.categories || r.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(empty); setModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setModal(true) }
  const closeModal = () => setModal(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, order: Number(form.order) }
      if (editing) {
        await updateCategory(editing.id, payload)
        showToast('تم تعديل التصنيف', 'success')
      } else {
        await createCategory(payload)
        showToast('تم إضافة التصنيف', 'success')
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
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا التصنيف؟')) return
    try {
      await deleteCategory(id)
      showToast('تم الحذف', 'success')
      load()
    } catch {
      showToast('فشل الحذف', 'error')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">التصنيفات</h2>
        <button className="btn btn-primary" onClick={openNew}><MdAdd /> إضافة تصنيف</button>
      </div>

      <div className="admin-card">
        {loading ? <Loader /> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>الأيقونة</th>
                <th>الاسم</th>
                <th>الترتيب</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ fontSize: '1.5rem' }}>{cat.icon || '🏷️'}</td>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td>{cat.order ?? 0}</td>
                  <td><span className={`badge ${cat.active !== false ? 'badge-success' : 'badge-danger'}`}>{cat.active !== false ? 'نشط' : 'مخفي'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="action-btn" onClick={() => openEdit(cat)}><MdEdit /></button>
                      <button className="action-btn danger" onClick={() => handleDelete(cat.id)}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>لا توجد تصنيفات</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</h3>
              <button className="modal-close" onClick={closeModal}><MdClose /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">اسم التصنيف *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الأيقونة (emoji)</label>
                    <input className="form-control" value={form.icon || ''} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🧕" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الترتيب</label>
                    <input className="form-control" type="number" value={form.order || 0} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
                    <input type="checkbox" id="catActive" checked={form.active !== false} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                    <label htmlFor="catActive">تصنيف نشط</label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">الوصف</label>
                  <textarea className="form-control" rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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
