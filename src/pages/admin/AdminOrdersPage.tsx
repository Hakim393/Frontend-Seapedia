import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { Order } from "../../types/order";
import { formatCurrency } from "../../utils/formatCurrency";
import { getOrderStatusLabel, getOrderStatusColor, getPaymentStatusLabel, getPaymentStatusColor } from "../../utils/statusLabel";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { ClipboardList, RefreshCw, Search } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await adminApi.getOrders();
      if (res.success && res.data) {
        setOrders(res.data);
      } else {
        setErr(res.message || "Gagal mendapatkan riwayat transaksi global.");
      }
    } catch (e: any) {
      console.error("Fetch admin orders error", e);
      setErr(e.response?.data?.message || e.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 font-sans bg-slate-950 text-slate-100 min-h-screen" id="admin-orders-page">
      <div className="border-b border-slate-800 pb-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white uppercase flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-violet-500" />
            <span>Riwayat Order Global ({orders.length})</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Mengaudit kepatuhan transaksi, pembayaran pembeli, dan kecepatan logistik seller.</p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-bold text-slate-300 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-6 max-w-sm relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari invoice (#INV-...) atau nama pembeli..."
          className="w-full px-3 py-2 pl-9 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      {err && <ErrorMessage message="Gagal Sinkronisasi Order Global." details={err} />}

      {loading ? (
        <LoadingSpinner message="Membuka riwayat database order..." />
      ) : orders.length === 0 ? (
        <p className="text-center text-slate-500 italic py-10">Belum ada invoice pesanan yang terbentuk di platform.</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-slate-500 italic py-10">Invoice pencarian tidak ditemukan.</p>
      ) : (
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left">
              <thead className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Tanggal & Invoice</th>
                  <th className="p-4">Pembeli (User)</th>
                  <th className="p-4">Toko Penjual (Seller)</th>
                  <th className="p-4">Jumlah Pake</th>
                  <th className="p-4">Total Nilai</th>
                  <th className="p-4">Kondisi Tagihan</th>
                  <th className="p-4">Kondisi Pengiriman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4">
                      <span className="font-bold text-white block">#INV-{ord.orderNumber}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-white block">{ord.user?.name || "Customer"}</span>
                      <span className="text-[10px] text-slate-500 block">ID: {ord.userId}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-violet-400 block">{ord.store?.name || `Toko ID: ${ord.storeId}`}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {ord.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                    </td>
                    <td className="p-4 font-mono font-bold text-white">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border font-mono ${getPaymentStatusColor(ord.paymentStatus)}`}>
                        {getPaymentStatusLabel(ord.paymentStatus)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border font-mono ${getOrderStatusColor(ord.status)}`}>
                        {getOrderStatusLabel(ord.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
