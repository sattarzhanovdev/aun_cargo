// src/components/ProgressPopup.js
import React from 'react';

export default function ProgressPopup({ open, title, percent, done, total, onClose }) {
  if (!open) return null;
  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <div style={styles.header}>
          <strong>{title}</strong>
        </div>
        <div style={styles.body}>
          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${percent}%` }} />
          </div>
          <div style={styles.meta}>
            <span>{percent}%</span>
            <span>{done}/{total}</span>
          </div>
        </div>
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.btn}>Скрыть</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
  },
  card: {
    width: 420, background: '#111', color: '#fff',
    borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  header: { padding: '16px 20px', borderBottom: '1px solid #222' },
  body: { padding: 20 },
  progressOuter: {
    height: 12, background: '#222', borderRadius: 999, overflow: 'hidden'
  },
  progressInner: { height: '100%', background: '#3b82f6', transition: 'width .25s ease' },
  meta: { display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 14, opacity: 0.85 },
  footer: { padding: '12px 20px', borderTop: '1px solid #222', display: 'flex', justifyContent: 'flex-end' },
  btn: { background: '#2a2a2a', color: '#fff', border: '1px solid #3a3a3a', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }
};