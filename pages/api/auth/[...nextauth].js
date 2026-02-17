import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getOrCreateUser } from '../../../lib/db'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Get or create user in database
        const dbUser = await getOrCreateUser(user.email, user.name, user.image)
        
        // Store user ID for session
        user.id = dbUser.id
        user.tier = dbUser.tier
        user.listingsUsed = dbUser.listings_used
        user.listingsLimit = dbUser.listings_limit
        
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },
    async session({ session, token }) {
      if (token?.email) {
        try {
          // Get fresh user data from database
          const { getUserByEmail } = require('../../../lib/db')
          const dbUser = await getUserByEmail(token.email)
          
          if (dbUser) {
            session.user.id = dbUser.id
            session.user.tier = dbUser.tier
            session.user.listingsUsed = dbUser.listings_used
            session.user.listingsLimit = dbUser.listings_limit
            session.user.stripeCustomerId = dbUser.stripe_customer_id
            session.user.stripeSubscriptionId = dbUser.stripe_subscription_id
          }
        } catch (error) {
          console.error('Session error:', error)
        }
      }
      
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.tier = user.tier
        token.listingsUsed = user.listingsUsed
        token.listingsLimit = user.listingsLimit
      }
      return token
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)