import React, { useEffect, useState } from "react";
import { productApi } from "../../api/productApi";
import { Category } from "../../types/product";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Tag, Plus, Edit2, Trash2, Check, RefreshCw } from "lucide-react";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [inputName, setInputName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await productApi.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      } else {
        setErr(res.message || "Gagal memuat kategori.");
      }
    } catch (e: any) {
      console.error("Fetch cats error", e);
      setErr(e.response?.data?.message || e.message || "Koneksi terganggu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    try {
      setSubmitting(true);
      const res = await productApi.createCategory({ name: inputName.trim() });
      if (res.success) {
        showToast(`Kategori "${inputName}" berhasil ditambahkan!`, "success");
        setInputName("");
        fetchCategories();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal membuat kategori.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editName.trim()) return;

    try {
      setSubmitting(true);
      const res = await productApi.updateCategory(editingCat.id, { name: editName.trim() });
      if (res.success) {
        showToast(`Kategori berhasil diubah menjadi "${editName}"!`, "success");
        setEditingCat(null);
        setEditName("");
        fetchCategories();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal mengubah kategori.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Hapus kategori fashion ini? Produk di bawah kategori ini juga akan terpengaruh!")) return;
    try {
      const res = await productApi.deleteCategory(id);
      if (res.success) {
        showToast("Kategori berhasil dihapus.", "success");
        fetchCategories();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal menghapus kategori.", "error");
    }
  };

  return (
    <div className="p-6 font-sans bg-slate-950 text-slate-100 min-h-screen" id="admin-categories-page">
      <div className="border-b border-slate-800 pb-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white uppercase flex items-center gap-2">
            <Tag className="w-6 h-6 text-violet-500" />
            <span>Kategori Busana & Gaya ({categories.length})</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Mengurus taxonomy, klasifikasi pakaian, streetwear, oversized top, pants, dan shoes.</p>
        </div>

        <button
          onClick={fetchCategories}
          className="p-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-bold text-slate-300 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category List */}
        <div className="lg:col-span-2">
          {err && <ErrorMessage message="Gagal Sinkronisasi Kategori." details={err} />}

          {loading ? (
            <LoadingSpinner message="Membuka daftar model..." />
          ) : categories.length === 0 ? (
            <p className="text-center text-slate-500 italic py-10 bg-slate-900/40 rounded-xl border border-slate-800">
              Belum ada kategori yang diklasifikasikan.
            </p>
          ) : (
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
              <table className="min-w-full divide-y divide-slate-800 text-left">
                <thead className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Nama Klasifikasi Kategori</th>
                    <th className="p-4 text-right">Moderasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-850/50 transition">
                      <td className="p-4 font-mono font-bold text-slate-500">#{cat.id}</td>
                      <td className="p-4">
                        <span className="font-extrabold text-white text-sm">{cat.name}</span>
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingCat(cat);
                            setEditName(cat.name);
                          }}
                          className="p-1.5 border border-slate-800 bg-slate-850 hover:bg-violet-600 hover:text-white rounded-lg text-slate-300 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 border border-slate-800 bg-slate-850 hover:bg-rose-600 hover:text-white rounded-lg text-rose-450 transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Forms */}
        <div className="lg:col-span-1 space-y-6">
          {editingCat ? (
            <div className="border border-slate-800 p-6 rounded-2xl bg-slate-900 shadow-xl">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-violet-400" />
                <span>Revisi Kategori</span>
              </h3>
              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Nama Klasifikasi</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Contoh: Premium Overcoats"
                    className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCat(null);
                      setEditName("");
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[11px] font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !editName.trim()}
                    className="px-4 py-2 bg-white text-black hover:bg-violet-600 hover:text-white rounded-lg text-[11px] font-bold transition disabled:opacity-45"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="border border-slate-800 p-6 rounded-2xl bg-slate-900 shadow-xl">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-violet-400" />
                <span>Buat Kategori Baru</span>
              </h3>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Nama Klasifikasi Kategori</label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Contoh: Streetwear"
                    className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !inputName.trim()}
                  className="w-full text-center py-2 bg-white text-black hover:bg-violet-600 hover:text-white rounded-lg text-[11px] font-bold transition disabled:opacity-45"
                >
                  {submitting ? "Membentuk..." : "Membentuk Kategori"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
