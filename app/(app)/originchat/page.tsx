import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OriginChatClient from '@/components/origin-chat-client'

export default async function OriginChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Загружаем всех пользователей для поиска
  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, name, avatar_url')
    .neq('id', user.id)

  // Загружаем чаты пользователя
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

  // Форматируем чаты для клиента
  const formattedChats = (chats || []).map(chat => ({
    id: chat.id,
    name: chat.name,
    is_group: chat.is_group,
    created_at: chat.created_at,
    updated_at: chat.updated_at,
    participants: chat.participants?.map((p: any) => ({
      user_id: p.user_id,
      profile: {
        id: p.profile?.id,
        username: p.profile?.username,
        name: p.profile?.name,
        avatar_url: p.profile?.avatar_url
      }
    })) || [],
    last_message: chat.last_message?.[0] ? {
      content: chat.last_message[0].content,
      created_at: chat.last_message[0].created_at,
      user_id: chat.last_message[0].user_id
    } : undefined
  }))

  return (
    <div className="h-screen flex flex-col bg-background">
      <OriginChatClient 
        currentUserId={user.id} 
        initialChats={formattedChats} 
        users={users || []}
      />
    </div>
  )
}
