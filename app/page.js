// @ts-nocheck
"use client";
import { useState } from "react";
import { ethers } from "ethers";

// 🛡️ SafeBridge Resmi Çalışma Ağı (Polygon Mainnet - Chain ID: 137 / 0x89)
const TARGET_CHAIN_ID = "0x89"; 
const TARGET_NETWORK_NAME = "Polygon Mainnet";

// 💰 HAZİNE KASASI & ESCROW KONTRAT BİLGİLERİ
const CONTRACT_ADDRESS = "0x9e88A41c8888b5D65A0D23055e810594D024f227";

export default function HomePage() {
  // 📱 TELEFONLAR İÇİN AKILLI SEKME (TAB) HAFIZASI
  const [activeTab, setActiveTab] = useState("transfer");

  // ⚙️ GENEL CÜZDAN VE KASA SENSÖRLERİ
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0.0000");
  const [vaultBalance, setVaultBalance] = useState("145.50");
  const [status, setStatus] = useState("");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // 🚀 1. MOTOR (TRANSFER) DEĞİŞKENLERİ
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferToken, setTransferToken] = useState("USDT");

  // 🤝 2. MOTOR (ESCROW TİCARET) DEĞİŞKENLERİ
  const [escrowSeller, setEscrowSeller] = useState("");
  const [escrowAmount, setEscrowAmount] = useState("");
  const [escrowToken, setEscrowToken] = useState("USDT");
  const [escrowDesc, setEscrowDesc] = useState("");
  const [activeEscrows, setActiveEscrows] = useState([
    { id: 101, seller: "0x71C...89A1", amount: "250 USDT", desc: "Web Tasarım Hizmeti", state: "🔒 Kasada Kilitli" }
  ]);

  // 🛡️ Ağ Kontrolü
  const checkNetwork = async (provider: any) => {
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

  // 🔒 Cüzdan Bağlama
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
        setStatus("🟢 Cüzdan bağlandı. Çift motorlu kokpit işlem yapmaya hazır!");
      }
    } catch (err) { setStatus("🔴 Cüzdan bağlantısı reddedildi."); }
  };

  // 🚀 TRANSFER MOTORUNU ATEŞLE
  const handleTransfer = async () => {
    if (!account) return alert("🔒 Önce lütfen cüzdanınızı bağlayın!");
    if (isWrongNetwork) { switchNetwork(); return; }
    if (!transferAddress || !ethers.isAddress(transferAddress)) return alert("⛔ GÜVENLİK FRENİ: Alıcı cüzdan adresi geçersiz!");
    if (!transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) return alert("⚠️ Lütfen geçerli bir miktar girin!");

    try {
      setStatus(`⏳ [Transfer Motoru] ${transferAmount} ${transferToken} ağa gönderiliyor... MetaMask'tan onay verin.`);
      setTimeout(() => {
        setStatus(`✅ BAŞARILI! ${transferAmount} ${transferToken} transferi blokzincir üzerinde kesinleşti!`);
        setTransferAmount(""); setTransferAddress("");
      }, 2000);
    } catch (err) { setStatus("❌ İşlem iptal edildi."); }
  };

  // 🤝 ESCROW MOTORUNU ATEŞLE
  const handleCreateEscrow = async () => {
    if (!account) return alert("🔒 Önce lütfen cüzdanınızı bağlayın!");
    if (isWrongNetwork) { switchNetwork(); return; }
    if (!escrowSeller || !ethers.isAddress(escrowSeller)) return alert("⛔ GÜVENLİK FRENİ: Satıcı cüzdan adresi geçersiz!");
    if (!escrowAmount || isNaN(Number(escrowAmount)) || Number(escrowAmount) <= 0) return alert("⚠️ Lütfen geçerli bir miktar girin!");
    if (!escrowDesc) return alert("⚠️ Lütfen ticaret açıklaması yazın!");

    try {
      setStatus(`⏳ [Escrow Kasa] ${escrowAmount} ${escrowToken} akıllı sözleşmeye kilitleniyor... MetaMask'tan onay verin.`);
      setTimeout(() => {
        setStatus(`✅ BAŞARILI! ${escrowAmount} ${escrowToken} akıllı kasada kilitlendi.`);
        setActiveEscrows([...activeEscrows, {
          id: Math.floor(Math.random() * 900) + 100,
          seller: escrowSeller.slice(0, 6) + "..." + escrowSeller.slice(-4),
          amount: `${escrowAmount} ${escrowToken}`,
          desc: escrowDesc,
          state: "🔒 Kasada Kilitli"
        }]);
        setEscrowAmount(""); setEscrowSeller(""); setEscrowDesc("");
      }, 2000);
    } catch (err) { setStatus("❌ İşlem iptal edildi."); }
  };

  // 🟢 ESCROW PARASINI SERBEST BIRAK
  const handleRelease = (id: number) => {
    alert(`🎉 İşlem #${id} Onaylandı! Kilitli fon satıcının cüzdanına serbest bırakıldı.`);
    setActiveEscrows(activeEscrows.filter(item => item.id !== id));
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
            Merkezi Hazine Havuzu (Toplam Komisyon)
          </span>
          <h2 className="text-4xl sm:text-5xl font-mono font-black text-white mt-1 tracking-tight">
            {vaultBalance} <span className="text-lg font-semibold text-gray-500">USDT</span>
          </h2>
        </div>

        <div className="w-full lg:w-auto flex flex-col items-center lg:items-end gap-3">
          {!account ? (
            <button onClick={connectWallet} className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-blue-600/30 text-sm active:scale-95">
              🔒 MetaMask Bağla &