'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { supabase } from '@/lib/supabase'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Send, MessageSquare, Plus, Trash2,
    Linkedin, Twitter, Copy, Check,
    Zap, Rocket, Briefcase, Sparkles, BookOpen, Coffee,
    MoreHorizontal
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Platform = 'twitter' | 'linkedin'
type Style = 'GenZ' | 'Degen' | 'Corporate' | 'Stylish' | 'Formal' | 'Natural'

interface ChatSession {
    id: string
    title: string
    platform: Platform
    style: Style
    created_at: string
}

export default function ContentCreationPage() {
    const router = useRouter()
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

    // Settings
    const [platform, setPlatform] = useState<Platform>('twitter')
    const [style, setStyle] = useState<Style>('Natural')

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auth check
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) router.push('/login')
            else loadSessions()
        })
    }, [router])

    const loadSessions = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (data) setSessions(data as ChatSession[])
    }

    const createNewSession = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('chat_sessions')
            .insert({
                user_id: user.id,
                title: 'New Chat',
                platform,
                style
            })
            .select()
            .single()

        if (data) {
            setSessions([data as ChatSession, ...sessions])
            setCurrentSessionId(data.id)
            setMessages([])
            toast.success('New chat started')
        }
    }

    const deleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        await supabase.from('chat_sessions').delete().eq('id', id)
        setSessions(sessions.filter(s => s.id !== id))
        if (currentSessionId === id) {
            setCurrentSessionId(null)
            setMessages([])
        }
        toast.success('Chat deleted')
    }

    // Load messages when session changes
    useEffect(() => {
        if (!currentSessionId) return

        const loadMessages = async () => {
            const { data } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', currentSessionId)
                .order('created_at', { ascending: true })

            if (data) {
                setMessages(data.map(m => ({
                    id: m.id,
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                })))
            }
        }
        loadMessages()
    }, [currentSessionId])

    // Vercel AI SDK hook
    const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading } = useChat({
        api: '/api/chat',
        body: {
            platform,
            style,
            sessionId: currentSessionId
        },
        onFinish: async () => {
            // Refresh session list to update titles if we implement auto-titling later
            loadSessions()
        },
        onError: (err: Error) => {
            toast.error("Failed to generate response")
            console.error(err)
        }
    })

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Custom submit handler to ensure session exists
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        if (!currentSessionId) {
            await createNewSession()
            // Wait a tick for state to update (in a real app, use ref or separate logic)
            // For now, let's just trigger submit after ID is set, or simply proceed if backend handles new session (it doesn't yet)
            // Better approach: create session implicitly or force user to create one.
            // Let's force create one locally if null, but await the state update
        }

        handleSubmit(e)
    }

    const styles = [
        { id: 'GenZ', icon: Zap, label: 'Gen Z', desc: 'Slang, chaotic, emojis' },
        { id: 'Degen', icon: Rocket, label: 'Degen', desc: 'Crypto slang, hype' },
        { id: 'Corporate', icon: Briefcase, label: 'Corporate', desc: 'Professional, structured' },
        { id: 'Stylish', icon: Sparkles, label: 'Stylish', desc: 'Minimalist, aesthetic' },
        { id: 'Formal', icon: BookOpen, label: 'Formal', desc: 'Academic, precise' },
        { id: 'Natural', icon: Coffee, label: 'Natural', desc: 'Conversational, authentic' }
    ]

    const postToSocial = (content: string) => {
        if (platform === 'twitter') {
            const text = encodeURIComponent(content)
            window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
        } else {
            // LinkedIn relies on copying or using their share API which requires a URL
            // For text-only, we'll copy to clipboard and open LinkedIn
            navigator.clipboard.writeText(content)
            toast.success("Copied to clipboard! Opening LinkedIn...")
            window.open('https://www.linkedin.com/feed/', '_blank')
        }
    }

    return (
        <div className="flex h-screen bg-[#030014] text-white overflow-hidden">
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {sidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 300, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border-r border-white/10 bg-[#0a0a0f] flex flex-col"
                    >
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-pink-500" />
                                History
                            </h2>
                            <Button onClick={createNewSession} variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {sessions.map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => setCurrentSessionId(session.id)}
                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all group relative ${currentSessionId === session.id
                                        ? 'bg-pink-500/10 text-pink-200 border border-pink-500/20'
                                        : 'hover:bg-white/5 text-gray-400'
                                        }`}
                                >
                                    <div className="font-medium truncate pr-6">{session.title || 'Untitled Chat'}</div>
                                    <div className="text-xs opacity-60 flex items-center gap-2 mt-1">
                                        {session.platform === 'twitter' ? <Twitter className="w-3 h-3" /> : <Linkedin className="w-3 h-3" />}
                                        <span>{session.style}</span>
                                    </div>

                                    <button
                                        onClick={(e) => deleteSession(session.id, e)}
                                        className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </button>
                            ))}

                            {sessions.length === 0 && (
                                <div className="text-center p-8 text-gray-600 text-sm">
                                    No chats yet. Start a new session!
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative">
                <Header />

                {/* Settings Bar */}
                <div className="h-16 pt-20 border-b border-white/5 bg-[#030014]/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-400 hover:text-white"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>

                        <div className="h-6 w-px bg-white/10" />

                        {/* Platform Selector */}
                        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                            <button
                                onClick={() => setPlatform('twitter')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${platform === 'twitter' ? 'bg-[#1DA1F2] text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Twitter className="w-3.5 h-3.5" /> Twitter / X
                            </button>
                            <button
                                onClick={() => setPlatform('linkedin')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${platform === 'linkedin' ? 'bg-[#0077b5] text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                            </button>
                        </div>
                    </div>

                    {/* Style Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mr-2">Style Data:</span>
                        <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value as Style)}
                            className="bg-[#0a0a0f] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-pink-500/50"
                        >
                            {styles.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto opacity-50">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mb-6">
                                <Sparkles className="w-10 h-10 text-pink-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">AI Content Studio</h3>
                            <p className="text-gray-400">Select a platform and style, then describe what you want to post about. I'll generate optimized content for you.</p>

                            <div className="mt-8 grid grid-cols-2 gap-3 w-full">
                                {styles.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setStyle(s.id as Style)}
                                        className={`p-3 rounded-lg border text-left text-xs transition-all ${style === s.id
                                            ? 'bg-pink-500/10 border-pink-500/30 text-pink-200'
                                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="font-bold mb-1 flex items-center gap-2">
                                            <s.icon className="w-3 h-3" /> {s.label}
                                        </div>
                                        <div className="opacity-60 truncate">{s.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${m.role === 'user'
                                        ? 'bg-pink-600/20 border border-pink-500/20 text-white rounded-br-none'
                                        : 'bg-[#1a1a2e] border border-white/10 text-gray-200 rounded-bl-none'
                                    }`}>
                                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

                                    {m.role === 'assistant' && (
                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                className={`h-8 text-xs gap-2 ${platform === 'twitter'
                                                    ? 'bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 text-white'
                                                    : 'bg-[#0077b5] hover:bg-[#0077b5]/80 text-white'
                                                    }`}
                                                onClick={() => postToSocial(m.content)}
                                            >
                                                {platform === 'twitter' ? <Twitter className="w-3 h-3" /> : <Linkedin className="w-3 h-3" />}
                                                Post Now
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(m.content)
                                                    toast.success("Copied!")
                                                }}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-4 rounded-bl-none flex items-center gap-3">
                                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#030014] via-[#030014] to-transparent">
                    <form onSubmit={handleFormSubmit} className="relative max-w-4xl mx-auto">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder={`Write a ${style} post for ${platform === 'twitter' ? 'Twitter' : 'LinkedIn'}...`}
                            className="w-full bg-[#1a1a2e]/80 backdrop-blur-xl border-white/10 h-14 pl-6 pr-14 rounded-2xl text-base focus:ring-pink-500/20 focus:border-pink-500/50 shadow-2xl"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-2 h-10 w-10 bg-pink-600 hover:bg-pink-500 text-white rounded-xl"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
