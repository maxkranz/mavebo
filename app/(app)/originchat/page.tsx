import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OriginChat from '@/components/origin-chat'

export default async function OriginChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Загружаем все чаты пользователя
  const { data: chats } = await supabase
    .from('chats')
    .select(`
      *,
      participants:chat_participants(
        user_id,
        profile:profiles(id, username, name, avatar_url)
      ),
      last_message:messages(
        content,
        created_at,
        user_id
      )
    `)
    .eq('participants.user_id', user.id)
    .order('updated_at', { ascending: false })

  // Загружаем всех пользователей для поиска
  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, name, avatar_url')
    .neq('id', user.id)

  return (
    <main className="h-screen flex flex-col bg-background">
      <OriginChat 
        currentUserId={user.id} 
        initialChats={chats || []} 
        users={users || []}
      />
    </main>
  )
}
