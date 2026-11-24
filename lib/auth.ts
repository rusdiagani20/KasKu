import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : [
          // Fallback provider jika credential Google belum diatur di .env
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "demo-google-id",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-google-secret",
          }),
        ]),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : [
          GithubProvider({
            clientId: process.env.GITHUB_ID || "demo-github-id",
            clientSecret: process.env.GITHUB_SECRET || "demo-github-secret",
          }),
        ]),
    // Demo provider untuk pengujian instan tanpa perlu setting OAuth Client ID Google/GitHub terlebih dahulu
    CredentialsProvider({
      id: "demo-google",
      name: "Akun Google Demo",
      credentials: {
        name: { label: "Nama", type: "text", placeholder: "Nama Akun Google" },
      },
      async authorize(credentials) {
        const userName = credentials?.name?.trim() || "Sobat KasKu (Google)";
        return {
          id: "google-demo-user",
          name: userName,
          email: "user@gmail.com",
          image: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "kasku-secret-development-super-key-32chars",
};
