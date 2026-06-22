import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderApi } from "../../api/orderApi";
import { Order } from "../../types/order";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { getOrderStatusLabel, getOrderStatusColor, getPaymentStatusLabel, getPaymentStatusColor } from "../../utils/statusLabel";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { FileText, ArrowLeft, Calendar, MapPin, Truck, HelpCircle, Package } from "lucide-react";

export default function MyOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setErrorDetails(null);
        const res = await orderApi.getMyOrderById(id);
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setErrorDetails(res.message || "Gagal mendapatkan rincian pesanan.");
        }
      } catch (err: any) {
        console.warn("MyOrderDetail query error", err);
        setErrorDetails(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Membuka detail invoice Anda..." />;
  }

  if (errorDetails || !order) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center font-sans">
        <ErrorMessage message="Koneksi terputus atau pesanan tidak ditemukan." details={errorDetails || ""} />
        <Link to="/user/orders" className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1 justify-center mt-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembalikan ke Riwayat Pesanan</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans bg-white min-h-screen" id="my-order-detail-page">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-600" />
            <span>Rincian Invoice Belanja</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Status pengiriman, riwayat kurir, serta tanda bukti transaksi.</p>
        </div>
        <Link
          to="/user/orders"
          className="flex items-center gap-1.5 p-2 px-3 border rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main details block */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice card */}
          <div className="border border-gray-150 rounded-2xl p-6 bg-white shadow-sm space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nomor Invoice</p>
                <p className="font-extrabold text-gray-900 text-base">#{order.orderNumber}</p>
              </div>
              <div className="flex gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase font-mono ${getOrderStatusColor(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase font-mono ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {getPaymentStatusLabel(order.paymentStatus)}
                </span>
              </div>
            </div>

            {/* List purchase items */}
            <div>
              <p className="text-xs font-bold text-gray-750 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-violet-500" />
                <span>Barang Yang Dibeli</span>
              </p>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                {order.items?.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4 items-center justify-between text-xs hover:bg-gray-50/20 transition">
                    <div>
                      <p className="font-bold text-gray-900">{item.product?.name || "Premium Item"}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Merk: {order.store?.name || "K-Shop Store"}</p>
                      <p className="text-gray-500 mt-1 font-mono">{formatCurrency(item.price)} x {item.quantity}</p>
                    </div>
                    <span className="font-extrabold font-mono text-gray-950">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier & Shipping target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border border-gray-100 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-750 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-violet-500" />
                  <span>Destinasi Penerima</span>
                </p>
                <p className="text-gray-800 text-xs leading-relaxed font-medium">Nama: {order.user?.name || "Penerima"}</p>
                <p className="text-gray-650 text-xs leading-relaxed mt-1">{order.shippingAddress}</p>
              </div>

              <div className="border border-gray-100 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-750 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-violet-500" />
                  <span>Logistik Pengiriman</span>
                </p>
                {order.courierName || order.trackingNumber ? (
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-800"><span className="text-gray-450 font-medium">Kurir:</span> {order.courierName}</p>
                    <p className="text-gray-800 font-mono"><span className="text-gray-450 font-normal font-sans">No Resi:</span> {order.trackingNumber}</p>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs italic">Menantikan penyerahan kurir dari toko penjual.</span>
                )}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-gray-50 p-4 rounded-xl text-xs flex gap-2">
                <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-gray-700">Catatan pembeli:</span>
                  <p className="text-gray-600 mt-1">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right timeline side column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status logs */}
          <div className="border border-gray-150 p-6 rounded-2xl bg-white shadow-sm">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-950 mb-4 pb-2 border-b">Riwayat Status Paket</h3>
            {order.statusHistories && order.statusHistories.length > 0 ? (
              <div className="space-y-4">
                {order.statusHistories.map((hist, index) => (
                  <div key={hist.id || index} className="flex gap-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 bg-violet-600 rounded-full" />
                      {index < (order.statusHistories?.length || 0) - 1 && <div className="w-0.5 bg-gray-200 flex-grow" />}
                    </div>
                    <div className="pb-2">
                      <span className="font-extrabold text-gray-800 block text-[11px] uppercase tracking-wide">{getOrderStatusLabel(hist.status)}</span>
                      {hist.note && <p className="text-gray-500 text-xs mt-0.5">{hist.note}</p>}
                      <span className="block text-[10px] text-gray-400 mt-1">{formatDate(hist.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-450 italic">Log status tidak terekam secara manual.</p>
            )}
          </div>

          <div className="border border-gray-150 p-6 rounded-2xl bg-gray-50/50 text-xs">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Metode Pembayaran</p>
            <p className="font-bold text-gray-800 text-sm mt-0.5">{order.paymentMethod === "BANK_TRANSFER" ? "Transfer Bank Manual" : "COD (Bayar di Tempat)"}</p>
            
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-4">Tanggal Order Pertama</p>
            <p className="text-gray-650 mt-0.5 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-gray-440" />
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
