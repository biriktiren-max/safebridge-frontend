"use client";
import { useState } from "react";
import { ethers } from "ethers";

// 🛡️ SafeBridge Resmi Çalışma Ağı (Polygon Mainnet - Chain ID: 137 / 0x89)
const TARGET_CHAIN_ID = "0x89"; 
const TARGET_NETWORK_NAME = "Polygon Mainnet";

// 🚀 GERÇEK BLOCKCHAIN MOTORU: Kripto Varlık Sözleşme Adresleri
const TOKEN_ADDRESSES = {
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Polygon USDT Ana Kontratı
  XAUT: "0x68749665FF8D2d112Fa859AA293F07A622782F38"  // Tether Altın Kontratı
};

// Standart ERC-20 Transfer Motoru Dişlileri (ABI)
const TOKEN_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function decimals() view returns (uint8)"
];

export default function TransferPage() {
  const [account, setAccount] = useState("");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("USDT");
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState("0");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // 🛡️ 1. KATMAN: Ağ Kontrolü
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
    } catch (err) {
      console.error("Ağ kontrolü hatası:", err);
      return false;
    }
  };

  // 🛡️ Doğru Ağa Geçiş Anahtarı
  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: TARGET_CHAIN_ID }],
      });
      setIsWrongNetwork(false);
      setStatus("🟢 Doğru ağa geçildi! Güvenlikle işlem yapabilirsiniz.");
    } catch (err) {
      alert(`⚠️ Lütfen MetaMask cüzdanınızdan ağınızı ${TARGET_NETWORK_NAME} olarak değiştirin.`);
    }
  };

  // 🔒 Cüzdan Bağlama
  const connectWallet = async () => {
    if (!window.ethereum) return alert("⚠️ MetaMask cüzdanı bulunamadı!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const currentAccount = accounts[0];
      setAccount(currentAccount);
      
      const isNetworkOk = await checkNetwork(provider);
      if (isNetworkOk) {
        const userBalance = await provider.getBalance(currentAccount);
        setBalance(ethers.formatEther(userBalance));
        setStatus("🟢 Güvenlik kilitleri aktif. Cüzdan bağlandı!");
      }
    } catch (err) {
      console.error(err);
      setStatus("🔴 Cüzdan bağlantısı reddedildi.");
    }
  };

  // 🚀 GERÇEK MOTOR: MetaMask'ı Açan ve İmza İsteyen Transfer Fonksiyonu
  const handleTransfer = async () => {
    // 🛡️ Güvenlik Sensör Kontrolleri
    if (!account) return alert("🔒 Önce lütfen cüzdanınızı bağlayın!");
    if (isWrongNetwork) { switchNetwork(); return; }
    if (!address || !ethers.isAddress(address)) {
      alert("⛔ GÜVENLİK FRENİ: Alıcı cüzdan adresi geçersiz!");
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("⚠️ Lütfen geçerli bir miktar girin!");
      return;
    }

    try {
      setStatus(`⏳ MetaMask ekrana getiriliyor... Lütfen cüzdanınızdan onay verin.`);
      
      // 1. Motoru ve Sürücüyü (Signer) Hazırla
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // İşte MetaMask'ı tetikleyen anahtar bu!

      // 2. Seçilen Varlığın Kontratına Bağlan (USDT veya XAUT)
      const targetTokenAddress = TOKEN_ADDRESSES[token] || TOKEN_ADDRESSES.USDT;
      const tokenContract = new ethers.Contract(targetTokenAddress, TOKEN_ABI, signer);

      // 3. Miktarı Blokzincir Formatına Çevir (Örn: USDT için 6 desimal)
      let decimals = 6; // Varsayılan USDT desimali
      try {
        decimals = await tokenContract.decimals();
      } catch (e) { console.log("Desimal okunamadı, 6 varsayıldı."); }
      
      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);

      // 🚀 4. ATEŞLE! (MetaMask Onay Penceresi Şimdi Açılacak!)
      const tx = await tokenContract.transfer(address, parsedAmount);
      
      setStatus(`⏳ İşlem ağa gönderildi! (Tx: ${tx.hash.slice(0, 10)}...). Blokzincir onayı bekleniyor...`);
      
      // 5. Madencilerin (Blokzincirin) İşlemi Onaylamasını Bekle
      await tx.wait();

      setStatus(`✅ BAŞARILI! ${amount} ${token} transferi blokzincir üzerinde kesinleşti!`);
      setAmount("");
      setAddress("");

    } catch (err) {
      console.error("Transfer Hatası:", err);
      // Kullanıcı MetaMask'tan "Reddet" butonuna basarsa:
      if (err.code === "ACTION_REJECTED" || err.info?.error?.code === 4001) {
        setStatus("❌ İşlem iptal edildi: MetaMask üzerinden onayı reddettiniz.");
      } else if (err.message && err.message.includes("exceeds balance")) {
        setStatus(`❌ HATA: Cüzdanınızda transfer etmek için yeterli ${token} bulunmuyor!`);
      } else {
        setStatus("❌ Transfer başarısız oldu! (Ağ hatası veya yetersiz gaz ücreti)");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">SafeBridge</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1">
            <span>🚀 Canlı Blockchain Motoru Aktif</span> 🦅
          </p>
        </div>

        {/* Cüzdan Durum Alanı */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-between gap-3">
          {!account ? (
            <button onClick={connectWallet} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md text-sm">
              🔒 MetaMask Bağla ve Güvenliği Aç
            </button>
          ) : (
            <div className="w-full text-center">
              {isWrongNetwork ? (
                <button onClick={switchNetwork} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl text-xs animate-pulse transition-all shadow-md mb-2">
                  ⚠️ YANLIŞ AĞ! Doğru Ağa Geçmek İçin Tıklayın
                </button>
              ) : (
                <div className="flex items-center justify-between bg-green-50 px-3 py-1.5 rounded-xl border border-green-200 mb-2">
                  <span className="text-xs font-semibold text-green-700">🟢 Motor Hazır</span>
                  <span className="text-xs font-mono font-bold text-green-800">POL/ETH: {Number(balance).toFixed(4)}</span>
                </div>
              )}
              <p className="text-xs font-mono text-gray-600 truncate bg-white p-2 rounded border">{account}</p>
            </div>
          )}
        </div>

        {/* Durum Bilgilendirme Ekranı */}
        {status && (
          <div className={`mb-4 p-3 rounded-xl text-center text-xs font-semibold border ${
            status.includes("❌") || status.includes("⛔") || status.includes("⚠️") ? "bg-red-50 text-red-700 border-red-200" : status.includes("🟢") || status.includes("✅") ? "bg-green-50 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"
          }`}>
            {status}
          </div>
        )}

        {/* Form Alanı */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Gönderilecek Varlık</label>
            <select value={token} onChange={(e) => setToken(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:border-blue-600">
              <option value="USDT">💵 USDT (Tether Dolar)</option>
              <option value="XAUT">🥇 XAUT (Tether Altın)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Alıcı Adresi</label>
            <input type="text" placeholder="0x..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl font-mono text-sm outline-none focus:border-blue-600" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Miktar</label>
            <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-gray-200 rounded-xl font-semibold outline-none focus:border-blue-600" />
          </div>

          <button
            onClick={handleTransfer}
            disabled={!account || isWrongNetwork}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all mt-2 ${
              !account ? "bg-gray-400 cursor-not-allowed" : isWrongNetwork ? "bg-red-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 cursor-pointer"
            }`}
          >
            {!account ? "🔒 Önce Cüzdan Bağlayın" : isWrongNetwork ? "⚠️ Yanlış Ağ Kilitli" : `🚀 Canlı Transferi Başlat (${token})`}
          </button>
        </div>

      </div>
    </div>
  );
}