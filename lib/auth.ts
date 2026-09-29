import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function validateCredentials(email: string | undefined, password: string | undefined, expectedRole?: "ADMIN" | "READER") {
  if (!email || !password) return null;
  const lookup = email.trim();
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: lookup.toLowerCase() }, { name: lookup }]
    }
  });
  if (!user) return null;
  if (expectedRole && user.role !== expectedRole) return null;
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/account/login" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        return validateCredentials(credentials?.email, credentials?.password, "READER");
      }
    }),
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        return validateCredentials(credentials?.email, credentials?.password, "ADMIN");
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? [AppleProvider({ clientId: process.env.APPLE_CLIENT_ID, clientSecret: process.env.APPLE_CLIENT_SECRET })]
      : [])
  ],
  callbacks: {
    async signIn({ user, account }) {
      if ((account?.provider === "google" || account?.provider === "apple") && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email.toLowerCase(),
              name: user.name || user.email.split("@")[0],
              password: await bcrypt.hash(crypto.randomUUID(), 12),
              role: "READER"
            }
          });
        } else if (user.name && existing.name !== user.name && existing.nameChangeTimestamps.length === 0) {
          await prisma.user.update({ where: { id: existing.id }, data: { name: user.name } });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const databaseUser = user.email ? await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } }) : null;
        token.uid = databaseUser?.id || (user as any).id;
        token.role = databaseUser?.role || (user as any).role || "READER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
        if (token.uid) {
          const databaseUser = await prisma.user.findUnique({ where: { id: token.uid as string }, select: { name: true, email: true, role: true, image: true } });
          if (databaseUser) {
            session.user.name = databaseUser.name;
            session.user.email = databaseUser.email;
            (session.user as any).role = databaseUser.role;
            session.user.image = databaseUser.image;
          }
        }
      }
      return session;
    }
  }
};

export function isAdminSession(session: unknown) {
  const user = (session as { user?: { role?: string } } | null | undefined)?.user;
  return user?.role === "ADMIN";
}
