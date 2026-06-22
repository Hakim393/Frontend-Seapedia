import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { Product, Category } from "../../types/product";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Store } from "lucide-react";

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Filter & Search states
  const searchQuery = searchParams.get("search") || "";
  const categoryIdFilter = searchParams.get("categoryId") || "";
  const sortFilter = searchParams.get("sort") || "latest";
  const pageFilter = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    // Keep internal input sync
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await productApi.getCategories();
        if (res.success) {
          setCategories(res.data ?? []);
        }
      } catch (err) {
        console.warn("Could not load categories", err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        setErrorDetails(null);

        const params: any = {
          page: pageFilter,
          limit: 12,
          sort: sortFilter,
        };

        if (searchQuery) params.search = searchQuery;
        if (categoryIdFilter) params.categoryId = categoryIdFilter;

        const res = await productApi.getProducts(params);
        if (res.success) {
          setProducts(res.data ?? []);
        } else {
          setErrorDetails(res.message || "Gagal mendapatkan produk.");
        }
      } catch (err: any) {
        console.error("Products fetch issue:", err);
        setErrorDetails(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [searchQuery, categoryIdFilter, sortFilter, pageFilter]);

  const updateFilters = (newParams: any) => {
    const current = Object.fromEntries(searchParams);
    const updated = { ...current, ...newParams };
    
    // Clear unused/falsy parameters
    Object.keys(updated).forEach(key => {
      if (!updated[key]) delete updated[key];
    });

    // Reset page to 1 when filters change (unless updating page itself)
    if (!newParams.page) {
      delete updated.page;
    }

    setSearchParams(updated);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" id="product-list-page">
      <div className="border-b border-gray-100 pb-6 mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 uppercase">Katalog Pakaian & Fashion</h1>
        <p className="text-gray-500 text-xs mt-1">Gaya harian, streetwear, oversized, formal, hingga aksesoris terbaik</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 bg-white border border-gray-150 p-6 rounded-2xl h-fit">
          <div className="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-4 mb-5">
            <SlidersHorizontal className="w-4 h-4 text-violet-600" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Saring Pilihan</h3>
          </div>

          <form onSubmit={handleSearchSubmit} className="mb-6">
            <label className="block text-[11px] font-bold text-gray-700 tracking-wide uppercase mb-1.5">Kata Kunci</label>
            <div className="relative rounded-lg shadow-sm">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari kaos, topi, kemeja..."
                className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 bg-gray-50/50"
              />
              <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-violet-600">
                <Search className="w-3.5 h-3.5 text-gray-400 hover:text-violet-500 transition" />
              </button>
            </div>
          </form>

          <div className="mb-6">
            <label className="block text-[11px] font-bold text-gray-700 tracking-wide uppercase mb-1.5">Kategori Fashion</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => updateFilters({ categoryId: "" })}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                  !categoryIdFilter ? "bg-violet-50 text-violet-700 font-bold" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Semua Kategori
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ categoryId: cat.id.toString() })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                    categoryIdFilter === cat.id.toString()
                      ? "bg-violet-50 text-violet-700 font-bold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[11px] font-bold text-gray-700 tracking-wide uppercase mb-1.5">Urutan Produk</label>
            <select
              value={sortFilter}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs bg-white text-gray-700 focus:outline-none"
            >
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="name_asc">Nama A-Z</option>
            </select>
          </div>

          <button
            onClick={clearAllFilters}
            className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold tracking-wider uppercase hover:bg-gray-50 transition"
          >
            Hapus Semua Filter
          </button>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {errorDetails && <ErrorMessage message="Gagal memuat produk. Menampilkan fallback offline." details={errorDetails} />}

          {loading ? (
            <LoadingSpinner message="Mencari fashion outfit hebat..." />
          ) : products.length === 0 ? (
            <EmptyState
              title="Tidak ada produk ditemukan"
              description="Maaf, kami tidak mendapat hasil yang cocok dengan filter atau kata kunci Anda sekarang."
              actionText="Reset Filter"
              onActionClick={clearAllFilters}
            />
          ) : (
            <>
              {/* Grid content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="group cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600"}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-550"
                      />
                      {product.stock === 0 && (
                        <span className="absolute top-2 right-2 bg-rose-600 text-white font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                          Habis
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-gray-405 text-[9px] font-bold uppercase tracking-widest">
                        {product.category?.name || "Casual Wear"}
                      </p>
                      <h3 className="font-extrabold text-gray-900 text-xs mt-1 limit-text-1 group-hover:text-violet-600 transition">
                        {product.name}
                      </h3>
                      <p className="font-extrabold text-violet-600 text-sm mt-1.5">
                        {formatCurrency(product.price)}
                      </p>
                      {product.store && (
                        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
                          <span className="flex items-center gap-1 font-medium text-gray-600">
                            <Store className="w-3.5 h-3.5 text-gray-400" />
                            {product.store?.name}
                          </span>
                          <span>Stok: {product.stock}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              <div className="flex justify-center items-center gap-4 mt-12 bg-gray-50/50 border p-3 rounded-2xl w-fit mx-auto">
                <button
                  disabled={pageFilter <= 1}
                  onClick={() => updateFilters({ page: (pageFilter - 1).toString() })}
                  className="p-2 border rounded-xl hover:bg-white transition disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-xs font-bold font-mono tracking-widest text-gray-700">Halaman {pageFilter}</span>
                <button
                  disabled={products.length < 12} // simple limit check
                  onClick={() => updateFilters({ page: (pageFilter + 1).toString() })}
                  className="p-2 border rounded-xl hover:bg-white transition disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
