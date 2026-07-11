"use client";
import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x9e88A41c8888b5D65A0D23055e810594D024f227";
const CONTRACT_ABI = ["function getTransferHistory() view returns (tuple(uint256 timestamp, string tokenType, uint256 amount, string status)[])"];

export default function Home() {
  const [account, setAccount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [selectedToken, setSelectedToken] = useState("USDT");

  const connectAndFetch = async () => {
    if (!window.ethereum) return alert("MetaMask yüklü değil!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const data = await contract.getTransferHistory();
      setTransactions(data);
    } catch (err) {
      console.error("Bağlantı veya veri çekme hatası:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">SafeBridge Operasyon Merkezi 🦅</h1>
      
      {/* 💰 Hazine Havuzu (Komisyon Takibi) */}
      <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-500/50 mb-8 shadow-lg">
        <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
          💰 Hazine Havuzu (Toplam Komisyon)
        </h3>
        <p className="text-4xl font-mono font-extrabold text-white">
          0.00 <span className="text-sm font-normal text-gray-400">USDT</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Transfer Paneli - GÜNCELLENDİ (Token Kontratı Kutusu Söküldü, Seçim Menüsü Takıldı) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/30 shadow-md">
          <h2 className="text-xl font-bold mb-4">🚀 Yeni Transfer</h2>
          
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Gönderilecek Varlık</label>
          <select 
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full bg-gray-900 p-3.5 mb-3 rounded border border-gray-700 font-semibold text-blue-300 outline-none focus:border-blue-500 transition-all"
          >
            <option value="USDT">💵 USDT (Tether Dolar)</option>
            <option value="XAUT">🥇 XAUT (Tether Altın)</option>
          </select>

          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Alıcı Adresi</label>
          <input type="text" placeholder="0x..." className="w-full bg-gray-900 p-3 mb-3 rounded border border-gray-700 font-mono text-sm outline-none focus:border-blue-500" />
          
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Miktar</label>
          <input type="number" placeholder="0.00" className="w-full bg-gray-900 p-3 mb-4 rounded border border-gray-700 outline-none focus:border-blue-500" />
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-3.5 rounded font-bold transition-all shadow-lg text-white">
            Güvenli Gönderimi Başlat ({selectedToken})
          </button>
        </div>

        {/* Geçmiş Paneli */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <h2 className="text-xl font-bold mb-4">📜 İşlem Geçmişi</h2>
          {!account ? (
            <button onClick={connectAndFetch} className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded w-full font-bold transition-all shadow-lg text-white">
              Cüzdanı Bağla ve Listeyi Çek
            </button>
          ) : (
            <div className="space-y-3 mt-4 max-h-60 overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-sm">Henüz kayıtlı işlem bulunmuyor.</p>
              ) : (
                transactions.map((tx, index) => (
                  <div key={index} className="bg-gray-900 p-3 rounded border border-gray-700 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-blue-300">{tx.tokenType}</p>
                      <p className="text-xs text-gray-500">{new Date(Number(tx.timestamp) * 1000).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-green-400 font-bold">{tx.amount.toString()}</p>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-900/60 rounded text-blue-200 border border-blue-500/30">{tx.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}