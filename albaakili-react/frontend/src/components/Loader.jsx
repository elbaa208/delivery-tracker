export default function Loader({ text = 'جاري التحميل...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>{text}</p>
    </div>
  )
}
