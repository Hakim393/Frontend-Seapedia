export const getOrderStatusLabel = (status: string): string => {
  switch (status) {
    case "SEDANG_DIKEMAS":
      return "Sedang Dikemas";
    case "MENUNGGU_PENGIRIM":
      return "Menunggu Pengirim";
    case "SEDANG_DIKIRIM":
      return "Sedang Dikirim";
    case "PESANAN_SELESAI":
      return "Selesai";
    case "DIKEMBALIKAN":
      return "Dikembalikan";
    default:
      return status;
  }
};

export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case "SEDANG_DIKEMAS":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "MENUNGGU_PENGIRIM":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "SEDANG_DIKIRIM":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "PESANAN_SELESAI":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "DIKEMBALIKAN":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const getPaymentStatusLabel = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "Menunggu Pembayaran";
    case "PAID":
      return "Lunas";
    case "FAILED":
      return "Gagal";
    case "REFUNDED":
      return "Refund";
    default:
      return status;
  }
};

export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "FAILED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "REFUNDED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const getStoreStatusLabel = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "Aktif";
    case "INACTIVE":
      return "Tidak Aktif";
    case "SUSPENDED":
      return "Ditangguhkan";
    default:
      return status;
  }
};

export const getStoreStatusColor = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "INACTIVE":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "SUSPENDED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const getProductStatusLabel = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "Aktif";
    case "INACTIVE":
      return "Tidak Aktif";
    case "OUT_OF_STOCK":
      return "Stok Habis";
    default:
      return status;
  }
};

export const getProductStatusColor = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "INACTIVE":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "OUT_OF_STOCK":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};
