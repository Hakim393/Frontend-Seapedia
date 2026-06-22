import React from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";

// Layout and guard systems
import Navbar from "./components/layout/Navbar";
import UserSidebar from "./components/layout/UserSidebar";
import SellerSidebar from "./components/layout/SellerSidebar";
import AdminSidebar from "./components/layout/AdminSidebar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleRoute from "./components/common/RoleRoute";

// Public Pages
import HomePage from "./pages/public/HomePage";
import ProductListPage from "./pages/public/ProductListPage";
import ProductDetailPage from "./pages/public/ProductDetailPage";
import StoreListPage from "./pages/public/StoreListPage";
import StoreDetailPage from "./pages/public/StoreDetailPage";
import ApplicationReviewsPage from "./pages/public/ApplicationReviewsPage";
import ForbiddenPage from "./pages/public/ForbiddenPage";
import NotFoundPage from "./pages/public/NotFoundPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// User Pages
import UserDashboardPage from "./pages/user/UserDashboardPage";
import UserProfilePage from "./pages/user/UserProfilePage";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import MyOrdersPage from "./pages/user/MyOrdersPage";
import MyOrderDetailPage from "./pages/user/MyOrderDetailPage";
import MyProductReviewsPage from "./pages/user/MyProductReviewsPage";
import MyApplicationReviewsPage from "./pages/user/MyApplicationReviewsPage";

// Seller Pages
import SellerDashboardPage from "./pages/seller/SellerDashboardPage";
import CreateStorePage from "./pages/seller/CreateStorePage";
import EditStorePage from "./pages/seller/EditStorePage";
import MyStorePage from "./pages/seller/MyStorePage";
import MyProductsPage from "./pages/seller/MyProductsPage";
import CreateProductPage from "./pages/seller/CreateProductPage";
import EditProductPage from "./pages/seller/EditProductPage";
import SellerOrdersPage from "./pages/seller/SellerOrdersPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminStoresPage from "./pages/admin/AdminStoresPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminProductReviewsPage from "./pages/admin/AdminProductReviewsPage";
import AdminAppReviewsPage from "./pages/admin/AdminAppReviewsPage";

// Base wrappers for layouts
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D14] text-slate-100">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}

function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D14] text-slate-100">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-grow">
        <UserSidebar />
        <main className="flex-grow p-4 md:p-6 bg-[#0A0D14] overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SellerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D14] text-slate-100">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-grow animate-fade-in">
        <SellerSidebar />
        <main className="flex-grow p-4 md:p-6 bg-[#0A0D14] overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D14] text-slate-100">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-grow animate-fade-in">
        <AdminSidebar />
        <main className="flex-grow p-4 md:p-6 bg-[#0A0D14] overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/stores" element={<StoreListPage />} />
              <Route path="/stores/:id" element={<StoreDetailPage />} />
              <Route path="/reviews" element={<ApplicationReviewsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forbidden" element={<ForbiddenPage />} />
            </Route>

            {/* Protected Routes Block */}
            <Route element={<ProtectedRoute />}>
              {/* USER Role Protected Pages */}
              <Route element={<RoleRoute allowedRoles={["USER"]} />}>
                <Route element={<UserLayout />}>
                  <Route path="/user/dashboard" element={<UserDashboardPage />} />
                  <Route path="/user/profile" element={<UserProfilePage />} />
                  <Route path="/user/cart" element={<CartPage />} />
                  <Route path="/user/orders" element={<MyOrdersPage />} />
                  <Route path="/user/orders/:id" element={<MyOrderDetailPage />} />
                  <Route path="/user/product-reviews" element={<MyProductReviewsPage />} />
                  <Route path="/user/app-reviews" element={<MyApplicationReviewsPage />} />
                  <Route path="/user/checkout" element={<CheckoutPage />} />
                </Route>
              </Route>

              {/* SELLER Role Protected Pages */}
              <Route element={<RoleRoute allowedRoles={["SELLER"]} />}>
                <Route element={<SellerLayout />}>
                  <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
                  <Route path="/seller/create-store" element={<CreateStorePage />} />
                  <Route path="/seller/edit-store" element={<EditStorePage />} />
                  <Route path="/seller/store" element={<MyStorePage />} />
                  <Route path="/seller/products" element={<MyProductsPage />} />
                  <Route path="/seller/products/create" element={<CreateProductPage />} />
                  <Route path="/seller/products/edit/:id" element={<EditProductPage />} />
                  <Route path="/seller/orders" element={<SellerOrdersPage />} />
                  {/* Shared Profile Shortcut links to same page */}
                  <Route path="/user/profile" element={<UserProfilePage />} />
                </Route>
              </Route>

              {/* ADMIN Role Protected Pages */}
              <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/stores" element={<AdminStoresPage />} />
                  <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/orders" element={<AdminOrdersPage />} />
                  <Route path="/admin/product-reviews" element={<AdminProductReviewsPage />} />
                  <Route path="/admin/application-reviews" element={<AdminAppReviewsPage />} />
                </Route>
              </Route>
            </Route>

            {/* fallback 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
