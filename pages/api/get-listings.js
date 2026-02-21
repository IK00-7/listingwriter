import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getUserByEmail, getUserListings } from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const user = await getUserByEmail(session.user.email)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const listings = await getUserListings(user.id, 50)
    
    res.status(200).json({ listings })
  } catch (error) {
    console.error('Error fetching listings:', error)
    res.status(500).json({ error: 'Failed to fetch listings', listings: [] })
  }
}
