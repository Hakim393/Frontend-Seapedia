import React, { useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";
import { UserProfile } from "../../types/auth";
import { useToast } from "../../context/ToastContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { Users, Trash2, Edit2, ShieldAlert, Check, RefreshCw } from "lucide-react";

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Editing role state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await adminApi.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setErr(res.message || "Gagal mendapatkan daftar pengguna.");
      }
    } catch (e: any) {
      console.error("Fetch users error", e);
      setErr(e.response?.data?.message || e.message || "Gagal terhubung dengan server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Hapus akun user ini secara permanen dari K-Shop? Tindakan tidak bisa dibatalkan!")) return;
    try {
      const res = await adminApi.deleteUser(id);
      if (res.success) {
        showToast("Akun pengguna berhasil dihapus.", "success");
        fetchUsers();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal menghapus pengguna.", "error");
    }
  };

  const handleUpdateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setUpdating(true);
      const res = await adminApi.updateUserRole(editingUser.id, newRole);
      if (res.success) {
        showToast(`Hak akses ${editingUser.name} berhasil diubah ke ${newRole}!`, "success");
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal memperbarui hak akses.", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 font-sans bg-slate-950 text-slate-100 min-h-screen" id="admin-users-page">
      <div className="border-b border-slate-800 pb-6 mb-8 flex justify-between items-center whitespace-nowrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white uppercase flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-500" />
            <span>Kelola Komunitas Pengguna ({users.length})</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Mengurus profil pembeli, mendaftarkan seller, dan membagi kewenangan admin.</p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-xs font-bold text-slate-300 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {err && <ErrorMessage message="Gagal Sinkronisasi Komunitas." details={err} />}

      {loading ? (
        <LoadingSpinner message="Membuka database keanggotaan K-Shop..." />
      ) : users.length === 0 ? (
        <p className="text-center text-slate-500 italic py-10">Belum ada akun terdaftar dalam sistem.</p>
      ) : (
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left">
              <thead className="bg-slate-950 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Identitas & Profil</th>
                  <th className="p-4">Alamat Email</th>
                  <th className="p-4">No. HP</th>
                  <th className="p-4">Peran Pengguna</th>
                  <th className="p-4">Waktu Terdaftar</th>
                  <th className="p-4 text-right">Tindakan Khusus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-820 font-extrabold text-[12px] flex items-center justify-center text-violet-400 border border-slate-700/60 font-mono">
                        {usr.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{usr.name}</span>
                        <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">{usr.address || "Belum melengkapi domisili"}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono">{usr.email}</td>
                    <td className="p-4 font-mono text-slate-400">{usr.phoneNumber || "-"}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border font-mono ${
                        usr.role === "ADMIN"
                          ? "bg-rose-950/80 text-rose-400 border-rose-900"
                          : usr.role === "SELLER"
                          ? "bg-violet-950/80 text-violet-400 border-violet-900"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      }) : "Lama"}
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingUser(usr);
                          setNewRole(usr.role);
                        }}
                        className="p-1.5 border border-slate-800 bg-slate-850 hover:bg-violet-600 hover:text-white hover:border-violet-500 rounded-lg text-slate-300 transition"
                        title="Ubah Peran"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(usr.id)}
                        disabled={usr.role === "ADMIN"}
                        className="p-1.5 border border-slate-800 bg-slate-850 hover:bg-rose-600 hover:text-white hover:border-rose-500 rounded-lg text-rose-400 transition disabled:opacity-30 disabled:pointer-events-none"
                        title="Hapus Pengguna"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editing Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" id="adjust-user-role-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="text-md font-extrabold text-white uppercase border-b border-slate-800 pb-3 mb-4">
              Ubah Role: {editingUser.name}
            </h3>

            <form onSubmit={handleUpdateRoleSubmit} className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Tentukan Kewenangan Akses Baru</p>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-violet-500 focus:border-transparent transition"
                >
                  <option value="USER">USER (Pembeli Biasa)</option>
                  <option value="SELLER">SELLER (Penjual / Pemilik Butik)</option>
                  <option value="ADMIN">ADMIN (Super Administrator)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-855">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-white hover:bg-violet-600 text-black hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 disabled:opacity-40"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{updating ? "Menyimpan" : "Simpan Peran"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
