"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trash2,
  Shield,
  Lightbulb,
  Users,
  Search,
  BadgeCheck,
  Snowflake,
  Monitor,
  Star,
  Image,
  FolderOpen,
  Images,
  MessageSquare,
  Eye,
  EyeOff,
} from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ADMIN_PASSWORD = "RealMaveboAdminModeration67"

type Photo = {
  id: string
  name: string
  url: string
  privacy: string
  created_at: string
  profile?: {
    id: string
    name: string | null
    username: string | null
    avatar_url: string | null
    badges: string[] | null
  }
  album_name?: string
  collection_name?: string
}

type Collection = {
  id: string
  name: string
  privacy: string
  created_at: string
  profile?: {
    id: string
    name: string | null
    username: string | null
    avatar_url: string | null
  }
}

type Album = {
  id: string
  name: string
  created_at: string
  profile?: {
    id: string
    name: string | null
    username: string | null
    avatar_url: string | null
  }
  collection_name?: string
}

type Comment = {
  id: string
  content: string
  created_at: string
  profile?: {
    id: string
    name: string | null
    username: string | null
    avatar_url: string | null
  }
  photo_name?: string
}

type Profile = {
  id: string
  name: string | null
  username: string | null
  avatar_url: string | null
  badges: string[] | null
  created_at: string
}

// Новые типы баджей
type BadgeType = 'verified' | 'snowflake' | 'computer' | 'star'

const BADGE_OPTIONS: { value: BadgeType; icon: React.ElementType; color: string; label: string }[] = [
  { value: 'verified', icon: BadgeCheck, color: 'text-blue-500', label: 'Verified' },
  { value: 'snowflake', icon: Snowflake, color: 'text-cyan-400', label: 'Snowflake' },
  { value: 'computer', icon: Monitor, color: 'text-violet-500', label: 'Computer' },
  { value: 'star', icon: Star, color: 'text-amber-400', label: 'Star' },
]

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("photos")

  // Данные для модерации
  const [photos, setPhotos] = useState<Photo[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])

  // Состояния загрузки
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Состояния удаления
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Состояния для поиска пользователя (для значков)
  const [searchUsername, setSearchUsername] = useState("")
  const [userProfile, setUserProfile] = useState<any>(null)
  const [newBadge, setNewBadge] = useState<{ username: string; badge_type: BadgeType }>({ 
    username: "", 
    badge_type: "verified" 
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData()
      sessionStorage.setItem('admin_auth', 'true')
    }
  }, [isAuthenticated])

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError(null)
    } else {
      setError("Invalid password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_auth')
  }

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      // Загружаем фото
      const photosRes = await fetch('/api/admin?type=photos')
      if (photosRes.ok) {
        const data = await photosRes.json()
        setPhotos(Array.isArray(data) ? data : [])
      }

      // Загружаем коллекции
      const collectionsRes = await fetch('/api/admin?type=collections')
      if (collectionsRes.ok) {
        const data = await collectionsRes.json()
        setCollections(Array.isArray(data) ? data : [])
      }

      // Загружаем альбомы
      const albumsRes = await fetch('/api/admin?type=albums')
      if (albumsRes.ok) {
        const data = await albumsRes.json()
        setAlbums(Array.isArray(data) ? data : [])
      }

      // Загружаем комментарии
      const commentsRes = await fetch('/api/admin?type=comments')
      if (commentsRes.ok) {
        const data = await commentsRes.json()
        setComments(Array.isArray(data) ? data : [])
      }

      // Загружаем профили
      const profilesRes = await fetch('/api/admin?type=profiles')
      if (profilesRes.ok) {
        const data = await profilesRes.json()
        setProfiles(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (type: string, id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          data: { type, id }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete')
      }

      // Обновляем соответствующий список
      switch (type) {
        case 'photo':
          setPhotos(prev => prev.filter(p => p.id !== id))
          break
        case 'collection':
          setCollections(prev => prev.filter(c => c.id !== id))
          break
        case 'album':
          setAlbums(prev => prev.filter(a => a.id !== id))
          break
        case 'comment':
          setComments(prev => prev.filter(c => c.id !== id))
          break
      }
    } catch (err) {
      console.error('Error deleting:', err)
      alert('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const searchUser = async () => {
    if (!searchUsername) return

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'searchUser',
          data: { username: searchUsername }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'User not found')
      }

      const data = await response.json()
      setUserProfile(data)
      setNewBadge(prev => ({ ...prev, username: data.username }))
    } catch (err) {
      console.error('Error searching user:', err)
      alert('User not found')
      setUserProfile(null)
    }
  }

  const handleAddBadge = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let userId = userProfile?.id

      if (!userId && newBadge.username) {
        const response = await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'searchUser',
            data: { username: newBadge.username }
          })
        })
        if (!response.ok) throw new Error('User not found')
        const data = await response.json()
        userId = data.id
      }

      if (!userId) {
        alert('Please search for a user first')
        return
      }

      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addBadge',
          data: {
            userId,
            badgeType: newBadge.badge_type
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add badge')
      }

      await loadAllData()
      setNewBadge({ username: "", badge_type: "verified" })
      setUserProfile(null)
      setSearchUsername("")
      alert('Badge added successfully!')
    } catch (err) {
      console.error('Error adding badge:', err)
      alert('Failed to add badge')
    }
  }

  const handleRemoveBadge = async (profileId: string, badge: string) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'removeBadge',
          data: { profileId, badge }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove badge')
      }

      setProfiles(prev => prev.map(p =>
        p.id === profileId
          ? { ...p, badges: (p.badges || []).filter(b => b !== badge) }
          : p
      ))
    } catch (err) {
      console.error('Error removing badge:', err)
      alert('Failed to remove badge')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getBadgeIcon = (badgeType: string) => {
    const badge = BADGE_OPTIONS.find(b => b.value === badgeType)
    if (!badge) return null
    const Icon = badge.icon
    return <Icon className={`h-4 w-4 ${badge.color}`} />
  }

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'verified':
        return "bg-blue-100 text-blue-800 border-blue-200"
      case 'snowflake':
        return "bg-cyan-100 text-cyan-800 border-cyan-200"
      case 'computer':
        return "bg-violet-100 text-violet-800 border-violet-200"
      case 'star':
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <Lightbulb className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Mavebo</span>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Admin Panel</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Admin Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && (
                    <div className="rounded-md bg-destructive/10 p-3">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                  <Link href="/">
                    <Button type="button" variant="outline" className="w-full bg-transparent">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="photos" className="gap-2">
                    <Image className="h-4 w-4" />
                    Photos ({photos.length})
                  </TabsTrigger>
                  <TabsTrigger value="collections" className="gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Collections ({collections.length})
                  </TabsTrigger>
                  <TabsTrigger value="albums" className="gap-2">
                    <Images className="h-4 w-4" />
                    Albums ({albums.length})
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments ({comments.length})
                  </TabsTrigger>
                  <TabsTrigger value="badges" className="gap-2">
                    <BadgeCheck className="h-4 w-4" />
                    Badges ({profiles.reduce((acc, p) => acc + (p.badges?.length || 0), 0)})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadAllData}>
                  Refresh
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Photos Tab */}
            <TabsContent value="photos">
              <div className="space-y-4">
                {photos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No photos found</p>
                  </div>
                ) : (
                  photos.map((photo) => (
                    <Card key={photo.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{photo.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              By @{photo.profile?.username || 'unknown'} · {photo.collection_name} / {photo.album_name}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={photo.privacy === 'public' ? 'default' : 'secondary'}>
                                {photo.privacy === 'public' ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                                {photo.privacy}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(photo.created_at)}</span>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={deletingId === photo.id}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Photo</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{photo.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete('photo', photo.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Collections Tab */}
            <TabsContent value="collections">
              <div className="space-y-4">
                {collections.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No collections found</p>
                  </div>
                ) : (
                  collections.map((collection) => (
                    <Card key={collection.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{collection.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              By @{collection.profile?.username || 'unknown'} · {collection.privacy}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">{formatDate(collection.created_at)}</p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={deletingId === collection.id}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{collection.name}" and all its contents? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete('collection', collection.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Albums Tab */}
            <TabsContent value="albums">
              <div className="space-y-4">
                {albums.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No albums found</p>
                  </div>
                ) : (
                  albums.map((album) => (
                    <Card key={album.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{album.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              By @{album.profile?.username || 'unknown'} · in {album.collection_name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">{formatDate(album.created_at)}</p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={deletingId === album.id}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Album</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{album.name}" and all its photos? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete('album', album.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments">
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No comments found</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm">"{comment.content}"</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              By @{comment.profile?.username || 'unknown'} on {comment.photo_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={deletingId === comment.id}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this comment? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete('comment', comment.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges">
              <div className="space-y-6">
                {/* Add Badge Form */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-5 w-5 text-primary" />
                      <CardTitle>Add User Badge</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Search User */}
                      <div className="space-y-2">
                        <Label>Find User by Username</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter username (without @)"
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                          />
                          <Button onClick={searchUser} className="gap-2">
                            <Search className="h-4 w-4" />
                            Search
                          </Button>
                        </div>
                      </div>

                      {userProfile && (
                        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                          <h4 className="font-semibold text-green-800">User Found:</h4>
                          <p className="text-green-700">Display Name: {userProfile.display_name || "Not set"}</p>
                          <p className="text-green-700">Username: {userProfile.username}</p>
                        </div>
                      )}

                      <form onSubmit={handleAddBadge}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Username {!userProfile && "*"}</Label>
                            <Input
                              placeholder="Enter username"
                              value={userProfile ? userProfile.username : newBadge.username}
                              onChange={(e) => setNewBadge({ ...newBadge, username: e.target.value })}
                              required={!userProfile}
                              disabled={!!userProfile}
                              className={userProfile ? "bg-green-50 border-green-200" : ""}
                            />
                          </div>
                          <div>
                            <Label>Badge Type *</Label>
                            <Select
                              value={newBadge.badge_type}
                              onValueChange={(value: BadgeType) => setNewBadge({ ...newBadge, badge_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select badge type" />
                              </SelectTrigger>
                              <SelectContent>
                                {BADGE_OPTIONS.map(({ value, icon: Icon, color, label }) => (
                                  <SelectItem key={value} value={value}>
                                    <div className="flex items-center gap-2">
                                      <Icon className={`h-4 w-4 ${color}`} />
                                      <span>{label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button type="submit" className="gap-2 mt-4">
                          <BadgeCheck className="h-4 w-4" />
                          Add Badge
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>

                {/* Users with Badges List */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <CardTitle>Users & Badges</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {profiles.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No users found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profiles.map((profile) => (
                          <div key={profile.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                                  {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.name || ''} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                                      <span className="text-sm font-bold text-primary">
                                        {profile.name?.[0] || profile.username?.[0] || '?'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold">{profile.name || 'No name'}</p>
                                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {(profile.badges || []).map((badge) => (
                                  <div key={badge} className="relative group">
                                    <Badge variant="outline" className={`${getBadgeColor(badge)} cursor-pointer`}>
                                      <span className="mr-1">{getBadgeIcon(badge)}</span>
                                      <span className="ml-1">{badge}</span>
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleRemoveBadge(profile.id, badge)}
                                    >
                                      ×
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
