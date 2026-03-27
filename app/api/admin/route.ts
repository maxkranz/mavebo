const searchUser = async () => {
  if (!searchUsername) {
    console.log('Search username is empty')
    return
  }

  console.log('Searching for:', searchUsername)

  try {
    const response = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'searchUser',
        data: { username: searchUsername }
      })
    })

    console.log('Response status:', response.status)
    
    const responseData = await response.json()
    console.log('Response data:', responseData)

    if (!response.ok) {
      throw new Error(responseData.error || 'User not found')
    }

    setUserProfile(responseData)
    setNewBadge(prev => ({ ...prev, username: responseData.username }))
  } catch (err) {
    console.error('Error searching user:', err)
    alert(`User not found: ${err instanceof Error ? err.message : 'Unknown error'}`)
    setUserProfile(null)
  }
}
