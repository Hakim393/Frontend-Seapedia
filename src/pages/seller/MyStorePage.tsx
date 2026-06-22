import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { storeApi } from "../../api/storeApi";
import { Store } from "../../types/store";
import { useToast } from "../../context/ToastContext";
import { getStoreStatusLabel, getStoreStatusColor } from "../../utils/statusLabel";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Store as StoreIcon, ShieldCheck, Settings, AlertTriangle, AlertCircle, Ban } from "lucide-react";

export default function MyStorePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchMyStore = async () => {
    try {
      setLoading(true);
      const res = await storeApi.getMyStore();
      if (res.success && res.data) {
        setStore(res.data);
      } else {
        setStore(null);
      }
    } catch (err) {
      console.warn("My store loading failed, possibly seller doesn't have a store yet.");
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyStore();
  }, []);

  const handleDeactivate = async () => {
    if (!confirm("Nonaktifkan toko Anda? Pembeli tidak akan melihat produk Anda untuk sementara.")) return;
    try {
      setSubmitting(true);
      const res = await storeApi.deactivateMyStore();
      if (res.success) {
        showToast("Toko berhasil dinonaktifkan.", "success");
        fetchMyStore();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal menonaktifkan toko.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async () => {
    if (!confirm("Aktifkan kembali toko Anda dan tampil di marketplace?")) return;
    try {
      setSubmitting(true);
      const res = await storeApi.activateMyStore();
      if (res.success) {
        showToast("Toko berhasil diaktifkan kembali!", "success");
        fetchMyStore();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal mengaktifkan toko.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Membuka profil toko fashion Anda..." />;
  }

  // Case 1: No store
  if (!store) {
    return (
      <div className="p-6 font-sans bg-white min-h-screen flex flex-col justify-center items-center text-center">
        <StoreIcon className="w-12 h-12 text-gray-350 mb-4" />
        <h2 className="text-xl font-extrabold text-gray-900 uppercase">Belum Memiliki Toko</h2>
        <p className="text-xs text-gray-500 mt-2 max-w-sm leading-relaxed">
          Sebelum mulai memajang baju streetwear atau jacket, Anda wajib meluncurkan data toko fashion pertama Anda.
        </p>
        <Link
          to="/seller/create-store"
          className="mt-6 bg-black text-white hover:bg-gray-800 text-xs font-bold py-2 px-5 rounded-lg transition"
        >
          Buat Toko Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans bg-white min-h-screen" id="my-store-page">
      <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center gap-2">
            <StoreIcon className="w-6 h-6 text-violet-600" />
            <span>Pengaturan Toko Saya</span>
          </h1>
          <p className="text-gray-500 text-xs mt-1">Kelola data dasar toko, aktifitas listing, serta penangguhan status.</p>
        </div>

        <Link
          to="/seller/edit-store"
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition"
        >
          <Settings className="w-4 h-4" />
          <span>Ubah Keterangan Toko</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main detail cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-150 p-6 rounded-3xl bg-white shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <img
              src={store.logoUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=150"}
              alt={store.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-2xl object-cover border bg-gray-50"
            />
            <div className="text-center sm:text-left flex-grow">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{store.name}</h2>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${getStoreStatusColor(store.status)}`}>
                  {getStoreStatusLabel(store.status)}
                </span>
              </div>
              <p className="text-gray-650 text-xs mt-2 leading-relaxed">{store.description || "Tidak ada deskripsi toko."}</p>
              <p className="text-[11px] text-gray-400 mt-2 font-medium">Lokasi: {store.address || "Tangerang"}</p>
            </div>
          </div>

          {/* Warning state info */}
          {store.status === "SUSPENDED" && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-800 text-xs flex gap-3">
              <Ban className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold">Toko Ditangguhkan Admin:</span> Butik Anda sedang ditangguhkan karena melanggar kepatuhan niaga atau tagihan platform belum terpenuhi. Hubungi support.
              </div>
            </div>
          )}
        </div>

        {/* Right action control panels */}
        <div className="lg:col-span-1">
          <div className="border border-gray-150 p-6 rounded-3xl bg-gray-50/50">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-400 mb-4">Kontrol Keaktifan Toko</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed mb-6 font-sans">
              Anda berhak menonaktifkan sementara seluruh produk toko dari listing pencarian utama K-Shop agar tidak dipesan pembeli jika sedang berlibur.
            </p>

            {store.status === "ACTIVE" ? (
              <button
                onClick={handleDeactivate}
                disabled={submitting}
                className="w-full text-center py-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition disabled:opacity-40"
              >
                Deaktifkan Toko
              </button>
            ) : store.status === "INACTIVE" ? (
              <button
                onClick={handleActivate}
                disabled={submitting}
                className="w-full text-center py-2.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition disabled:opacity-40"
              >
                Aktifkan Toko
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border text-rose-800 rounded-xl text-[11px] text-center">
                Toko disuspend oleh admin. Tidak dapat diubah manual.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
