import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeApi } from "../../api/storeApi";
import { Store } from "../../types/store";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import { MapPin, Store as StoreIcon, ShieldCheck } from "lucide-react";

export default function StoreListPage() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoresList = async () => {
      try {
        setLoading(true);
        setErrorDetails(null);
        const res = await storeApi.getStores();
        if (res.success) {
          setStores(res.data ?? []);
        } else {
          setErrorDetails(res.message || "Gagal mendapatkan daftar toko fashion.");
        }
      } catch (err: any) {
        console.error("Stores list fetch err:", err);
        setErrorDetails(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchStoresList();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans bg-white min-h-screen" id="store-list-page">
      <div className="border-b border-gray-100 pb-6 mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-950 uppercase">Toko Fashion K-Shop</h1>
        <p className="text-gray-500 text-xs mt-1">Belanja aman dari butik fashion terbaik, kurator indie, serta produsen streetwear tepercaya</p>
      </div>

      {errorDetails && <ErrorMessage details={errorDetails} />}

      {loading ? (
        <LoadingSpinner message="Menghubungkan ke butik terpercaya..." />
      ) : stores.length === 0 ? (
        <EmptyState
          title="Belum ada toko terdaftar"
          description="Masuk sebagai SELLER dan daftarkan toko fashion pertama Anda di K-Shop SEAPEDIA untuk mulai berjualan."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              onClick={() => navigate(`/stores/${store.id}`)}
              className="cursor-pointer bg-white border border-gray-150 p-6 rounded-2xl hover:shadow-lg hover:border-violet-300 transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100 mb-4">
                  <img
                    src={store.logoUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=150"}
                    alt={store.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-gray-950 text-sm tracking-tight">{store.name}</h3>
                      {store.status === "ACTIVE" && (
                        <ShieldCheck className="w-4 h-4 text-violet-600 fill-violet-100" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">ID Toko: #{store.id}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed min-h-[36px] line-clamp-2">
                  {store.description || "Temukan outfit terbaik, atasan, bawahan, streetwear, tas, serta jam elegan di butik resmi kami."}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-50/50 flex justify-between items-center text-[11px] text-gray-500">
                <span className="flex items-center gap-1 font-medium text-gray-650">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {store.address || "Tangerang"}
                </span>
                <span className="font-bold text-violet-600 hover:underline">Butik Profil &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
