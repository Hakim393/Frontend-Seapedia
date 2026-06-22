import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../api/authApi";
import { useToast } from "../../context/ToastContext";
import { User, Phone, MapPin, Key, Save, Sparkles } from "lucide-react";

export default function UserProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  // Profile update state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Nama tidak boleh kosong!", "error");
      return;
    }

    try {
      setUpdatingProfile(true);
      await updateProfile({ name, phone, address });
    } catch {
      // already printed via context
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("Sandian saat ini dan sandian baru wajib diisi!", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Kata sandi baru minimal memiliki 6 karakter!", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast("Konfirmasi kata sandi baru tidak sesuai!", "error");
      return;
    }

    try {
      setChangingPass(true);
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        showToast("Kata sandi berhasil diperbarui!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal mengubah kata sandi.", "error");
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="p-6 font-sans bg-white min-h-screen" id="user-profile-page">
      <div className="border-b border-gray-100 pb-6 mb-8">
        <h1 className="text-2xl font-extrabold text-gray-950 uppercase flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <span>Pengaturan Akun</span>
        </h1>
        <p className="text-gray-500 text-xs mt-1">Ubah nama profil lengkap, nomor seluler, alamat paket, beserta kredensial kata sandi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left pane: Profile card */}
        <div className="border border-gray-150 rounded-3xl p-6 bg-white shadow-sm h-fit">
          <div className="flex items-center gap-2 text-violet-600 mb-6 pb-4 border-b border-gray-100">
            <User className="w-4 h-4" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-950">Informasi Pribadi</h3>
          </div>

          <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Email (Akun Utama)</label>
              <input
                type="text"
                disabled
                value={user?.email || ""}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-450 focus:outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Level Akses (Role)</label>
              <span className="inline-block bg-slate-100 text-slate-800 font-mono font-bold text-[10px] tracking-widest px-3 py-1 rounded-full uppercase border">
                {user?.role}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Nomor Hp / Telepon</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Alamat Paket Pengiriman</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 pt-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                  placeholder="Isi alamat lengkap dengan RT, RW, Kelurahan, Kecamatan, Kota"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow scroll-smooth transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{updatingProfile ? "Menyimpan..." : "Simpan Profil Baru"}</span>
            </button>
          </form>
        </div>

        {/* Right pane: Change password card */}
        <div className="border border-gray-150 rounded-3xl p-6 bg-white shadow-sm h-fit">
          <div className="flex items-center gap-2 text-violet-600 mb-6 pb-4 border-b border-gray-100">
            <Key className="w-4 h-4" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-950">Ganti Sandian Kunci</h3>
          </div>

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Nama Sandi Sekarang</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                placeholder="Sandi lama Anda"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Nama Sandi Baru (Min 6 karakter)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                placeholder="Gunakan pola sandi kuat hibrid"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Konfirmasi Sandi Baru</label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-violet-500 focus:outline-none"
                placeholder="Sandi baru kembali"
              />
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              <span>{changingPass ? "Memproses..." : "Perbarui Kata Sandi"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
