import "next-auth/jwt";

declare module "next-auth" {
  /**
   * Mở rộng kiểu Session để có thêm accessToken
   */
  interface Session {
    accessToken?: string;
    // Giữ lại các trường mặc định của user (name, email, image) và thêm các trường khác nếu cần
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  /**
   * Mở rộng kiểu JWT để có thêm accessToken, refreshToken, và các field khác
   */
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}
