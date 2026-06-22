import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import { Order } from "../../types/order";
import { formatCurrency } from "../../utils/formatCurrency";
import { useToast } from "../../context/ToastContext";
import { getOrderStatusLabel, getOrderStatusColor, getPaymentStatusLabel, getPaymentStatusColor } from "../../utils/statusLabel";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import { ClipboardList, Search, RefreshCw, Eye, Edit2, Check, Truck, CreditCard } from "lucide-react";

export default function SellerOrdersPage() {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Edit status modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorDetails(null);
      const res = await orderApi.getSellerOrders();
      if (res.success) {
        setOrders(res.data ?? []);
      } else {
        setErrorDetails(res.message || "Gagal mendapatkan daftar pesanan masuk.");
      }
    } catch (err: any) {
      console.error("Seller orders load error", err);
      setErrorDetails(err.response?.data?.message || err.message || "Gagal terhubung dengan server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setCourierName(order.courierName || "");
    setTrackingNumber(order.trackingNumber || "");
    setStatusNote((order as any).statusNote || order.notes || "");
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setSubmitting(true);
      
      // 1. Update status if changed
      if (newStatus !== selectedOrder.status || courierName || trackingNumber || statusNote) {
        await orderApi.updateOrderStatus(selectedOrder.id, {
          status: newStatus,
          note: statusNote || undefined,
          courierName: courierName || undefined,
          trackingNumber: trackingNumber || undefined
        });
      }

      // 2. Update payment if changed
      if (newPaymentStatus !== selectedOrder.paymentStatus) {
        await orderApi.updateOrderPayment(selectedOrder.id, {
          paymentStatus: newPaymentStatus
        });
      }

      showToast(`Pesanan #INV-${selectedOrder.orderNumber} berhasil diperbarui!`, "success");
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal memperbarui status order.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.user?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 font-sans bg-slate-950 text-slate-100 min-h-screen" id="seller-orders-page">
      <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white uppercase flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-violet-500" />
            <span>Manajemen Order Masuk ({orders.length})</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Mengurus pesanan, pengiriman busana, dan status tagihan.</p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-bold text-slate-300 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="mb-6 max-w-sm relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nomor invoice (#INV-...) atau nama pembeli..."
          className="w-full px-3 py-2 pl-9 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-3.5 h-3.5 text-slate-500" />
        </div>
      </div>

      {errorDetails && <ErrorMessage message="Gagal Sinkronisasi Order." details={errorDetails} />}

      {loading ? (
        <LoadingSpinner message="Mengambil daftar pesanan pelanggan..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Belum ada order masuk"
          description="Butik Anda belum menerima pesanan fashion dari pembeli. Promosikan produk pakaian Anda sekarang di platform!"
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="Order tidak ditemukan" description="Tidak ada invoice pesanan yang cocok dengan kriteria kata pencarian Anda." />
      ) : (
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left">
              <thead className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Tanggal & Invoice</th>
                  <th className="p-4">Detail Pembeli</th>
                  <th className="p-4">Item Pakaian</th>
                  <th className="p-4">Jumlah Total</th>
                  <th className="p-4">Status Tagihan</th>
                  <th className="p-4">Status Pengiriman</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4">
                      <span className="font-bold text-white block">#INV-{order.orderNumber}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-extrabold text-white block">{order.user?.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{order.shippingAddress}</span>
                    </td>
                    <td className="p-4">
                      <div className="max-w-[220px] space-y-1">
                        {order.items?.map((it, i) => (
                          <div key={it.id || i} className="flex justify-between items-center text-[11px] gap-2">
                            <span className="limit-text-1 text-slate-300">{it.productName ?? "Produk"}</span>
                            <span className="font-mono text-slate-500 font-bold text-[10px]">x{it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-extrabold text-white text-sm">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                      {order.courierName && (
                        <span className="text-[9px] text-slate-500 block mt-1 font-mono">
                          {order.courierName} ({order.trackingNumber || "-"})
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openStatusModal(order)}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-300 text-xs font-bold py-1.5 px-3 rounded-lg transition border border-slate-700 hover:border-violet-500"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Update</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit status modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" id="update-order-modal">
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-white uppercase border-b border-slate-800 pb-3 mb-4">
              Update Order #INV-{selectedOrder.orderNumber}
            </h3>

            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-violet-400" />
                  <span>Ubah Status Pembayaran</span>
                </p>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-violet-500 focus:border-transparent transition"
                >
                  <option value="PENDING">Menunggu Pembayaran</option>
                  <option value="PAID">Lunas</option>
                  <option value="FAILED">Gagal</option>
                  <option value="REFUNDED">Refund</option>
                </select>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-violet-400" />
                  <span>Ubah Status Pengiriman</span>
                </p>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-violet-500 focus:border-transparent transition"
                >
                  <option value="SEDANG_DIKEMAS">Sedang Dikemas</option>
                  <option value="MENUNGGU_PENGIRIM">Menunggu Pengirim</option>
                  <option value="SEDANG_DIKIRIM">Sedang Dikirim</option>
                  <option value="PESANAN_SELESAI">Selesai / Diterima</option>
                  <option value="DIKEMBALIKAN">Dikembalikan / Retur</option>
                </select>
              </div>

              {/* Courier info inputs only when shipping or shipped */}
              {(newStatus === "SEDANG_DIKIRIM" || newStatus === "PESANAN_SELESAI") && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950/50 border border-slate-850 rounded-lg">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Penyedia Kurir</label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="JNE / J&T / Sicepat"
                      className="w-full bg-slate-950 text-slate-100 border border-slate-850 rounded-md px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Nomor Resi / AWB</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Masukkan resi pengiriman"
                      className="w-full bg-slate-950 text-slate-100 border border-slate-850 rounded-md px-2.5 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">Catatan Catatan Internal / Note</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Contoh: Menyiapkan paket dari gudang sub-distrik..."
                  rows={2}
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-white hover:bg-violet-600 text-black hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 disabled:opacity-40"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{submitting ? "Menyimpan..." : "Update Order"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
