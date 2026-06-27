import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { prisma } from "@/lib/prisma";

export function getAuthProviders(): Provider[] {
  const providers: Provider[] = [];

  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      })
    );
  }

  if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM) {
    providers.push(
      Nodemailer({
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: Number(process.env.EMAIL_SERVER_PORT) || 587,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        },
        from: process.env.EMAIL_FROM,
      })
    );
  }

  if (
    process.env.AUTH_DEV_MODE === "true" &&
    process.env.NODE_ENV === "development"
  ) {
    providers.push(
      Credentials({
        id: "dev",
        name: "Development",
        credentials: {
          email: { label: "Email", type: "email" },
        },
        async authorize(credentials) {
          const email = (credentials?.email as string)?.trim().toLowerCase();
          if (!email) return null;

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: email.split("@")[0],
                emailVerified: new Date(),
              },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        },
      })
    );
  }

  return providers;
}

export function getAuthConfig() {
  return {
    hasGoogle: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    hasMagicLink: !!(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM),
    hasDev:
      process.env.AUTH_DEV_MODE === "true" &&
      process.env.NODE_ENV === "development",
  };
}
