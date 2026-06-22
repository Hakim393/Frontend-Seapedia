import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { storeApi } from "../../api/storeApi";
import { Store } from "../../types/store";
import { Product } from "../../types/product";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import {
  ArrowLeft,
  Search,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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

const normalizeStore = (response: any): Store | null => {
  const payload = getApiPayload(response);

  if (!payload) return null;

  if (payload.store) return payload.store;

  return payload;
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

const getStoreStatusClass = (status?: string) => {
  if (status === "ACTIVE") {
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  }

  if (status === "SUSPENDED") {
    return "bg-rose-500/20 text-rose-300 border-rose-500/30";
  }

  return "bg-amber-500/20 text-amber-300 border-amber-500/30";
};

export default function StoreDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchStoreInfo = async () => {
    if (!id) {
      setErrorDetails("ID toko tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorDetails(null);

      const storeRes: any = await storeApi.getStoreById(id);

      if (isApiSuccess(storeRes) === false) {
        setStore(null);
        setProducts([]);
        setErrorDetails(
          getApiMessage(storeRes, "Gagal mendapatkan informasi toko.")
        );
        return;
      }

      const normalizedStore = normalizeStore(storeRes);

      if (!normalizedStore || !normalizedStore.id) {
        setStore(null);
        setProducts([]);
        setErrorDetails("Data toko tidak valid atau toko tidak ditemukan.");
        return;
      }

      setStore(normalizedStore);

      const productsRes: any = await storeApi.getStoreProducts(id);

      if (isApiSuccess(productsRes) === false) {
        setProducts([]);
        return;
      }

      const normalizedProducts = normalizeProducts(productsRes);
      setProducts(normalizedProducts);
    } catch (err: any) {
      console.error("Store fetch err:", err);
      setStore(null);
      setProducts([]);
      setErrorDetails(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengambil data toko dari backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreInfo();
  }, [id]);

  const safeProducts = Array.isArray(products) ? products : [];
  const keyword = search.trim().toLowerCase();

  const filteredProducts = safeProducts.filter((prod) => {
    const productName = prod.name?.toLowerCase() || "";
    const productDescription = prod.description?.toLowerCase() || "";

    if (!keyword) return true;

    return (
      productName.includes(keyword) || productDescription.includes(keyword)
    );
  });

  const productsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((currentPage) => currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Membuka etalase butik pakaian..." />
      </div>
    );
  }

  if (errorDetails || !store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorMessage
          message="Koneksi ke toko fashion terputus atau toko tidak tersedia."
          details={errorDetails || ""}
        />

        <div className="text-center mt-6">
          <Link
            to="/stores"
            className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Toko</span>
          </Link>
        </div>
      </div>
    );
  }

  const storeStatus = store.status || "ACTIVE";

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-white min-h-screen"
      id="store-detail-page"
    >
      <div className="mb-6">
        <Link
          to="/stores"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Toko</span>
        </Link>
      </div>

      <div className="bg-gradient-to-tr from-slate-900 via-neutral-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 mb-12 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-violet-600/10 w-96 h-96 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row gap-6 items-center relative z-10">
          <img
            src={
              store.logoUrl ||
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=150"
            }
            alt={store.name}
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 bg-white shadow-md flex-shrink-0"
          />

          <div className="text-center sm:text-left flex-grow">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {store.name}
              </h1>

              <span
                className={`font-mono text-[9px] font-bold tracking-widest px-2 py-0.5 rounded uppercase border ${getStoreStatusClass(
                  storeStatus
                )}`}
              >
                {storeStatus}
              </span>
            </div>

            <p className="text-gray-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              {store.description ||
                "Selamat datang di butik resmi kami. Temukan pakaian modern terbaik untuk harian dan event formal."}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-4 text-xs text-gray-400">
              <MapPin className="w-4 h-4 text-violet-400" />
              <span>{store.address || "Tangerang, Banten"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>Koleksi Produk Toko ({filteredProducts.length})</span>
          </h2>

          <p className="text-gray-500 text-xs mt-0.5">
            Etalase lengkap dari produk fashion {store.name}
          </p>
        </div>

        <div className="relative rounded-lg shadow-sm max-w-xs w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari produk toko ini..."
            className="w-full pl-3 pr-10 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 bg-gray-50"
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      </div>

      {paginatedProducts.length === 0 ? (
        <EmptyState
          title="Tidak ada produk untuk ditampilkan"
          description="Toko ini belum mengupload produk fashion, atau pencarian Anda tidak memiliki hasil."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="group cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
                  <img
                    src={
                      product.imageUrl ||
                      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600"
                    }
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-500"
                  />

                  {Number(product.stock) === 0 && (
                    <span className="absolute top-2 right-2 bg-rose-600 text-white font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                      Habis
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-extrabold text-gray-900 text-xs line-clamp-1 group-hover:text-violet-600 transition">
                    {product.name}
                  </h3>

                  <p className="font-extrabold text-violet-600 text-sm mt-1.5">
                    {formatCurrency(Number(product.price ?? 0))}
                  </p>

                  <div className="mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Sisa Stok: {Number(product.stock ?? 0)} pcs
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 bg-gray-50/50 border p-3 rounded-2xl w-fit mx-auto">
              <button
                disabled={page <= 1}
                onClick={handlePrevPage}
                className="p-1.5 border rounded-xl hover:bg-white transition disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              <span className="text-[11px] font-bold tracking-widest text-gray-700">
                Halaman {page} dari {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={handleNextPage}
                className="p-1.5 border rounded-xl hover:bg-white transition disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}