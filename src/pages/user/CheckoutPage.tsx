import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cartApi } from "../../api/cartApi";
import { orderApi } from "../../api/orderApi";
import { Cart } from "../../types/cart";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { MapPin, CreditCard, Sparkles, Clipboard, CheckCircle, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout fields
  const [shippingAddress, setShippingAddress] = useState(user?.address || "");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const res = await cartApi.getCart();
        if (res.success && res.data) {
          setCart(res.data);
        }
      } catch (err) {
        console.warn("Checkout cart query err:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      showToast("Alamat pengiriman wajib diisi!", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        shippingAddress,
        paymentMethod,
        notes: notes || undefined,
      };

      const res = await orderApi.checkout(payload);
      if (res.success) {
        showToast("Pesanan sukses dibuat! Silakan lakukan pembayaran jika diinstruksikan.", "success");
        // Clear cart globally
        try {
          await cartApi.clearCart();
        } catch {}
        navigate("/user/orders");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal melakukan checkout pesanan.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Mempersiapkan rincian pembayaran..." />;
  }

  const items = cart?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center p-8 border rounded-2xl bg-gray-50 my-16 font-sans">
        <h3 className="font-extrabold text-gray-900 text-sm uppercase">Keranjang Anda Kosong</h3>
        <p className="text-gray-500 text-xs mt-2">Anda tidak dapat membuka checkout jika tidak ada item pakaian di dalam keranjang.</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-6 bg-black text-white text-xs font-bold py-2 px-4 rounded-xl shadow"
        >
          Belanja Pakaian
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-white" id="checkout-page">
      <div className="border-b border-gray-100 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-violet-600" />
            <span>Formulir Pengiriman & Checkout</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Selesaikan rincian alamat tujuan dan metode pembayaran.</p>
        </div>
        <button onClick={() => navigate("/user/cart")} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-black">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Keranjang</span>
        </button>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fill Details pane */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-150 p-6 rounded-3xl bg-white shadow-sm space-y-5">
            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-violet-500" />
                <span>Alamat Pengiriman Paket *</span>
              </label>
              <textarea
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                placeholder="Masukkan alamat pengiriman lengkap Anda (Kecamatan, Kota, Provinsi, RT/RW, dan Kode Pos)..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
              />
            </div>

            {/* Payment selections */}
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-violet-500" />
                <span>Metode Pembayaran *</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`border p-4 rounded-xl flex items-start gap-3 cursor-pointer transition ${
                  paymentMethod === "BANK_TRANSFER" ? "border-violet-600 bg-violet-50/20" : "border-gray-200"
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === "BANK_TRANSFER"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-900">Transfer Bank</span>
                    <span className="text-[10px] text-gray-400">Verifikasi instan via m-banking.</span>
                  </div>
                </label>

                <label className={`border p-4 rounded-xl flex items-start gap-3 cursor-pointer transition ${
                  paymentMethod === "COD" ? "border-violet-600 bg-violet-50/20" : "border-gray-200"
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-900">COD (Bayar di Tempat)</span>
                    <span className="text-[10px] text-gray-400">Bayar saat kurir sampai di rumah.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Optional buyer notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1.5">
                <Clipboard className="w-4 h-4 text-violet-500" />
                <span>Catatan Pesanan (Opsional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Titipkan di satpam, warna kaos hitam pekat..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Total Summary and checkout trigger */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 border border-gray-150 p-6 rounded-3xl sticky top-24">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-950 pb-3 border-b border-gray-150 mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-600 fill-violet-100" />
              <span>Detail Pembelian</span>
            </h3>

            {/* Micro items list */}
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-xs">
                  <div className="text-gray-600">
                    <span className="font-bold text-gray-800">{item.product?.name}</span> x {item.quantity}
                  </div>
                  <span className="font-bold text-gray-900 font-mono flex-shrink-0">
                    {formatCurrency((item.product?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-150 pt-4 space-y-3 mb-6">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Total Item</span>
                <span>{items.reduce((sum, item) => sum + item.quantity, 0)} pcs</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Ongkos Kirim</span>
                <span className="text-emerald-600 font-bold">FREE SHIPPING</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center text-sm font-bold text-gray-900">
                <span>Total Pembayaran</span>
                <span className="text-sm font-extrabold text-violet-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-bold py-3.5 rounded-xl transition shadow disabled:opacity-40"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{submitting ? "Memproses Order..." : "Konfirmasi & Buat Pesanan"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
