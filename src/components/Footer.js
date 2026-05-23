import React, { useState } from 'react';
import './Footer.css';

export default function Footer() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-left">
          <span className="footer-name">Built by <strong>Leela</strong></span>
          <span className="footer-sep">·</span>
          <span className="footer-copy">PM Accelerator Tech Assessment</span>
        </div>
        <button className="footer-about-btn" onClick={() => setOpen(o => !o)}>
          {open ? '▲' : '▼'} About PM Accelerator
        </button>
      </div>

      {open && (
        <div className="footer-about">
          <div className="about-logo">⚡ Product Manager Accelerator</div>
          <p className="about-text">
            Product Manager Accelerator (PMA) is the world's leading product management
            community and training program. PMA helps aspiring and existing product managers
            break into the field, level up their skills, and land their dream PM roles at top
            tech companies through mentorship, real-world projects, and career coaching.
          </p>
          <a className="about-link" href="https://www.linkedin.com/school/product-manager-accelerator/" target="_blank" rel="noopener noreferrer">View on LinkedIn →</a>
        </div>
      )}
    </footer>
  );
}