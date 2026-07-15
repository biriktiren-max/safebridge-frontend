"use client";
// @ts-nocheck

import { useState, useEffect } from "react";

export default function Page() {
  const [wallet, setWallet] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState("");

  // Senin Polygon Yönetici Cüzdan Adresin (Küçük harfe duyarlı kontrol için)
  const ADMIN_ADDRESS = "0x68E0c1948900699E23a5490fcE4e376EDe21588D".toLowerCase();

  // Cüzdan adresini ve admin durumunu kontrol et
  useEffect(() => {
    if (wallet) {
      if (wallet.toLowerCase() === ADMIN_ADDRESS) {
        setIsAdmin(true);
        setStatus("Yönetici girişi başarıyla doğrulandı!");
      } else {
        setIsAdmin(false);
        setStatus("Connected successfully as client.");
      }
    } else {
      setIsAdmin(false);
      setStatus("");
    }
  }, [wallet]);

  // MetaMask bağlantısını dinleme (Hesap değiştiğinde otomatik günceller)
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      // Sayfa ilk açıldığında halihazırda bağlı hesap var mı kontrol et
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        }
      });

      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        } else {
          setWallet(null);
        }
      });
    }
  }, []);

  // MetaMask bağlantı fonksiyonu
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        setStatus(wallet && wallet.toLowerCase() === ADMIN_ADDRESS ? "Bağlanıyor..." : "Connecting...");
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          setWallet(accounts[0]);
        }
      } catch (error) {
        setStatus(wallet && wallet.toLowerCase() === ADMIN_ADDRESS ? "Bağlantı reddedildi." : "Connection rejected.");
      }
    } else {
      alert(
        wallet && wallet.toLowerCase() === ADMIN_ADDRESS
          ? "MetaMask bulunamadı! Lütfen tarayıcınıza MetaMask eklentisini kurun." 
          : "MetaMask not found! Please install MetaMask extension."
      );
    }
  };

  // Çıkış yapma (Disconnect simülasyonu)
  const disconnectWallet = () => {
    setWallet(null);
    setIsAdmin(false);
    setStatus("");
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        {/* ÜST BİLGİ ALANI (Cüzdan Durumu) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#666', display: 'block' }}>
              {isAdmin ? "Bağlı Cüzdan" : "Connected Wallet"}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: wallet ? '#28a745' : '#dc3545' }}>
              {wallet 
                ? `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}` 
                : (isAdmin ? "Bağlantı Yok" : "Not Connected")}
            </span>
          </div>
          {wallet && (
            <button 
              onClick={disconnectWallet}
              style={{ padding: '5px 10px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
            >
              {isAdmin ? "Bağlantıyı Kes" : "Disconnect"}
            </button>
          )}
        </div>

        {/* ANA BAŞLIK */}
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

          {status && (
            <p style={{ color: isAdmin ? '#28a745' : '#0070f3', fontWeight: 'bold', margin: '15px 0 5px 0', fontSize: '14px' }}>
              {status}
            </p>
          )}

          {!wallet ? (
            <button 
              onClick={connectWallet}
              style={{ marginTop: '25px', padding: '12px 30px', cursor: 'pointer', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px', width: '100%' }}
            >
              🚀 Connect Wallet / Cüzdanı Bağla
            </button>
          ) : (
            <div style={{ marginTop: '25px' }}>
              {isAdmin ? (
                <div>
                  {/* Yöneticiye Özel Ek Butonlar */}
                  <button 
                    onClick={() => alert("Sözleşme yönetim modülü açılıyor...")}
                    style={{ padding: '12px 30px', cursor: 'pointer', background: '#d9534f', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px', width: '100%', marginBottom: '10px' }}
                  >
                    ⚙️ Akıllı Sözleşmeyi Yönet (Müdahale)
                  </button>
                  <button 
                    onClick={() => alert("Polygon üzerindeki kasa bakiyesi sorgulanıyor...")}
                    style={{ padding: '10px 30px', cursor: 'pointer', background: '#333', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '14px', width: '100%' }}
                  >
                    📊 Kasa Bakiyesi ve Logları İncele
                  </button>
                </div>
              ) : (
                /* Müşteriye Özel Ek Butonlar */
                <button 
                  onClick={() => alert("Escrow dashboard is loading...")}
                  style={{ padding: '12px 30px', cursor: 'pointer', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px', width: '100%' }}
                >
                  🚀 Open Escrow Dashboard
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
