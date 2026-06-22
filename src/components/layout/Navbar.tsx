import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, ShoppingCart, User, LogOut, Menu, X, Store, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { cartApi } from "../../api/cartApi";
import { getDashboardPathByRole } from "../../utils/getDashboardPathByRole";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor cart count
  const fetchCartCount = async () => {
    if (!user || user.role === "ADMIN") return;
    try {
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        // Items count total or unique items
        const count = res.data.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
        setCartCount(count);
      }
    } catch {
      // Quietly fail or output 0 if backend not running
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    // Fetch count occasionally or on location change
    const interval = setInterval(fetchCartCount, 15000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isLinkActive = (path: string) => {
    return location.pathname === path ? "text-violet-600 border-b-2 border-violet-600" : "text-gray-600 hover:text-violet-600";
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40" id="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <ShoppingBag className="w-6 h-6 text-violet-600 transition group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-wider text-black">
                  K-Shop <span className="text-violet-600">SEAPEDIA</span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-gray-400 uppercase -mt-1 flex items-center gap-0.5">
                  <Sparkles className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                  PREMIUM STREETWEAR
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`font-medium text-sm transition py-1 ${isLinkActive("/")}`}>
              Home
            </Link>
            <Link to="/products" className={`font-medium text-sm transition py-1 ${isLinkActive("/products")}`}>
              Produk Fashion
            </Link>
            <Link to="/stores" className={`font-medium text-sm transition py-1 ${isLinkActive("/stores")}`}>
              Toko Fashion
            </Link>
            <Link to="/reviews" className={`font-medium text-sm transition py-1 ${isLinkActive("/reviews")}`}>
              Review App
            </Link>
          </div>

          {/* User controls / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Cart link: Only for USER & SELLER role */}
                {user.role !== "ADMIN" && (
                  <Link
                    to="/user/cart"
                    className="relative p-2 text-gray-500 hover:text-violet-600 transition"
                    title="Keranjang Belanja"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-violet-600 text-white font-mono text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Dashboard Shortcut */}
                <Link
                  to={getDashboardPathByRole(user.role)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user.name} ({user.role})</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-rose-600 transition"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-violet-600 transition"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-sm"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            {user && user.role !== "ADMIN" && (
              <Link
                to="/user/cart"
                className="relative p-2 mr-2 text-gray-500 hover:text-violet-600 transition"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-violet-600 text-white font-mono text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-black focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Produk Fashion
            </Link>
            <Link
              to="/stores"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Toko Fashion
            </Link>
            <Link
              to="/reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Review App
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 px-3">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1 rounded bg-gray-50 mb-3">
                  <p className="text-xs text-gray-400">Masuk sebagai</p>
                  <p className="font-bold text-sm text-black">{user.name}</p>
                  <p className="text-xs text-violet-600 font-mono tracking-wide uppercase">{user.role}</p>
                </div>
                <Link
                  to={getDashboardPathByRole(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-2 border border-violet-600 text-violet-600 rounded-lg text-sm font-bold hover:bg-violet-50 transition"
                >
                  Dashboard Saya
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
