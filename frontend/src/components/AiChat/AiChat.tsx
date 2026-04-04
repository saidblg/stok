import { useState, useRef, useEffect } from 'react';
import { X, Send, Trash2, Sparkles, User, Bot, Maximize2, Minimize2 } from 'lucide-react';
import { useAiChat } from '../../hooks/useAiChat';
import './AiChat.css';

const AiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isLoading, error, sendMessage, clearMessages } = useAiChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ESC tuşu ile tam ekrandan çık
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClose = () => {
    setIsFullscreen(false);
    setIsOpen(false);
  };

  const quickQuestions = [
    'En çok satan ürünüm ne?',
    'Düşük stoklu ürünler',
    'Bu ayki satışlarım',
    'Borçlu müşteriler',
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        className={`ai-chat-fab ${isOpen ? 'ai-chat-fab-hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="AI Asistan"
      >
        <Sparkles className="ai-chat-fab-icon" />
        <span className="ai-chat-fab-pulse" />
      </button>

      {/* Chat Panel */}
      <div className={`ai-chat-panel ${isOpen ? 'ai-chat-panel-open' : ''} ${isFullscreen ? 'ai-chat-panel-fullscreen' : ''}`}>
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-info">
            <div className="ai-chat-header-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="ai-chat-header-title">Karabacak AI</h3>
              <span className="ai-chat-header-status">
                {isLoading ? 'Yazıyor...' : 'Çevrimiçi'}
              </span>
            </div>
          </div>
          <div className="ai-chat-header-actions">
            <button
              className="ai-chat-header-btn"
              onClick={clearMessages}
              title="Sohbeti Temizle"
            >
              <Trash2 size={18} />
            </button>
            <button
              className="ai-chat-header-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Küçült' : 'Tam Ekran'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              className="ai-chat-header-btn"
              onClick={handleClose}
              title="Kapat"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-chat-message ${msg.role === 'user' ? 'ai-chat-message-user' : 'ai-chat-message-assistant'}`}
            >
              <div className="ai-chat-message-avatar">
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="ai-chat-message-content">
                <div className="ai-chat-message-text">{msg.content}</div>
                <span className="ai-chat-message-time">
                  {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="ai-chat-message ai-chat-message-assistant">
              <div className="ai-chat-message-avatar">
                <Bot size={16} />
              </div>
              <div className="ai-chat-message-content">
                <div className="ai-chat-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="ai-chat-error">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="ai-chat-quick-questions">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                className="ai-chat-quick-btn"
                onClick={() => sendMessage(q)}
                disabled={isLoading}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form className="ai-chat-input-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="ai-chat-input"
            placeholder="Bir soru sorun..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="ai-chat-send-btn"
            disabled={!input.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Backdrop */}
      {isOpen && !isFullscreen && (
        <div
          className="ai-chat-backdrop"
          onClick={handleClose}
        />
      )}
    </>
  );
};

export default AiChat;
