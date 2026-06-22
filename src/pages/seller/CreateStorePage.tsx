import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeApi } from "../../api/storeApi";
import { useToast } from "../../context/ToastContext";
import { Store, MapPin, Clipboard, Image, Sparkles } from "lucide-react";

export default function CreateStorePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Nama Toko fashion wajib diisi!", "error");
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

      const res = await storeApi.createStore(payload);
      if (res.success) {
        showToast("Toko fashion Anda berhasil didaftarkan di K-Shop SEAPEDIA!", "success");
        navigate("/seller/dashboard");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal membuat toko. Anda mungkin sudah memiliki toko fashion.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 font-sans bg-white" id="create-store-page">
      <div className="text-center sm:text-left border-b border-gray-100 pb-6 mb-8">
        <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="w-5 h-5 text-violet-600 fill-violet-100" />
          <span>Daftarkan Toko Fashion Baru</span>
        </h1>
        <p className="text-gray-500 text-xs mt-1">
          Luncurkan toko online pribadi Anda dan mulailah memperlihatkan kreasi pakaian ke ribuan fashionista.
        </p>
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
              placeholder="Contoh: K-Casual Store, Varsity Vintage"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1">
              <Clipboard className="w-4 h-4 text-violet-500" />
              <span>Deskripsi Toko Fashion</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ceritakan tema fesyen Anda, misal: Fokus pada pakaian oversized harian, streetwear berkualitas, denim jacket..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1">
              <Image className="w-4 h-4 text-violet-500" />
              <span>Link URL Foto Logo Toko</span>
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo-toko.png"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1.5 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-violet-500" />
              <span>Kota / Alamat Toko</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Tangerang, Banten atau Jakarta Selatan"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/seller/dashboard")}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border text-gray-600 rounded-xl text-xs font-bold transition"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-6 py-2 rounded-xl shadow transition disabled:opacity-50"
            >
              {submitting ? "Memproses..." : "Luncurkan Toko"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
