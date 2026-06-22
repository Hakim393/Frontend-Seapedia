import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import { Order } from "../../types/order";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { getOrderStatusLabel, getOrderStatusColor, getPaymentStatusLabel, getPaymentStatusColor } from "../../utils/statusLabel";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import { ClipboardList, ArrowLeft, RefreshCw, Calendar, Sparkles } from "lucide-react";

export default function MyOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorDetails(null);
      const res = await orderApi.getMyOrders();
      if (res.success) {
        setOrders(res.data ?? []);
      } else {
        setErrorDetails(res.message || "Gagal mengambil riwayat pesanan.");
      }
    } catch (err: any) {
      console.warn("MyOrders fetch err", err);
      setErrorDetails(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCompleteOrder = async (orderId: number) => {
    if (!confirm("Selesaikan pesanan ini? Aksi menyatakan Anda telah menerima barang dengan baik.")) return;
    try {
      setSubmittingId(orderId);
      const res = await orderApi.completeMyOrder(orderId);
      if (res.success) {
        showToast("Pesanan berhasil diselesaikan! Terima kasih telah berbelanja.", "success");
        fetchOrders();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal menandai pesanan selesai.", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReturnOrder = async (orderId: number) => {
    if (!confirm("Ajukan komplain pengembalian barang pesanan ini?")) return;
    try {
      setSubmittingId(orderId);
      const res = await orderApi.returnMyOrder(orderId);
      if (res.success) {
        showToast("Pesanan berhasil diajukan pengembalian (DIKEMBALIKAN). Penjual akan menghubungi Anda.", "success");
        fetchOrders();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal mengajukan pengembalian.", "error");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="p-6 font-sans bg-white min-h-screen" id="my-orders-page">
      <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-violet-600" />
            <span>Pesanan Saya</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Riwayat lengkap transaksi belanja pakaian & fashion Anda.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 p-2 px-3 border rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-600 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {errorDetails && <ErrorMessage message="Gagal mendapatkan pesanan aktif." details={errorDetails} />}

      {loading ? (
        <LoadingSpinner message="Membuka riwayat logistik pakaian Anda..." />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pesanan"
          description="Anda belum pernah membuat transaksi pembelian. Mulailah mengisi keranjang belanja dengan style terbaik hari ini."
          actionText="Belanja Fesyen"
          onActionClick={() => window.location.href = "/products"}
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isSubmitting = submittingId === order.id;
            return (
              <div
                key={order.id}
                className="border border-gray-150 rounded-2xl bg-white overflow-hidden shadow-sm hover:border-violet-100 transition-all duration-300"
              >
                {/* Order Top Summary */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 flex flex-wrap justify-between items-center gap-4 text-xs font-medium text-gray-700">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div>
                      <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Nomor Invoice</span>
                      <span className="font-extrabold text-gray-900">#{order.orderNumber}</span>
                    </div>
                    <div className="border-l pl-4 border-gray-200">
                      <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Tanggal Beli</span>
                      <span className="text-gray-650 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="border-l pl-4 border-gray-200">
                      <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider">Toko Penjual</span>
                      <span className="text-gray-900 font-bold">{order.store?.name || "K-Shop Seller"}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="p-4 sm:p-5">
                  <div className="text-xs text-gray-500 mb-2">Item Belanja:</div>
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item) => (
                      <div key={item.id} className="text-xs flex justify-between items-center bg-gray-50/40 p-2 rounded-xl text-gray-700">
                        <span>{item.product?.name || "Premium Item"} <strong className="text-gray-900 font-mono">x {item.quantity}</strong></span>
                        <span className="font-bold font-mono text-gray-950">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Shipment Tracking if exists */}
                  {(order.courierName || order.trackingNumber) && (
                    <div className="bg-sky-50/50 border border-sky-100 p-3 rounded-xl text-[11px] text-sky-900 mb-4 font-sans">
                      <span className="font-bold">Informasi Kurir: </span>
                      {order.courierName} ({order.trackingNumber})
                    </div>
                  )}

                  {/* Actions footer */}
                  <div className="border-t border-gray-100 pt-4 mt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <div className="text-xs font-semibold text-gray-500">
                      Total Belanja: <span className="text-sm font-extrabold text-violet-600 font-mono">{formatCurrency(order.totalAmount)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <Link
                        to={`/user/orders/${order.id}`}
                        className="text-center px-4 py-1.5 border rounded-xl text-xs font-bold hover:bg-gray-50 transition"
                      >
                        Detail Invoice
                      </Link>

                      {/* Complete order if SEDANG_DIKIRIM */}
                      {order.status === "SEDANG_DIKIRIM" && (
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleCompleteOrder(order.id)}
                          className="px-4 py-1.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-40"
                        >
                          Tandai Selesai
                        </button>
                      )}

                      {/* Return order if allowed (e.g. still packaged/sent/done but wants return) */}
                      {order.status === "PESANAN_SELESAI" && (
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleReturnOrder(order.id)}
                          className="px-4 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-xl text-xs font-bold transition disabled:opacity-40"
                        >
                          Ajukan Return
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
