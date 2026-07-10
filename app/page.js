"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";

const TANIMLI_TOKENLAR = [
  { name: "Tether Gold", symbol: "XAUt", address: "0x68749665FF8E2d113303102A6A2f86237887192C" },
  { name: "Tether USD", symbol: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" },
  { name: "USD Coin", symbol: "USDC", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" }
];

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [assetType, setAssetType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState([]); 

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      } catch (error) { console.error(error); }
    } else { alert("MetaMask yüklü değil!"); }
  };

  const tokenSec = (token) => {
    setTokenAddress(token.address);
    setAssetType(token.symbol);
  };

  const executeTransfer = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const parsedAmount = ethers.parseUnits(amount, 18);
      const tx = await contract.sendTokens(tokenAddress, toAddress, parsedAmount, assetType);
      
      const newTx = { id: tx.hash, type: assetType, amount: amount, status: "⏳ Onayda..." };
      setTransactions([newTx, ...transactions]);
      await tx.wait();
      setTransactions([{ ...newTx, status: "✅ Tamamlandı" }, ...transactions]);
      setToAddress(""); setAmount("");
    } catch (error) { console.error(error); alert("İşlem hatası!"); } finally { setIsProcessing(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 py-4 border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-400">SafeBridge 🦅</h1>
          <p className="text-gray-400 text-sm">Merkeziyetsiz Varlık Transfer Ağı</p>
        </div>
        <button onClick={connectWallet} className="bg-orange-500 px-4 py-2 rounded-lg font-bold">
          {walletAddress ? `${walletAddress.substring(0, 6)}...` : "🦊 Cüzdanı Bağla"}
        </button>
      </header>

      {walletAddress && (
        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-gray-800/40 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-bold mb-4">🔄 Yeni Transfer</h2>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {TANIMLI_TOKENLAR.map((t, i) => (
                <button key={i} onClick={() => tokenSec(t)} className="bg-gray-900 p-2 rounded-lg text-xs border border-gray-700 hover:border-blue-500">
                  <div className="font-bold">{t.symbol}</div>
                </button>
              ))}
            </div>
            <form onSubmit={executeTransfer} className="space-y-4">
              <input type="text" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} placeholder="Token Kontratı" className="w-full bg-gray-900 p-3 rounded-lg border border-gray-700" />
              <input type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="Alıcı Adresi" className="w-full bg-gray-900 p-3 rounded-lg border border-gray-700" />
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Miktar" className="w-full bg-gray-900 p-3 rounded-lg border border-gray-700" />
              <button type="submit" disabled={isProcessing} className="w-full bg-blue-600 py-3 rounded-xl font-bold">
                {isProcessing ? '⚙️ İşleniyor...' : '🚀 Gönder'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-gray-800/20 p-6 rounded-2xl border border-gray-700">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700 text-center">
                <p className="text-gray-400 text-xs">TOPLAM İŞLEM</p>
                <p className="text-2xl font-bold text-blue-400">{transactions.length}</p>
              </div>
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700 text-center">
                <p className="text-gray-400 text-xs">SİSTEM DURUMU</p>
                <p className="text-2xl font-bold text-green-500">AKTİF</p>
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4">📋 Son İşlemler</h2>
            <div className="space-y-3">
              {transactions.map((tx, i) => (
                <div key={i} className="bg-gray-900/40 p-3 rounded-lg border border-gray-700 flex justify-between">
                  <span className="text-sm font-mono">{tx.amount} {tx.type}</span>
                  <span className="text-sm font-bold">{tx.status}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}