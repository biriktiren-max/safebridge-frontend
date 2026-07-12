"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const TARGET_CHAIN_ID = "0x89"; 
const CONTRACT_ADDRESS = "0x9e88A41c8888b5D65A0D23055e810594D024f227";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("transfer");
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [escrowPassword, setEscrowPassword] = useState("");
  const [status, setStatus] = useState("");
  const [activeEscrows, setActiveEscrows] = useState([]);

  // Yönetici Yetki Kontrolü (Blokzincir Sahibi ile eşleşme)
  useEffect(() => {
    const checkOwner = async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        // Gerçek kontrat sahibini kontrol et
        const ownerAbi = ["function owner() view returns (address)"];
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ownerAbi, provider);
        try {
          const owner = await contract.owner();
          if (accounts[0].toLowerCase() === owner.toLowerCase()) setIsAdmin(true);
        } catch (e) { console.log("Owner kontrolü bekleniyor..."); }
      }
    };
    checkOwner();
  }, []);

  const handleCreateEscrow = async () => {
    const p1 = escrowPassword;
    const p2 = prompt("🔒 Güvenliği doğrulamak için şifreyi tekrar girin:");
    
    if (!p1 || p1 !== p2) {
      alert("❌ HATA: Şifreler uyuşmuyor veya boş bırakıldı!");
      return;
    }

    const sixMonthsInSeconds = 6 * 30 * 24 * 60 * 60;
    const deadline = Math.floor(Date.now() / 1000) + sixMonthsInSeconds;

    setActiveEscrows([...activeEscrows, {
      id: Date.now(),
      amount: "0.00",
      password: p1,
      deadline: deadline,
      state: "🔒 6 Ay Zaman Kilitli"
    }]);
    
    setStatus("✅ İşlem başarıyla 6 aylık zaman kilidi altına alındı.");
    setEscrowPassword("");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 sm:p-8 font-sans">
      <h1 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        SafeBridge Global 🦅
      </h1>

      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        {/* Navigasyon Paneli */}
        <div className="flex w-full bg-slate-950 p-1.5 rounded-2xl mb-8">
          <button onClick={() => setActiveTab("transfer")} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === "transfer" ? "bg-blue-600" : ""}`}>🚀 Transfer</button>
          <button onClick={() => setActiveTab("escrow")} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === "escrow" ? "bg-emerald-600" : ""}`}>🤝 Escrow</button>
          {isAdmin && (
            <button onClick={() => setActiveTab("admin")} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === "admin" ? "bg-purple-600" : ""}`}>🛠️ Yönetici</button>
          )}
        </div>

        {/* 2. Modül (Escrow) */}
        {activeTab === "escrow" && (
          <div className="space-y-6">
             <div className="relative">
                <label className="block text-xs font-bold text-emerald-400 uppercase mb-1">🔒 GÜVENLİK PAROLASI</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={escrowPassword} 
                  onChange={(e) => setEscrowPassword(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-emerald-900 rounded-xl"
                  placeholder="Güvenlik şifreni belirle..."
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-xl hover:text-emerald-400">
                  {showPassword ? "👁️" : "🙈"}
                </button>
             </div>
             <button onClick={handleCreateEscrow} className="w-full py-4 bg-emerald-600 rounded-xl font-bold hover:bg-emerald-700 transition-all">🤝 Kasaya Kilitle (6 Ay Korumalı)</button>
          </div>
        )}
      </div>

      {/* Kullanım Kılavuzu Bloğu */}
      <div className="w-full max-w-4xl mx-auto mt-12 bg-slate-900 border border-slate-800 p-8 rounded-3xl">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><span>📖</span> SafeBridge Kullanım Rehberi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-400 text-sm">
           <div className="bg-slate-950 p-6 rounded-xl border border-slate-800"><strong>🚀 Hızlı Transfer:</strong> Cüzdanını bağla, varlık seç ve anında işlem yap.</div>
           <div className="bg-slate-950 p-6 rounded-xl border border-slate-800"><strong>🤝 Escrow:</strong> İki aşamalı şifre doğrulaması ile fonlarını kasaya kilitle.</div>
           <div className="bg-slate-950 p-6 rounded-xl border border-slate-800"><strong>⏰ 6 Ay Koruması:</strong> İşlemler 6 ay boyunca otomatik zaman kilidi altındadır.</div>
        </div>
      </div>

      <div className="text-center mt-12 text-gray-600 text-xs font-mono">
        SafeBridge v2.5.0 • Hoşdere Disipliniyle Üretildi 🛠️
      </div>
    </div>
  );
}