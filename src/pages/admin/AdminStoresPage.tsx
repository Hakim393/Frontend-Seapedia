import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { Store } from "../../types/store";
import { useToast } from "../../context/ToastContext";
import { getStoreStatusLabel, getStoreStatusColor } from "../../utils/statusLabel";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Store as SIcon, RefreshCw, AlertTriangle, PlayCircle, StopCircle, UserCheck } from "lucide-react";

export default function AdminStoresPage() {
  const { showToast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await adminApi.getStores();
      if (res.success && res.data) {
        setStores(res.data);
      } else {
        setErr(res.message || "Gagal mendapatkan daftar butik.");
      }
    } catch (e: any) {
      console.error("Fetch stores err", e);
      setErr(e.response?.data?.message || e.message || "Gagal menghubungkan dengan server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleUpdateStatus = async (id: number, currentStatus: string, action: "ACTIVATE" | "SUSPEND" | "INACTIVATE") => {
    let nextStatus = "ACTIVE";
    if (action === "SUSPEND") {
      nextStatus = "SUSPENDED";
    } else if (action === "INACTIVATE") {
      nextStatus = "INACTIVE";
    }

    if (!confirm(`Konfirmasi mengubah status butik ini menjadi ${nextStatus}?`)) return;

    try {
      setUpdatingId(id);
      const res = await adminApi.updateStoreStatus(id, nextStatus);
      if (res.success) {
        showToast(`Status butik fashion berhasil diubah ke ${nextStatus}.`, "success");
        fetchStores();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal mengganti status toko.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 font-sans bg-slate-950 text-slate-100 min-h-screen" id="admin-stores-page">
      <div className="border-b border-slate-800 pb-6 mb-8 flex justify-between items-center whitespace-nowrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white uppercase flex items-center gap-2">
            <SIcon className="w-6 h-6 text-violet-500" />
            <span>Verifikasi & Kelola Butik ({stores.length})</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Mengurus perizinan toko local fashion, memantau deskripsi, serta melakukan suspensi.</p>
        </div>

        <button
          onClick={fetchStores}
          className="p-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-bold text-slate-300 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {err && <ErrorMessage message="Gagal Sinkronisasi Butik." details={err} />}

      {loading ? (
        <LoadingSpinner message="Membuka database butik K-Shop..." />
      ) : stores.length === 0 ? (
        <p className="text-center text-slate-500 italic py-10">Belum ada seller yang merumuskan data toko.</p>
      ) : (
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left">
              <thead className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Logo & Nama Butik</th>
                  <th className="p-4">Pemilik / Seller</th>
                  <th className="p-4">Alamat Fisik</th>
                  <th className="p-4">Waktu Buka</th>
                  <th className="p-4">Kondisi / Status</th>
                  <th className="p-4 text-right">Tindakan Moderasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                {stores.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4 flex items-center gap-3.5">
                      <img
                        src={st.logoUrl || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=150"}
                        className="w-11 h-11 rounded-lg object-cover bg-slate-950 border border-slate-800"
                        alt={st.name}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-bold text-white block">{st.name}</span>
                        <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 max-w-[240px] limit-text-1">{st.description || "Butik streetwear fashion"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-white block">{st.seller?.name || "Seller ID Check"}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{st.seller?.email || `ID: ${st.sellerId}`}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{st.address}</td>
                    <td className="p-4 text-slate-500">
                      {st.createdAt ? new Date(st.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short"
                      }) : "Lama"}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border font-mono ${getStoreStatusColor(st.status)}`}>
                        {getStoreStatusLabel(st.status)}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      {st.status !== "ACTIVE" && (
                        <button
                          onClick={() => handleUpdateStatus(st.id, st.status, "ACTIVATE")}
                          disabled={updatingId !== null}
                          className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800 hover:border-emerald-500 hover:bg-emerald-950/40 text-emerald-400 text-[11px] font-bold py-1 px-2.5 rounded-lg transition disabled:opacity-40"
                          title="Set Aktif"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Aktifkan</span>
                        </button>
                      )}

                      {st.status === "ACTIVE" && (
                        <button
                          onClick={() => handleUpdateStatus(st.id, st.status, "SUSPEND")}
                          disabled={updatingId !== null}
                          className="inline-flex items-center gap-1 bg-slate-950 border border-slate-800 hover:border-rose-500 hover:bg-rose-950/40 text-rose-400 text-[11px] font-bold py-1 px-2.5 rounded-lg transition disabled:opacity-40"
                          title="Suspend Butik"
                        >
                          <StopCircle className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
