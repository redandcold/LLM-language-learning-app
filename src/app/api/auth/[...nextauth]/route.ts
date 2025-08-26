import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '../../../../../lib/prisma'
import { sendVerificationEmail } from '../../../../../lib/email'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await sendVerificationEmail({ to: email, url })
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'database' as const,
    maxAge: 60 * 60, // 1시간 (초 단위)
    updateAge: 24 * 60 * 60, // 24시간마다 세션 업데이트
  },
  callbacks: {
    session: async ({ session, user }: any) => {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
    redirect: async ({ url, baseUrl }: any) => {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }