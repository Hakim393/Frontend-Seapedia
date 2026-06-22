import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { storeApi } from "../../api/storeApi";
import { productApi } from "../../api/productApi";
import { orderApi } from "../../api/orderApi";
import { Store } from "../../types/store";
import { Product } from "../../types/product";
import { Order } from "../../types/order";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  getStoreStatusLabel,
  getStoreStatusColor,
  getOrderStatusLabel,
  getOrderStatusColor,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from "../../utils/statusLabel";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  Store as StoreIcon,
  AlertOctagon,
  ClipboardList,
  Package,
  PlusCircle,
  Sparkles,
  ChevronRight,
  Ban,
} from "lucide-react";

const getApiPayload = (response: any) => {
  return response?.data?.data ?? response?.data ?? response;
};

const isApiSuccess = (response: any) => {
  return response?.success ?? response?.data?.success ?? true;
};

const normalizeStore = (response: any): Store | null => {
  const payload = getApiPayload(response);

  if (!payload) return null;

  if (payload.store) return payload.store;

  return payload;
};

const normalizeArray = <T,>(response: any, key: string): T[] => {
  const payload = getApiPayload(response);

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.[key])) return payload[key];

  if (Array.isArray(payload?.items)) return payload.items;

  if (Array.isArray(payload?.data)) return payload.data;

  if (Array.isArray(payload?.results)) return payload.results;

  return [];
};

export default function SellerDashboardPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const fetchSellerDashboard = async () => {
    try {
      setLoading(true);
      setErrorDetails(null);
      setProducts([]);
      setOrders([]);

      let currentStore: Store | null = null;

      try {
        const storeRes: any = await storeApi.getMyStore();

        if (isApiSuccess(storeRes)) {
          currentStore = normalizeStore(storeRes);
          setStore(currentStore);
        } else {
          setStore(null);
        }
      } catch (err: any) {
        console.warn("Seller has no store yet or backend offline:", err);
        setStore(null);
      }

      if (!currentStore) {
        return;
      }

      try {
        const prodRes: any = await productApi.getMyProducts();

        if (isApiSuccess(prodRes)) {
          setProducts(normalizeArray<Product>(prodRes, "products"));
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        console.warn("Failed to fetch seller products:", err);
        setProducts([]);
      }

      try {
        const ordRes: any = await orderApi.getSellerOrders();

        if (isApiSuccess(ordRes)) {
          setOrders(normalizeArray<Order>(ordRes, "orders"));
        } else {
          setOrders([]);
        }
      } catch (err: any) {
        console.warn("Failed to fetch seller orders:", err);
        setOrders([]);
      }
    } catch (err: any) {
      console.error("Seller dashboard fetch error:", err);
      setErrorDetails(
        err.response?.data?.message ||
          err.message ||
          "Gagal memuat dashboard seller."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Membuka dashboard toko fashion Anda..." />;
  }

  if (errorDetails) {
    return (
      <div className="p-6 font-sans bg-white min-h-screen">
        <ErrorMessage
          message="Gagal memuat dashboard seller."
          details={errorDetails}
        />

        <button
          type="button"
          onClick={fetchSellerDashboard}
          className="mt-4 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!store) {
    return (
      <div
        className="p-6 font-sans bg-white min-h-screen flex flex-col justify-center items-center text-center"
        id="seller-no-store"
      >
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-full text-violet-600 mb-6 font-sans animate-bounce">
          <StoreIcon className="w-14 h-14" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight uppercase">
          Mulai Bisnis Fashion Anda
        </h1>

        <p className="text-sm text-gray-500 mt-2 max-w-md leading-relaxed">
          Anda belum memiliki toko fashion. Buat toko terlebih dahulu untuk mulai
          menjual produk di K-Fashion SEAPEDIA.
        </p>

        <div className="mt-8">
          <Link
            to="/seller/create-store"
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-bold py-3 px-6 rounded-xl shadow-lg transition"
          >
            <PlusCircle className="w-4 h-4 text-violet-400" />
            <span>Buat Toko Fashion</span>
          </Link>
        </div>
      </div>
    );
  }

  if (store.status === "SUSPENDED") {
    return (
      <div
        className="p-6 font-sans bg-white min-h-screen flex flex-col justify-center items-center text-center"
        id="store-suspended"
      >
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-full text-rose-500 mb-6">
          <Ban className="w-12 h-12 animate-pulse" />
        </div>

        <h1 className="text-2xl font-extrabold text-rose-900 tracking-tight uppercase">
          Toko Ditangguhkan
        </h1>

        <p className="text-sm text-gray-500 mt-2 max-w-sm leading-relaxed">
          Toko Anda ditangguhkan oleh Admin K-Fashion SEAPEDIA. Hubungi
          administrator platform untuk menyelesaikan status toko Anda.
        </p>
      </div>
    );
  }

  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  const lowStockProducts = safeProducts.filter((product) => {
    return Number(product.stock ?? 0) <= 5;
  });

  const incomingOrders = safeOrders.filter((order) => {
    return (
      order.status !== "PESANAN_SELESAI" &&
      order.status !== "DIKEMBALIKAN"
    );
  });

  const paidRevenue = safeOrders
    .filter((order) => order.paymentStatus === "PAID")
    .reduce((sum, order) => {
      return sum + Number(order.totalAmount ?? 0);
    }, 0);

  return (
    <div
      className="p-6 font-sans bg-white min-h-screen"
      id="seller-dashboard-page"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <span>Dashboard Seller</span>
          </h1>

          <p className="text-gray-500 text-xs mt-1">
            Mengelola butik{" "}
            <strong className="text-gray-800">{store.name}</strong>. Atur
            produk fashion, stok, resi logistik, serta rincian penjualan.
          </p>
        </div>

        <div className="flex gap-2">
          <span
            className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${getStoreStatusColor(
              store.status
            )}`}
          >
            Status Toko: {getStoreStatusLabel(store.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 p-5 rounded-2xl border border-violet-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">
              Total Produk
            </p>

            <h3 className="text-2xl font-extrabold text-violet-900 mt-1 font-mono">
              {safeProducts.length}
            </h3>
          </div>

          <Package className="w-8 h-8 text-violet-500/80" />
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
              Order Masuk
            </p>

            <h3 className="text-2xl font-extrabold text-amber-900 mt-1 font-mono">
              {incomingOrders.length}
            </h3>
          </div>

          <ClipboardList className="w-8 h-8 text-amber-500/80" />
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              Kritis Stok (&le;5)
            </p>

            <h3 className="text-2xl font-extrabold text-rose-900 mt-1 font-mono">
              {lowStockProducts.length}
            </h3>
          </div>

          <AlertOctagon className="w-8 h-8 text-rose-500/85" />
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between col-span-1">
          <div>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
              Pendapatan Kotor
            </p>

            <h3 className="text-base font-extrabold text-indigo-900 mt-1.5 font-mono">
              {formatCurrency(paidRevenue)}
            </h3>
          </div>

          <Sparkles className="w-8 h-8 text-indigo-500/80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-950">
                Order Terkini Masuk
              </h3>

              <Link
                to="/seller/orders"
                className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1 group"
              >
                <span>Selengkapnya</span>
                <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
              </Link>
            </div>

            {safeOrders.length === 0 ? (
              <p className="text-center py-8 text-xs text-gray-400 font-sans italic border-t border-dashed">
                Belum menerima invoice pesanan dari pembeli.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {safeOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-xs text-gray-900">
                        #INV-{order.orderNumber}
                      </p>

                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Oleh: {order.user?.name || "Pelanggan"}
                      </p>

                      <p className="text-xs font-semibold text-violet-600 mt-1">
                        {formatCurrency(Number(order.totalAmount ?? 0))}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getOrderStatusColor(
                          order.status
                        )}`}
                      >
                        {getOrderStatusLabel(order.status)}
                      </span>

                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {getPaymentStatusLabel(order.paymentStatus)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="border border-gray-200 p-6 rounded-2xl bg-white shadow-sm">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-950 mb-3">
              Peringatan Menipisnya Stok
            </h3>

            {lowStockProducts.length === 0 ? (
              <p className="text-[11px] text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100 font-sans">
                Semua produk fashion memiliki stok memadai.
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center text-xs p-2 rounded-xl border bg-rose-50/20 border-rose-100"
                  >
                    <span className="font-medium text-gray-800 leading-tight line-clamp-1 max-w-[150px]">
                      {product.name}
                    </span>

                    <span className="font-bold text-rose-600 bg-rose-100/50 px-2.5 py-0.5 rounded text-[10px] font-mono">
                      Sisa: {Number(product.stock ?? 0)} pcs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-200 p-6 rounded-2xl bg-white shadow-sm space-y-2">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400 mb-3">
              Pintasan Cepat
            </h3>

            <Link
              to="/seller/products/create"
              className="block text-center w-full bg-black text-white py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition"
            >
              Tambah Produk Fashion Baru
            </Link>

            <Link
              to="/seller/store"
              className="block text-center w-full border border-gray-200 text-gray-700 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition"
            >
              Kelola Pengaturan Toko
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}