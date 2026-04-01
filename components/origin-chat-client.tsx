'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  Search, Send, Trash2, MessageCircle, Menu, MoreHorizontal, 
  Smile, User, X, ChevronLeft, Users, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  updated_at: string
  deleted_by: string[]
  chat_id: string
  reactions: Reaction[]
}

interface Reaction {
  id: string
  emoji: string
  user_id: string
  message_id: string
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

interface SearchedUser {
  id: string
  username: string
  name: string
  avatar_url: string
}

interface OriginChatClientProps {
  currentUserId: string
  initialChats: Chat[]
  users: SearchedUser[]
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "👏"]

// Мемоизированный компонент аватарки
const MemoizedAvatar = ({ user, size = 8 }: { user: any, size?: number }) => {
  const getInitials = useCallback((name: string | null) => {
    if (!name) return "U"
    return name[0].toUpperCase()
  }, [])

  const displayName = user?.name || user?.display_name || user?.username || "User"
  const avatarUrl = user?.avatar_url

  return (
    <Avatar className={`h-${size} w-${size} h-10 w-10`}>
      <AvatarImage 
        src={avatarUrl || ""} 
        className="object-cover"
        alt={displayName}
      />
      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  )
}

export default function OriginChatClient({ currentUserId, initialChats, users }: OriginChatClientProps) {
  const supabase = createClient()
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Группировка сообщений по датам
  const groupMessagesByDate = useCallback((messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    
    messages.forEach(message => {
      const date = new Date(message.created_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      let dateKey
      if (date.toDateString() === today.toDateString()) {
        dateKey = "Today"
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Yesterday"
      } else {
        dateKey = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })
    
    return groups
  }, [])

  const groupedMessages = useMemo(() => 
    groupMessagesByDate(messages), 
    [messages, groupMessagesByDate]
  )

  // Фокус на инпут при открытии
  useEffect(() => {
    if (selectedChat && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [selectedChat])

  // Авто-скролл к новым сообщениям
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: "smooth"
      })
    }, 100)
  }

  // Загружаем сообщения при выборе чата
  useEffect(() => {
    if (!selectedChat) return

    loadMessages(selectedChat.id)
  }, [selectedChat])

  // Подписка на новые сообщения
  useEffect(() => {
    if (!selectedChat) return

    const channel = supabase
      .channel(`chat:${selectedChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChat.id}`
        },
        async (payload) => {
          const newMessage = payload.new as Message
          
          if (newMessage.chat_id === selectedChat.id) {
            // Загружаем реакции
            const { data: reactions } = await supabase
              .from('message_reactions')
              .select('*')
              .eq('message_id', newMessage.id)
            
            setMessages(prev => [...prev, {
              ...newMessage,
              reactions: reactions || []
            }])
            
            // Обновляем список чатов для обновления последнего сообщения
            setTimeout(() => refreshChats(), 300)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${selectedChat.id}`
        },
        (payload) => {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
          setTimeout(() => refreshChats(), 300)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedChat])

  const refreshChats = async () => {
    const { data } = await supabase
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
      .eq('participants.user_id', currentUserId)
      .order('updated_at', { ascending: false })

    if (data) {
      const formatted = data.map(chat => ({
        id: chat.id,
        name: chat.name,
        is_group: chat.is_group,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        participants: chat.participants?.map((p: any) => ({
          user_id: p.user_id,
          profile: p.profile
        })) || [],
        last_message: chat.last_message?.[0]
      }))
      setChats(formatted)
    }
  }

  const loadMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          reactions:message_reactions (
            id,
            emoji,
            user_id,
            message_id
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const filteredMessages = (data || []).filter(msg => 
        !msg.deleted_by?.includes(currentUserId)
      )

      setMessages(filteredMessages.map(msg => ({
        ...msg,
        reactions: msg.reactions || []
      })))
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSending) return

    setIsSending(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.id,
          sender_id: currentUserId,
          content: newMessage.trim()
        })
        .select()
        .single()

      if (error) throw error

      setMessages(prev => [...prev, { ...data, reactions: [] }])
      setNewMessage("")
      
      // Обновляем время чата
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedChat.id)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (!error) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: currentUserId,
          emoji
        })

      if (!error) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? {
                ...msg,
                reactions: [...(msg.reactions || []), {
                  id: Date.now().toString(),
                  emoji,
                  user_id: currentUserId,
                  message_id: messageId
                }]
              }
            : msg
        ))
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const removeReaction = async (messageId: string, emoji: string) => {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', currentUserId)
        .eq('emoji', emoji)

      if (!error) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? {
                ...msg,
                reactions: msg.reactions.filter(r => 
                  !(r.user_id === currentUserId && r.emoji === emoji)
                )
              }
            : msg
        ))
      }
    } catch (error) {
      console.error('Error removing reaction:', error)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const filtered = users.filter(user => 
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered.slice(0, 10))
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startChatWithUser = async (user: SearchedUser) => {
    try {
      const existingChat = chats.find(chat =>
        !chat.is_group && chat.participants.some(p => p.user_id === user.id)
      )

      if (existingChat) {
        setSelectedChat(existingChat)
        setSearchResults([])
        setSearchQuery("")
        setMobileSidebarOpen(false)
        return
      }

      // Создаем новый чат
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({ is_group: false })
        .select()
        .single()

      if (error) throw error

      await supabase
        .from('chat_participants')
        .insert([
          { chat_id: newChat.id, user_id: currentUserId },
          { chat_id: newChat.id, user_id: user.id }
        ])

      const fullChat: Chat = {
        id: newChat.id,
        is_group: false,
        created_at: newChat.created_at,
        updated_at: newChat.updated_at,
        participants: [
          { user_id: currentUserId, profile: {} as any },
          { user_id: user.id, profile: user as any }
        ]
      }

      setChats(prev => [fullChat, ...prev])
      setSelectedChat(fullChat)
      setSearchResults([])
      setSearchQuery("")
      setMobileSidebarOpen(false)
    } catch (error) {
      console.error('Error starting chat:', error)
    }
  }

  const createGroupChat = async () => {
    if (selectedUsers.length < 2) return

    try {
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({ 
          is_group: true,
          name: groupName.trim() || `Group (${selectedUsers.length + 1})`
        })
        .select()
        .single()

      if (error) throw error

      const participants = [...selectedUsers, currentUserId].map(userId => ({
        chat_id: newChat.id,
        user_id: userId
      }))

      await supabase.from('chat_participants').insert(participants)

      const fullChat: Chat = {
        id: newChat.id,
        name: newChat.name,
        is_group: true,
        created_at: newChat.created_at,
        updated_at: newChat.updated_at,
        participants: participants.map(p => ({ user_id: p.user_id, profile: {} as any }))
      }

      setChats(prev => [fullChat, ...prev])
      setSelectedChat(fullChat)
      setIsCreatingGroup(false)
      setSelectedUsers([])
      setGroupName("")
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  const deleteChat = async (chatId: string) => {
    if (!confirm("Delete this chat? This cannot be undone.")) return

    try {
      await supabase.from('messages').delete().eq('chat_id', chatId)
      await supabase.from('chat_participants').delete().eq('chat_id', chatId)
      await supabase.from('chats').delete().eq('id', chatId)

      setChats(prev => prev.filter(chat => chat.id !== chatId))
      if (selectedChat?.id === chatId) {
        setSelectedChat(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name
    const otherUser = chat.participants.find(p => p.user_id !== currentUserId)
    return otherUser?.profile?.name || otherUser?.profile?.username || "Unknown"
  }

  const getChatAvatar = (chat: Chat) => {
    if (chat.is_group) return null
    const otherUser = chat.participants.find(p => p.user_id !== currentUserId)
    return otherUser?.profile?.avatar_url
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const ReactionPicker = ({ messageId, onClose }: { messageId: string, onClose: () => void }) => (
    <div className="absolute bottom-full left-0 mb-2 bg-background border border-border rounded-lg shadow-lg p-2 z-10">
      <div className="flex gap-1">
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            className="h-8 w-8 text-lg hover:bg-accent rounded transition-colors flex items-center justify-center"
            onClick={() => {
              addReaction(messageId, emoji)
              onClose()
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )

  const renderMessages = () => {
    return Object.entries(groupedMessages).map(([date, dateMessages]) => (
      <div key={date} className="space-y-3 sm:space-y-4">
        <div className="flex justify-center my-4">
          <Badge variant="outline" className="px-3 py-1 bg-background">
            {date}
          </Badge>
        </div>
        
        {dateMessages.map(message => {
          const isOwn = message.sender_id === currentUserId
          const currentChatUser = selectedChat?.participants.find(p => p.user_id !== currentUserId)?.profile

          return (
            <div
              key={message.id}
              className={`flex gap-2 sm:gap-3 group relative ${
                isOwn ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isOwn && currentChatUser && (
                <MemoizedAvatar user={currentChatUser} size={8} />
              )}
              
              <div className={`max-w-[85%] sm:max-w-[70%] min-w-0 ${isOwn ? 'order-first' : ''}`}>
                <div
                  className={`rounded-lg p-3 text-sm sm:text-base relative ${
                    isOwn
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="break-words whitespace-pre-wrap">{message.content}</p>
                  
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowReactionPicker(message.id)}>
                          <Smile className="h-4 w-4 mr-2" />
                          Add Reaction
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteMessage(message.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.created_at)}
                  </span>
                  
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(
                        message.reactions.reduce((acc: any, reaction) => {
                          acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
                          return acc
                        }, {})
                      ).map(([emoji, count]) => (
                        <Badge
                          key={emoji}
                          variant="secondary"
                          className="text-xs cursor-pointer hover:bg-accent px-1 py-0 h-5"
                          onClick={() => {
                            const userReaction = message.reactions.find(
                              r => r.user_id === currentUserId && r.emoji === emoji
                            )
                            if (userReaction) {
                              removeReaction(message.id, emoji)
                            } else {
                              addReaction(message.id, emoji)
                            }
                          }}
                        >
                          {emoji} {count}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {showReactionPicker === message.id && (
                <ReactionPicker 
                  messageId={message.id} 
                  onClose={() => setShowReactionPicker(null)}
                />
              )}
            </div>
          )
        })}
      </div>
    ))
  }

  const ChatSidebar = () => (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreatingGroup(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Group
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            className="flex-1"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {searchResults.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 px-2">Search Results</h3>
              {searchResults.map(user => (
                <div
                  key={user.id}
                  className="p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors mb-2"
                  onClick={() => startChatWithUser(user)}
                >
                  <div className="flex items-center gap-3">
                    <MemoizedAvatar user={user} size={10} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.name || user.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-sm font-medium mb-2 px-2">Your Chats</h3>
          {chats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No chats yet</p>
              <p className="text-xs mt-1">Search for users to start a conversation</p>
            </div>
          ) : (
            chats.map(chat => {
              const otherUser = chat.participants.find(p => p.user_id !== currentUserId)
              const name = chat.name || otherUser?.profile?.name || otherUser?.profile?.username || "Unknown"
              const avatar = chat.is_group ? null : otherUser?.profile?.avatar_url

              return (
                <div
                  key={chat.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors mb-2",
                    selectedChat?.id === chat.id ? "bg-accent" : ""
                  )}
                  onClick={() => {
                    setSelectedChat(chat)
                    setMobileSidebarOpen(false)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {avatar ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatar} />
                          <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {chat.is_group ? <Users className="h-5 w-5" /> : name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{name}</p>
                        {chat.last_message && (
                          <p className="text-xs text-muted-foreground truncate">
                            {chat.last_message.user_id === currentUserId ? 'You: ' : ''}{chat.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!chat.is_group && otherUser && (
                          <DropdownMenuItem asChild>
                            <Link href={`/profile/${otherUser.profile.username}`} className="cursor-pointer">
                              <User className="h-4 w-4 mr-2" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => deleteChat(chat.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )

  const currentChatUser = selectedChat?.participants.find(p => p.user_id !== currentUserId)?.profile
  const chatName = selectedChat?.name || currentChatUser?.name || currentChatUser?.username || "Chat"
  const chatAvatar = selectedChat?.is_group ? null : currentChatUser?.avatar_url

  return (
    <div className="flex h-full bg-background">
      {/* Десктоп сайдбар */}
      <div className="hidden md:flex w-80 border-r border-border flex-col">
        <ChatSidebar />
      </div>

      {/* Мобильный сайдбар */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-10">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <ChatSidebar />
        </SheetContent>
      </Sheet>

      {/* Основная область чата */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Заголовок чата */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {chatAvatar ? (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={chatAvatar} />
                  <AvatarFallback>{chatName[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {selectedChat.is_group ? <Users className="h-5 w-5" /> : chatName[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold">{chatName}</p>
                {selectedChat.is_group && (
                  <p className="text-xs text-muted-foreground">{selectedChat.participants.length} members</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!selectedChat.is_group && currentChatUser && (
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${currentChatUser.username}`}>
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => deleteChat(selectedChat.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Сообщения */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                renderMessages()
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Ввод сообщения */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
                disabled={isSending}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || isSending}
              >
                {isSending ? (
                  <div className="animate-spin">
                    <Send className="h-4 w-4" />
                  </div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">OriginChat</h2>
            <p className="text-muted-foreground">Select a chat or search for users to start messaging</p>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {isCreatingGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create Group Chat</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCreatingGroup(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Group Name (optional)</label>
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Add Members</label>
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              />
            </div>

            <ScrollArea className="max-h-60 mb-4">
              <div className="space-y-2">
                {searchResults.map(user => {
                  const isSelected = selectedUsers.includes(user.id)
                  return (
                    <div
                      key={user.id}
                      className={cn(
                        "p-2 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                        isSelected && "bg-accent"
                     
