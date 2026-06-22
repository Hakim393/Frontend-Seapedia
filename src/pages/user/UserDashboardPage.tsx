import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import { cartApi } from "../../api/cartApi";
import { reviewApi } from "../../api/reviewApi";
import { Order } from "../../types/order";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../utils/formatCurrency";
import { getOrderStatusLabel, getOrderStatusColor } from "../../utils/statusLabel";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ShoppingCart, ClipboardList, PenTool, Star, User, ChevronRight, Sparkles, FolderHeart } from "lucide-react";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [appReviewsCount, setAppReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch cart quantity
        try {
          const res = await cartApi.getCart();
          if (res.success && res.data) {
            const count = res.data.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;
            setCartCount(count);
          }
        } catch {}

        // Fetch my orders
        try {
          const res = await orderApi.getMyOrders();
          if (res.success) {
            setOrders(res.data ?? []);
          }
        } catch {}

        // Fetch my product reviews
        try {
          const res = await reviewApi.getMyProductReviews();
          if (res.success) {
            setReviewsCount(res.data?.length ?? 0);
          }
        } catch {}

        // Fetch my app reviews
        try {
          const res = await reviewApi.getMyAppReviews();
          if (res.success) {
            setAppReviewsCount(res.data?.length ?? 0);
          }
        } catch {}

      } catch (err) {
        console.error("Dashboard fetch err:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardDetails();
  }, [user]);

  // Statistics summaries
  const pendingOrders = orders.filter((o) => o.status !== "PESANAN_SELESAI" && o.status !== "DIKEMBALIKAN");
  const completedOrders = orders.filter((o) => o.status === "PESANAN_SELESAI");

  if (loading) {
    return <LoadingSpinner message="Membuka halaman ringkasan belanja..." />;
  }

  return (
    <div className="p-6 font-sans bg-white min-h-screen" id="user-dashboard-page">
      {/* Welcome Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600 fill-violet-100/30" />
            <span>Dashboard Pembeli</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Halo {user?.name || "Pelanggan"}, kelola riwayat pesanan, profil, serta ulasan pakaian Anda di sini.
          </p>
        </div>
        <Link
          to="/"
          className="bg-black hover:bg-gray-800 text-white text-xs font-bold py-2 px-4 rounded-xl transition shadow shadow-black/10"
        >
          Belanja Produk Fashion Baru
        </Link>
      </div>

      {/* Widget/Cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 p-5 rounded-2xl border border-violet-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">Item Di Keranjang</p>
            <h3 className="text-2xl font-extrabold text-violet-900 mt-1 font-mono">{cartCount}</h3>
          </div>
          <ShoppingCart className="w-8 h-8 text-violet-500/80" />
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-2xl border border-amber-150 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Order Berlangsung</p>
            <h3 className="text-2xl font-extrabold text-amber-900 mt-1 font-mono">{pendingOrders.length}</h3>
          </div>
          <ClipboardList className="w-8 h-8 text-amber-500/80" />
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-2xl border border-emerald-150 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Order Selesai</p>
            <h3 className="text-2xl font-extrabold text-emerald-900 mt-1 font-mono">{completedOrders.length}</h3>
          </div>
          <ClipboardList className="w-8 h-8 text-emerald-500/80" />
        </div>

        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Review Anda</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1 font-mono">{reviewsCount + appReviewsCount}</h3>
          </div>
          <PenTool className="w-8 h-8 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Latest orders list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-150 rounded-2xl p-6 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-950">Pesanan Terbaru Anda</h3>
              <Link to="/user/orders" className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1 group">
                <span>Semua Order</span>
                <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 font-sans italic border-t border-dashed">
                Belum ada pengajuan transaksi order. Jelajahi katalog dan checkout keranjang belanja Anda.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-xs text-gray-900">ID Order: #{order.orderNumber}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("id-ID")}</p>
                      <p className="text-xs font-semibold text-violet-600 mt-1">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                      <Link
                        to={`/user/orders/${order.id}`}
                        className="p-1 px-3 bg-gray-50 border rounded-lg text-[10px] font-bold hover:bg-violet-50 transition"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Action Shortcuts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-gray-150 p-6 rounded-2xl bg-white shadow-sm">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-950 mb-4">Shortcut Navigasi</h3>
            <div className="space-y-3">
              <Link
                to="/user/profile"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/20 text-xs font-bold text-gray-700 transition"
              >
                <User className="w-4 h-4 text-violet-500" />
                <span>Pengaturan Profil & Sandi</span>
              </Link>
              <Link
                to="/user/cart"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/20 text-xs font-bold text-gray-700 transition"
              >
                <ShoppingCart className="w-4 h-4 text-violet-500" />
                <span>Lompati ke Keranjang Belanja</span>
              </Link>
              <Link
                to="/user/orders"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/20 text-xs font-bold text-gray-700 transition"
              >
                <ClipboardList className="w-4 h-4 text-violet-500" />
                <span>Lihat Seluruh Pesanan Anda</span>
              </Link>
              <Link
                to="/user/product-reviews"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-violet-100 hover:bg-violet-50/20 text-xs font-bold text-gray-700 transition"
              >
                <FolderHeart className="w-4 h-4 text-violet-500" />
                <span>Lihat Riwayat Review Detail Anda</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
