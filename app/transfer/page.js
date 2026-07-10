"use client";
import { useState } from "react";

export default function TransferPage() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const handleTransfer = async () => {
    if (!window.ethereum) return alert("MetaMask yüklü değil!");
    
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      alert("Transfer işlemi cüzdan üzerinden başlatılıyor...");
      // Transfer mantığı buraya gelecek
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8 flex flex-col items-center">
      <div className="w-full max-w-md mb-8">
        <h1 className="text-3xl font-bold">SafeBridge</h1>
        <p className="text-gray-500">Güvenli ve hızlı transfer noktası</p>
      </div>
      
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Varlık Seçin</label>
          <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none">
            <option>USDT (Tether)</option>
            <option>XAUt (Altın)</option>
          </select>
        </div>
        
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Alıcı Adresi</label>
          <input 
            type="text" 
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" 
            placeholder="0x... ile başlayan adres"
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Miktar</label>
          <input 
            type="number" 
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" 
            placeholder="0.00"
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button 
          onClick={handleTransfer}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-md"
        >
          Transferi Onayla
        </button>
      </div>
    </div>
  );
}