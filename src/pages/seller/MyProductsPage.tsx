import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { Product } from "../../types/product";
import { formatCurrency } from "../../utils/formatCurrency";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import {
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  PackageOpen,
  AlertOctagon,
} from "lucide-react";

const getApiPayload = (response: any) => {
  return response?.data?.data ?? response?.data ?? response;
};

const getApiMessage = (response: any, fallback: string) => {
  return response?.message ?? response?.data?.message ?? fallback;
};

const isApiSuccess = (response: any) => {
  return response?.success ?? response?.data?.success ?? true;
};

const normalizeProducts = (response: any): Product[] => {
  const payload = getApiPayload(response);

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.products)) return payload.products;

  if (Array.isArray(payload?.items)) return payload.items;

  if (Array.isArray(payload?.data)) return payload.data;

  if (Array.isArray(payload?.results)) return payload.results;

  return [];
};

export default function MyProductsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      setErrorDetails(null);

      const res: any = await productApi.getMyProducts();

      if (isApiSuccess(res) === false) {
        setProducts([]);
        setErrorDetails(getApiMessage(res, "Gagal mendapatkan produk Anda."));
        return;
      }

      const normalizedProducts = normalizeProducts(res);
      setProducts(normalizedProducts);
    } catch (err: any) {
      console.error("Seller product load error:", err);
      setProducts([]);
      setErrorDetails(
        err.response?.data?.message ||
          err.message ||
          "Gagal menghubungi backend.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleDeleteProduct = async (id: number) => {
    const confirmed = confirm(
      "Hapus produk fashion ini secara permanen dari etalase toko Anda?",
    );

    if (!confirmed) return;

    try {
      const res: any = await productApi.deleteProduct(id);

      if (isApiSuccess(res) === false) {
        showToast(getApiMessage(res, "Gagal menghapus produk."), "error");
        return;
      }

      showToast("Produk berhasil dihapus dari sistem.", "success");
      fetchMyProducts();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || err.message || "Gagal menghapus produk.",
        "error",
      );
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const keyword = search.trim().toLowerCase();

  const filtered = safeProducts.filter((product) => {
    const productName = product.name?.toLowerCase() || "";
    const productDescription = product.description?.toLowerCase() || "";
    const categoryName = product.category?.name?.toLowerCase() || "";

    if (!keyword) return true;

    return (
      productName.includes(keyword) ||
      productDescription.includes(keyword) ||
      categoryName.includes(keyword)
    );
  });

  return (
    <div
      className="p-6 font-sans bg-white min-h-screen"
      id="seller-products-page"
    >
      <div className="border-b border-gray-100 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center gap-2">
            <PackageOpen className="w-6 h-6 text-violet-600" />
            <span>Koleksi Produk Toko ({safeProducts.length})</span>
          </h1>

          <p className="text-gray-500 text-xs mt-1">
            Mengatur item fashion, stok produk, deskripsi, kategori, serta harga
            banderol.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchMyProducts}
            disabled={loading}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-600 transition disabled:opacity-50"
            title="Refresh produk"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            to="/seller/products/create"
            className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition"
          >
            <PlusCircle className="w-4 h-4 text-violet-400" />
            <span>Tambah Produk</span>
          </Link>
        </div>
      </div>

      <div className="mb-6 max-w-sm relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari dalam etalase produk Anda..."
          className="w-full px-3 py-2 pl-9 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />

        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {errorDetails && (
        <ErrorMessage message="Gagal sinkron produk." details={errorDetails} />
      )}

      {loading ? (
        <LoadingSpinner message="Membuka etalase pakaian..." />
      ) : safeProducts.length === 0 ? (
        <EmptyState
          title="Belum memiliki produk"
          description="Anda belum mendaftarkan produk fashion satu pun di toko online ini. Daftarkan produk pertama Anda sekarang."
          actionText="Daftarkan Produk Baru"
          onActionClick={() => navigate("/seller/products/create")}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Produk tidak ditemukan"
          description="Tidak terdapat produk yang cocok dengan kata pencarian tersebut di toko Anda."
        />
      ) : (
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 font-sans">
              <tr className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Foto & Nama Produk</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga</th>
                <th className="p-4">Sisa Stok</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs">
              {filtered.map((item) => {
                const price = Number(item.price ?? 0);
                const stock = Number(item.stock ?? 0);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/60 transition-all duration-300"
                  >
                    <td className="p-4">
                      <div className="flex gap-3.5 items-center">
                        <img
                          src={
                            item.imageUrl ||
                            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=150"
                          }
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                        />

                        <div>
                          <h3 className="font-extrabold text-gray-900 leading-tight">
                            {item.name}
                          </h3>

                          <p className="text-[10px] text-gray-400 mt-1 max-w-[220px] line-clamp-1">
                            {item.description || "Tidak ada deskripsi produk."}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-gray-600 font-medium">
                      {item.category?.name || "Lain-lain"}
                    </td>

                    <td className="p-4 font-bold text-gray-900 font-mono">
                      {formatCurrency(price)}
                    </td>

                    <td className="p-4">
                      {stock <= 5 ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded font-mono border border-rose-100">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Sisa {stock}</span>
                        </span>
                      ) : (
                        <span className="font-bold text-gray-700 font-mono">
                          {stock} pcs
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/seller/products/edit/${item.id}`}
                          className="inline-flex p-2 text-violet-600 hover:text-white bg-violet-50 hover:bg-violet-600 border border-violet-100 rounded-xl transition"
                          title="Edit produk"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(item.id)}
                          className="inline-flex p-2 text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 border border-rose-100 rounded-xl transition"
                          title="Hapus produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
