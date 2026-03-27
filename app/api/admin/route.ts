import { NextResponse } from 'next/server'
import {
  adminSearchUser,
  adminAddBadge,
  adminRemoveBadge,
  adminGetPhotos,
  adminGetCollections,
  adminGetAlbums,
  adminGetComments,
  adminGetProfiles,
  adminDeletePhoto,
  adminDeleteCollection,
  adminDeleteAlbum,
  adminDeleteComment,
} from '@/app/admin/actions'

const ADMIN_PASSWORD = "RealMaveboAdminModeration67"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const password = searchParams.get('password') || ADMIN_PASSWORD

  try {
    let result
    
    switch (type) {
      case 'photos':
        result = await adminGetPhotos(password)
        break
      case 'collections':
        result = await adminGetCollections(password)
        break
      case 'albums':
        result = await adminGetAlbums(password)
        break
      case 'comments':
        result = await adminGetComments(password)
        break
      case 'profiles':
        result = await adminGetProfiles(password)
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, data } = body
    const password = data?.password || ADMIN_PASSWORD

    console.log('=== ADMIN API POST ===')
    console.log('Action:', action)
    console.log('Data:', data)

    switch (action) {
      case 'delete': {
        const { type, id } = data
        
        switch (type) {
          case 'photo':
            const photoResult = await adminDeletePhoto(id, password)
            if (!photoResult.success) {
              return NextResponse.json({ error: photoResult.error }, { status: 400 })
            }
            break
          case 'collection':
            const collectionResult = await adminDeleteCollection(id, password)
            if (!collectionResult.success) {
              return NextResponse.json({ error: collectionResult.error }, { status: 400 })
            }
            break
          case 'album':
            const albumResult = await adminDeleteAlbum(id, password)
            if (!albumResult.success) {
              return NextResponse.json({ error: albumResult.error }, { status: 400 })
            }
            break
          case 'comment':
            const commentResult = await adminDeleteComment(id, password)
            if (!commentResult.success) {
              return NextResponse.json({ error: commentResult.error }, { status: 400 })
            }
            break
          default:
            return NextResponse.json({ error: 'Invalid delete type' }, { status: 400 })
        }
        return NextResponse.json({ success: true })
      }

      case 'searchUser': {
        const { username } = data
        console.log('Searching for username:', username)
        
        if (!username || username.trim() === '') {
          console.log('Username is empty')
          return NextResponse.json({ error: 'Username is required' }, { status: 400 })
        }
        
        const result = await adminSearchUser(username, password)
        console.log('Search result:', result)
        
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 })
        }
        return NextResponse.json(result.data)
      }

      case 'addBadge': {
        const { userId, badgeType } = data
        console.log('Adding badge:', { userId, badgeType })
        
        if (!userId || !badgeType) {
          return NextResponse.json({ error: 'User ID and badge type are required' }, { status: 400 })
        }
        
        const result = await adminAddBadge(userId, badgeType, password)
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 })
        }
        return NextResponse.json({ success: true })
      }

      case 'removeBadge': {
        const { profileId, badge } = data
        console.log('Removing badge:', { profileId, badge })
        
        const result = await adminRemoveBadge(profileId, badge, password)
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 })
        }
        return NextResponse.json({ success: true })
      }

      default:
        console.log('Invalid action:', action)
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
