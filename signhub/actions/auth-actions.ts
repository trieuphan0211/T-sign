"use server";
import { auth, signOut } from "@/auth";

export async function federatedSignOut() {
  const session = await auth();

  if (session) {
    // 1. Lấy thông tin cần thiết
    const idToken = session.idToken;
    const issuer = process.env.AUTH_KEYCLOAK_ISSUER; // https://sso.stephen.io.vn/realms/master

    // 2. Tạo URL Logout của Keycloak
    // Mục tiêu: Sau khi logout ở Keycloak, nó sẽ trả người dùng về trang chủ của bạn
    const logoutUrl = `${issuer}/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${process.env.AUTH_URL}`;

    // 3. Đăng xuất ở NextAuth (Server-side)
    await signOut({ redirect: false });

    // 4. Trả về URL để Frontend thực hiện điều hướng (Redirect)
    return logoutUrl;
  }

  return "/";
}
