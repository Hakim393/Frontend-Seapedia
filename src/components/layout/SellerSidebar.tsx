import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Store, PlusCircle, ShoppingBag, FolderPlus, ListOrdered, User, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function SellerSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", path: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Toko Saya", path: "/seller/store", icon: Store },
    { name: "Buat Toko Baru", path: "/seller/create-store", icon: PlusCircle },
    { name: "Produk Saya", path: "/seller/products", icon: ShoppingBag },
    { name: "Tambah Produk", path: "/seller/products/create", icon: FolderPlus },
    { name: "Order Masuk", path: "/seller/orders", icon: ListOrdered },
    { name: "Profil Akun", path: "/user/profile", icon: User },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex flex-col h-auto md:h-[calc(100vh-4rem)] p-4 sticky top-16" id="seller-sidebar">
      <div className="mb-6 px-2">
        <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400">Seller Menu</h3>
      </div>
      <nav className="space-y-1 flex-grow">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-violet-50 text-violet-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-violet-600" : "text-gray-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-100 pt-4 mt-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
