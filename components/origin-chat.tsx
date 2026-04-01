'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Search, Send, MoreVertical, Smile, Trash2, Edit2, Check, X, 
  Heart, ThumbsUp, Laugh, Wow, Sad, Angry, ArrowLeft, UserPlus,
  Bell, BellOff, MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  chat_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  is_edited: boolean
  reaction?: string
  profile?: {
    username: string
    name: string
    avatar_url: string
  }
}

interface Chat {
  id: string
  name?: string
  is_group: boolean
  created_at: string
  updated_at: string
  participants: {
    user_id: string
    profile: {
      id: string
      username: string
      name: string
      avatar_url: string
    }
  }[]
  last_message?: {
    content: string
    created_at: string
    user_id: string
  }
}

interface Props {
  currentUserId: string
  initialChats: Chat[]
  users: any[]
}

const REACTIONS = [
  { emoji: '❤️', label: 'heart' },
  { emoji: '👍', label: 'thumbsup' },
  { emoji: '😄', label: 'laugh' },
  { emoji: '😮', label: 'wow' },
  { emoji: '😢', label: 'sad' },
  { emoji: '😡', label: 'angry' },
]

export default function OriginChat({ currentUserId, initialChats, users }: Props) {
  const supabase = createClient()
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [showReactions, setShowReactions] = useState<string | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [newChatName, setNewChatName] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const subscriptionRef = useRef<any>(null)

  // Запрос разрешения на уведомления
  useEffect(() => {
    if ('Notification' in window && notificationsEnabled) {
      Notification.requestPermission()
    }
  }, [notificationsEnabled])

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Подписка на новые сообщения — ОТДЕЛЬНЫЙ КАНАЛ ДЛЯ КАЖДОГО ЧАТА
  useEffect(() => {
    if (!selectedChat) return

    // Отписываемся от предыдущего канала
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current)
    }

    // Создаем уникальный канал для этого чата
    const channelName = `chat_${selectedChat.id}`
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChat.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          
          // Дополнительная проверка, что сообщение принадлежит текущему чату
          if (newMessage.chat_id === selectedChat.id) {
            setMessages(prev => [...prev, newMessage])
            
            // Уведомление
            if (notificationsEnabled && newMessage.user_id !== currentUserId && Notification.permission === 'granted') {
              const otherUser = selectedChat.participants.find(p => p.user_id !== currentUserId)
              new Notification(`New message from ${otherUser?.profile.name}`, {
                body: newMessage.content,
                icon: otherUser?.profile.avatar_url
              })
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to channel: ${channelName}`)
        }
      })

    subscriptionRef.current = subscription

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [selectedChat, currentUserId, notificationsEnabled, supabase])

  // Загрузка сообщений
  useEffect(() => {
    if (!selectedChat) return

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          profile:profiles(id, username, name, avatar_url)
        `)
        .eq('chat_id', selectedChat.id)
        .order('created_at', { ascending: true })
      
      setMessages(data || [])
    }
    
    loadMessages()
  }, [selectedChat, supabase])

  // Отправка сообщения
  async function sendMessage() {
    if (!inputMessage.trim() || !selectedChat) return

    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: selectedChat.id,
        user_id: currentUserId,
        content: inputMessage.trim()
      })
      .select()
      .single()

    if (!error && data) {
      setMessages(prev => [...prev, data])
      setInputMessage('')
      
      // Обновляем время последнего сообщения в чате
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedChat.id)
    }
  }

  // Редактирование сообщения
  async function editMessage(message: Message) {
    if (!editingMessage) return

    const { error } = await supabase
      .from('messages')
      .update({ 
        content: editingMessage.content,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', message.id)

    if (!error) {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, content: editingMessage.content, is_edited: true } : m
      ))
      setEditingMessage(null)
    }
  }

  // Удаление сообщения
  async function deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== messageId))
    }
  }

  // Добавление реакции
  async function addReaction(messageId: string, emoji: string) {
    const { error } = await supabase
      .from('messages')
      .update({ reaction: emoji })
      .eq('id', messageId)

    if (!error) {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, reaction: emoji } : m
      ))
      setShowReactions(null)
    }
  }

  // Создание нового чата
  async function createChat() {
    if (selectedUsers.length === 0) return

    const isGroup = selectedUsers.length > 1
    const chatName = isGroup ? newChatName || `Group chat` : null

    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        name: chatName,
        is_group: isGroup
      })
      .select()
      .single()

    if (error || !chat) return

    const participants = [...selectedUsers, currentUserId].map(userId => ({
      chat_id: chat.id,
      user_id: userId
    }))

    await supabase.from('chat_participants').insert(participants)

    const { data: fullChat } = await supabase
      .from('chats')
      .select(`
        *,
        participants:chat_participants(
          user_id,
          profile:profiles(id, username, name, avatar_url)
        )
      `)
      .eq('id', chat.id)
      .single()

    if (fullChat) {
      setChats(prev => [fullChat, ...prev])
      setSelectedChat(fullChat)
      setIsCreatingChat(false)
      setSelectedUsers([])
      setNewChatName('')
    }
  }

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name
    const otherUser = chat.participants.find(p => p.user_id !== currentUserId)
    return otherUser?.profile.name || otherUser?.profile.username || 'Unknown'
  }

  const getChatAvatar = (chat: Chat) => {
    if (chat.is_group) return null
    const otherUser = chat.participants.find(p => p.user_id !== currentUserId)
    return otherUser?.profile.avatar_url
  }

  return (
    <div className="flex h-full bg-background">
      {/* Список чатов */}
      <div className={cn(
        "w-full md:w-80 border-r border-border flex flex-col",
        selectedChat && "hidden md:flex"
      )}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">OriginChat</h1>
            <button
              onClick={() => setIsCreatingChat(true)}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.filter(chat => 
            getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
          ).map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={cn(
                "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors",
                selectedChat?.id === chat.id && "bg-muted/50"
              )}
            >
              <div className="relative">
                {getChatAvatar(chat) ? (
                  <img
                    src={getChatAvatar(chat)!}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                    {getChatName(chat)[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate">{getChatName(chat)}</p>
                  {chat.last_message && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(chat.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                {chat.last_message && (
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.last_message.user_id === currentUserId ? 'You: ' : ''}{chat.last_message.content}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Окно чата */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-2 hover:bg-muted rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {getChatAvatar(selectedChat) ? (
                <img
                  src={getChatAvatar(selectedChat)!}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {getChatName(selectedChat)[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="font-semibold">{getChatName(selectedChat)}</h2>
                {selectedChat.is_group && (
                  <p className="text-xs text-muted-foreground">{selectedChat.participants.length} members</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
              <button className="p-2 hover:bg-muted rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => {
              const isOwn = message.user_id === currentUserId

              return (
                <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[70%] group relative",
                    isOwn ? "items-end" : "items-start"
                  )}>
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1">
                        <img
                          src={message.profile?.avatar_url || `https://ui-avatars.com/api/?name=${message.profile?.name}`}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-xs text-muted-foreground">{message.profile?.name}</span>
                      </div>
                    )}
                    
                    {editingMessage?.id === message.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editingMessage.content}
                          onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-lg bg-input text-sm"
                          autoFocus
                        />
                        <button onClick={() => editMessage(message)} className="p-1 text-primary">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingMessage(null)} className="p-1 text-muted-foreground">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={cn(
                          "px-4 py-2 rounded-2xl",
                          isOwn 
                            ? "bg-primary text-primary-foreground rounded-br-none" 
                            : "bg-muted text-foreground rounded-bl-none"
                        )}>
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          {message.is_edited && (
                            <span className="text-[10px] opacity-70 mt-1 block">(edited)</span>
                          )}
                        </div>
                        
                        {message.reaction && (
                          <div className="absolute -bottom-4 left-2 bg-background border border-border rounded-full px-1.5 py-0.5 text-xs">
                            {message.reaction}
                          </div>
                        )}
                        
                        <div className={cn(
                          "absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
                          isOwn ? "right-0" : "left-0"
                        )}>
                          <button
                            onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                            className="p-1 rounded-full bg-background border border-border hover:bg-muted"
                          >
                            <Smile className="w-3 h-3" />
                          </button>
                          {isOwn && (
                            <>
                              <button
                                onClick={() => setEditingMessage(message)}
                                className="p-1 rounded-full bg-background border border-border hover:bg-muted"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteMessage(message.id)}
                                className="p-1 rounded-full bg-background border border-border hover:bg-destructive hover:text-white"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>

                        {showReactions === message.id && (
                          <div className="absolute -bottom-12 left-0 flex gap-1 bg-background border border-border rounded-full p-1 shadow-lg z-10">
                            {REACTIONS.map(reaction => (
                              <button
                                key={reaction.label}
                                onClick={() => addReaction(message.id, reaction.emoji)}
                                className="p-1.5 hover:bg-muted rounded-full transition-colors text-lg"
                              >
                                {reaction.emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <Smile className="w-5 h-5" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-lg bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {showEmojiPicker && (
              <div className="absolute bottom-20 left-4 z-10">
                <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
                  <div className="grid grid-cols-8 gap-1">
                    {REACTIONS.map(reaction => (
                      <button
                        key={reaction.label}
                        onClick={() => {
                          setInputMessage(prev => prev + reaction.emoji)
                          setShowEmojiPicker(false)
                        }}
                        className="p-2 hover:bg-muted rounded-lg text-xl"
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">OriginChat</h2>
            <p className="text-muted-foreground">Select a chat to start messaging</p>
          </div>
        </div>
      )}

      {/* Create Chat Modal */}
      {isCreatingChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">New Chat</h2>
            
            <div className="mb-4">
              <label className="text-sm font-medium">Search users</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-input text-sm"
                />
              </div>
            </div>

            {selectedUsers.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium">Group name (optional)</label>
                <input
                  type="text"
                  placeholder="Group name"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-input text-sm"
                />
              </div>
            )}

            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {filteredUsers.map(user => {
                const isSelected = selectedUsers.includes(user.id)
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUsers(prev => 
                      isSelected ? prev.filter(id => id !== user.id) : [...prev, user.id]
                    )}
                    className={cn(
                      "w-full p-2 flex items-center gap-3 rounded-lg transition-colors",
                      isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-primary" />}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={createChat}
                disabled={selectedUsers.length === 0}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Create {selectedUsers.length > 1 ? 'Group' : 'Chat'}
              </button>
              <button
                onClick={() => {
                  setIsCreatingChat(false)
                  setSelectedUsers([])
                  setNewChatName('')
                }}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
