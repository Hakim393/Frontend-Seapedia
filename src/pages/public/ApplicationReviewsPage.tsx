import React, { useEffect, useState } from "react";
import { reviewApi } from "../../api/reviewApi";
import { AppReview } from "../../types/review";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import RatingStars from "../../components/common/RatingStars";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import {
  MessageSquareCode,
  ShieldAlert,
  BadgeCheck,
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

const normalizeAppReviews = (response: any): AppReview[] => {
  const payload = getApiPayload(response);

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.reviews)) return payload.reviews;

  if (Array.isArray(payload?.appReviews)) return payload.appReviews;

  if (Array.isArray(payload?.applicationReviews)) {
    return payload.applicationReviews;
  }

  if (Array.isArray(payload?.items)) return payload.items;

  if (Array.isArray(payload?.data)) return payload.data;

  if (Array.isArray(payload?.results)) return payload.results;

  return [];
};

export default function ApplicationReviewsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAppReviewsList = async () => {
    try {
      setLoading(true);
      setErrorDetails(null);

      const res: any = await reviewApi.getAppReviews();

      if (isApiSuccess(res) === false) {
        setReviews([]);
        setErrorDetails(
          getApiMessage(res, "Gagal mendapatkan review aplikasi.")
        );
        return;
      }

      const normalizedReviews = normalizeAppReviews(res);
      setReviews(normalizedReviews);
    } catch (err: any) {
      console.error("App review fetch error:", err);

      setReviews([]);
      setErrorDetails(
        err.response?.data?.message ||
          err.message ||
          "Gagal menghubungi backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppReviewsList();
  }, []);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast("Silakan login terlebih dahulu.", "info");
      return;
    }

    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      showToast("Ulasan tidak boleh kosong.", "info");
      return;
    }

    if (rating < 1 || rating > 5) {
      showToast("Rating harus berada di antara 1 sampai 5.", "info");
      return;
    }

    try {
      setSubmitting(true);

      const res: any = await reviewApi.createAppReview({
        rating,
        comment: trimmedComment,
      });

      if (isApiSuccess(res) === false) {
        showToast(getApiMessage(res, "Gagal menyimpan review."), "error");
        return;
      }

      showToast("Review aplikasi Anda berhasil disimpan!", "success");
      setComment("");
      setRating(5);
      fetchAppReviewsList();
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          err.message ||
          "Gagal menyimpan review.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: number) => {
    const confirmed = confirm("Hapus ulasan aplikasi Anda?");

    if (!confirmed) return;

    try {
      const res: any = await reviewApi.deleteAppReview(id);

      if (isApiSuccess(res) === false) {
        showToast(getApiMessage(res, "Gagal menghapus review."), "error");
        return;
      }

      showToast("Review aplikasi berhasil dihapus.", "success");
      fetchAppReviewsList();
    } catch (err: any) {
      showToast(
        err.response?.data?.message ||
          err.message ||
          "Gagal menghapus review.",
        "error"
      );
    }
  };

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-white min-h-screen"
      id="app-reviews-page"
    >
      <div className="border-b border-gray-100 pb-6 mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 uppercase flex items-center justify-center sm:justify-start gap-2.5">
          <MessageSquareCode className="w-8 h-8 text-violet-600 animate-pulse" />
          <span>Review & Ulasan Aplikasi</span>
        </h1>

        <p className="text-gray-500 text-xs mt-1">
          Ulasan jujur dari komunitas pembeli tentang kegunaan marketplace
          K-Fashion SEAPEDIA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-3xl sticky top-24">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400 mb-4">
              Tulis Ulasan Aplikasi
            </h3>

            {user ? (
              <form onSubmit={handleCreateReview} className="space-y-4">
                <div>
                  <span className="block text-xs text-gray-700 font-bold mb-1.5">
                    Beri Rating Aplikasi *
                  </span>

                  <RatingStars
                    rating={rating}
                    onRatingChange={setRating}
                    size={5}
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700 font-bold mb-1.5 font-sans">
                    Ulasan Anda *
                  </label>

                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Tulis kritik, saran, atau pujian Anda terhadap performa situs marketplace fashion ini..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 px-4 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 disabled:hover:bg-black"
                >
                  {submitting ? "Harap Tunggu..." : "Kirim Ulasan Aplikasi"}
                </button>
              </form>
            ) : (
              <div className="text-center p-4 rounded-2xl border bg-amber-50 border-amber-100/50">
                <ShieldAlert className="w-5 h-5 text-amber-500 mx-auto mb-2" />

                <p className="text-xs text-amber-800 leading-relaxed font-sans">
                  Silakan login atau daftar terlebih dahulu untuk mulai mengirim
                  ulasan aplikasi.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {errorDetails && (
            <ErrorMessage
              message="Gagal memuat ulasan aplikasi."
              details={errorDetails}
            />
          )}

          {loading ? (
            <LoadingSpinner message="Membuka masukan pelanggan..." />
          ) : safeReviews.length === 0 ? (
            <EmptyState
              title="Belum ada ulasan aplikasi"
              description="Aplikasi ini baru diluncurkan. Berikan masukan Anda pertama kali."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safeReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-violet-100 hover:shadow-md transition duration-300"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <RatingStars
                        rating={Number(rev.rating ?? 0)}
                        size={3.5}
                      />

                      <BadgeCheck className="w-4 h-4 text-violet-500 fill-violet-50/50" />
                    </div>

                    <p className="text-xs text-gray-600 italic leading-relaxed font-sans">
                      "
                      {rev.comment ||
                        "Desain premium, mudah menemukan fashion modern."}
                      "
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
                    <div>
                      <span className="font-extrabold text-gray-800">
                        {rev.user?.name || "Pelanggan K-Fashion"}
                      </span>

                      <span className="block text-[9px] text-gray-400 font-mono">
                        Role: {rev.user?.role || "USER"}
                      </span>
                    </div>

                    {user && Number(user.id) === Number(rev.userId) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded hover:bg-rose-100 hover:text-rose-600 transition"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}