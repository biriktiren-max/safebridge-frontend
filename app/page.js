"use client";
// @ts-nocheck

import { useState } from "react";

export default function Page() {
  const [active, setActive] = useState(true);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', color: '#1a73e8' }}>Safe Bridge Kokpit</h1>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '50px' }}>👁️</span>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Sistem İzleme Aktif</p>
          <button 
            onClick={() => setActive(!active)}
            style={{ marginTop: '20px', padding: '10px 25px', cursor: 'pointer', background: active ? '#28a745' : '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            {active ? "Sistemi Durdur" : "Sistemi Başlat"}
          </button>
        </div>
      </div>
    </div>
  );
}
