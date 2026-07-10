"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [assetType, setAssetType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Şimdilik görsel amaçlı boş bir işlem geçmişi listesi (Yakında sözleşmeden çekeceğiz)
  const [transactions, setTransactions] = useState([]); 

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Bağlantı hatası:", error);
      }
    } else {
      alert("Ustabaşı uyarısı: Lütfen tarayıcınıza MetaMask yükleyin!");
    }
  };

  const executeTransfer = async (e) => {
    e.preventDefault();
    if (!toAddress || !amount || !tokenAddress || !assetType) {
      alert("Ustam, lütfen tüm alanları eksiksiz doldur!");
      return;
    }

    try {
      setIsProcessing(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const parsedAmount = ethers.parseUnits(amount, 18);

      const tx = await contract.sendTokens(tokenAddress, toAddress, parsedAmount, assetType);
      
      // İşlem başladığında sağdaki panele "Beklemede" olarak ekle
      const newTx = { id: tx.hash, type: assetType, amount: amount, status: "⏳ Ağda Onay Bekliyor..." };
      setTransactions([newTx, ...transactions]);

      await tx.wait();
      
      // Onaylanınca durumu güncelle
      setTransactions([{ ...newTx, status: "✅ Tamamlandı" }, ...transactions]);
      
      setToAddress("");
      setAmount("");
      setTokenAddress("");
      setAssetType("");

    } catch (error) {
      console.error("Transfer hatası:", error);
      alert("Sistemde bir arıza oluştu: " + (error.reason || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Üst Bilgi Paneli (Tabela) */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-12 py-4 border-b border-gray-800">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
            SafeBridge 🦅
          </h1>
          <p className="text-gray-400 text-sm mt-1 tracking-wide">Merkeziyetsiz Varlık Transfer Ağı</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          {walletAddress ? (
            <div className="flex items-center gap-3 bg-gray-800/50 border border-gray-700 px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-mono text-gray-300">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </span>
            </div>
          ) : (
            <button onClick={connectWallet} className="bg-orange-500 hover:bg-orange-600 transition-all px-6 py-2 rounded-lg font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2">
              🦊 Cüzdanı Bağla
            </button>
          )}
        </div>
      </header>

      {/* Ana Kokpit (İki Sütunlu Tasarım) */}
      {walletAddress && (
        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sol Sütun: Transfer Motoru */}
          <div className="lg:col-span-5 bg-gray-800/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-100 border-b border-gray-700 pb-2">🔄 Yeni Transfer İşlemi</h2>
            <form onSubmit={executeTransfer} className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gönderilecek Token Kontratı</label>
                <input type="text" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-blue-300 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="0x..." />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alıcı Cüzdan Adresi</label>
                <input type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-blue-300 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="0x..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Miktar</label>
                  <input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-blue-300 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 transition-all outline-none" placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Varlık Tipi</label>
                  <input type="text" value={assetType} onChange={(e) => setAssetType(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-blue-300 placeholder-gray-600 focus:ring-2 focus:ring-blue-500 transition-all outline-none uppercase" placeholder="Örn: ISC" />
                </div>
              </div>

              <button type="submit" disabled={isProcessing} className={`w-full mt-4 font-bold py-4 rounded-xl text-white transition-all duration-300 ${isProcessing ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transform hover:-translate-y-0.5'}`}>
                {isProcessing ? '⚙️ Motor Çalışıyor...' : '🚀 Gönderimi Başlat'}
              </button>
            </form>
          </div>

          {/* Sağ Sütun: İşlem Kayıtları Panosu */}
          <div className="lg:col-span-7 bg-gray-800/20 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
            <h2 className="text-xl font-bold mb-6 text-gray-100 border-b border-gray-700 pb-2">📋 Son İşlem Kayıtları</h2>
            
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <div key={index} className="bg-gray-900/40 p-4 rounded-xl border border-gray-700 flex justify-between items-center hover:bg-gray-800/60 transition-colors">
                    <div>
                      <div className="text-sm font-bold text-gray-200">{tx.amount} {tx.type}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">Tx: {tx.id.substring(0, 10)}...</div>
                    </div>
                    <div className="text-sm font-medium px-3 py-1 bg-gray-800 rounded-full border border-gray-600">
                      {tx.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                  <div className="text-4xl mb-3 opacity-50">📭</div>
                  <p>Henüz bu oturumda işlem yapılmadı.</p>
                  <p className="text-xs mt-1">Motoru çalıştırdığınızda kayıtlar buraya düşecek.</p>
                </div>
              )}
            </div>
          </div>
          
        </main>
      )}
    </div>
  );
}
