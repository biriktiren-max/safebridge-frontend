"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x9e88A41c8888b5D65A0D23055e810594D024f227";
const CONTRACT_ABI = [
  "function getTransferHistory() view returns (tuple(uint256 timestamp, string tokenType, uint256 amount, string status)[])"
];

export default function Home() {
  const [account, setAccount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const connectAndFetch = async () => {
    if (!window.ethereum) return alert("MetaMask yüklü değil!");
    
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const data = await contract.getTransferHistory();
      setTransactions(data);
    } catch (err) {
      console.error("Hata:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">SafeBridge Operasyon Merkezi 🦅</h1>
      
      {!account ? (
        <button onClick={connectAndFetch} className="bg-blue-600 px-6 py-3 rounded-lg font-bold">Cüzdanı Bağla ve Verileri Çek</button>
      ) : (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4">📋 Canlı İşlem Geçmişi</h2>
          {loading ? <p>Veriler işleniyor...</p> : (
            <table className="w-full text-left">
              <thead><tr className="text-gray-400 border-b border-gray-700"><th className="pb-2">Tarih</th><th className="pb-2">Varlık</th><th className="pb-2">Miktar</th><th className="pb-2">Durum</th></tr></thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-3">{new Date(Number(tx.timestamp) * 1000).toLocaleDateString()}</td>
                    <td className="py-3">{tx.tokenType}</td>
                    <td className="py-3 font-mono">{tx.amount.toString()}</td>
                    <td className="py-3 text-green-400">{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}