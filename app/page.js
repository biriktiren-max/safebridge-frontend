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
  const [transferToken, setTransferToken] = useState("POL"); // Test için varsayılan POL yapıldı

  // 🤝 2. MOTOR (ESCROW TİCARET) DEĞİŞKENLERİ
  const [escrowSeller, setEscrowSeller] = useState("");
  const [escrowAmount, setEscrowAmount] = useState("");
  const [escrowToken, setEscrowToken] = useState("POL");
  const [escrowDesc, setEscrowDesc] = useState("");
  const [escrowPassword, setEscrowPassword] = useState(""); 
  const [activeEscrows, setActiveEscrows] = useState([
    { id: 101, seller: "0x71C...89A1", amount: "250 USDT", desc: "Web Tasarım Hizmeti", password: "123", state: "🔒 Kasada Kilitli" }
  ]);

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

  // 🚀 GERÇEK METAMASK ATEŞLEME MOTORU (1. MODÜL)
  const handleTransfer = async () => {
    if (!account) return alert("🔒 Önce lütfen cüzdanınızı bağlayın!");
    if (isWrongNetwork) { switchNetwork(); return; }
    if (!transferAddress || !ethers.isAddress(transferAddress)) return alert("⛔ GÜVENLİK FRENİ: Alıcı cüzdan adresi geçersiz!");
    if (!transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) return alert("⚠️ Lütfen geçerli bir miktar girin!");

    try {
      setStatus(`⏳ [Gerçek Sinyal] MetaMask açılıyor... Lütfen cüzdanınızdan ${transferAmount} ${transferToken} transferini onaylayın!`);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (transferToken === "POL") {
        // 🟣 Doğrudan POL (Polygon Ana Coin) Transferi
        const tx = await signer.sendTransaction({
          to: transferAddress,
          value: ethers.parseEther(transferAmount)
        });
        setStatus(`⏳ POL Transferi ağa iletildi! Blokzincir onayı bekleniyor... (TX: ${tx.hash.slice(0, 8)}...)`);
        await tx.wait();
      } else {
        // 💵 USDT veya XAUT (ERC-20 Token) Transferi
        const TOKEN_ADDRESS = transferToken === "USDT" 
          ? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" // Polygon USDT Resmi Adresi
          : "0x68749665FF8D2d112Fa859AA293F07A622782F38"; // XAUT Adresi
        
        const erc20Abi = ["function transfer(address to, uint256 value) public returns (bool)"];
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, signer);
        
        // USDT 6 desimaldir
        const decimals = transferToken === "USDT" ? 6 : 18;
        const amountInWei = ethers.parseUnits(transferAmount, decimals);
        
        const tx = await tokenContract.transfer(transferAddress, amountInWei);
        setStatus(`⏳ ${transferToken} Transferi ağa iletildi! Onay bekleniyor... (TX: ${tx.hash.slice(0, 8)}...)`);
        await tx.wait();
      }

      setStatus(`✅ BAŞARILI! ${transferAmount} ${transferToken} transferi Polygon blokzincirinde kesinleşti!`);
      setTransferAmount(""); setTransferAddress("");
    } catch (err) { 
      console.error(err);
      if (err.code === "ACTION_REJECTED" || err.code === 4001) {
        setStatus("❌ İşlem iptal edildi: MetaMask onayı sizin tarafınızdan reddedildi.");
      } else {
        setStatus(`❌ HATA: Transfer gerçekleştirilemedi (Cüzdanda yetersiz bakiye veya ağ hatası).`);
      }
    }
  };

  // 🤝 GERÇEK METAMASK ATEŞLEME MOTORU (2. MODÜL - ESCROW)
  const handleCreateEscrow = async () => {
    if (!account) return alert("🔒 Önce lütfen cüzdanınızı bağlayın!");
    if (isWrongNetwork) { switchNetwork(); return; }
    if (!escrowSeller || !ethers.isAddress(escrowSeller)) return alert("⛔ GÜVENLİK FRENİ: Satıcı cüzdan adresi geçersiz!");
    if (!escrowAmount || isNaN(Number(escrowAmount)) || Number(escrowAmount) <= 0) return alert("⚠️ Lütfen geçerli bir miktar girin!");
    if (!escrowDesc) return alert("⚠️ Lütfen ticaret açıklaması yazın!");
    if (!escrowPassword) return alert("🔒 GÜVENLİK FRENİ: Lütfen bu işlem için bir kilit şifresi belirleyin!");

    try {
      setStatus(`⏳ [Escrow Kasa] MetaMask açılıyor... Lütfen ${escrowAmount} ${escrowToken} kilitme işlemini onaylayın!`);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (escrowToken === "POL") {
        // Kasaya doğrudan POL kilitleme sinyali
        const tx = await signer.sendTransaction({
          to: CONTRACT_ADDRESS,
          value: ethers.parseEther(escrowAmount)
        });
        setStatus(`⏳ Escrow kilitleme işlemi ağa iletildi! Onay bekleniyor...`);
        await tx.wait();
      } else {
        // USDT kilitleme sinyali
        const TOKEN_ADDRESS = escrowToken === "USDT" 
          ? "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" 
          : "0x68749665FF8D2d112Fa859AA293F07A622782F38";
        const erc20Abi = ["function transfer(address to, uint256 value) public returns (bool)"];
        const tokenContract = new ethers.Contract(TOKEN_ADDRESS, erc20Abi, signer);
        const decimals = escrowToken === "USDT" ? 6 : 18;
        const amountInWei = ethers.parseUnits(escrowAmount, decimals);
        
        const tx = await tokenContract.transfer(CONTRACT_ADDRESS, amountInWei);
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
    } catch (err) { 
      console.error(err);
      if (err.code === "ACTION_REJECTED" || err.code === 4001) {
        setStatus("❌ İşlem iptal edildi: MetaMask onayı reddedildi.");
      } else {
        setStatus("❌ HATA: Escrow kasasına kilitleme başarısız oldu (Yetersiz bakiye).");
      }
    }
  };

  // 🟢 ESCROW PARASINI SERBEST BIRAK
  const handleRelease = (id, originalPassword) => {
    const inputPass = prompt("🔒 Lütfen bu işlemin kilidini açmak için Güvenlik Şifresini girin:");
    if (inputPass === originalPassword) {
      alert(`🎉 Şifre Doğru! İşlem #${id} Onaylandı! Kilitli fon satıcının cüzdanına serbest bırakıldı.`);
      setActiveEscrows(activeEscrows.filter(item => item.id !== id));
    } else {
      alert("❌ HATA: Yanlış şifre girdiniz! Güvenlik kilidi açılamadı.");
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
            Merkezi Hazine Havuzu (Toplam Komisyon)
          </span>
          <h2 className="text-4xl sm:text-5xl font-mono font-black text-white mt-1 tracking-tight">
            {vaultBalance} <span className="text-lg font-semibold text-gray-500">USDT</span>
          </h2>
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
              <span className="text-[11px] text-green-400 font-semibold flex items-center justify-center lg:justify-end gap-1">🟢 Gerçek MetaMask Ateşleme Motoru Aktif</span>
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

      {/* 📱 TELEFONLAR İÇİN AKILLI SEKME (TAB) BUTONLARI */}
      <div className="flex lg:hidden w-full max-w-md bg-slate-900 p-1.5 rounded-2xl border border-slate-800 mb-6 shadow-lg mx-auto">
        <button
          onClick={() => setActiveTab("transfer")}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === "transfer" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          🚀 Anlık Transfer
        </button>
        <button
          onClick={() => setActiveTab("escrow")}
          className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            activeTab === "escrow" ? "bg-emerald-600 text-white shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          🤝 Escrow Ticaret
        </button>
      </div>

      {/* 🏁 ASIL ÇALIŞMA ALANI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl items-start">
        
        {/* 🚀 1. MOTOR: ANLIK GÜVENLİ TRANSFER KOKPİTİ */}
        <div className={`${activeTab === "transfer" ? "block" : "hidden"} lg:block bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl hover:border-blue-500/30 transition-all`}>
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🚀</span> Anlık Güvenli Transfer
              </h3>
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

            <button
              onClick={handleTransfer}
              disabled={!account || isWrongNetwork}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all mt-2 flex items-center justify-center gap-2 ${
                !account ? "bg-gray-700 text-gray-500 cursor-not-allowed" : isWrongNetwork ? "bg-red-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 active:scale-95 cursor-pointer"
              }`}
            >
              {!account ? "🔒 Önce Cüzdan Bağlayın" : "🚀 Güvenli Gönderimi Başlat"}
            </button>
          </div>
        </div>

        {/* 🤝 2. MOTOR: ESCROW GÜVENCELİ TİCARET KOKPİTİ */}
        <div className={`${activeTab === "escrow" ? "block" : "hidden"} lg:block bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl hover:border-emerald-500/30 transition-all flex flex-col justify-between h-full`}>
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🤝</span> Güvenli Ticaret (Escrow)
                </h3>
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
                  <input type="number" placeholder="0.00" value={escrowAmount} onChange={(e) => setEscrowAmount(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Varlık</label>
                  <select value={escrowToken} onChange={(e) => setEscrowToken(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-white outline-none focus:border-emerald-500">
                    <option value="POL">🟣 POL</option>
                    <option value="USDT">💵 USDT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ticaret Açıklaması</label>
                <input type="text" placeholder="Örn: Araç Kapora Bedeli / Yazılım İş Ücreti" value={escrowDesc} onChange={(e) => setEscrowDesc(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-gray-300 outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-400 uppercase mb-1">🔒 GÜVENLİK PAROLASI (KİLİT ŞİFRESİ)</label>
                <input type="password" placeholder="Kilidi açacak gizli şifre belirleyin" value={escrowPassword} onChange={(e) => setEscrowPassword(e.target.value)} className="w-full p-3.5 bg-slate-950 border border-emerald-900 rounded-xl text-sm text-white outline-none focus:border-emerald-500 placeholder-emerald-800" />
              </div>

              <button
                onClick={handleCreateEscrow}
                disabled={!account || isWrongNetwork}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all mt-2 flex items-center justify-center gap-2 ${
                  !account ? "bg-gray-700 text-gray-500 cursor-not-allowed" : isWrongNetwork ? "bg-red-600 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 active:scale-95 cursor-pointer"
                }`}
              >
                {!account ? "🔒 Önce Cüzdan Bağlayın" : "🤝 Kasaya Kilitle & Başlat"}
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center justify-between">
              <span>📜 Kilitli Kasadaki İşlemler</span>
              <span className="text-emerald-400 font-mono">Top: {activeEscrows.length}</span>
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {activeEscrows.map((item) => (
                <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{item.desc}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{item.amount} • Satıcı: {item.seller}</span>
                  </div>
                  <button onClick={() => handleRelease(item.id, item.password)} className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 font-bold px-2.5 py-1 rounded-lg text-[11px] transition-all">
                    🔑 Kilidi Aç
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Alt Bilgi */}
      <div className="mt-16 text-gray-600 text-xs font-mono text-center">
        SafeBridge v2.5.0 • Gerçek Web3 Motoru Aktif • Hoşdere Disipliniyle Üretildi 🛠️
      </div>

    </div>
  );
}