import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        if (credentials.password === process.env.ADMIN_PASSWORD) {
          return { id: '1', name: 'Admin SBC', role: 'admin' }
        }
        return null
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  callbacks: {
    authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
      if (isAdminRoute) return !!auth
      return true
    },
    jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    session({ session, token }) {
      if (token) (session.user as any).role = token.role
      return session
    },
  },
})
