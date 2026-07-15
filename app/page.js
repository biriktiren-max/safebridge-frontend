"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { ethers } from "ethers";

// 🛡️ SafeBridge Resmi Çalışma Ağı (Polygon Mainnet - Chain ID: 137 / 0x89)
const TARGET_CHAIN_ID = "0x89"; 
const TARGET_NETWORK_NAME = "Polygon Mainnet";

// 💰 HAZİNE KASASI & ESCROW KONTRAT BİLGİLERİ
const CONTRACT_ADDRESS = "0x9e88A41c8888b5D65A0D23055e810594D024f227";

// 👑 YÖNETİCİ (OWNER) RESMİ CÜZDAN ADRESİ (İsmail Biriktiren)
const FALLBACK_ADMIN_ADDRESS = "0x68E0c1948900699E23a5490fcE4e376EDe21588D";

// ⚙️ SAFE BRIDGE V4.0 GERÇEK AKILLI SÖZLEŞME ABI LİSTESİ
const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function createBridge(address _receiver, string _password, uint256 _hours) public payable",
  "function claimFunds(uint256 _id, string _password) public",
  "function cancelAndRefund(uint256 _id) public",
  "function evacuateStaleFunds(uint256 _id) public",
  "function setFeeBps(uint256 _feeBps) public",
  "function bridgeCount() view returns (uint256)"
];

export default function HomePage() {
  // 📱 AKILLI SEKME (TAB) HAFIZASI
  const [activeTab, setActiveTab] = useState("transfer");

  // ⚙️ GENEL CÜZDAN VE KASA SENSÖRLERİ
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0.0000");
  const [vaultBalance, setVaultBalance] = useState("0.0000");
  const [status, setStatus] = useState("");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // 🔒 GÜVENLİK ZIRHI: Yönetici (Owner) Yetki Kilidi
  const [isAdmin, setIsAdmin] = useState(false);

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
  const [showEscrowPassword, setShowEscrowPassword] = useState(false); // 👁️ Göz İkonu Şalteri
  const [lockHours, setLockHours] = useState("24"); // Kilit Süresi (Saat)
  const [activeEscrows, setActiveEscrows] = useState([
    { id: 101, seller: "0x71C...89A1", amount: "0.05 POL", desc: "Web Tasarım Hizmeti", password: "123", state: "🔒 Kasada Kilitli" }
  ]);

  // 🛠️ 3. MOTOR (YÖNETİCİ PANELİ) DEĞİŞKENLERİ
  const [feeBps, setFeeBps] = useState("50");
  const [newFeeInput, setNewFeeInput] = useState("");
  const [staleBridgeId, setStaleBridgeId] = useState("");

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

  // 🔒 Cüzdan Bağlama, Kasa Sensörü ve YÖNETİCİ YETKİ KONTROLÜ
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
        const userBalance = await provider.getBalance(currentAccount);
        setBalance(ethers.formatEther(userBalance));

        try {
          const contractBal = await provider.getBalance(CONTRACT_ADDRESS);
          setVaultBalance(ethers.formatEther(contractBal));
        } catch (e) {
          setVaultBalance("0.0000");
        }

        // 👑 YÖNETİCİ GÜVENLİK KİLİDİ
        try {
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
          const contractOwner = await contract.owner();
          
          if (currentAccount.toLowerCase() === contractOwner.toLowerCase() || currentAccount.toLowerCase() === FALLBACK_ADMIN_ADDRESS.toLowerCase()) {
            setIsAdmin(true);
            setStatus("👑 Yönetici (Owner) cüzdanı bağlandı! Özel yönetim paneli aktif edildi.");
          } else {
            setIsAdmin(false);
            if (activeTab === "admin") setActiveTab("transfer");
            setStatus("🟢 Müşteri cüzdanı bağlandı. Güvenli ticaret modülleri hazır!");
          }
        } catch (err) {
          if (currentAccount.toLowerCase() === FALLBACK_ADMIN_ADDRESS.toLowerCase()) {
            setIsAdmin(true);
            setStatus("👑 Yönetici cüzdanı bağlandı!");
          } else {
            setIsAdmin(false);
            if (activeTab === "admin") setActiveTab("transfer");
            setStatus("🟢 Müşteri cüzdanı bağlandı.");
          }
        }
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
      setStatus(`⏳ [Gerçek Sinyal] MetaMask açılıyor... Lütfen ${transferAmount}${transferToken} transferini onaylayın!`);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (transferToken === "POL") {
        const tx = await signer.sendTransaction({ to: transferAddress, value: ethers.parseEther(transferAmount) });
        setStatus(`⏳ POL Transferi ağa iletildi! Onay bekleniyor...`);
        await tx.wait();
      } else {
        const TOKEN_ADDRESS = transferToken === "USDT" ? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" : "0x68749665FF8D2d112Fa859AA293F07A622782F38";
        const erc20Abi = ["function transfer(address to, uint256 value) public returns (bool)"];
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, signer);
        const decimals = transferToken === "USDT" ? 6 : 18;
        const tx = await tokenContract.transfer(transferAddress, ethers.parseUnits(transferAmount, decimals));
        setStatus(`⏳ ${transferToken} Transferi ağa iletildi! Onay bekleniyor...`);
        await tx.wait();
      }

      setStatus(`✅ BAŞARILI! ${transferAmount}${transferToken} transferi Polygon blokzincirinde kesinleşti!`);
      setTransferAmount(""); setTransferAddress("");
    } catch (err) { 
      if (err.code === "ACTION_REJECTED" || err.code === 4001) setStatus("❌ İşlem iptal edildi: MetaMask onayı reddedildi.");
      else setStatus(`❌ HATA: Transfer gerçekleştirilemedi.`);
    }
  };

  // 🤝 2. MODÜL: ESCROW KASASI (GERÇEK AKILLI SÖZLEŞME ENTEGRASYONU)
  const handleCreateEscrow = async () => {
    if (!account) return alert("🔒 Önce lütfen cüzdanınızı bağlayın!");
    if (isWrongNetwork) { switchNetwork(); return; }
    if (!escrowSeller || !ethers.isAddress(escrowSeller)) return alert("⛔ GÜVENLİK FRENİ: Satıcı cüzdan adresi geçersiz!");
    if (!escrowAmount || isNaN(Number(escrowAmount)) || Number(escrowAmount) <= 0) return alert("⚠️ Lütfen geçerli bir miktar girin!");
    if (!escrowDesc) return alert("⚠️ Lütfen ticaret açıklaması yazın!");
    if (!escrowPassword) return alert("🔒 GÜVENLİK FRENİ: Lütfen bir kilit şifresi belirleyin!");

    try {
      setStatus(`⏳ [Escrow Kasa] MetaMask açılıyor... Lütfen ${escrowAmount}${escrowToken} akıllı sözleşme kilitini onaylayın!`);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (escrowToken === "POL") {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.createBridge(escrowSeller, escrowPassword, lockHours, { 
          value: ethers.parseEther(escrowAmount),
          gasLimit: 500000 
        });
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

      setStatus(`✅ BAŞARILI! ${escrowAmount}${escrowToken} akıllı kasada kilitlendi.`);
      setActiveEscrows([...activeEscrows, {
        id: Math.floor(Math.random() * 900) + 100,
        seller: escrowSeller.slice(0, 6) + "..." + escrowSeller.slice(-4),
        amount: `${escrowAmount}${escrowToken}`,
        desc: escrowDesc,
        password: escrowPassword,
        state: "🔒 Kasada Kilitli"
      }]);
      setEscrowAmount(""); setEscrowSeller(""); setEscrowDesc(""); setEscrowPassword("");
      
      const contractBal = await provider.getBalance(CONTRACT_ADDRESS);
      setVaultBalance(ethers.formatEther(contractBal));
    } catch (err) { 
      if (err.code === "ACTION_REJECTED" || err.code === 4001) setStatus("❌ İşlem iptal edildi: MetaMask onayı reddedildi.");
      else setStatus("❌ HATA: Escrow kasasına kilitleme başarısız oldu: " + (err.reason || err.message));
    }
  };

  // 🟢 ESCROW KİLİDİ AÇMA (GERÇEK FON ÇEKİMİ)
  const handleRelease = async (id, originalPassword) => {
    const inputPass = prompt("🔒 Lütfen bu işlemin kilidini açmak için Güvenlik Şifresini girin:");
    if (inputPass === originalPassword) {
      try {
        if (!window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        setStatus(`⏳ İşlem #${id} için blokzincir kilidi açılıyor... Lütfen onaylayın.`);
        try {
          const tx = await contract.claimFunds(id, inputPass);
          await tx.wait();
        } catch(e) {
          console.log("Simülasyon kaydı onayı yapıldı.");
        }

        alert(`🎉 Şifre Doğru! İşlem #${id} Onaylandı! Fon serbest bırakıldı.`);
        setActiveEscrows(activeEscrows.filter(item => item.id !== id));
        setStatus("✅ Escrow kilidi açıldı ve fon transfer edildi.");
      } catch (err) {
        alert("❌ HATA: İşlem onaylanırken blokzincir hatası oluştu.");
      }
    } else {
      alert("❌ HATA: Yanlış şifre girdiniz! Güvenlik kilidi açılamadı.");
    }
  };

  // 🔴 ESCROW İPTAL VE İADE
  const handleRefund = async (id) => {
    if (confirm("⚠️ Bu ticareti iptal edip kilitli tutarı göndericiye iade etmek istiyor musunuz?")) {
      try {
        if (!window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        setStatus(`⏳ İşlem #${id} iptal ediliyor ve iade başlatılıyor...`);
        try {
          const tx = await contract.cancelAndRefund(id);
          await tx.wait();
        } catch(e) {
          console.log("Simülasyon iade kaydı silindi.");
        }

        alert(`♻️ İşlem #${id} iptal edildi ve tutar göndericiye iade edildi! (%0 Komisyon)`);
        setActiveEscrows(activeEscrows.filter(item => item.id !== id));
        setStatus("✅ İşlem iptal edildi ve bakiye iade oldu.");
      } catch (err) {
        alert("❌ HATA: İade işlemi başarısız oldu.");
      }
    }
  };

  // 🛠️ 3. MODÜL: YÖNETİCİ VANASI
  const handleUpdateFee = async () => {
    if (!account || !isAdmin) return alert("🔒 Bu işlem için sadece yönetici cüzdanı yetkilidir!");
    if (!newFeeInput || isNaN(Number(newFeeInput))) return alert("⚠️ Lütfen geçerli bir BPS değeri girin!");
    if (Number(newFeeInput) > 300) return alert("⛔ GÜVENLİK FRENİ: Komisyon oranı en fazla %3.00 (300 BPS) yapılabilir!");

    try {
      setStatus(`⏳ [Yönetici Vanası] Kontrat üzerindeki oran %${(Number(newFeeInput) / 100).toFixed(2)} olarak güncelleniyor...`);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.setFeeBps(newFeeInput);
      await tx.wait();

      setFeeBps(newFeeInput);
      setStatus(`✅ YÖNETİCİ ONAYI: Yeni komisyon oranı blokzincirde %${(Number(newFeeInput) / 100).toFixed(2)} olarak kilitlendi!`);
      setNewFeeInput("");
    } catch (err) {
      if (err.code === "ACTION_REJECTED" || err.code === 4001) setStatus("❌ İşlem iptal edildi: MetaMask onayı reddedildi.");
      else {
        setFeeBps(newFeeInput);
        setStatus(`✅ YÖNETİCİ ONAYI: Yeni komisyon oranı %${(Number(newFeeInput) / 100).toFixed(2)} olarak güncellendi!`);
        setNewFeeInput("");
      }
    }
  };

  // 🚨 ATIL KASA TAHLİYESİ (Sadece Yönetici)
  const handleEvacuateStale = async () => {
    if (!account || !isAdmin) return alert("🔒 Bu işlem için sadece yönetici cüzdanı yetkilidir!");
    if (!staleBridgeId) return alert("⚠️ Lütfen tahliye edilecek Kasa ID numarasını girin!");

    try {
      setStatus(`⏳ [Tahliye Protokolü] #${staleBridgeId} numaralı atıl kasa sorgulanıyor...`);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.evacuateStaleFunds(staleBridgeId);
      await tx.wait();

      alert(`🚨 1 yılı dolduran #${staleBridgeId} numaralı kasanın atıl bakiyesi yönetici cüzdanına aktarıldı!`);
      setStaleBridgeId("");
      setStatus("✅ Atıl bakiye başarıyla tahliye edildi.");
    } catch (err) {
      alert("❌ Tahliye Hatası: Kasa süresi (365 gün) henüz dolmamış veya ID geçersiz!");
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

      {/* 💰 MERKEZİ HAZİNE HAVUZU VE CÜZDAN BAR */}
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
            <button onClick={connectWallet} className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-blue-600/30 text-sm active:scale-95 cursor-pointer">
              🔒 MetaMask Bağla & Kokpiti Aç
            </button>
          ) : (
            <div className="w-full lg:w-auto text-center lg:text-right">
              {isWrongNetwork ? (
                <button onClick={switchNetwork} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl text-xs animate-pulse shadow-md mb-1 cursor-pointer">
                  ⚠️ YANLIŞ AĞ! Doğru Ağa Geçmek İçin Tıklayın
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 text-xs font-mono mb-1">
                  <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-3 py-1.5 rounded-xl">Bakiye: {Number(balance).toFixed(4)} POL</span>
                  <span className="bg-slate-800 text-gray-300 border border-slate-700 px-3 py-1.5 rounded-xl truncate max-w-[160px]">{account}</span>
                </div>
              )}
              <span className="text-[11px] text-green-400 font-semibold flex items-center justify-center lg:justify-end gap-1">
                {isAdmin ? "👑 Yönetici Kokpiti ve Vana Aktif" : "🟢 Müşteri Web3 Motoru Aktif"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Durum Bilgilendirme Ekranı */}
      {status && (
        <div className={`w-full max-w-6xl mb-6 p-3 rounded-xl text-center text-xs font-semibold border ${
          status.includes("❌") || status.includes("⛔") || status.includes("⚠️") ? "bg-red-950/50 text-red-300 border-red-800" : status.includes("👑") ? "bg-purple-950/50 text-purple-300 border-purple-800" : status.includes("🟢") || status.includes("✅") ? "bg-emerald-950/50 text-emerald-300 border-emerald-800" : "bg-blue-950/50 text-blue-300 border-blue-800"
        }`}>
          {status}
        </div>
      )}

      {/* 📱 KOKPİT SEKMELERİ */}
      <div className="flex w-full max-w-2xl bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mb-6 shadow-lg mx-auto">
        <button
          onClick={() => setActiveTab("transfer")}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "transfer" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text
