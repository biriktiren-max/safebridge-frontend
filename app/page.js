"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [komisyonOrani] = useState("0.5%"); 

  useEffect(() => {
    setTransactions([
      { id: "0x123...abc", type: "USDT", amount: "500", status: "✅ Başarılı", tarih: "10.07.2026" },
      { id: "0x456...def", type: "XAUt", amount: "1.2", status: "✅ Başarılı", tarih: "09.07.2026" }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8 font-sans">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">SafeBridge Operasyon Merkezi 🦅</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gişe Paneli */}
        <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/30">
          <h2 className="text-xl font-bold mb-4">💰 Gişe & Komisyon Oranı</h2>
          <p className="text-gray-400">Aktif Komisyon Oranımız: <span className="text-green-400 font-bold">{komisyonOrani}</span></p>
          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
            <p className="text-sm">Her başarılı transferde sistem otomatik olarak {komisyonOrani}'lik hizmet bedelini havuz hesabına aktarır.</p>
          </div>
        </div>

        {/* Detaylı Geçmiş */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4">📋 Tüm İşlem Geçmişi</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700">
                <th className="pb-2">Tarih</th>
                <th className="pb-2">Varlık</th>
                <th className="pb-2">Miktar</th>
                <th className="pb-2">Durum</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-3">{tx.tarih}</td>
                  <td className="py-3">{tx.type}</td>
                  <td className="py-3 font-mono">{tx.amount}</td>
                  <td className="py-3 text-sm">{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}