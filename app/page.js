"use client";
import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x9e88A41c8888b5D65A0D23055e810594D024f227";
const CONTRACT_ABI = ["function getTransferHistory() view returns (tuple(uint256 timestamp, string tokenType, uint256 amount, string status)[])"];

export default function Home() {
  const [account, setAccount] = useState("");
  const [transactions, setTransactions] = useState([]);

  const connectAndFetch = async () => {
    if (!window.ethereum) return alert("MetaMask yüklü değil!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const data = await contract.getTransferHistory();
    setTransactions(data);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">SafeBridge Operasyon Merkezi 🦅</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Transfer Paneli */}
        <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/30">
          <h2 className="text-xl font-bold mb-4">🚀 Yeni Transfer</h2>
          <input type="text" placeholder="Token Kontratı" className="w-full bg-gray-900 p-2 mb-3 rounded border border-gray-700" />
          <input type="text" placeholder="Alıcı Adresi" className="w-full bg-gray-900 p-2 mb-3 rounded border border-gray-700" />
          <input type="number" placeholder="Miktar" className="w-full bg-gray-900 p-2 mb-4 rounded border border-gray-700" />
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold">Gönder</button>
        </div>

        {/* Geçmiş Paneli */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4">📋 İşlem Geçmişi</h2>
          {!account ? (
            <button onClick={connectAndFetch} className="bg-green-600 px-4 py-2 rounded w-full">Cüzdanı Bağla ve Listeyi Çek</button>
          ) : (
            <table className="w-full text-left text-sm">
              <thead><tr className="text-gray-400 border-b border-gray-700"><th className="pb-2">Tarih</th><th className="pb-2">Varlık</th><th className="pb-2">Miktar</th></tr></thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-2">{new Date(Number(tx.timestamp) * 1000).toLocaleDateString()}</td>
                    <td className="py-2">{tx.tokenType}</td>
                    <td className="py-2">{tx.amount.toString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}