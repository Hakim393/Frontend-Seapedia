import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeApi } from "../../api/storeApi";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Store, MapPin, Clipboard, Image, ArrowLeft, Save } from "lucide-react";

export default function EditStorePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCurrentStoreInfo = async () => {
      try {
        setLoading(true);
        const res = await storeApi.getMyStore();
        if (res.success && res.data) {
          setName(res.data.name || "");
          setDescription(res.data.description || "");
          setLogoUrl(res.data.logoUrl || "");
          setAddress(res.data.address || "");
        }
      } catch (err: any) {
        showToast("Gagal mengambil data toko untuk diedit.", "error");
        navigate("/seller/store");
      } finally {
        setLoading(false);
      }
    };
    loadCurrentStoreInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Nama Toko wajib diisi!", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        description: description || undefined,
        logoUrl: logoUrl || undefined,
        address: address || undefined,
      };

      const res = await storeApi.updateMyStore(payload);
      if (res.success) {
        showToast("Rincian toko fashion Anda berhasil diperbarui!", "success");
        navigate("/seller/store");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal mengubah rincian toko.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Membuka isian butik..." />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans bg-white" id="edit-store-page">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/seller/store")}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
      </div>

      <div className="border-b border-gray-100 pb-6 mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold text-gray-950 uppercase">Ubah Rincian Toko Fashion</h1>
        <p className="text-gray-500 text-xs mt-1">Ubah nama butik, rincian produk, serta foto ikon logo toko Anda.</p>
      </div>

      <div className="bg-white border border-gray-150 p-6 sm:p-8 rounded-3xl shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1">
              <Store className="w-4 h-4 text-violet-500" />
              <span>Nama Toko Fashion *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1">
              <Clipboard className="w-4 h-4 text-violet-500" />
              <span>Deskripsi Toko</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1">
              <Image className="w-4 h-4 text-violet-500" />
              <span>Tautan URL Logo Toko</span>
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-violet-500" />
              <span>Alamat Toko</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/seller/store")}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border text-gray-600 rounded-xl text-xs font-bold transition"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold px-6 py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
