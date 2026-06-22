import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { Product } from "../../types/product";
import { formatCurrency } from "../../utils/formatCurrency";
import { useToast } from "../../context/ToastContext";
import { getProductStatusLabel, getProductStatusColor } from "../../utils/statusLabel";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { ShoppingBag, RefreshCw, Eye, EyeOff } from "lucide-react";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await adminApi.getProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setErr(res.message || "Gagal memuat katalog produk.");
      }
    } catch (e: any) {
      console.error("Fetch products error", e);
      setErr(e.response?.data?.message || e.message || "Koneksi terganggu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      setTogglingId(id);
      const res = await adminApi.updateProductStatus(id, nextStatus);
      if (res.success) {
        showToast("Status keaktifan produk berhasil diubah.", "success");
        fetchProducts();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal mengganti status produk.", "error");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-6 font-sans bg-slate-950 text-slate-100 min-h-screen" id="admin-products-page">
      <div className="border-b border-slate-800 pb-6 mb-8 flex justify-between items-center whitespace-nowrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white uppercase flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-violet-500" />
            <span>Katalog Produk Seluruh Seller ({products.length})</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Mengurus listing komoditas, menonaktifkan item fasyen tiruan atau usang.</p>
        </div>

        <button
          onClick={fetchProducts}
          className="p-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-bold text-slate-300 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {err && <ErrorMessage message="Gagal Sinkronisasi Produk." details={err} />}

      {loading ? (
        <LoadingSpinner message="Membuka database produk pakaian..." />
      ) : products.length === 0 ? (
        <p className="text-center text-slate-500 italic py-10">Belum ada komoditas pakaian yang diposting seller.</p>
      ) : (
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left">
              <thead className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Foto & Deskripsi</th>
                  <th className="p-4">Butik / Seller</th>
                  <th className="p-4">Klasifikasi</th>
                  <th className="p-4">Banderol</th>
                  <th className="p-4">Stok Gudang</th>
                  <th className="p-4">Kondisi</th>
                  <th className="p-4 text-right">Moderasi Teknis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                {products.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4 flex gap-3.5 items-center">
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=150"}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 max-w-[200px] limit-text-1">{item.description}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-white block">{item.store?.name || "Butik Detail"}</span>
                      <span className="text-[10px] text-slate-500 block">ID: {item.storeId}</span>
                    </td>
                    <td className="p-4 text-slate-400 font-medium">
                      {item.category?.name || "Lain-lain"}
                    </td>
                    <td className="p-4 font-mono font-bold text-white text-xs">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {item.stock} pcs
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border font-mono ${getProductStatusColor(item.status)}`}>
                        {getProductStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(item.id, item.status)}
                        disabled={togglingId !== null}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold py-1 px-2.5 rounded-lg transition border border-slate-800 ${
                          item.status === "ACTIVE"
                            ? "bg-slate-950 hover:bg-rose-950/40 hover:border-rose-500 text-rose-450"
                            : "bg-slate-950 hover:bg-emerald-950/40 hover:border-emerald-500 text-emerald-400"
                        }`}
                      >
                        {item.status === "ACTIVE" ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Arsip</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Aktifkan</span>
                          </>
                        )}
                      </button>
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
