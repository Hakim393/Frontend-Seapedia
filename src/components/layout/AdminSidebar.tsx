import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Store, Tag, ShoppingBag, ClipboardList, Star, MessageSquareCode, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { name: "Dashboard Admin", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Kelola Users", path: "/admin/users", icon: Users },
    { name: "Kelola Toko", path: "/admin/stores", icon: Store },
    { name: "Kelola Kategori", path: "/admin/categories", icon: Tag },
    { name: "Kelola Produk", path: "/admin/products", icon: ShoppingBag },
    { name: "Kelola Order", path: "/admin/orders", icon: ClipboardList },
    { name: "Review Produk", path: "/admin/product-reviews", icon: Star },
    { name: "Review Aplikasi", path: "/admin/application-reviews", icon: MessageSquareCode },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col h-auto md:h-[calc(100vh-4rem)] p-4 sticky top-16" id="admin-sidebar">
      <div className="mb-6 px-2">
        <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Administrator Panel</h3>
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
                  ? "bg-slate-800 text-white font-semibold"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-violet-400" : "text-slate-500"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-800 pt-4 mt-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-800 hover:text-rose-300 transition"
        >
          <LogOut className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>Keluar Admin</span>
        </button>
      </div>
    </aside>
  );
}
