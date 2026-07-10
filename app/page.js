"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

// Kontrat adresin ve ABI'n (Daha önce konuştuğumuz veriler)
const CONTRACT_ADDRESS = "0x9e88A41c8888b5D65A0D23055e810594D024f227";
const CONTRACT_ABI = [ /* Buraya ABI kodlarını yapıştırabilirsin, şimdilik sadece bağlantıyı kuruyoruz */ ];

export default function Home() {
  const [account, setAccount] = useState("");
  const [komisyonOrani] = useState("0.5%");

  // Cüzdan bağlama fonksiyonu
  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } else {
      alert("Lütfen MetaMask kurun!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-blue-400">SafeBridge Operasyon Merkezi 🦅</h1>
        <button 
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition"
        >
          {account ? `${account.substring(0,6)}... bağlı` : "Cüzdanı Bağla"}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gişe Paneli */}
        <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/30">
          <h2 className="text-xl font-bold mb-4">💰 Gişe & Komisyon Oranı</h2>
          <p className="text-gray-400">Aktif Komisyon Oranımız: <span className="text-green-400 font-bold">{komisyonOrani}</span></p>
        </div>

        {/* Gerçek Veri Geçmişi */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4">📋 Blockchain İşlem Geçmişi</h2>
          {!account ? (
            <p className="text-gray-500 italic">Verileri görmek için cüzdanı bağlayın...</p>
          ) : (
            <div className="text-green-400">Bağlantı başarılı! Kontrat verileri çekiliyor...</div>
          )}
        </div>
      </div>
    </div>
  );
}