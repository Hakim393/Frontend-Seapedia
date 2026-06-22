import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { storeApi } from "../../api/storeApi";
import { reviewApi } from "../../api/reviewApi";
import { Category, Product } from "../../types/product";
import { Store } from "../../types/store";
import { AppReview } from "../../types/review";
import { useAuth } from "../../hooks/useAuth";
import { formatCurrency } from "../../utils/formatCurrency";
import RatingStars from "../../components/common/RatingStars";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Shirt, Store as StoreIcon, Star, Sparkles, MessageCircle, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [activeStores, setActiveStores] = useState<Store[]>([]);
  const [appReviews, setAppReviews] = useState<AppReview[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setBackendError(false);

        // Fetch categories
        let cats: Category[] = [];
        try {
          const resCat = await productApi.getCategories();
          if (resCat.success) {
            cats = resCat.data ?? [];
            setCategories(cats);
          }
        } catch (e: any) {
          console.warn("Categories fetch err", e);
        }

        // Fetch products
        try {
          const resProd = await productApi.getProducts({ page: 1, limit: 4, sort: "latest" });
          if (resProd.success) {
            setFeaturedProducts(resProd.data ?? []);
          }
        } catch (e: any) {
          console.warn("Products fetch err", e);
        }

        // Fetch stores
        try {
          const resStore = await storeApi.getStores();
          if (resStore.success) {
            setActiveStores((resStore.data ?? []).slice(0, 3));
          }
        } catch (e: any) {
          console.warn("Stores fetch err", e);
        }

        // Fetch app reviews
        try {
          const resRev = await reviewApi.getAppReviews();
          if (resRev.success) {
            setAppReviews((resRev.data ?? []).slice(0, 3));
          }
        } catch (e: any) {
          console.warn("App reviews fetch err", e);
        }

      } catch (err: any) {
        console.error("Master home fetch failed", err);
        setBackendError(true);
        setErrorDetails(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Soft fallback categories if backend has no categories yet
  const displayCats = categories.length > 0 ? categories : [
    { id: 1, name: "Pakaian Pria" },
    { id: 2, name: "Pakaian Wanita" },
    { id: 3, name: "Sepatu" },
    { id: 4, name: "Tas" },
    { id: 5, name: "Aksesoris" },
    { id: 6, name: "Streetwear" },
  ];

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const target = e.target as HTMLInputElement;
      navigate(`/products?search=${encodeURIComponent(target.value)}`);
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans text-black" id="homepage-container">
      {/* Hero Section */}
      <section className="bg-gradient-to-tr from-gray-50 via-white to-violet-50/40 border-b border-gray-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 border border-violet-200/50 text-violet-700 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />
            <span>K-Shop SEAPEDIA Premium Marketplace</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-950 uppercase max-w-4xl mx-auto leading-none">
            TEMUKAN FASHION TERBARU DI K-Shop SEAPEDIA
          </h1>
          
          <p className="mt-6 text-sm sm:text-base text-gray-650 max-w-2xl mx-auto leading-relaxed font-medium">
            Belanja pakaian, sepatu, tas, dan aksesoris pilihan dari berbagai toko fashion terpercaya. Temukan outfit terbaik untuk gaya harian, casual, streetwear, formal, hingga premium look.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/products"
              className="bg-black text-white hover:bg-gray-800 text-sm font-bold px-8 py-3.5 rounded-xl transition shadow shadow-black/10"
            >
              Jelajahi Produk
            </Link>
            <Link
              to="/stores"
              className="bg-white text-gray-950 border border-gray-200 hover:border-black hover:bg-gray-50 text-sm font-bold px-8 py-3.5 rounded-xl transition"
            >
              Cari Toko Fashion
            </Link>
          </div>

          <div className="mt-12 max-w-md mx-auto relative rounded-2xl shadow-sm">
            <input
              type="text"
              onKeyDown={handleSearchKeyPress}
              placeholder="Cari streetwear, oversized tee, gaun, tas..."
              className="block w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-center"
            />
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400 text-xs">
              Selesai dengan "Enter"
            </div>
          </div>
        </div>
      </section>

      {/* Connection Indicator Alert */}
      {backendError && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <ErrorMessage details={errorDetails || "Backend offline"} />
        </div>
      )}

      {/* Value Prepositions */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-violet-100 bg-gray-50/30 transition">
            <div className="bg-violet-100 p-3 rounded-xl text-violet-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Produk Terverifikasi</h4>
              <p className="text-gray-500 text-xs mt-1">Setiap seller di platform kami melalui kurasi ketat untuk menjamin keaslian outfit.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-violet-100 bg-gray-50/30 transition">
            <div className="bg-violet-100 p-3 rounded-xl text-violet-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Pengiriman Seluruh Nusantara</h4>
              <p className="text-gray-500 text-xs mt-1">Dukung pengiriman aman melalui kurir andal & tepercaya langsung ke alamat Anda.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-violet-100 bg-gray-50/30 transition">
            <div className="bg-violet-100 p-3 rounded-xl text-violet-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Ketentuan Return Jelas</h4>
              <p className="text-gray-500 text-xs mt-1">Kami menyediakan perlindungan asuransi return bagi pembeli jika barang tidak sesuai.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 bg-gray-50/50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-950 uppercase">Kategori Fashion Pilihan</h2>
              <p className="text-gray-500 text-xs mt-1">Temukan gaya fesyen khusus yang sesuai dengan karaktermu</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayCats.map((cat, i) => (
              <Link
                key={cat.id || i}
                to={`/products?categoryId=${cat.id}`}
                className="bg-white hover:bg-black hover:text-white border border-gray-100 hover:border-black p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition duration-300 flex flex-col items-center gap-3 group"
              >
                <div className="bg-gray-50 text-gray-700 p-3 rounded-full group-hover:bg-neutral-800 group-hover:text-violet-300 transition">
                  <Shirt className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm tracking-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Products Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-950 uppercase">Koleksi Terkini</h2>
            <p className="text-gray-500 text-xs mt-1">Pilihan style outfit, atasan, bawahan, outerwear, serta tas esensial</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group">
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : featuredProducts.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <p className="text-gray-500 text-sm">Belum ada produk fashion yang dimuat di database.</p>
            <p className="text-xs text-gray-400 mt-2">Masuk dengan akun SELLER lalu daftarkan tokomu dan tambahkan produk fashion baru pertama.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-500"
                  />
                  {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-rose-600 text-white font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Habis
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
                    {product.category?.name || "Premium Collection"}
                  </p>
                  <h3 className="font-bold text-gray-900 text-sm mt-1 limit-text-1 group-hover:text-violet-600 transition">
                    {product.name}
                  </h3>
                  <p className="font-extrabold text-violet-600 text-base mt-2">
                    {formatCurrency(product.price)}
                  </p>
                  {product.store && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1 font-medium">
                        <StoreIcon className="w-3.5 h-3.5 text-gray-450" />
                        {product.store?.name}
                      </span>
                      <span>Stok: {product.stock}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Stores Section */}
      <section className="py-16 bg-gray-50/50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-950 uppercase">Toko Fashion Tepercaya</h2>
              <p className="text-gray-500 text-xs mt-1">Beli langsung dari seller independen dan lokal fashion terbaik</p>
            </div>
            <Link to="/stores" className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group">
              <span>Semua Toko</span>
              <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : activeStores.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-6">Belum ada seller aktif mendaftarkan toko fashion.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => navigate(`/stores/${store.id}`)}
                  className="cursor-pointer bg-white border border-gray-150/60 p-6 rounded-2xl hover:shadow-md hover:border-violet-200 transition-all duration-300 flex items-start gap-4"
                >
                  <img
                    src={store.logoUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=150"}
                    alt={store.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm tracking-tight">{store.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{store.description || "Toko fashion modern terbaik."}</p>
                    <p className="text-[10px] text-gray-450 mt-2 font-medium">{store.address}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Reviews */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-950 uppercase">Apa Kata Pelanggan Kami</h2>
            <p className="text-gray-500 text-xs mt-1">Review asli dari komunitas K-Shop SEAPEDIA tentang kepuasan belanja</p>
          </div>
          <Link to="/reviews" className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group">
            <span>Tulis Review App</span>
            <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : appReviews.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 text-center border">
            <p className="text-gray-500 text-xs">Belum ada review aplikasi.</p>
            <p className="text-[10px] text-gray-400 mt-1">Masuk dengan akun USER lalu suarakan pengalaman belanjamu!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {appReviews.map((rev) => (
              <div key={rev.id} className="bg-white border rounded-2xl p-6 shadow-sm border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="mb-3">
                    <RatingStars rating={rev.rating} size={3.5} />
                  </div>
                  <p className="text-xs text-gray-650 italic leading-relaxed">
                    "{rev.comment || "Desain premium, mudah menemukan fashion modern."}"
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-bold text-gray-800">{rev.user?.name || "Seseorang"}</span>
                  <span>Reviewer</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-black text-white py-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-extrabold uppercase tracking-tight">K-Shop SEAPEDIA</h2>
            <h3 className="text-xl font-bold text-violet-300 mt-2 uppercase tracking-wide">Marketplace Fashion untuk Semua Gaya</h3>
            <p className="text-gray-400 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
              Daftar sekarang untuk mulai menjual produk buatanmu atau membeli streetwear, outfit oversize, kemeja rapi, serta ribuan pilihan fashion premium harian.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/register"
                className="bg-white text-black hover:bg-gray-150 text-xs font-bold px-6 py-3 rounded-lg shadow-md transition"
              >
                Mulai Daftar
              </Link>
              <Link
                to="/login"
                className="border border-white hover:bg-white/10 text-xs font-bold px-6 py-3 rounded-lg transition"
              >
                Masuk Akun
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
