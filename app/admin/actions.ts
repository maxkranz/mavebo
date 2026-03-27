"use server"

import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

const ADMIN_PASSWORD = "RealMaveboAdminModeration67"

// Helper to verify admin password
function verifyAdmin(password: string) {
  return password === ADMIN_PASSWORD
}

// GET ACTIONS - для загрузки данных
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
        album:albums(name),
        collection:collections(name)
      `)
      .eq("privacy", "public")
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error("Error loading photos:", err)
    return { success: false, error: "Failed to load photos" }
  }
}

export async function adminGetCollections(password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("collections")
      .select(`*, profile:profiles(id, name, username, avatar_url)`)
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error("Error loading collections:", err)
    return { success: false, error: "Failed to load collections" }
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
        profile:profiles(id, name, username, avatar_url),
        collection:collections(name)
      `)
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error("Error loading albums:", err)
    return { success: false, error: "Failed to load albums" }
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
        profile:profiles(id, name, username, avatar_url),
        photo:photos(name)
      `)
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) throw error
    return { success: true, data }
  } catch (err) {
    console.error("Error loading comments:", err)
    return { success: false, error: "Failed to load comments" }
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
    return { success: true, data }
  } catch (err) {
    console.error("Error loading profiles:", err)
    return { success: false, error: "Failed to load profiles" }
  }
}

// DELETE ACTIONS
export async function adminDeletePhoto(photoId: string, password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    const { error } = await supabaseAdmin
      .from("photos")
      .delete()
      .eq("id", photoId)

    if (error) throw error
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

  const validBadges = ["verified", "snowflake", "computer", "star"]
  if (!validBadges.includes(badgeType)) {
    return { success: false, error: "Invalid badge type" }
  }

  try {
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("badges")
      .eq("id", userId)
      .single()

    if (fetchError) throw fetchError

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
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("badges")
      .eq("id", userId)
      .single()

    if (fetchError) throw fetchError

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

// Bulk delete action (для удаления всех фото пользователя и т.д.)
export async function adminDeleteUserContent(userId: string, contentType: string, password: string) {
  if (!verifyAdmin(password)) {
    return { success: false, error: "Invalid admin password" }
  }

  try {
    let error
    switch (contentType) {
      case "photos":
        ({ error } = await supabaseAdmin.from("photos").delete().eq("user_id", userId))
        break
      case "collections":
        ({ error } = await supabaseAdmin.from("collections").delete().eq("user_id", userId))
        break
      case "albums":
        ({ error } = await supabaseAdmin.from("albums").delete().eq("user_id", userId))
        break
      case "comments":
        ({ error } = await supabaseAdmin.from("comments").delete().eq("user_id", userId))
        break
      default:
        return { success: false, error: "Invalid content type" }
    }

    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error("Error deleting user content:", err)
    return { success: false, error: "Failed to delete content" }
  }
}
