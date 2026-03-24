// USER ACTIONS
export async function adminSearchUser(username: string, password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, name, username, display_name, avatar_url, badges")
      .eq("username", username)
      .single()

    if (error) throw error
    if (!data) throw new Error("User not found")

    return { success: true, data }
  } catch (err) {
    console.error("Error searching user:", err)
    return { success: false, error: "User not found" }
  }
}

export async function adminAddBadge(userId: string, badgeType: string, password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  // Validate badge type - ОБНОВЛЕНО!
  const validBadges = ["verified", "snowflake", "computer", "star"]
  if (!validBadges.includes(badgeType)) {
    return { success: false, error: "Invalid badge type" }
  }

  try {
    // Get current user badges
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("badges")
      .eq("id", userId)
      .single()

    if (fetchError) throw fetchError

    // Add new badge if not already present
    const currentBadges = user?.badges || []
    if (!currentBadges.includes(badgeType)) {
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ badges: [...currentBadges, badgeType] })
        .eq("id", userId)

      if (updateError) throw updateError
    }

    return { success: true }
  } catch (err) {
    console.error("Error adding badge:", err)
    return { success: false, error: "Failed to add badge" }
  }
}

export async function adminRemoveBadge(userId: string, badgeType: string, password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    // Get current user badges
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("badges")
      .eq("id", userId)
      .single()

    if (fetchError) throw fetchError

    // Remove badge
    const currentBadges = user?.badges || []
    const updatedBadges = currentBadges.filter((b: string) => b !== badgeType)

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ badges: updatedBadges })
      .eq("id", userId)

    if (updateError) throw updateError

    return { success: true }
  } catch (err) {
    console.error("Error removing badge:", err)
    return { success: false, error: "Failed to remove badge" }
  }
}
// Добавьте эти функции в app/admin/actions.ts

export async function adminGetPhotos(password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("photos")
      .select(`
        *,
        profile:profiles(id, name, username, avatar_url, badges),
        collection:collections(name),
        album:albums(name)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Transform data to match the expected format in AdminPage
    const transformedData = data?.map(photo => ({
      id: photo.id,
      name: photo.name,
      url: photo.url,
      privacy: photo.privacy,
      created_at: photo.created_at,
      profile: photo.profile,
      collection_name: photo.collection?.name,
      album_name: photo.album?.name
    }))

    return { success: true, data: transformedData || [] }
  } catch (err) {
    console.error("Error getting photos:", err)
    return { success: false, error: "Failed to get photos" }
  }
}

export async function adminGetCollections(password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("collections")
      .select(`
        *,
        profile:profiles(id, name, username, avatar_url, badges)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (err) {
    console.error("Error getting collections:", err)
    return { success: false, error: "Failed to get collections" }
  }
}

export async function adminGetAlbums(password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("albums")
      .select(`
        *,
        profile:profiles(id, name, username, avatar_url, badges),
        collection:collections(name)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Transform data to match the expected format in AdminPage
    const transformedData = data?.map(album => ({
      id: album.id,
      name: album.name,
      created_at: album.created_at,
      profile: album.profile,
      collection_name: album.collection?.name
    }))

    return { success: true, data: transformedData || [] }
  } catch (err) {
    console.error("Error getting albums:", err)
    return { success: false, error: "Failed to get albums" }
  }
}

export async function adminGetComments(password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("comments")
      .select(`
        *,
        profile:profiles(id, name, username, avatar_url, badges),
        photo:photos(name)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Transform data to match the expected format in AdminPage
    const transformedData = data?.map(comment => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      profile: comment.profile,
      photo_name: comment.photo?.name
    }))

    return { success: true, data: transformedData || [] }
  } catch (err) {
    console.error("Error getting comments:", err)
    return { success: false, error: "Failed to get comments" }
  }
}

export async function adminGetProfiles(password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data: data || [] }
  } catch (err) {
    console.error("Error getting profiles:", err)
    return { success: false, error: "Failed to get profiles" }
  }
}

export async function adminDeletePhoto(photoId: string, password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    // First get the photo to get its URL
    const { data: photo, error: fetchError } = await supabaseAdmin
      .from("photos")
      .select("url")
      .eq("id", photoId)
      .single()

    if (fetchError) throw fetchError

    // Delete from storage if possible
    if (photo?.url) {
      const path = photo.url.split('/').pop()
      if (path) {
        await supabaseAdmin.storage.from("photos").remove([path])
      }
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from("photos")
      .delete()
      .eq("id", photoId)

    if (deleteError) throw deleteError

    return { success: true }
  } catch (err) {
    console.error("Error deleting photo:", err)
    return { success: false, error: "Failed to delete photo" }
  }
}

export async function adminDeleteCollection(collectionId: string, password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    const { error } = await supabaseAdmin
      .from("collections")
      .delete()
      .eq("id", collectionId)

    if (error) throw error

    return { success: true }
  } catch (err) {
    console.error("Error deleting collection:", err)
    return { success: false, error: "Failed to delete collection" }
  }
}

export async function adminDeleteAlbum(albumId: string, password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    const { error } = await supabaseAdmin
      .from("albums")
      .delete()
      .eq("id", albumId)

    if (error) throw error

    return { success: true }
  } catch (err) {
    console.error("Error deleting album:", err)
    return { success: false, error: "Failed to delete album" }
  }
}

export async function adminDeleteComment(commentId: string, password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    const { error } = await supabaseAdmin
      .from("comments")
      .delete()
      .eq("id", commentId)

    if (error) throw error

    return { success: true }
  } catch (err) {
    console.error("Error deleting comment:", err)
    return { success: false, error: "Failed to delete comment" }
  }
}
