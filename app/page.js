"use client";
// @ts-nocheck

import { useState } from "react";

export default function Page() {
  // Yönetici modu şalteri (İleride bunu senin MetaMask adresin otomatik açacak)
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      
      {/* ÜST ŞALTER: Sadece test için, ileride gizlenecek */}
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          style={{ padding: '8px 15px', cursor: 'pointer', background: isAdmin ? '#d9534f' : '#333', color: 'white', border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}
        >
          {isAdmin ? "👤 Yönetici Kokpiti (TR)" : "🌐 Customer View (EN)"}
        </button>
      </div>

      {/* ANA KOKPİT EKRANI */}
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        <h1 style={{ textAlign: 'center', color: isAdmin ? '#d9534f' : '#1a73e8' }}>
          {isAdmin ? "Safe Bridge - Yönetim Kokpiti" : "Safe Bridge - Global Escrow"}
        </h1>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '50px' }}>👁️</span>
          
          <p style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>
            {isAdmin ? "Sistem Durumu: AKTİF VE İZLENİYOR" : "System Status: ACTIVE & SECURE"}
          </p>
          
          <p style={{ color: '#666', marginTop: '10px', fontSize: '14px', lineHeight: '1.5' }}>
            {isAdmin 
              ? "Hoşdere montaj hattı disipliniyle akıllı sözleşme ve kalkan denetimi. Yetkili: İsmail Biriktiren." 
              : "Decentralized, trustless escrow services powered by smart contracts on Polygon."}
          </p>

          <button 
            onClick={() => alert(isAdmin ? "Yönetici yetkisi doğrulandı. İşlem izni aktif!" : "Please connect your MetaMask wallet first.")}
            style={{ marginTop: '25px', padding: '12px 30px', cursor: 'pointer', background: isAdmin ? '#28a745' : '#0070f3', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px', width: '100%' }}
          >
            {isAdmin ? "⚙️ Sözleşmeyi Yönet / Müdahale Et" : "🔗 Connect Wallet to Start"}
          </button>
        </div>

      </div>
    </div>
  );
}
