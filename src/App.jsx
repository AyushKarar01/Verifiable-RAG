import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [chats, setChats] = useState([
    {
      id: 1,
      title: 'New Conversation',
      messages: [
        {
          role: 'assistant',
          text: 'Hello! Welcome to your RAG Chatbot. Upload a document and ask me questions.'
        }
      ]
    }
  ])

  const [activeChat, setActiveChat] = useState(1)
  const [input, setInput] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isListening, setIsListening] = useState(false)

  const recognitionRef = useRef(null)

  const currentChat = chats.find(chat => chat.id === activeChat)

  function createNewChat() {
    const newChat = {
      id: Date.now(),
      title: 'New Conversation',
      messages: [
        {
          role: 'assistant',
          text: 'Welcome to the RAG Chatbot! How can I assist you today?',
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      ]
    }

    setChats(previous => [newChat, ...previous])
    setActiveChat(newChat.id)
    setInput('')
    setSelectedFile(null)
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!input.trim() && !selectedFile) return

    const userText =
      input.trim() +
      (selectedFile ? `\nAttached file: ${selectedFile.name}` : '')

    setChats(previous =>
      previous.map(chat =>
        chat.id === activeChat
          ? {
              ...chat,
              title:
                chat.messages.length === 1
                  ? input.trim().slice(0, 28) || selectedFile?.name || chat.title
                  : chat.title,
              messages: [
                ...chat.messages,
                {
                  role: 'user',
                  text: userText,
                  time: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }
              ]
            }
          : chat
      )
    )

    setInput('')
    setSelectedFile(null)
  }

  function handleVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Voice input is not supported. Try Chrome.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.continuous = false

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = event => {
      const spokenText = event.results[0][0].transcript
      setInput(previous =>
        previous ? `${previous} ${spokenText}` : spokenText
      )
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }

  return (
    <div className="app-layout">

      <aside className="sidebar">

        <div className="sidebar-header">
          <h2>RAG Assistant</h2>
        </div>

        <button className="new-chat-button" onClick={createNewChat}>
          + New Chat
        </button>

        <p className="history-heading">CHAT HISTORY</p>

        <div className="history-list">
          {chats.map(chat => (
            <button
              key={chat.id}
              type="button"
              className={`history-item ${chat.id === activeChat ? 'active' : ''}`}
              onClick={() => setActiveChat(chat.id)}
            >
              <span>◷</span>
              <span>{chat.title}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <span>RAG Chatbot Project</span>
          <small>Frontend Prototype</small>
        </div>

      </aside>

      <main className="chat-container">

        <header className="chat-header">
          <h1>RAG Chatbot</h1>
          <p>Ask questions about your documents</p>
        </header>

        <section className="chat-area">

          {currentChat.messages.map((message, index) => {
            const isUser = message.role === 'user'

            return (
              <div
                key={index}
                className={`message ${message.role}`}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  marginBottom: '12px'
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      background: isUser ? '#dbeafe' : '#f3f4f6',
                      color: '#111827',
                      borderRadius: isUser ? '12px 12px 0 12px' : '12px 12px 12px 0',
                      padding: '10px 14px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                    }}
                  >
                    {message.text}
                  </div>

                  {message.time && (
                    <small
                      className="message-time"
                      style={{
                        marginTop: '4px',
                        color: '#6b7280',
                        fontSize: '11px',
                        display: 'block'
                      }}
                    >
                      {message.time}
                    </small>
                  )}
                </div>
              </div>
            )
          })}

        </section>

        <form className="chat-input-area" onSubmit={handleSubmit}>

          {selectedFile && (
            <div className="attachment">
              <span>📄 {selectedFile.name}</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
              >
                ×
              </button>
            </div>
          )}

          <div className="input-row">

            <label className="icon-button" title="Upload document">
              <span className="plus-icon">+</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                hidden
                onChange={event => {
                  if (event.target.files[0]) {
                    setSelectedFile(event.target.files[0])
                  }
                  event.target.value = ''
                }}
              />
            </label>

            <input
              className="message-input"
              type="text"
              placeholder="Ask anything about your documents..."
              value={input}
              onChange={event => setInput(event.target.value)}
            />

            <button
              type="button"
              className={`icon-button mic-button ${isListening ? 'listening' : ''}`}
              onClick={handleVoiceInput}
              title="Voice input"
            >
              <svg viewBox="0 0 24 24" width="22" height="22"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <path d="M12 17v5M8 22h8" />
              </svg>
            </button>

            <button type="submit" className="send-button">
              Send
            </button>

          </div>
        </form>

      </main>
    </div>
  )
}

export default App
