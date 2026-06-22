import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cartApi } from "../../api/cartApi";
import { Cart } from "../../types/cart";
import { formatCurrency } from "../../utils/formatCurrency";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Trash2, ShoppingBag, ArrowRight, RefreshCw, Sparkles, AlertCircle } from "lucide-react";

export default function CartPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  const fetchCartDetails = async () => {
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        setCart(res.data);
      } else {
        setCart(null);
      }
    } catch (err: any) {
      console.warn("Cart loading failed which matches fallback scenario:", err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartDetails();
  }, []);

  const handleUpdateQty = async (itemId: number, currentQty: number, change: number) => {
    const nextQty = currentQty + change;
    if (nextQty <= 0) {
      handleDeleteItem(itemId);
      return;
    }

    try {
      setUpdatingItemId(itemId);
      const res = await cartApi.updateCartItem(itemId, { quantity: nextQty });
      if (res.success) {
        fetchCartDetails();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal mengubah kuantitas barang.", "error");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Hapus item ini dari keranjang?")) return;
    try {
      setUpdatingItemId(itemId);
      const res = await cartApi.deleteCartItem(itemId);
      if (res.success) {
        showToast("Item berhasil dihapus.", "success");
        fetchCartDetails();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal menghapus item.", "error");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Kosongkan semua isi keranjang belanja?")) return;
    try {
      setLoading(true);
      const res = await cartApi.clearCart();
      if (res.success) {
        showToast("Keranjang berhasil dikosongkan.", "success");
        setCart(null);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal mengosongkan keranjang.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !cart) {
    return <LoadingSpinner message="Membuka tas pakaian belanja Anda..." />;
  }

  const items = cart?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <div className="p-6 font-sans bg-white min-h-screen" id="cart-page">
      <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-violet-600" />
            <span>Keranjang Belanja</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Review item Anda sebelum melanjutkan pemesanan pengiriman.</p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="flex items-center gap-2 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 hover:bg-rose-100 px-4 py-2 rounded-xl transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan Keranjang</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Keranjang Belanja Kosong"
          description="Sepertinya keranjang belanja Anda kosong. Mulai jelajahi tren pakaian mode terbaru dan pesan gaun, outerwear, kemeja, atau aksesorismu!"
          actionText="Belanja Sekarang"
          onActionClick={() => navigate("/products")}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items list table */}
          <div className="lg:col-span-2 space-y-4">
            {/* Warning Single Store restriction */}
            <div className="bg-violet-50 border border-violet-100/50 p-4 rounded-2xl text-violet-850 text-xs flex gap-3">
              <AlertCircle className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold">Ketentuan K-Shop:</span> Satu keranjang belanja hanya diperbolehkan berisi item-item buatan satu toko fashion yang sama. Selesaikan atau bersihkan transaksi agar bisa memesan dari butik kreatif lain.
              </div>
            </div>

            <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const product = item.product;
                  const isUpdating = updatingItemId === item.id;
                  if (!product) return null;

                  return (
                    <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/20 transition-all duration-300">
                      {/* Product identity */}
                      <div className="flex gap-4 items-center">
                        <img
                          src={product.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=150"}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover border flex-shrink-0"
                        />
                        <div>
                          <p className="text-[9px] font-bold text-violet-600 uppercase tracking-widest">{product.category?.name || "K-Shop Store"}</p>
                          <h3 className="font-extrabold text-sm text-gray-900 pr-4">{product.name}</h3>
                          <span className="text-[10px] text-gray-400">Butik: {product.store?.name || "Independent Seller"}</span>
                          <p className="font-bold text-xs text-gray-800 mt-1">{formatCurrency(product.price)}</p>
                        </div>
                      </div>

                      {/* Controls and prices */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        {/* Qty edit section */}
                        <div className="flex items-center gap-1 bg-gray-50 border rounded-xl overflow-hidden shadow-sm">
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                            className="px-3 py-1 font-bold hover:bg-gray-25/50 font-mono disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 font-mono text-xs font-bold text-gray-850 bg-white border-l border-r">{item.quantity}</span>
                          <button
                            disabled={isUpdating || (product.stock && item.quantity >= product.stock)}
                            onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                            className="px-3 py-1 font-bold hover:bg-gray-50 font-mono disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        {/* Calculated price */}
                        <div className="text-right flex-grow sm:flex-none">
                          <p className="text-xs text-gray-400">Subtotal</p>
                          <p className="font-extrabold text-xs text-gray-900 mt-0.5">{formatCurrency(product.price * item.quantity)}</p>
                        </div>

                        {/* Delete trigger */}
                        <button
                          disabled={isUpdating}
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 transition border border-transparent hover:border-rose-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Checkout pricing summary panel */}
          <div className="lg:col-span-1">
            <div className="border border-gray-150 p-6 rounded-3xl bg-gray-50/50 sticky top-24">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 border-b border-gray-150 pb-3 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-600 fill-violet-100" />
                <span>Ringkasan Nilai Belanja</span>
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Merek/Toko</span>
                  <span className="font-extrabold text-gray-800">{items[0]?.product?.store?.name || "K-Shop"}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Jumlah Item</span>
                  <span className="font-medium text-gray-800 font-mono">{items.reduce((sum, item) => sum + item.quantity, 0)} pcs</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Biaya Ongkir (Estimasi)</span>
                  <span className="text-emerald-600 font-semibold uppercase tracking-wider text-[10px]">GRATIS PLATFORM</span>
                </div>
                <div className="border-t border-gray-150 pt-3 flex justify-between items-center text-sm font-bold text-gray-950">
                  <span>Total Harga</span>
                  <span className="text-sm font-extrabold text-violet-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/user/checkout")}
                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-bold py-3 rounded-xl transition shadow"
              >
                <span>Lanjut ke Form Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
