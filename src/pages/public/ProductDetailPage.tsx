import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productApi } from "../../api/productApi";
import { reviewApi } from "../../api/reviewApi";
import { cartApi } from "../../api/cartApi";
import { Product } from "../../types/product";
import { ProductReview } from "../../types/review";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import RatingStars from "../../components/common/RatingStars";
import {
  ShoppingCart,
  Store,
  ArrowLeft,
  Star,
  MessageSquare,
  ShieldAlert,
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

const normalizeProduct = (response: any): Product | null => {
  const payload = getApiPayload(response);

  if (!payload) return null;

  if (payload.product) return payload.product;

  return payload;
};

const normalizeProductReviews = (response: any): ProductReview[] => {
  const payload = getApiPayload(response);

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.reviews)) return payload.reviews;

  if (Array.isArray(payload?.productReviews)) return payload.productReviews;

  if (Array.isArray(payload?.items)) return payload.items;

  if (Array.isArray(payload?.data)) return payload.data;

  if (Array.isArray(payload?.results)) return payload.results;

  return [];
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [postingReview, setPostingReview] = useState(false);

  const loadProductDetailAndReviews = async () => {
    if (!id) {
      setErrorDetails("ID produk tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorDetails(null);
      setProduct(null);
      setReviews([]);

      const productRes: any = await productApi.getProductById(id);

      if (isApiSuccess(productRes) === false) {
        setErrorDetails(
          getApiMessage(productRes, "Gagal mendapatkan detail produk."),
        );
        return;
      }

      const normalizedProduct = normalizeProduct(productRes);

      if (!normalizedProduct || !normalizedProduct.id) {
        setErrorDetails("Data produk tidak valid atau produk tidak ditemukan.");
        return;
      }

      setProduct(normalizedProduct);

      const productStock = Number(normalizedProduct.stock ?? 0);
      if (productStock > 0 && quantity > productStock) {
        setQuantity(productStock);
      }

      try {
        const reviewsRes: any = await reviewApi.getProductReviews(id);

        if (isApiSuccess(reviewsRes)) {
          const normalizedReviews = normalizeProductReviews(reviewsRes);
          setReviews(normalizedReviews);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.warn("Could not fetch product reviews:", err);
        setReviews([]);
      }
    } catch (err: any) {
      console.error("Product fetch issue:", err);

      setProduct(null);
      setReviews([]);
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
    loadProductDetailAndReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!user) {
      showToast(
        "Silakan login terlebih dahulu untuk menambah produk ke keranjang belanja.",
        "info",
      );
      navigate("/login");
      return;
    }

    const stock = Number(product.stock ?? 0);

    if (stock <= 0) {
      showToast("Produk sedang habis.", "error");
      return;
    }

    if (quantity < 1 || quantity > stock) {
      showToast("Jumlah produk tidak valid.", "error");
      return;
    }

    try {
      setAddingToCart(true);

      const res: any = await cartApi.addToCart({
        productId: product.id,
        quantity,
      });

      if (isApiSuccess(res) === false) {
        showToast(
          getApiMessage(res, "Gagal menambahkan produk ke keranjang belanja."),
          "error",
        );
        return;
      }

      showToast("Produk berhasil ditambahkan ke keranjang belanja!", "success");
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Gagal menambahkan produk ke keranjang belanja.";

      showToast(errMsg, "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !product) return;

    if (!user) {
      showToast("Anda harus login untuk mengirim ulasan.", "info");
      return;
    }

    const trimmedComment = reviewComment.trim();

    if (!trimmedComment) {
      showToast("Komentar ulasan tidak boleh kosong.", "info");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      showToast("Rating harus berada di antara 1 sampai 5.", "info");
      return;
    }

    try {
      setPostingReview(true);

      const res: any = await reviewApi.createProductReview(id, {
        rating: reviewRating,
        comment: trimmedComment,
      });

      if (isApiSuccess(res) === false) {
        showToast(getApiMessage(res, "Gagal mengirim review produk."), "error");
        return;
      }

      showToast("Review produk berhasil dikirim!", "success");
      setReviewComment("");
      setReviewRating(5);
      loadProductDetailAndReviews();
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Anda tidak berwenang mengulas produk ini. Pastikan order sudah selesai.";

      showToast(errMsg, "error");
    } finally {
      setPostingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const confirmed = confirm("Hapus ulasan Anda?");

    if (!confirmed) return;

    try {
      const res: any = await reviewApi.deleteProductReview(reviewId);

      if (isApiSuccess(res) === false) {
        showToast(getApiMessage(res, "Gagal menghapus review."), "error");
        return;
      }

      showToast("Review berhasil dihapus.", "success");
      loadProductDetailAndReviews();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || err.message || "Gagal menghapus review.",
        "error",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Membuka detail pakaian premium..." />
      </div>
    );
  }

  if (errorDetails || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ErrorMessage
          message="Produk fashion tidak ditemukan atau backend offline."
          details={errorDetails || ""}
        />

        <div className="text-center mt-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog Produk</span>
          </Link>
        </div>
      </div>
    );
  }

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const productPrice = Number(product.price ?? 0);
  const productStock = Number(product.stock ?? 0);
  const storeId = product.store?.id ?? product.storeId;

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-white"
      id="product-detail-page"
    >
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Pakaian</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="bg-gray-50 rounded-3xl overflow-hidden aspect-square flex items-center justify-center border border-gray-100 max-h-[500px]">
          <img
            src={
              product.imageUrl ||
              "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=700"
            }
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 w-fit rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-wider mb-4">
              <Star className="w-3 h-3 fill-violet-700" />
              <span>{product.category?.name || "Premium Look"}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="font-extrabold text-2xl text-violet-600 mt-4">
              {formatCurrency(productPrice)}
            </p>

            <div className="mt-6 border-t border-b border-gray-100 py-4 mb-6">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Detail Serta Deskripsi Produk
              </p>

              <p className="text-gray-600 text-sm mt-2 whitespace-pre-line leading-relaxed">
                {product.description ||
                  "Tidak ada deskripsi produk disediakan untuk pakaian ini."}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-gray-700 mb-6">
              <span>Stok:</span>

              {productStock > 0 ? (
                <span className="text-emerald-600 font-bold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {productStock} pcs tersedia
                </span>
              ) : (
                <span className="text-rose-600 font-bold font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Out Of Stock (Habis)
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {productStock > 0 && (
              <div className="flex items-center gap-3 w-fit bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                <span className="text-xs font-bold text-gray-700 px-2">
                  Kuantitas
                </span>

                <div className="flex items-center gap-1 bg-white border rounded-xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() =>
                      setQuantity((currentQuantity) =>
                        Math.max(1, currentQuantity - 1),
                      )
                    }
                    className="px-3 py-1 font-bold hover:bg-gray-100 transition disabled:opacity-30"
                  >
                    -
                  </button>

                  <span className="px-3 py-1 font-mono text-xs font-extrabold text-gray-900">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    disabled={quantity >= productStock}
                    onClick={() =>
                      setQuantity((currentQuantity) =>
                        Math.min(productStock, currentQuantity + 1),
                      )
                    }
                    className="px-3 py-1 font-bold hover:bg-gray-100 transition disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                disabled={productStock <= 0 || addingToCart}
                onClick={handleAddToCart}
                className="flex-grow flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-bold py-3 px-6 rounded-xl transition shadow disabled:opacity-40 disabled:hover:bg-black"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  {addingToCart ? "Memproses..." : "Tambahkan ke Keranjang"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl sticky top-24">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400 mb-4">
              Profil Penjual / Toko
            </h3>

            {product.store ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      product.store.logoUrl ||
                      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=150"
                    }
                    alt={product.store.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                  />

                  <div>
                    <h4 className="font-extrabold text-gray-900 text-sm">
                      {product.store.name}
                    </h4>

                    <span className="inline-block mt-0.5 bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      Official Seller
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  Koleksi pakaian chic modern, streetwear terbaik, dan kasual
                  premium harian langsung dari toko andalan.
                </p>

                <div className="pt-2 text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-violet-500" />
                  <span>{product.store.address || "Lokasi: Tangerang"}</span>
                </div>

                <div className="border-t border-gray-200/50 pt-4 mt-4">
                  <Link
                    to={`/stores/${storeId}`}
                    className="block text-center w-full px-4 py-2 border border-black hover:bg-black hover:text-white rounded-xl text-xs font-bold transition"
                  >
                    Kunjungi Toko Fashion
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">
                Informasi toko tidak ditemukan.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-extrabold text-lg text-gray-950 uppercase tracking-tight mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-600" />
            <span>Ulasan Pakaian ({safeReviews.length})</span>
          </h3>

          {user ? (
            <form
              onSubmit={handlePostReview}
              className="bg-gray-50 border border-gray-200 p-6 rounded-2xl mb-8"
            >
              <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wide mb-3">
                Tulis Review Produk
              </h4>

              <div className="mb-4">
                <span className="block text-xs text-gray-600 font-bold mb-1.5">
                  Beri Skor Bintang:
                </span>

                <RatingStars
                  rating={reviewRating}
                  onRatingChange={setReviewRating}
                  size={5}
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-600 font-bold mb-1.5">
                  Komentar Ulasan:
                </label>

                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  required
                  placeholder="Ceritakan kepuasan bahan kain, kecocokan ukuran, atau kualitas sablon pakaian ini..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={postingReview}
                className="bg-black hover:bg-gray-800 text-white text-[11px] font-bold font-sans px-4 py-2 rounded-lg transition disabled:opacity-40 disabled:hover:bg-black"
              >
                {postingReview ? "Mengirim..." : "Kirim Ulasan Produk"}
              </button>
            </form>
          ) : (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800 text-xs text-center flex items-center gap-3 justify-center mb-8">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Silakan login terlebih dahulu untuk menyuarakan ulasan pakaian
                ini.
              </span>
            </div>
          )}

          {safeReviews.length === 0 ? (
            <p className="text-gray-500 italic text-xs py-4 text-center border-t border-dashed">
              Belum ada ulasan untuk produk fashion ini. Jadilah yang pertama
              memberikan ulasan!
            </p>
          ) : (
            <div className="space-y-6">
              {safeReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="border-b border-gray-100 pb-6 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">
                        {rev.user?.name || "Pelanggan Terhormat"}
                      </span>

                      <RatingStars
                        rating={Number(rev.rating ?? 0)}
                        size={3.5}
                      />
                    </div>

                    <p className="text-gray-600 text-xs leading-relaxed italic">
                      "{rev.comment || "Kualitas luar biasa sesuai foto!"}"
                    </p>

                    <span className="block text-[10px] text-gray-400 mt-2">
                      {rev.createdAt
                        ? new Date(rev.createdAt).toLocaleDateString("id-ID")
                        : "Tanggal tidak tersedia"}
                    </span>
                  </div>

                  {user && Number(user.id) === Number(rev.userId) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev.id)}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
