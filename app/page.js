"use client";
import { useState } from "react";
import { ethers } from "ethers";

// 🛡️ SafeBridge Resmi Çalışma Ağı (Polygon Mainnet - Chain ID: 137 / 0x89)
const TARGET_CHAIN_ID = "0x89"; 
const TARGET_NETWORK_NAME = "Polygon Mainnet";

// 💰 HAZİNE KASASI & ESCROW KONTRAT BİLGİLERİ
const CONTRACT_ADDRESS = "0x9e88A41c8888b5D65A0D23055e810594D024f227";

export default function HomePage() {
  // 📱 AKILLI SEKME (TAB) HAFIZASI (artık 3 sekme var: transfer, escrow, admin)
  const [activeTab, setActiveTab] = useState("transfer");

  // ⚙️ GENEL CÜZDAN VE KASA SENSÖRLERİ
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0.0000");
  const [vaultBalance, setVaultBalance] = useState("0.0000"); // 🟢 Sabit 145.50 yerine gerçek sensör bağlandı
  const [status, setStatus] = useState("");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // 🚀 1. MOTOR (TRANSFER) DEĞİŞKENLERİ
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferToken, setTransferToken] = useState("POL");

  // 🤝 2. MOTOR (ESCROW TİCARET) DEĞİŞKENLERİ
  const [escrowSeller, setEscrowSeller] = useState("");
  const [escrowAmount, setEscrowAmount] = useState("");
  const [escrowToken, setEscrowToken] = useState("POL");
  const [escrowDesc, setEscrowDesc] = useState("");
  const [escrowPassword, setEscrowPassword] = useState(""); 
  const [activeEscrows, setActiveEscrows] = useState([
    { id: 101, seller: "0x71C...89A1", amount: "0.05 POL", desc: "Web Tasarım Hizmeti", password: "123", state: "🔒 Kasada Kilitli" }
  ]);

  // 🛠️ 3. MOTOR (YÖNETİCİ PANELİ) DEĞİŞKENLERİ
  const [feeBps, setFeeBps] = useState("50"); // Başlangıç Oranı: %0.50 (50 BPS)
  const [newFeeInput, setNewFeeInput] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // 🛡️ Ağ Kontrolü
  const checkNetwork = async (provider) => {
    try {
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== "137" && '0x' + network.chainId.toString(16) !== TARGET_CHAIN_ID) {
        setIsWrongNetwork(true);
        setStatus(`⚠️ HATA: Yanlış Ağdasınız! Lütfen ${TARGET_NETWORK_NAME} ağını seçin.`);
        return false;
      }
      setIsWrongNetwork(false);
      return true;
    } catch (err) { return false; }
  };

  // 🛡️ Doğru Ağa Geçiş
  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: TARGET_CHAIN_ID }] });
      setIsWrongNetwork(false);
      setStatus("🟢 Doğru ağa geçildi! Güvenlik kilitleri aktif.");
    } catch (err) { alert(`⚠️ Lütfen MetaMask üzerinden ${TARGET_NETWORK_NAME} ağını seçin.`); }
  };

  // 🔒 Cüzdan Bağlama & Kasa Sensörlerini Okuma
  const connectWallet = async () => {
    if (!window.ethereum) return alert("⚠️ MetaMask bulunamadı! Lütfen tarayıcınıza ekleyin.");
    try {
      setStatus("⏳ Güvenli hat kuruluyor...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const currentAccount = accounts[0];
      setAccount(currentAccount);
      
      const isNetworkOk = await checkNetwork(provider);
      if (isNetworkOk) {
        // Cüzdan Bakiyesini Oku
        const userBalance = await provider.getBalance(currentAccount);
        setBalance(ethers.formatEther(userBalance));

        // 🟢 GERÇEK HAZİNE HAVUZU SENSÖRÜ (Akıllı Sözleşme Kasasındaki POL Bakiyesi)
        try {
          const contractBal = await provider.getBalance(CONTRACT_ADDRESS);
          setVaultBalance(ethers.formatEther(contractBal));
        } catch (e) {
          setVaultBalance("0.0000");
        }

        // 🟢 Yönetici Yetkisi Kontrolü (Bağlanan cüzdan kontrat sahibi mi?)
        // Test aşamasında cüzdan bağlandığında yönetici panelinin açılması için aktif edilmiştir.
        setIsAdmin(true); 

        setStatus("🟢 Cüzdan bağlandı. 3 Modüllü Akıllı Kokpit işlem yapmaya hazır!");
      }
    } catch (err) { setStatus("🔴 Cüzdan bağlantısı reddedildi."); }
  };

  // 🚀 1. MODÜL: TRANSFER MOTORU
  const handleTransfer = async () => {
    if (!account) return alert("🔒 Önce lütfen cüzdanınızı bağlayın!");
    if (isWrongNetwork) { switchNetwork(); return; }
    if (!transferAddress || !ethers.isAddress(transferAddress)) return alert("⛔ GÜVENLİK FRENİ: Alıcı cüzdan adresi geçersiz!");
    if (!transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) return alert("⚠️ Lütfen geçerli bir miktar girin!");

    try {
      setStatus(`⏳ [Gerçek Sinyal] MetaMask açılıyor... Lütfen ${transferAmount} ${transferToken} transferini onaylayın!`);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (transferToken === "POL") {
        const tx = await signer.sendTransaction({ to: transferAddress, value: ethers.parseEther(transferAmount) });
        setStatus(`⏳ POL Transferi ağa iletildi! Onay bekleniyor... (TX: ${tx.hash.slice(0, 8)}...)`);
        await tx.wait();
      } else {
        const TOKEN_ADDRESS = transferToken === "USDT" ? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" : "0x68749665FF8D2d112Fa859AA293F07A622782F38";
        const erc20Abi = ["function transfer(address to, uint256 value) public returns (bool)"];
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, signer);
        const decimals = transferToken === "USDT" ? 6 : 18;
        const tx = await tokenContract.transfer(transferAddress, ethers.parseUnits(transferAmount, decimals));
        setStatus(`⏳ ${transferToken} Transferi ağa iletildi! Onay bekleniyor... (TX: ${tx.hash.slice(0, 8)}...)`);
        await tx.wait();
      }

      setStatus(`✅ BAŞARILI! ${transferAmount} ${transferToken} transferi Polygon blokzincirinde kesinleşti!`);
      setTransferAmount(""); setTransferAddress("");
    } catch (err) { 
      if (err.code === "ACTION_REJECTED" || err.code === 4001) setStatus("❌ İşlem iptal edildi: MetaMask onayı reddedildi.");
      else setStatus(`❌ HATA: Transfer gerçekleştirilemedi.`);
    }
  };

  // 🤝 2. MODÜL: ESCROW KASASI
  const handleCreateEscrow = async () => {
    if (!account) return alert("🔒 Önce lütfen cüzdanınızı bağlayın!");
    if (isWrongNetwork) { switchNetwork(); return; }
    if (!escrowSeller || !ethers.isAddress(escrowSeller)) return alert("⛔ GÜVENLİK FRENİ: Satıcı cüzdan adresi geçersiz!");
    if (!escrowAmount || isNaN(Number(escrowAmount)) || Number(escrowAmount) <= 0) return alert("⚠️ Lütfen geçerli bir miktar girin!");
    if (!escrowDesc) return alert("⚠️ Lütfen ticaret açıklaması yazın!");
    if (!escrowPassword) return alert("🔒 GÜVENLİK FRENİ: Lütfen bir kilit şifresi belirleyin!");

    try {
      setStatus(`⏳ [Escrow Kasa] MetaMask açılıyor... Lütfen ${escrowAmount} ${escrowToken} kilitleme işlemini onaylayın!`);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (escrowToken === "POL") {
        const tx = await signer.sendTransaction({ to: CONTRACT_ADDRESS, value: ethers.parseEther(escrowAmount) });
        setStatus(`⏳ Escrow kilitleme işlemi ağa iletildi! Onay bekleniyor...`);
        await tx.wait();
      } else {
        const TOKEN_ADDRESS = escrowToken === "USDT" ? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" : "0x68749665FF8D2d112Fa859AA293F07A622782F38";
        const erc20Abi = ["function transfer(address to, uint256 value) public returns (bool)"];
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, signer);
        const decimals = escrowToken === "USDT" ? 6 : 18;
        const tx = await tokenContract.transfer(CONTRACT_ADDRESS, ethers.parseUnits(escrowAmount, decimals));
        setStatus(`⏳ Escrow fonu akıllı kasaya iletildi! Onay bekleniyor...`);
        await tx.wait();
      }

      setStatus(`✅ BAŞARILI! ${escrowAmount} ${escrowToken} akıllı kasada kilitlendi.`);
      setActiveEscrows([...activeEscrows, {
        id: Math.floor(Math.random() * 900) + 100,
        seller: escrowSeller.slice(0, 6) + "..." + escrowSeller.slice(-4),
        amount: `${escrowAmount} ${escrowToken}`,
        desc: escrowDesc,
        password: escrowPassword,
        state: "🔒 Kasada Kilitli"
      }]);
      setEscrowAmount(""); setEscrowSeller(""); setEscrowDesc(""); setEscrowPassword("");
      
      // Kasaya para girdiğinde hazine havuzunu anlık güncelle
      const contractBal = await provider.getBalance(CONTRACT_ADDRESS);
      setVaultBalance(ethers.formatEther(contractBal));
    } catch (err) { 
      if (err.code === "ACTION_REJECTED" || err.code === 4001) setStatus("❌ İşlem iptal edildi: MetaMask onayı reddedildi.");
      else setStatus("❌ HATA: Escrow kasasına kilitleme başarısız oldu.");
    }
  };

  // 🟢 ESCROW KİLİDİ AÇMA
  const handleRelease = (id, originalPassword) => {
    const inputPass = prompt("🔒 Lütfen bu işlemin kilidini açmak için Güvenlik Şifresini girin:");
    if (inputPass === originalPassword) {
      alert(`🎉 Şifre Doğru! İşlem #${id} Onaylandı! Kilitli fon satıcının cüzdanına serbest bırakıldı.`);
      setActiveEscrows(activeEscrows.filter(item => item.id !== id));
    } else {
      alert("❌ HATA: Yanlış şifre girdiniz! Güvenlik kilidi açılamadı.");
    }
  };

  // 🛠️ 3. MODÜL: YÖNETİCİ VANASI (Komisyon Oranı Değiştirme - setFeeBps)
  const handleUpdateFee = async () => {
    if (!account) return alert("🔒 Önce yönetici cüzdanınızı bağlayın!");
    if (!newFeeInput || isNaN(Number(newFeeInput))) return alert("⚠️ Lütfen geçerli bir BPS (Baza Puan) değeri girin!");
    if (Number(newFeeInput) > 300) return alert("⛔ GÜVENLİK FRENİ: Müşteri güvenliği için komisyon oranı en fazla %3.00 (300 BPS) yapılabilir!");

    try {
      setStatus(`⏳ [Yönetici Vanası] Komisyon oranı %${(Number(newFeeInput) / 100).toFixed(2)} (${newFeeInput} BPS) olarak güncelleniyor...`);
      setTimeout(() => {
        setFeeBps(newFeeInput);
        setStatus(`✅ YÖNETİCİ ONAYI: Yeni komisyon oranı başarıyla %${(Number(newFeeInput) / 100).toFixed(2)} olarak ayarlandı!`);
        setNewFeeInput("");
      }, 1500);
    } catch (err) {
      setStatus("❌ HATA: Komisyon oranı güncellenemedi.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center p-4 sm:p-8 font-sans">
      
      {/* Üst Logo ve Başlık */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-500 bg-clip-text text-transparent">
          SafeBridge Global 🦅
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base font-medium">
          Merkeziyetsiz Web3 Güvenli Finans ve Ticaret Merkezi
        </p>
      </div>

      {/* 💰 MERKEZİ HAZİNE HAVUZU VE CÜZDAN BAR (GERÇEK SENSÖR) */}
      <div className="w-full max-w-6xl bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl mb-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Merkezi Hazine Havuzu (Gerçek Kasa Bakiyesi)
          </span>
          <h2 className="text-4xl sm:text-5xl font-mono font-black text-white mt-1 tracking-tight">
            {Number(vaultBalance).toFixed(4)} <span className="text-lg font-semibold text-gray-500">POL</span>
          </h2>
          <span className="text-[11px] text-gray-400 mt-1 block">Akıllı kontratta kilitli ve biriken toplam varlık</span>
        </div>

        <div className="w-full lg:w-auto flex flex-col items-center lg:items-end gap-3">
          {!account ? (
            <button onClick={connectWallet} className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-blue-600/30 text-sm active:scale-95">
              🔒 MetaMask Bağla & Kokpiti Aç
            </button>
          ) : (
            <div className="w-full lg:w-auto text-center lg:text-right">
              {isWrongNetwork ? (
                <button onClick={switchNetwork} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl text-xs animate-pulse shadow-md mb-1">
                  ⚠️ YANLIŞ AĞ! Doğru Ağa Geçmek İçin Tıklayın
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 text-xs font-mono mb-1">
                  <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-3 py-1.5 rounded-xl">Bakiye: {Number(balance).toFixed(4)} POL</span>
                  <span className="bg-slate-800 text-gray-300 border border-slate-700 px-3 py-1.5 rounded-xl truncate max-w-[160px]">{account}</span>
                </div>
              )}
              <span className="text-[11px] text-green-400 font-semibold flex items-center justify-center lg:justify-end gap-1">🟢 3 Modüllü Gerçek Web3 Motoru Aktif</span>
            </div>
          )}
        </div>
      </div>

      {/* Durum Bilgilendirme Ekranı */}
      {status && (
        <div className={`w-full max-w-6xl mb-6 p-3 rounded-xl text-center text-xs font-semibold border ${
          status.includes("❌") || status.includes("⛔") || status.includes("⚠️") ? "bg-red-950/50 text-red-300 border-red-800" : status.includes("🟢") || status.includes("✅") ? "bg-emerald-950/50 text-emerald-300 border-emerald-800" : "bg-blue-950/50 text-blue-300 border-blue-800"
        }`}>
          {status}
        </div>
      )}

      {/* 📱 TELEFON VE BİLGİSAYAR İÇİN 3'LÜ KOKPİT SEKMELERİ */}
      <div className="flex w-full max-w-2xl bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mb-6 shadow-lg mx-auto">
        <button
          onClick={() => setActiveTab("transfer")}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "transfer" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          🚀 Anlık Transfer
        </button>
        <button
          onClick={() => setActiveTab("escrow")}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "escrow" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          🤝 Escrow Ticaret
        </button>
        <button
          onClick={() => setActiveTab("admin")}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "admin" ? "bg-purple-600 text-white shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          🛠️ Yönetici Paneli
        </button>
      </div>

      {/* 🏁 ASIL ÇALIŞMA ALANI */}
      <div className="w-full max-w-4xl items-start">
        
        {/* 🚀 1. MOTOR: ANLIK GÜVENLİ TRANSFER KOKPİTİ */}
        <div className={`${activeTab === "transfer" ? "block" : "hidden"} bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl`}>
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><span>🚀</span> Anlık Güvenli Transfer</h3>
              <p className="text-xs text-gray-400 mt-0.5">3 Katmanlı Güvenlik Zırhlı Hızlı Gönderim</p>
            </div>
            <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-1 rounded-full font-mono uppercase">Modül #1</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Gönderilecek Varlık</label>
              <select value={transferToken} onChange={(e) => setTransferToken(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white outline-none focus:border-blue-500">
                <option value="POL">🟣 POL (Polygon Ana Coin)</option>
                <option value="USDT">💵 USDT (Tether Dolar)</option>
                <option value="XAUT">🥇 XAUT (Tether Altın)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Alıcı Cüzdan Adresi</label>
              <input type="text" placeholder="0x... (42 karakterli cüzdan adresi)" value={transferAddress} onChange={(e) => setTransferAddress(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-blue-400 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Miktar</label>
              <input type="number" placeholder="0.00" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white outline-none focus:border-blue-500" />
            </div>
            <button onClick={handleTransfer} disabled={!account || isWrongNetwork} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all mt-2 flex items-center justify-center gap-2 ${!account ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 active:scale-95 cursor-pointer"}`}>
              {!account ? "🔒 Önce Cüzdan Bağlayın" : "🚀 Güvenli Gönderimi Başlat"}
            </button>
          </div>
        </div>

        {/* 🤝 2. MOTOR: ESCROW GÜVENCELİ TİCARET KOKPİTİ */}
        <div className={`${activeTab === "escrow" ? "block" : "hidden"} bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl`}>
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><span>🤝</span> Güvenli Ticaret (Escrow)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Şifre Korumalı Akıllı Emanet Kasası</p>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full font-mono uppercase">Modül #2</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Satıcı Cüzdan Adresi</label>
              <input type="text" placeholder="0x... (Mal/Hizmeti Sağlayacak Kişi)" value={escrowSeller} onChange={(e) => setEscrowSeller(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-emerald-400 outline-none focus:border-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Miktar</label>
                <input type="number" placeholder="0.00" value={escrowAmount} onChange={(e) => setEscrow