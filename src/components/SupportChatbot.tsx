'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface Message {
    id: string
    type: 'user' | 'bot' | 'system'
    content: string
    timestamp: Date
}

export function SupportChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [isTyping, setIsTyping] = useState(false)
    const [isSearchingAgent, setIsSearchingAgent] = useState(false)
    const [userInput, setUserInput] = useState('')
    const [conversationStep, setConversationStep] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            startConversation()
        }
    }, [isOpen])

    const addMessage = (type: 'user' | 'bot' | 'system', content: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            type,
            content,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, newMessage])
    }

    const typeMessage = async (content: string, delay: number = 1500) => {
        setIsTyping(true)
        await new Promise(resolve => setTimeout(resolve, delay))
        addMessage('bot', content)
        setIsTyping(false)
    }

    const startConversation = async () => {
        // Simular búsqueda de agente
        setIsSearchingAgent(true)
        addMessage('system', '🔍 Buscando agente disponible...')

        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsSearchingAgent(false)

        // Mensaje de bienvenida del agente
        await typeMessage('¡Hola! 👋 Soy el asistente virtual de MicroInfo.', 800)
        await typeMessage('⚠️ NOTA: Este es un prototipo. En la versión final, aquí estaría nuestra IA avanzada para ayudarte de forma más personalizada.', 1500)
        await typeMessage('Por ahora, puedo guiarte paso a paso para crear una solicitud de asistencia técnica. ¿Te gustaría que te explique cómo hacerlo?', 1200)

        setConversationStep(1)
    }

    const handleUserResponse = async (response: string) => {
        addMessage('user', response)
        setUserInput('')

        if (conversationStep === 1) {
            // Respuesta a la pregunta inicial
            await typeMessage('¡Perfecto! Te explicaré el proceso completo. Es muy sencillo. 😊', 1000)
            await typeMessage('**Paso 1: Accede a tu cuenta** 🔐\n\nPrimero necesitas iniciar sesión o crear una cuenta de cliente en nuestra plataforma.', 1500)
            await typeMessage('**Paso 2: Ve a la sección SAT** 🎫\n\nUna vez dentro, dirígete a la sección "Mis Tickets de Soporte" desde el menú principal.', 1500)
            await typeMessage('**Paso 3: Crear nuevo ticket** ➕\n\nHaz clic en el botón "Crear Nuevo Ticket" que encontrarás en la parte superior.', 1500)
            await typeMessage('**Paso 4: Completa el formulario** 📝\n\n• Selecciona el tipo de solicitud (Incidencia, Reparación, Garantía, etc.)\n• Elige la prioridad\n• Escribe un asunto descriptivo\n• Detalla el problema en la descripción\n• Si tienes número de serie del producto, inclúyelo', 2000)
            await typeMessage('**Paso 5: Envía tu solicitud** 🚀\n\nRevisa la información y haz clic en "Crear Ticket". ¡Listo! Recibirás un número de seguimiento y un técnico será asignado pronto.', 1500)
            await typeMessage('¿Te gustaría ir directamente a crear tu ticket ahora? Puedo llevarte allí. 😉', 1000)

            setConversationStep(2)
        } else if (conversationStep === 2) {
            // Respuesta final
            if (response.toLowerCase().includes('sí') || response.toLowerCase().includes('si') || response.toLowerCase().includes('vale') || response.toLowerCase().includes('ok')) {
                await typeMessage('¡Genial! Te redirigiré a la página de creación de tickets. Si necesitas ayuda adicional, no dudes en contactarnos. ¡Buena suerte! 🍀', 1000)
                setTimeout(() => {
                    window.location.href = '/sat/nuevo'
                }, 2000)
            } else {
                await typeMessage('No hay problema. Si cambias de opinión o necesitas ayuda, estaré aquí. ¡Que tengas un buen día! 😊', 1000)
                setConversationStep(3)
            }
        }
    }

    const handleQuickAction = (action: string) => {
        handleUserResponse(action)
    }

    return (
        <>
            {/* Botón flotante */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary to-blue-600 text-white rounded-full p-4 shadow-2xl hover:shadow-primary/50 transition-all hover:scale-110 active:scale-95 group"
                    aria-label="Abrir chat de soporte"
                >
                    <MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        1
                    </span>
                </button>
            )}

            {/* Ventana del chatbot */}
            {isOpen && (
                <Card className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] flex flex-col shadow-2xl border-2 !bg-white">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Bot className="h-6 w-6" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                            </div>
                            <div>
                                <h3 className="font-bold">Asistente Virtual</h3>
                                <p className="text-xs text-white/80">En línea</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 rounded-full p-1 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.type === 'system' ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {message.content}
                                    </div>
                                ) : (
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.type === 'user'
                                                ? 'bg-primary text-white rounded-br-none'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                                        <span className="text-[10px] opacity-70 mt-1 block">
                                            {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick actions */}
                    {conversationStep === 1 && !isTyping && (
                        <div className="px-4 py-2 bg-white border-t flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAction('Sí, por favor')}
                                className="flex-1 text-xs"
                            >
                                Sí, por favor
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAction('No, gracias')}
                                className="flex-1 text-xs"
                            >
                                No, gracias
                            </Button>
                        </div>
                    )}

                    {conversationStep === 2 && !isTyping && (
                        <div className="px-4 py-2 bg-white border-t flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => handleQuickAction('Sí, llévame allí')}
                                className="flex-1 text-xs"
                            >
                                Sí, llévame allí
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickAction('No, gracias')}
                                className="flex-1 text-xs"
                            >
                                Ahora no
                            </Button>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-white border-t rounded-b-xl">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                if (userInput.trim() && !isTyping) {
                                    handleUserResponse(userInput)
                                }
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Escribe tu mensaje..."
                                disabled={isTyping || isSearchingAgent}
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!userInput.trim() || isTyping || isSearchingAgent}
                                className="shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </Card>
            )}
        </>
    )
}
