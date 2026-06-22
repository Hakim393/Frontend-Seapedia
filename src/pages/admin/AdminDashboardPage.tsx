import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { AdminDashboardData } from "../../types/admin";
import { formatCurrency } from "../../utils/formatCurrency";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  ClipboardList,
  MessageSquareCode,
  ShieldAlert,
  UserPlus,
} from "lucide-react";

const emptyDashboardData: AdminDashboardData = {
  stats: {
    totalUsers: 0,
    totalSellers: 0,
    totalStores: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalReviews: 0,
  },
  recentUsers: [],
  recentStores: [],
  recentProducts: [],
  recentOrders: [],
};

const normalizeAdminDashboardData = (response: any): AdminDashboardData => {
  const payload =
    response?.data?.data ??
    response?.data ??
    response;

  const stats = payload?.stats ?? {};

  return {
    stats: {
      totalUsers: Number(stats.totalUsers ?? payload?.totalUsers ?? 0),
      totalSellers: Number(stats.totalSellers ?? payload?.totalSellers ?? 0),
      totalStores: Number(stats.totalStores ?? payload?.totalStores ?? 0),
      totalProducts: Number(stats.totalProducts ?? payload?.totalProducts ?? 0),
      totalOrders: Number(stats.totalOrders ?? payload?.totalOrders ?? 0),
      totalReviews: Number(stats.totalReviews ?? payload?.totalReviews ?? 0),
    },
    recentUsers: Array.isArray(payload?.recentUsers) ? payload.recentUsers : [],
    recentStores: Array.isArray(payload?.recentStores) ? payload.recentStores : [],
    recentProducts: Array.isArray(payload?.recentProducts) ? payload.recentProducts : [],
    recentOrders: Array.isArray(payload?.recentOrders) ? payload.recentOrders : [],
  };
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData>(emptyDashboardData);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setErr(null);

      const res: any = await adminApi.getDashboard();

      const isSuccess = res?.success ?? res?.data?.success ?? true;
      const message = res?.message ?? res?.data?.message;

      if (isSuccess === false) {
        setErr(message || "Gagal mendapatkan statistik admin.");
        return;
      }

      const dashboardData = normalizeAdminDashboardData(res);
      setData(dashboardData);
    } catch (e: any) {
      console.error("Admin dashboard fetch error", e);
      setErr(
        e.response?.data?.message ||
          e.message ||
          "Gagal menghubungi backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Membuka Panel Administrator K-Fashion SEAPEDIA..." />;
  }

  if (err) {
    return (
      <div className="p-6 bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-center items-center">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-extrabold uppercase text-white">
          Ralat Akses Admin
        </h2>
        <p className="text-xs text-slate-400 mt-2 max-w-md text-center">
          {err}
        </p>
        <button
          onClick={fetchDashboard}
          className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-white"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { stats, recentStores, recentOrders } = data;

  return (
    <div
      className="p-6 font-sans bg-slate-950 text-slate-100 min-h-screen"
      id="admin-dashboard-page"
    >
      <div className="border-b border-slate-800 pb-6 mb-8">
        <h1 className="text-2xl font-extrabold text-white uppercase flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-violet-500" />
          <span>Admin Command Center</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Mengawasi kesehatan ekosistem marketplace K-Fashion SEAPEDIA.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase">
            Users
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-extrabold text-white font-mono">
              {stats.totalUsers}
            </h3>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase">
            Sellers
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-extrabold text-violet-400 font-mono">
              {stats.totalSellers}
            </h3>
            <UserPlus className="w-4 h-4 text-violet-800" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase">
            Toko Aktif
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-extrabold text-emerald-400 font-mono">
              {stats.totalStores}
            </h3>
            <Store className="w-4 h-4 text-emerald-800" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase">
            Produk
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-extrabold text-indigo-400 font-mono">
              {stats.totalProducts}
            </h3>
            <ShoppingBag className="w-4 h-4 text-indigo-800" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase">
            Orders
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-extrabold text-amber-500 font-mono">
              {stats.totalOrders}
            </h3>
            <ClipboardList className="w-4 h-4 text-amber-800" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase">
            Reviews
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-extrabold text-rose-400 font-mono">
              {stats.totalReviews}
            </h3>
            <MessageSquareCode className="w-4 h-4 text-rose-800" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-extrabold uppercase text-white tracking-wider border-b border-slate-800 pb-3 mb-4">
            Toko Terdaftar Baru
          </h3>

          {recentStores.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">
              Belum ada registrasi toko baru.
            </p>
          ) : (
            <div className="space-y-4">
              {recentStores.map((st) => (
                <div
                  key={st.id}
                  className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        st.logoUrl ||
                        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=80"
                      }
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900"
                      alt={st.name}
                    />
                    <div>
                      <h4 className="font-bold text-white text-xs">
                        {st.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {st.address || "Alamat belum tersedia"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${
                      st.status === "ACTIVE"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-900"
                        : "bg-amber-950 text-amber-400 border-amber-900"
                    }`}
                  >
                    {st.status}
                  </span>
                </div>
              ))}

              <div className="pt-2 text-center">
                <Link
                  to="/admin/stores"
                  className="text-xs text-violet-400 hover:text-violet-300 font-bold"
                >
                  Kelola Seluruh Toko &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-extrabold uppercase text-white tracking-wider border-b border-slate-800 pb-3 mb-4">
            Order Masuk Terakhir
          </h3>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">
              Belum ada order transaksi masuk.
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-800"
                >
                  <div>
                    <h4 className="font-bold text-white text-xs">
                      #{ord.orderNumber}
                    </h4>
                    <p className="text-[10px] text-violet-400 mt-0.5 font-bold font-mono">
                      {formatCurrency(Number(ord.totalAmount))}
                    </p>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${
                      ord.status === "PESANAN_SELESAI"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-900"
                        : "bg-blue-950 text-blue-400 border-blue-900"
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
              ))}

              <div className="pt-2 text-center">
                <Link
                  to="/admin/orders"
                  className="text-xs text-violet-400 hover:text-violet-300 font-bold"
                >
                  Kelola Seluruh Order &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}