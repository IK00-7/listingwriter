import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub
        session.user.tier = 'free'
        session.user.listingsUsed = 0
        session.user.listingsLimit = 5
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}

export default NextAuth(authOptions)