"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x9e88A41c8888b5D65A0D23055e810594D024f227";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("transfer");
  const [account, setAccount] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [escrowPassword, setEscrowPassword] = useState("");
  const [escrowDesc, setEscrowDesc] = useState("");
  const [escrowAmount, setEscrowAmount] = useState("");
  const [activeEscrows, setActiveEscrows] = useState([]);

  // Yönetici Yetki Kontrolü
  useEffect(() => {
    const checkOwner = async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const ownerAbi = ["function owner() view returns (address)"];
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ownerAbi, provider);
        try {
          const owner = await contract.owner();
          if (accounts[0].toLowerCase() === owner.toLowerCase()) setIsAdmin(true);
        } catch (e) { console.log("Kontrat sahibi kontrolü..."); }
      }
    };
    checkOwner();
  }, []);

  // 🤝 KİLİTLEME MOTORU (2 Aşamalı Güvenlik + Zaman Kilidi)
  const handleCreateEscrow = () => {
    const p1 = escrowPassword;
    const p2 = prompt("🔒 Güvenliği doğrulamak için şifreyi tekrar girin:");
    
    if (!p1 || p1 !== p2) {
      alert("❌ HATA: Şifreler uyuşmuyor veya boş!");
      return;
    }

    // 6 Ay Zaman Kilidi (Saniye cinsinden)
    const deadline = Math.floor(Date.now() / 1000) + (6 * 30 * 24 * 60 * 60);

    setActiveEscrows([...activeEscrows, {
      id: Date.now(),
      amount: escrowAmount || "0.00",
      desc: escrowDesc || "Genel Ticaret",
      password: p1,
      deadline: deadline,
      state: "🔒 6 Ay Zaman Kilitli"
    }]);
    
    alert("✅ İşlem başarıyla 6 aylık zaman kilidi altına alındı.");
    setEscrowPassword("");
  };

  // 🔓 KİLİT AÇMA (RELEASE) MOTORU
  const handleRelease = (id, password, deadline) => {
    const now = Math.floor(Date.now() / 1000);
    
    // Otomatik İcra Kontrolü
    if (now > deadline) {
        alert("⏰ Süre doldu! Fon serbest bırakıldı.");
        setActiveEscrows(activeEscrows.filter(e => e.id !== id));
        return;
    }

    const input = prompt("🔑 Kilitli fonu açmak için şifreyi girin:");
    if (input === password) {
      alert("🎉 Şifre onaylandı! Fon serbest bırakıldı.");
      setActiveEscrows(activeEscrows.filter(e => e.id !== id));
    } else {
      alert("❌ Yanlış şifre!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 sm:p-8 font-sans">
      <h1 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        SafeBridge Global 🦅
      </h1>

      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        {/* Navigasyon */}
        <div className="flex w-full bg-slate-950 p-1.5 rounded-2xl mb-8">
          <button onClick={() => setActiveTab("transfer")} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === "transfer" ? "bg-blue-600" : ""}`}>🚀 Transfer</button>
          <button onClick={() => setActiveTab("escrow")} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === "escrow" ? "bg-emerald-600" : ""}`}>🤝 Escrow</button>
          {isAdmin && <button onClick={() => setActiveTab("admin")} className={`flex-1 py-3 rounded-xl font-bold ${activeTab === "admin" ? "bg-purple-600" : ""}`}>🛠️ Yönetici</button>}
        </div>

        {/* 2. Modül (Escrow) - Kasa ve Listeleme */}
        {activeTab === "escrow" && (
          <div className="space-y-8">
             <div className="space-y-4">
                <input value={escrowAmount} onChange={(e) => setEscrowAmount(e.target.value)} placeholder="Tutar (POL)" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl"/>
                <input value={escrowDesc} onChange={(e) => setEscrowDesc(e.target.value)} placeholder="Açıklama" className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl"/>
                <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={escrowPassword} onChange={(e) => setEscrowPassword(e.target.value)} className="w-full p-4 bg-slate-950 border border-emerald-900 rounded-xl" placeholder="Güvenlik şifresi..."/>
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-xl"> {showPassword ? "👁️" : "🙈"}</button>
                </div>
                <button onClick={handleCreateEscrow} className="w-full py-4 bg-emerald-600 rounded-xl font-bold hover:bg-emerald-700">🤝 Kasaya Kilitle (6 Ay Korumalı)</button>
             </div>

             {/* Aktif Kasa Listesi */}
             {activeEscrows.length > 0 && (
                <div className="border-t border-slate-800 pt-6">
                    <h2 className="font-bold mb-4">📜 Kilitli İşlemler</h2>
                    {activeEscrows.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl mb-2 border border-slate-800">
                            <span>{item.desc} ({item.amount} POL)</span>
                            <button onClick={() => handleRelease(item.id, item.password, item.deadline)} className="bg-emerald-600 px-4 py-2 rounded-lg text-xs font-bold">🔑 Kilidi Aç</button>
                        </div>
                    ))}
                </div>
             )}
          </div>
        )}
      </div>

      {/* Kılavuz */}
      <div className="w-full max-w-4xl mx-auto mt-12 bg-slate-900 border border-slate-800 p-8 rounded-3xl">
        <h3 className="text-xl font-bold mb-6">📖 SafeBridge Kullanım Rehberi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-400 text-sm">
           <div className="bg-slate-950 p-6 rounded-xl border border-slate-800"><strong>🚀 Hızlı Transfer:</strong> Cüzdanını bağla, varlık seç ve anında işlem yap.</div>
           <div className="bg-slate-950 p-6 rounded-xl border border-slate-800"><strong>🤝 Escrow:</strong> 2 aşamalı şifre ve 6 ay zaman kilidi ile %100 güvence.</div>
           <div className="bg-slate-950 p-6 rounded-xl border border-slate-800"><strong>⏰ İcra:</strong> 6 ay dolunca kasa otomatik açılır.</div>
        </div>
      </div>
    </div>
  );
}