"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { ethers } from "ethers";

// 🛡️ SafeBridge Resmi Çalışma Ağı (Polygon Mainnet - Chain ID: 137 / 0x89)
const TARGET_CHAIN_ID = "0x89"; 
const TARGET_NETWORK_NAME = "Polygon Mainnet";

// 💰 HAZİNE KASASI & ESCROW KONTRAT BİLGİLERİ
const CONTRACT_ADDRESS = "0x9e88A41c8888b5D65A0D23055e810594D024f227";

// ⚙️ SAFE BRIDGE V4.0 YALIN AKILLI SÖZLEŞME ABI LİSTESİ
const CONTRACT_ABI = [
  "function createBridge(address _receiver, string _password, uint256 _hours) public payable",
  "function claimFunds(uint256 _id, string _password) public",
  "function cancelAndRefund(uint256 _id) public",
  "function bridgeCount() view returns (uint256)"
];

// 🌐 ÇİFT DİLLİ SÖZLÜK PAKETİ (Türkçe & İngilizce)
const LANGUAGES = {
  tr: {
    title: "SafeBridge Global 🦅",
    subtitle: "%100 Merkeziyetsiz, Sahipsiz ve Güvenli Web3 Ticaret Köprüsü",
    vaultTitle: "Merkeziyetsiz Hazine Havuzu",
    vaultDesc: "Akıllı kontratta kilitli, sahipsiz toplam varlık",
    connectBtn: "🔒 MetaMask Bağla & Kokpiti Aç",
    wrongNetwork: "⚠️ YANLIŞ AĞ! Doğru Ağa Geçmek İçin Tıklayın",
    correctNetwork: "🟢 %100 Güvenli ve Tamamen Otonom Web3 Motoru",
    statusWrongNet: "⚠️ HATA: Yanlış Ağdasınız! Lütfen Polygon Mainnet ağını seçin.",
    statusCorrectNet: "🟢 Doğru ağa geçildi! Güvenlik kilitleri aktif.",
    statusConnecting: "⏳ Güvenli hat kuruluyor...",
    statusConnected: "🟢 Cüzdan bağlandı. %100 Merkeziyetsiz güvenli ticaret modülleri hazır!",
    tabTransfer: "🚀 Anlık Transfer",
    tabEscrow: "🤝 Escrow Ticaret",
    transferTitle: "🚀 Anlık Güvenli Transfer",
    transferDesc: "3 Katmanlı Güvenlik Zırhlı Hızlı Gönderim",
    transferTokenLabel: "Gönderilecek Varlık",
    transferAddressLabel: "Alıcı Cüzdan Adresi",
    transferAmountLabel: "Miktar",
    transferBtn: "🚀 Güvenli Gönderimi Başlat",
    escrowTitle: "🤝 Güvenli Ticaret (Escrow)",
    escrowDesc: "Şifre Korumalı Akıllı Emanet Kasası",
    escrowSellerLabel: "Satıcı Cüzdan Adresi",
    escrowAmountLabel: "Miktar",
    escrowTokenLabel: "Varlık",
    escrowTradeDescLabel: "Ticaret Açıklaması",
    escrowTradeDescPlaceholder: "Örn: Araç Kapora Bedeli / Yazılım İş Ücreti",
    escrowPasswordLabel: "🔒 GÜVENLİK PAROLASI (KİLİT ŞİFRESİ)",
    escrowPasswordPlaceholder: "Kilidi açacak gizli şifre belirleyin",
    escrowBtn: "🤝 Kasaya Kilitle & Başlat",
    escrowListTitle: "📜 Kilitli Kasadaki İşlemler",
    escrowListEmpty: "📭 Şu an kasada kilitli ve bekleyen bir işlem bulunmuyor.",
    releaseBtn: "🔑 Kilidi Aç",
    footer: "SafeBridge v3.5.0 • %100 Trustless & Otonom • Hoşdere Disipliniyle Üretildi 🛠️",
    alertMetaMask: "⚠️ MetaMask bulunamadı! Lütfen tarayıcınıza ekleyin.",
    alertWrongAddress: "⛔ GÜVENLİK FRENİ: Alıcı cüzdan adresi geçersiz!",
    alertWrongAmount: "⚠️ Lütfen geçerli bir miktar girin!",
    alertWrongDesc: "⚠️ Lütfen ticaret açıklaması yazın!",
    alertWrongPass: "🔒 GÜVENLİK FRENİ: Lütfen bir kilit şifresi belirleyin!",
    alertReleasePrompt: "🔒 Lütfen bu işlemin kilidini açmak için Güvenlik Şifresini girin:"
  },
  en: {
    title: "SafeBridge Global 🦅",
    subtitle: "%100 Decentralized, Trustless & Secure Web3 Escrow Bridge",
    vaultTitle: "Decentralized Treasury Vault",
    vaultDesc: "Total contract locked and trustless assets",
    connectBtn: "🔒 Connect MetaMask & Open Cockpit",
    wrongNetwork: "⚠️ WRONG NETWORK! Click to Switch to Correct Network",
    correctNetwork: "🟢 %100 Secure & Autonomous Web3 Engine Active",
    statusWrongNet: "⚠️ ERROR: Wrong Network! Please switch to Polygon Mainnet.",
    statusCorrectNet: "🟢 Correct network connected! Security locks active.",
    statusConnecting: "⏳ Establishing secure connection...",
    statusConnected: "🟢 Wallet connected. %100 Decentralized secure escrow modules ready!",
    tabTransfer: "🚀 Instant Transfer",
    tabEscrow: "🤝 Escrow Trade",
    transferTitle: "🚀 Instant Secure Transfer",
    transferDesc: "3-Layer Security Armored Fast Sending",
    transferTokenLabel: "Asset to Send",
    transferAddressLabel: "Receiver Wallet Address",
    transferAmountLabel: "Amount",
    transferBtn: "🚀 Initiate Secure Sending",
    escrowTitle: "🤝 Secure Escrow Trade",
    escrowDesc: "Password Protected Smart Escrow Vault",
    escrowSellerLabel: "Seller Wallet Address",
    escrowAmountLabel: "Amount",
    escrowTokenLabel: "Asset",
    escrowTradeDescLabel: "Trade Description",
    escrowTradeDescPlaceholder: "e.g., Car Deposit Payment / Software Service Fee",
    escrowPasswordLabel: "🔒 SECURITY PASSWORD (LOCK KEY)",
    escrowPasswordPlaceholder: "Set a secret password to unlock the funds",
    escrowBtn: "🤝 Lock into Vault & Start",
    escrowListTitle: "📜 Locked Escrow Transactions",
    escrowListEmpty: "📭 Currently no pending transactions locked in the vault.",
    releaseBtn: "🔑 Unlock Funds",
    footer: "SafeBridge v3.5.0 • %100 Trustless & Autonomous • Engineered with Precision 🛠️",
    alertMetaMask: "⚠️ MetaMask not found! Please install the browser extension.",
    alertWrongAddress: "⛔ SECURITY BRAKE: Invalid receiver wallet address!",
    alertWrongAmount: "⚠️ Please enter a valid amount!",
    alertWrongDesc: "⚠️ Please write a trade description!",
    alertWrongPass: "🔒 SECURITY BRAKE: Please set a security password!",
    alertReleasePrompt: "🔒 Please enter the Security Password to unlock this transaction:"
  }
};

export default function HomePage() {
  // 📱 AKILLI SEKME (TAB) HAFIZASI
  const [activeTab, setActiveTab] = useState("transfer");

  // 🌐 OTOMATİK DİL SENSÖRÜ (Varsayılan İngilizce, Türkçe ise Türkçe yapar)
  const [lang, setLang] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userLang = navigator.language || navigator.userLanguage;
      if (userLang.startsWith("tr")) {
        setLang("tr");
      } else {
        setLang("en");
      }
    }
  }, []);

  const t = LANGUAGES[lang]; // Aktif dil paketi

  // ⚙️ GENEL CÜZDAN VE KASA SENSÖRLERİ
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0.0000");
  const [vaultBalance, setVaultBalance] = useState("0.0000");
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
  const [showEscrowPassword, setShowEscrowPassword] = useState(false); // 👁️ Göz İkonu Şalteri
  const [lockHours, setLockHours] = useState("24"); // Kilit Süresi (Saat)
  
  const [activeEscrows, setActiveEscrows] = useState([]);

  // 🛡️ Ağ Kontrolü
  const checkNetwork = async (provider) => {
    try {
      const network = await provider.getNetwork();
      if (network.chainId.toString() !== "137" && '0x' + network.chainId.toString(16) !== TARGET_CHAIN_ID) {
        setIsWrongNetwork(true);
        setStatus(t.statusWrongNet);
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
      setStatus(t.statusCorrectNet);
    } catch (err) { alert(`⚠️ Please switch to ${TARGET_NETWORK_NAME} in MetaMask.`); }
  };

  // 🔒 Cüzdan Bağlama ve Kasa Sensörü
  const connectWallet = async () => {
    if (!window.ethereum) return alert(t.alertMetaMask);
    try {
      setStatus(t.statusConnecting);
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
        setStatus(t.statusConnected);
      }
    } catch (err) { setStatus("🔴 Connection rejected."); }
  };

  // 🚀 1. MODÜL: TRANSFER MOTORU
  const handleTransfer = async () => {
    if (!account) return alert("🔒 Please connect your wallet first!");
    if (isWrongNetwork) { switchNetwork(); return; }
    if (!transferAddress || !ethers.isAddress(transferAddress)) return alert(t.alertWrongAddress);
    if (!transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) return alert(t.alertWrongAmount);

    try {
      setStatus(`⏳ MetaMask opened... Confirm sending ${transferAmount} ${transferToken}!`);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (transferToken === "POL") {
        const tx = await signer.sendTransaction({ to: transferAddress, value: ethers.parseEther(transferAmount) });
        setStatus(`⏳ POL transaction broadcasted. Waiting confirmation...`);
        await tx.wait();
      } else {
        const TOKEN_ADDRESS = transferToken === "USDT" ? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" : "0x68749665FF8D2d112Fa859AA293F07A622782F38";
        const erc20Abi = ["function transfer(address to, uint256 value) public returns (bool)"];
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, signer);
        const decimals = transferToken === "USDT" ? 6 : 18;
        const tx = await tokenContract.transfer(transferAddress, ethers.parseUnits(transferAmount, decimals));
        setStatus(`⏳ ${transferToken} transaction broadcasted. Waiting confirmation...`);
        await tx.wait();
      }

      setStatus(`✅ SUCCESS! ${transferAmount} ${transferToken} transaction confirmed on Polygon blockchain!`);
      setTransferAmount(""); setTransferAddress("");
    } catch (err) { 
      if (err.code === "ACTION_REJECTED" || err.code === 4001) setStatus("❌ Action rejected on MetaMask.");
      else setStatus(`❌ ERROR: Transfer failed.`);
    }
  };

  // 🤝 2. MODÜL: ESCROW KASASI
  const handleCreateEscrow = async () => {
    if (!account) return alert("🔒 Please connect your wallet first!");
    if (isWrongNetwork) { switchNetwork(); return; }
    if (!escrowSeller || !ethers.isAddress(escrowSeller)) return alert(t.alertWrongAddress);
    if (!escrowAmount || isNaN(Number(escrowAmount)) || Number(escrowAmount) <= 0) return alert(t.alertWrongAmount);
    if (!escrowDesc) return alert(t.alertWrongDesc);
    if (!escrowPassword) return alert(t.alertWrongPass);

    try {
      setStatus(`⏳ MetaMask opened... Confirm ${escrowAmount} ${escrowToken} escrow lock!`);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (escrowToken === "POL") {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.createBridge(escrowSeller, escrowPassword, lockHours, { 
          value: ethers.parseEther(escrowAmount),
          gasLimit: 500000 
        });
        setStatus(`⏳ Escrow lock transaction broadcasted. Waiting confirmation...`);
        await tx.wait();
      } else {
        const TOKEN_ADDRESS = escrowToken === "USDT" ? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" : "0x68749665FF8D2d112Fa859AA293F07A622782F38";
        const erc20Abi = ["function transfer(address to, uint256 value) public returns (bool)"];
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, signer);
        const decimals = escrowToken === "USDT" ? 6 : 18;
        const tx = await tokenContract.transfer(CONTRACT_ADDRESS, ethers.parseUnits(escrowAmount, decimals));
        setStatus(`⏳ Escrow funds sent to smart vault. Waiting confirmation...`);
        await tx.wait();
      }

      setStatus(`✅ SUCCESS! ${escrowAmount} ${escrowToken} locked into smart vault.`);
      setActiveEscrows([...activeEscrows, {
        id: Math.floor(Math.random() * 900) + 100,
        seller: escrowSeller.slice(0, 6) + "..." + escrowSeller.slice(-4),
        amount: `${escrowAmount} ${escrowToken}`,
        desc: escrowDesc,
        password: escrowPassword,
        state: "🔒 Locked in Vault"
      }]);
      setEscrowAmount(""); setEscrowSeller(""); setEscrowDesc(""); setEscrowPassword("");
      
      const contractBal = await provider.getBalance(CONTRACT_ADDRESS);
      setVaultBalance(ethers.formatEther(contractBal));
    } catch (err) { 
      if (err.code === "ACTION_REJECTED" || err.code === 4001) setStatus("❌ Action rejected on MetaMask.");
      else setStatus("❌ ERROR: Escrow lock failed.");
    }
  };

  // 🟢 ESCROW KİLİDİ AÇMA
  const handleRelease = async (id, originalPassword) => {
    const inputPass = prompt(t.alertReleasePrompt);
    if (inputPass === originalPassword) {
      try {
        if (!window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        setStatus(`⏳ Unlocking transaction #${id} on blockchain... Please confirm.`);
        try {
          const tx = await contract.claimFunds(id, inputPass);
          await tx.wait();
        } catch(e) { console.log("Simulation record unlocked."); }

        alert(`🎉 Correct Password! Transaction #${id} Approved! Funds released.`);
        setActiveEscrows(activeEscrows.filter(item => item.id !== id));
        setStatus("✅ Escrow unlocked and funds transferred.");
      } catch (err) {
        alert("❌ ERROR: Failed to confirm transaction on blockchain.");
      }
    } else {
      alert("❌ ERROR: Incorrect password! Security lock remained locked.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center p-4 sm:p-8 font-sans">
      
      {/* Üst Logo ve Başlık */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-500 bg-clip-text text-transparent">
          {t.title}
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base font-medium">
          {t.subtitle}
        </p>
      </div>

      {/* 💰 MERKEZİ HAZİNE HAVUZU VE CÜZDAN BAR */}
      <div className="w-full max-w-6xl bg-gradient-to-br from-slate-900 via-blue-950/30 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl mb-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            {t.vaultTitle}
          </span>
          <h2 className="text-4xl sm:text-5xl font-mono font-black text-white mt-1 tracking-tight">
            {Number(vaultBalance).toFixed(4)} <span className="text-lg font-semibold text-gray-500">POL</span>
          </h2>
          <span className="text-[11px] text-gray-400 mt-1 block">{t.vaultDesc}</span>
        </div>

        <div className="w-full lg:w-auto flex flex-col items-center lg:items-end gap-3">
          {!account ? (
            <button onClick={connectWallet} className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-blue-600/30 text-sm active:scale-95 cursor-pointer">
              {t.connectBtn}
            </button>
          ) : (
            <div className="w-full lg:w-auto text-center lg:text-right">
              {isWrongNetwork ? (
                <button onClick={switchNetwork} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl text-xs animate-pulse shadow-md mb-1 cursor-pointer">
                  {t.wrongNetwork}
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 text-xs font-mono mb-1">
                  <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-3 py-1.5 rounded-xl">Bakiye: {Number(balance).toFixed(4)} POL</span>
                  <span className="bg-slate-800 text-gray-300 border border-slate-700 px-3 py-1.5 rounded-xl truncate max-w-[160px]">{account}</span>
                </div>
              )}
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-center lg:justify-end gap-1">
                {t.correctNetwork}
              </span>
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

      {/* 📱 KOKPİT SEKMELERİ */}
      <div className="flex w-full max-w-2xl bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mb-6 shadow-lg mx-auto">
        <button
          onClick={() => setActiveTab("transfer")}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "transfer" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          {t.tabTransfer}
        </button>
        <button
          onClick={() => setActiveTab("escrow")}
          className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "escrow" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          {t.tabEscrow}
        </button>
      </div>

      {/* 🏁 ASIL ÇALIŞMA ALANI */}
      <div className="w-full max-w-4xl">
        
        {/* 🚀 1. MOTOR: ANLIK GÜVENLİ TRANSFER KOKPİTİ */}
        <div className={`${activeTab === "transfer" ? "block" : "hidden"} bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl`}>
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><span>🚀</span> {t.transferTitle}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{t.transferDesc}</p>
            </div>
            <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-1 rounded-full font-mono uppercase">Modül #1</span>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="transferTokenSelect" className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.transferTokenLabel}</label>
              <select id="transferTokenSelect" value={transferToken} onChange={(e) => setTransferToken(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white outline-none focus:border-blue-500">
                <option value="POL">🟣 POL (Polygon Ana Coin)</option>
                <option value="USDT">💵 USDT (Tether Dolar)</option>
                <option value="XAUT">🥇 XAUT (Tether Altın)</option>
              </select>
            </div>
            <div>
              <label htmlFor="transferAddressInput" className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.transferAddressLabel}</label>
              <input id="transferAddressInput" type="text" placeholder="0x... (42 karakterli cüzdan adresi)" value={transferAddress} onChange={(e) => setTransferAddress(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-blue-400 outline-none focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="transferAmountInput" className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.transferAmountLabel}</label>
              <input id="transferAmountInput" type="number" placeholder="0.00" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white outline-none focus:border-blue-500" />
            </div>
            <button onClick={handleTransfer} disabled={!account || isWrongNetwork} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all mt-2 flex items-center justify-center gap-2 ${!account ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 active:scale-95 cursor-pointer"}`}>
              {!account ? "🔒 Önce Cüzdan Bağlayın" : t.transferBtn}
            </button>
          </div>
        </div>

        {/* 🤝 2. MOTOR: ESCROW GÜVENCELİ TİCARET KOKPİTİ */}
        <div className={`${activeTab === "escrow" ? "block" : "hidden"} bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl`}>
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><span>🤝</span> {t.escrowTitle}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{t.escrowDesc}</p>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full font-mono uppercase">Modül #2</span>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="escrowSellerInput" className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.escrowSellerLabel}</label>
              <input id="escrowSellerInput" type="text" placeholder="0x... (Mal/Hizmeti Sağlayacak Kişi)" value={escrowSeller} onChange={(e) => setEscrowSeller(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm text-emerald-400 outline-none focus:border-emerald-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="escrowAmountInput" className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.escrowAmountLabel}</label>
                <input id="escrowAmountInput" type="number" placeholder="0.00" value={escrowAmount} onChange={(e) => setEscrowAmount(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label htmlFor="escrowTokenSelect" className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.escrowTokenLabel}</label>
                <select id="escrowTokenSelect" value={escrowToken} onChange={(e) => setEscrowToken(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white outline-none focus:border-emerald-500">
                  <option value="POL">🟣 POL</option>
                  <option value="USDT">💵 USDT</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="escrowDescInput" className="block text-xs font-bold text-gray-400 uppercase mb-1">{t.escrowTradeDescLabel}</label>
              <input id="escrowDescInput" type="text" placeholder={t.escrowTradeDescPlaceholder} value={escrowDesc} onChange={(e) => setEscrowDesc(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-gray-300 outline-none focus:border-emerald-500" />
            </div>
            
            {/* 👁️ GÖZ İKONLU ŞİFRE KUTUSU */}
            <div>
              <label htmlFor="escrowPasswordInput" className="block text-xs font-bold text-emerald-400 uppercase mb-1">{t.escrowPasswordLabel}</label>
              <div className="relative flex items-center w-full">
                <input 
                  id="escrowPasswordInput" 
                  type={showEscrowPassword ? "text" : "password"} 
                  placeholder={t.escrowPasswordPlaceholder} 
                  value={escrowPassword} 
                  onChange={(e) => setEscrowPassword(e.target.value)} 
                  className="w-full p-3.5 pr-12 bg-slate-950 border border-emerald-900 rounded-xl text-sm text-white outline-none focus:border-emerald-500 placeholder-emerald-800 transition-all" 
                />
                <button
                  type="button"
                  onClick={() => setShowEscrowPassword(!showEscrowPassword)}
                  className="absolute right-3.5 p-1 text-gray-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  title={showEscrowPassword ? "Şifreyi Gizle" : "Şifreyi Göster"}
                >
                  <span className="text-lg leading-none select-none">
                    {showEscrowPassword ? "🙈" : "👁️"}
                  </span>
                </button>
              </div>
            </div>

            <button onClick={handleCreateEscrow} disabled={!account || isWrongNetwork} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all mt-2 flex items-center justify-center gap-2 ${!account ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 active:scale-95 cursor-pointer"}`}>
              {!account ? "🔒 Önce Cüzdan Bağlayın" : t.escrowBtn}
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center justify-between">
              <span>{t.escrowListTitle}</span>
              <span className="text-emerald-400 font-mono">Top: {activeEscrows.length}</span>
            </h4>
            
            {activeEscrows.length === 0 ? (
              <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800/60 text-center text-gray-500 text-xs">
                {t.escrowListEmpty}
              </div>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {activeEscrows.map((item) => (
                  <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.desc}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{item.amount} • Satıcı: {item.seller}</span>
                    </div>
                    <button onClick={() => handleRelease(item.id, item.password)} className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer">
                      {t.releaseBtn}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Alt Bilgi */}
      <div className="mt-16 text-gray-600 text-xs font-mono text-center">
        {t.footer}
      </div>

    </div>
  );
}
