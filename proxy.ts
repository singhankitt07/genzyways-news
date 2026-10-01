import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized: ({ token }) => Boolean(token)
  }
});

export const config = {
  matcher: ["/admin/((?!login).*)"]
};