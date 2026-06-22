import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { Category } from "../../types/product";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { PlusCircle, ArrowLeft, Image, Sparkles } from "lucide-react";

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoadingCats(true);
        const res = await productApi.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setCategoryId(String(res.data[0].id));
          }
        }
      } catch (err: any) {
        console.error("Failed load cats", err);
        setErrorDetails("Gagal memuat kategori. Beberapa fungsi terganggu.");
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock || !categoryId) {
      showToast("Harap isi semua kolom wajib (Nama, Harga, Stok, Kategori)", "error");
      return;
    }

    try {
      setSubmitting(true);
      setErrorDetails(null);
      const payload = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl.trim() || undefined,
        categoryId: Number(categoryId),
        status,
      };

      const res = await productApi.createProduct(payload);
      if (res.success) {
        showToast("Produk fashion berhasil dipajang di etalase!", "success");
        navigate("/seller/products");
      } else {
        setErrorDetails(res.message || "Gagal membuat produk.");
      }
    } catch (err: any) {
      console.error("Create product failed", err);
      setErrorDetails(err.response?.data?.message || err.message || "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCats) {
    return <LoadingSpinner message="Mempersiapkan etalase fashion..." />;
  }

  return (
    <div className="p-6 font-sans bg-slate-950 text-slate-100 min-h-screen" id="create-product-page">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/seller/products")}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition text-xs font-bold mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Produk Saya</span>
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="border-b border-slate-800 pb-5 mb-6">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-violet-500" />
              <span>Tambah Koleksi Fashion</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Tambahkan produk pakaian, streetwear, casual, jas, atau gaun elegan terbaru yang ingin Anda tawarkan.
            </p>
          </div>

          {errorDetails && <ErrorMessage message="Gagal menambahkan produk." details={errorDetails} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Produk */}
            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Nama Produk Fashion <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Oversized Hoodie Streetwear K-Style"
                className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition"
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Deskripsi Detail Produk</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tulis spesifikasi bahan, detail jahitan, panduan ukuran (S, M, L, XL), serta warna yang tersedia."
                rows={4}
                className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Harga */}
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Harga Banderolan (Rp) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Harga dalam Rupiah"
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition"
                  min="0"
                  required
                />
              </div>

              {/* Sisa Stok */}
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Jumlah Sisa Stok <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Jumlah item tersedia"
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kategori */}
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Kategori Gaya <span className="text-red-500">*</span></label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-100 text-gray-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition font-medium"
                  required
                >
                  {categories.length === 0 ? (
                    <option value="" disabled>Belum ada kategori</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Status Penjualan <span className="text-red-500">*</span></label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-100 text-gray-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition font-medium"
                  required
                >
                  <option value="ACTIVE">Aktif (Tampil di Marketplace)</option>
                  <option value="INACTIVE">Arsip (Sembunyikan Sementara)</option>
                  <option value="OUT_OF_STOCK">Habis (Stok Kosong)</option>
                </select>
              </div>
            </div>

            {/* URL Gambar */}
            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">URL Foto Pakaian</label>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... atau tautan gambar fasyen"
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition flex-grow"
                />
                <div className="hidden sm:flex border border-slate-800 bg-slate-950/40 p-2 rounded-xl items-center justify-center w-14 h-12 flex-shrink-0 text-slate-400">
                  {imageUrl.trim() ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                      }}
                    />
                  ) : (
                    <Image className="w-5 h-5 text-slate-600" />
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Biarkan kosong untuk menggunakan placeholder busana standard.</p>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/seller/products")}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition"
              >
                Batalkan
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-white hover:bg-violet-600 text-black hover:text-white rounded-xl text-xs font-bold shadow-md hover:shadow-violet-500/20 transition disabled:opacity-40 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-violet-500 fill-violet-400 group-hover:text-white" />
                <span>{submitting ? "Memajang..." : "Pajang Produk Fashion"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
