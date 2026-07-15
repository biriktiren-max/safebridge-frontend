"use client";
// @ts-nocheck

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// ARŞİVDEN ALINAN TEKNİK PARAMETRELER 
const CONTRACT_ADDRESS = "0x68E0c1948900699E23a5490fcE4e376EDe21588D"; // 
const ADMIN_ADDRESS = "0x68E0c1948900699E23a5490fcE4e376EDe21588D".toLowerCase(); // 

// SAFE BRIDGE V4.0 ABI 
const CONTRACT_ABI = [
  "function createBridge(address _receiver, string _password, uint256 _hours) public payable", // 
  "function claimFunds(uint256 _id, string _password) public", // 
  "function cancelAndRefund(uint256 _id) public", // 
  "function evacuateStaleFunds(uint256 _id) public", // 
  "function bridgeCount() public view returns (uint256)", // 
  "function bridges(uint256) public view returns (address sender, address receiver, uint256 amount, string password, uint256 createTime, uint256 unlockTime, bool claimed, bool refunded)" // 
];

export default function Page() {
  const [wallet, setWallet] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState("");
  const [totalBridges, setTotalBridges] = useState("0");

  // Form State'leri
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [lockHours, setLockHours] = useState("1"); // 
  const [bridgeId, setBridgeId] = useState("");
  const [claimPassword, setClaimPassword] = useState("");

  // Akıllı Kilit ve Rol Denetimi
  useEffect(() => {
    if (wallet) {
      if (wallet.toLowerCase() === ADMIN_ADDRESS) {
        setIsAdmin(true);
        setStatus("Yönetici girişi doğrulandı! (Polygon Amoy Testnet)"); // 
      } else {
        setIsAdmin(false);
        setStatus("Connected as Client (Polygon Amoy Testnet)"); // 
      }
      fetchBridgeCount();
    } else {
      setIsAdmin(false);
      setStatus("");
    }
  }, [wallet]);

  // MetaMask Bağlantısını Dinleme
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) setWallet(accounts[0]);
      });
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) setWallet(accounts[0]);
        else setWallet(null);
      });
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        setStatus("Bağlanıyor / Connecting...");
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) setWallet(accounts[0]);
      } catch (error) {
        setStatus("Bağlantı reddedildi / Connection rejected.");
      }
    } else {
      alert("MetaMask bulunamadı! / MetaMask not found!");
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setIsAdmin(false);
    setStatus("");
  };

  // Toplam Kasa Sayısını Çekme
  const fetchBridgeCount = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum, "any"); // 
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider); // 
      const count = await contract.bridgeCount(); // 
      setTotalBridges(count.toString());
    } catch (e) {
      console.log("Kasa sayısı okunamadı:", e);
    }
  };

  // 1. İŞLEM: Kasaya POL/MATIC Kilitleme (createBridge) 
  const handleCreateBridge = async () => {
    try {
      if (!window.ethereum) return;
      const finalReceiver = receiver.trim().toLowerCase(); // 
      if (finalReceiver.length !== 42) return alert(isAdmin ? "Hata: Alıcı adresi 42 karakter olmalı!" : "Error: Receiver address must be 42 characters!"); // 

      const provider = new ethers.BrowserProvider(window.ethereum, "any"); // 
      const signer = await provider.getSigner(); // 
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer); // 
      const amountWei = ethers.parseEther(amount); // 

      setStatus(isAdmin ? "Ağa gönderiliyor, lütfen MetaMask'ı onaylayın..." : "Sending to network, please confirm in MetaMask...");
      const tx = await contract.createBridge(finalReceiver, password, lockHours, { value: amountWei, gasLimit: 2000000 }); // 
      await tx.wait(); // 

      alert(isAdmin ? "İşlem Başarılı! POL kasaya kilitlendi." : "Success! POL locked in Safe Bridge.");
      fetchBridgeCount();
    } catch (e: any) {
      alert("Hata / Error: " + (e.reason || e.message)); // 
    }
  };

  // 2. İŞLEM: Alıcının Parayı Çekmesi (claimFunds) 
  const handleClaimFunds = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum, "any"); // 
      const signer = await provider.getSigner(); // 
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer); // 

      setStatus(isAdmin ? "Şifre doğrulanıyor ve transfer açılıyor..." : "Verifying password and releasing funds...");
      const tx = await contract.claimFunds(bridgeId, claimPassword); // 
      await tx.wait(); // 

      alert(isAdmin ? "Para başarıyla alıcı cüzdanına aktarıldı!" : "Funds successfully claimed to your wallet!");
    } catch (e: any) {
      alert("Hata / Error: " + (e.reason || e.message)); // 
    }
  };

  // 3. İŞLEM: Göndericinin Erken İptal ve İadesi (cancelAndRefund) 
  const handleCancelRefund = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum, "any"); // 
      const signer = await provider.getSigner(); // 
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer); // 

      setStatus(isAdmin ? "İade işlemi başlatılıyor..." : "Initiating refund...");
      const tx = await contract.cancelAndRefund(bridgeId); // 
      await tx.wait(); // 

      alert(isAdmin ? "İşlem iptal edildi ve tutar göndericiye iade oldu!" : "Transaction cancelled and refunded successfully!");
    } catch (e: any) {
      alert("Hata / Error: " + (e.reason || e.message)); // 
    }
  };

  // 4. İŞLEM: 1 Yıllık Atıl Para Tahliyesi (evacuateStaleFunds - Sadece Admin) [cite: 12, 13]
  const handleEvacuate = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum, "any"); // 
      const signer = await provider.getSigner(); // 
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer); // 

      setStatus("Atıl kasa tahliyesi tetikleniyor...");
      const tx = await contract.evacuateStaleFunds(bridgeId); // 
      await tx.wait(); // 

      alert("1 yılı dolduran atıl bakiye komisyon/tahliye cüzdanına aktarıldı!"); // [cite: 13]
    } catch (e: any) {
      alert("Tahliye Hatası: " + (e.reason || e.message));
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '650px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        {/* ÜST BİLGİ ALANI */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#666', display: 'block' }}>
              {isAdmin ? "Yetkili Cüzdan (Admin)" : "Connected Wallet"}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: wallet ? '#28a745' : '#dc3545' }}>
              {wallet ? `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}` : (isAdmin ? "Bağlantı Yok" : "Not Connected")}
            </span>
          </div>
          {wallet && (
            <button onClick={disconnectWallet} style={{ padding: '5px 10px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>
              {isAdmin ? "Çıkış Yap" : "Disconnect"}
            </button>
          )}
        </div>

        {/* ANA BAŞLIK */}
        <h1 style={{ textAlign: 'center', color: isAdmin ? '#d9534f' : '#1a73e8', marginBottom: '5px' }}>
          {isAdmin ? "Safe Bridge - Yönetim Kokpiti v4.0" : "Safe Bridge - Global Escrow v4.0"}
        </h1>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginBottom: '20px' }}>
          {isAdmin ? `Polygon Amoy Ağında Toplam Kurulan Köprü: ${totalBridges}` : `Total Active Bridges on Polygon Amoy: ${totalBridges}`}
        </p>

        {status && <p style={{ textAlign: 'center', color: isAdmin ? '#d9534f' : '#0070f3', fontWeight: 'bold', fontSize: '13px', marginBottom: '20px', background: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>{status}</p>}

        {!wallet ? (
          <button onClick={connectWallet} style={{ padding: '15px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', width: '100%', cursor: 'pointer' }}>
            🚀 Connect MetaMask / Cüzdanı Bağla
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* 1. KISIM: KASA OLUŞTURMA ALANI  */}
            <div style={{ border: '1px solid #e1e4e8', padding: '20px', borderRadius: '10px', background: '#fafbfc' }}>
              <h3 style={{ marginTop: 0, color: '#333', fontSize: '16px' }}>{isAdmin ? "🔒 Yeni Emanet Kasası Oluştur" : "🔒 Create New Escrow Lock"}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <input placeholder={isAdmin ? "Alıcı Cüzdan Adresi (0x...)" : "Receiver Address (0x...)"} value={receiver} onChange={(e) => setReceiver(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
                <input placeholder={isAdmin ? "Miktar (Örn: 0.05 POL)" : "Amount (e.g. 0.05 POL)"} value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
                <input placeholder={isAdmin ? "Gizli Parola" : "Secret Password"} value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
                <input placeholder={isAdmin ? "Kilit Süresi (Saat - Örn: 1)" : "Lock Duration (Hours - e.g. 1)"} value={lockHours} onChange={(e) => setLockHours(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} /> // 
                <button onClick={handleCreateBridge} style={{ padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
                  {isAdmin ? "KASAYA KİLİTLE VE GÖNDER" : "LOCK FUNDS IN ESCROW"} // 
                </button>
              </div>
            </div>

            {/* 2. KISIM: İŞLEM VE İADE YÖNETİMİ  */}
            <div style={{ border: '1px solid #e1e4e8', padding: '20px', borderRadius: '10px', background: '#fafbfc' }}>
              <h3 style={{ marginTop: 0, color: '#333', fontSize: '16px' }}>{isAdmin ? "⚡ Kasa İşlemleri ve İade" : "⚡ Claim or Refund Funds"}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <input placeholder={isAdmin ? "Kasa Numarası (ID)" : "Bridge ID"} value={bridgeId} onChange={(e) => setBridgeId(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
                <input placeholder={isAdmin ? "Parola (Sadece çekim için)" : "Password (Required for claim)"} value={claimPassword} onChange={(e) => setClaimPassword(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <button onClick={handleClaimFunds} style={{ flex: 1, padding: '12px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isAdmin ? "PARAYI ÇEK (Alıcı)" : "CLAIM FUNDS"}
                  </button>
                  <button onClick={handleCancelRefund} style={{ flex: 1, padding: '12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isAdmin ? "İPTAL & İADE (Gönderen)" : "CANCEL & REFUND"} // 
                  </button>
                </div>
              </div>
            </div>

            {/* 3. KISIM: SADECE YÖNETİCİYE ÖZEL TAHLİYE MODÜLÜ [cite: 12, 13] */}
            {isAdmin && (
              <div style={{ border: '2px dashed #d9534f', padding: '20px', borderRadius: '10px', background: '#fff8f8' }}>
                <h3 style={{ marginTop: 0, color: '#d9534f', fontSize: '16px' }}>🛡️ Yönetici Özel Müdahale Alanı</h3>
                <p style={{ fontSize: '12px', color: '#666' }}>1 yıl (365 gün) boyunca hareketsiz kalan veya atıl duran kasaları komisyon cüzdanına tahliye eder. [cite: 12, 13]</p>
                <button onClick={handleEvacuate} style={{ width: '100%', padding: '12px', background: '#d9534f', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                  🚨 ATIL KASAYI TAHLİYE ET (Evacuate Stale Funds) // 
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
