import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?count=20&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching from Unsplash:', error)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}
