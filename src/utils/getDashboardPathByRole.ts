export const getDashboardPathByRole = (role: string): string => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "SELLER") return "/seller/dashboard";
  return "/user/dashboard";
};

export default getDashboardPathByRole;
