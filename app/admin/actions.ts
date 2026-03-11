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
