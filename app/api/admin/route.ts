import { NextResponse } from 'next/server'
import {
  adminGetPhotos,
  adminGetCollections,
  adminGetAlbums,
  adminGetComments,
  adminGetProfiles,
  adminDeletePhoto,
  adminDeleteCollection,
  adminDeleteAlbum,
  adminDeleteComment,
  adminSearchUser,
  adminAddBadge,
  adminRemoveBadge,
  // ← добавил для совместимости
} from '../../admin/actions'  // ← правильный путь

const ADMIN_PASSWORD = "RealMaveboAdminModeration67"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  switch (type) {
    case 'photos':
      const photos = await adminGetPhotos(ADMIN_PASSWORD)
      return NextResponse.json(photos.success ? photos.data : { error: photos.error })

    case 'collections':
      const collections = await adminGetCollections(ADMIN_PASSWORD)
      return NextResponse.json(collections.success ? collections.data : { error: collections.error })

    case 'albums':
      const albums = await adminGetAlbums(ADMIN_PASSWORD)
      return NextResponse.json(albums.success ? albums.data : { error: albums.error })

    case 'comments':
      const comments = await adminGetComments(ADMIN_PASSWORD)
      return NextResponse.json(comments.success ? comments.data : { error: comments.error })

    case 'profiles':
      const profiles = await adminGetProfiles(ADMIN_PASSWORD)
      return NextResponse.json(profiles.success ? profiles.data : { error: profiles.error })

    default:
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, data } = body

  switch (action) {
    case 'delete':
      const { type, id } = data
      switch (type) {
        case 'photo':
          return NextResponse.json(await adminDeletePhoto(id, ADMIN_PASSWORD))
        case 'collection':
          return NextResponse.json(await adminDeleteCollection(id, ADMIN_PASSWORD))
        case 'album':
          return NextResponse.json(await adminDeleteAlbum(id, ADMIN_PASSWORD))
        case 'comment':
          return NextResponse.json(await adminDeleteComment(id, ADMIN_PASSWORD))
        default:
          return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
      }

    case 'searchUser':
      const { username } = data
      return NextResponse.json(await adminSearchUser(username, ADMIN_PASSWORD))

    case 'addBadge':
      const { userId, badgeType } = data
      return NextResponse.json(await adminAddBadge(userId, badgeType, ADMIN_PASSWORD))

    case 'removeBadge':
      const { profileId, badge } = data
      return NextResponse.json(await adminRemoveBadge(profileId, badge, ADMIN_PASSWORD))

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}   
