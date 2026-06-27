import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/login";
      const isAuthApi = nextUrl.pathname.startsWith("/api/auth");
      const isApiRoute = nextUrl.pathname.startsWith("/api/");
      const isOffline = nextUrl.pathname === "/offline";

      if (isAuthApi || isOffline) return true;

      if (isLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn && isApiRoute) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      return isLoggedIn;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  providers: [],
  trustHost: true,
} satisfies NextAuthConfig;
