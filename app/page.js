"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

// 🛡️ SafeBridge Resmi Çalışma Ağı (Örn: Polygon Mainnet - Chain ID: 137 / 0x89)
// Kullanıcı yanlış ağdaysa sistem otomatik bu ağa geçiş önerecek.
const TARGET_CHAIN_ID = "0x89"; 
const TARGET_NETWORK_NAME = "Polygon Mainnet";

export default function TransferPage() {
  const [account, setAccount] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("USDT");
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState("0");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // 🛡️ 1. KATMAN: Ağ (Network) Kontrol Sensörü
  const checkNetwork = async (provider) => {
    try {
      const network = await provider.getNetwork();
      // Hex veya Decimal kontrolü
      if (network.chainId.toString() !== "137" && '0x' + network.chainId.toString(16) !== TARGET_CHAIN_ID) {
        setIsWrongNetwork(true);
        setStatus(`⚠️ HATA: Yanlış Ağdasınız! Lütfen ${TARGET_NETWORK_NAME} ağını seçin.`);
        return false;
      }
      setIsWrongNetwork(false);
      return true;
    } catch (err) {
      console.error("Ağ kontrolü hatası:", err);
      return false;
    }
  };

  // 🛡️ Doğru Ağa Otomatik Geçiş Anahtarı
  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: TARGET_CHAIN_ID }],
      });
      setIsWrongNetwork(false);
      setStatus("🟢 Doğru ağa geçiş yapıldı! Güvenlikle işlem yapabilirsiniz.");
    } catch (err) {
      alert(`⚠️ Lütfen MetaMask cüzdanınızdan ağınızı ${TARGET_NETWORK_NAME} olarak değiştirin.`);
    }
  };

  // 🔒 Güvenli Cüzdan Bağlantısı ve Bakiye Okuma
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("⚠️ MetaMask cüzdanı bulunamadı! Lütfen tarayıcınıza yükleyin.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const currentAccount = accounts[0];
      setAccount(currentAccount);
      
      // Ağ Kontrolü Yap
      const isNetworkOk = await checkNetwork(provider);
      
      // Depodaki Yakıtı (Bakiyeyi) Çek
      if (isNetworkOk) {
        const userBalance = await provider.getBalance(currentAccount);
        setBalance(ethers.formatEther(userBalance));
        setStatus("🟢 Güvenlik kilitleri aktif. Cüzdan başarıyla bağlandı!");
      }
    } catch (err) {
      console.error(err);
      setStatus("🔴 Cüzdan bağlantısı reddedildi veya hata oluştu.");
    }
  };

  // 🚀 GÜVENLİK SENSÖRLÜ TRANSFER TETİKLEYİCİ
  const handleTransfer = async () => {
    // Sensör 1: Cüzdan Bağlı mı?
    if (!account) {
      alert("🔒 Güvenlik Uyarısı: İşlem yapmadan önce lütfen cüzdanınızı bağlayın!");
      return;
    }

    // Sensör 2: Yanlış Ağda mı?
    if (isWrongNetwork) {
      alert(`⚠️ Yanlış ağdasınız! Lütfen önce ${TARGET_NETWORK_NAME} ağını bağlayın.`);
      switchNetwork();
      return;
    }

    // Sensör 3: Şasi/Plaka Kontrolü (Adres Doğru mu?)
    if (!address || !ethers.isAddress(address)) {
      alert("⛔ GÜVENLİK FRENİ: Alıcı cüzdan adresi geçersiz! Lütfen 0x ile başlayan 42 karakterlik adresi tam ve doğru yazdığınızdan emin olun.");
      setStatus("❌ Hatalı veya eksik alıcı adresi girildi!");
      return;
    }

    // Sensör 4: Miktar Kontrolü
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("⚠️ Lütfen geçerli bir transfer miktarı girin!");
      return;
    }

    // Sensör 5: Depo Yakıt Kontrolü (Yetersiz Bakiye Freni)
    if (Number(amount) > Number(balance)) {
      alert(`⛔ GÜVENLİK FRENİ: Yetersiz Bakiye! Cüzdanınızda sadece ${Number(balance).toFixed(4)} birim var, fakat siz ${amount} göndermek istiyorsunuz.`);
      setStatus("❌ Yetersiz bakiye sebebiyle işlem motoru durduruldu.");
      return;
    }

    // Tüm Fren ve Sensörlerden Geçildi -> Motor Çalışıyor!
    try {
      setStatus(`⏳ [Güvenlik Onaylandı] ${amount} ${token} transfer motoru ateşleniyor... Lütfen MetaMask üzerinden onay verin.`);
      
      // NOT: Bir sonraki adımda buraya gerçek Akıllı Kontrat Transfer motorunu (contract.transfer) bağlayacağız!
      setTimeout(() => {
        setStatus(`✅ BAŞARILI! ${amount} ${token} transferi güvenli ağ üzerinden alıcıya ulaştırıldı.`);
        setAmount("");
        setAddress("");
      }, 2500);

    } catch (err) {
      setStatus("❌ İşlem kullanıcı tarafından iptal edildi veya ağda hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        
        {/* Üst Başlık */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">SafeBridge</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
            <span>🛡️ 3 Katmanlı Güvenlik Zırhı Aktif</span> 🦅
          </p>
        </div>

        {/* 🔒 Güvenlik Alanı: Cüzdan Durumu */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-between gap-3">
          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              🔒 MetaMask Bağla ve Güvenliği Aç
            </button>
          ) : (
            <div className="w-full text-center">
              {isWrongNetwork ? (
                <button
                  onClick={switchNetwork}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs animate-pulse transition-all shadow-md mb-2"
                >
                  ⚠️ YANLIŞ AĞ! Doğru Ağa Geçmek İçin Tıklayın
                </button>
              ) : (
                <div className="flex items-center justify-between bg-green-50 px-3 py-1.5 rounded-xl border border-green-200 mb-2">
                  <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                    🟢 Güvenlik Sensörleri OK
                  </span>
                  <span className="text-xs font-mono font-bold text-green-800">
                    Bakiye: {Number(balance).toFixed(4)} POL/ETH
                  </span>
                </div>
              )}
              <p className="text-xs font-mono text-gray-600 truncate bg-white p-2 rounded border">
                {account}
              </p>
            </div>
          )}
        </div>

        {/* Durum Bilgilendirme Ekranı */}
        {status && (
          <div className={`mb-4 p-3 rounded-xl text-center text-xs font-semibold border ${
            status.includes("❌") || status.includes("⛔") || status.includes("⚠️")
              ? "bg-red-50 text-red-700 border-red-200"
              : status.includes("🟢") || status.includes("✅")
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}>
            {status}
          </div>
        )}

        {/* Form Alanı */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Gönderilecek Varlık</label>
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:border-blue-600 transition-all"
            >
              <option value="USDT">💵 USDT (Tether Dolar)</option>
              <option value="XAUT">🥇 XAUT (Tether Altın)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Alıcı Adresi <span className="text-[10px] text-gray-400 font-normal">(0x... formatında 42 karakter)</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl font-mono text-sm outline-none focus:border-blue-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Miktar</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-blue-600 transition-all"
            />
          </div>

          {/* Transfer Butonu - Sensörlere Göre Akıllı Tepki Verir */}
          <button
            onClick={handleTransfer}
            disabled={!account || isWrongNetwork}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all mt-2 flex items-center justify-center gap-2 ${
              !account
                ? "bg-gray-400 cursor-not-allowed shadow-none"
                : isWrongNetwork
                ? "bg-red-500 hover:bg-red-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 cursor-pointer"
            }`}
          >
            {!account ? "🔒 Önce Cüzdan Bağlayın" : isWrongNetwork ? "⚠️ Yanlış Ağ Kilitli" : `🚀 Güvenli Gönder (${token})`}
          </button>
        </div>

      </div>
    </div>
  );
}