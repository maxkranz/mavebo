export type Privacy = 'private' | 'public'

export type BadgeType = 'verified' | 'snowflake' | 'computer' | 'star'

export interface Profile {
  id: string
  name: string
  username: string
  avatar_url: string | null
  bio: string | null
  badges: BadgeType[]
  is_admin: boolean
  created_at: string
  updated_at: string
  followers_count?: number
  following_count?: number
  is_following?: boolean
}

export interface Collection {
  id: string
  user_id: string
  name: string
  privacy: Privacy
  cover_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
  albums?: Album[]
  albums_count?: number
  photos_count?: number
  profile?: Profile
}

export interface Album {
  id: string
  collection_id: string
  user_id: string
  name: string
  privacy: Privacy
  sort_order: number
  created_at: string
  updated_at: string
  photos?: Photo[]
  photos_count?: number
}

export interface Photo {
  id: string
  album_id: string
  collection_id: string
  user_id: string
  name: string
  url: string
  privacy: Privacy
  sort_order: number
  created_at: string
  updated_at: string
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
  profile?: Profile
}

export interface Like {
  id: string
  user_id: string
  photo_id: string
  created_at: string
}

export interface Comment {
  id: string
  user_id: string
  photo_id: string
  content: string
  created_at: string
  profile?: Profile
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  type: 'like' | 'comment' | 'follow' | 'share'
  photo_id: string | null
  collection_id: string | null
  read: boolean
  created_at: string
  actor?: Profile
  photo?: Photo
  collection?: Collection
}

export interface SharedCollection {
  id: string
  collection_id: string
  owner_id: string
  collaborator_id: string
  can_add_photos: boolean
  created_at: string
  collection?: Collection
  collaborator?: Profile
}
