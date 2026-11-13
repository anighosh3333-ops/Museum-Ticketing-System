import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Landmark, 
  HelpCircle, 
  RotateCcw,
  ExternalLink 
} from 'lucide-react';
import { CHATBOT_FAQ } from '../data/mockData';
import { Link } from 'react-router-dom';

export default function Chatbot({ isOpen, onToggle, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Welcome to Aurum Heritage Concierge. I can help with museum details, reservation steps, and in-app QR passes. How may I assist you today?',
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { label: 'Ticket Prices', query: 'What are the ticket prices and discounts?' },
    { label: 'Opening Hours', query: 'What are the museum opening hours?' },
    { label: 'How to Book', query: 'How do I book a digital ticket?' },
    { label: 'Cancel & Refund', query: 'Can I cancel or get a refund for my booking?' },
    { label: 'Audio Guides', query: 'Are audio guides available in different languages?' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate intelligent concierge reasoning
    setTimeout(() => {
      const lower = text.toLowerCase();
      let matchedReply = null;

      const asksHowToBook = /\bhow\b.{0,40}\b(book|reserve|purchase)\b|\b(book|booking|reserve|reservation)\b.{0,40}\b(digital|ticket|pass)\b/.test(lower);
      const asksAboutCancellation = /\b(cancel|cancellation|refund|refunded)\b/.test(lower);
      const asksAboutPayment = /\b(payment|pay|paid|card|charge|checkout)\b/.test(lower);

      if (asksAboutCancellation) {
        matchedReply = CHATBOT_FAQ.find(faq => faq.keywords.includes('cancel'))?.reply;
      } else if (asksAboutPayment) {
        matchedReply = CHATBOT_FAQ.find(faq => faq.keywords.includes('payment'))?.reply;
      } else if (asksHowToBook) {
        matchedReply = CHATBOT_FAQ.find(faq => faq.keywords.includes('how to book'))?.reply;
      }

      if (!matchedReply) {
        const matchingFaq = CHATBOT_FAQ.find(faq => faq.keywords.some(keyword => lower.includes(keyword)));
        matchedReply = matchingFaq?.reply;
      }

      if (!matchedReply) {
        if (lower.includes('contact') || lower.includes('email') || lower.includes('phone')) {
          matchedReply = "I don't have verified central contact details. Open the selected museum's details page or its official visitor website for contact information.";
        } else {
          matchedReply = "Browse the Museums page for venue details, then choose a museum to see its listed information and reservation options. This app records reservations and displays an in-app QR pass; it does not process payments or confirm a museum's entry policy.";
        }
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: matchedReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'Conversation reset. How can I help you explore world museums today?',
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-floating-trigger"
          onClick={onToggle}
          aria-label="Open Museum Concierge Chatbot"
        >
          <div className="trigger-pulse" />
          <div className="trigger-inner">
            <MessageSquare size={22} className="trigger-icon" />
          </div>
          <span className="trigger-tooltip">Chat with AURUM</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window-modal">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="bot-avatar-circle">
                <Landmark size={18} className="gold-accent" />
                <span className="online-indicator" />
              </div>
              <div>
                <div className="chatbot-title-row">
                  <h3 className="chatbot-title">Chat with AURUM</h3>
                </div>
                <p className="chatbot-status">Your museum visitor assistant</p>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button 
                type="button" 
                className="chatbot-tool-btn" 
                onClick={resetChat}
                title="Restart conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button 
                type="button" 
                className="chatbot-tool-btn close-btn" 
                onClick={onClose}
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick FAQ Prompts */}
          <div className="chatbot-prompts-bar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="prompt-chip"
                onClick={() => handleSend(p.query)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="chatbot-messages-body">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-bubble-row ${m.sender === 'user' ? 'user-row' : 'bot-row'}`}
              >
                {m.sender === 'bot' && (
                  <div className="chat-avatar-mini">
                    <Sparkles size={12} className="text-gold" />
                  </div>
                )}
                <div className={`chat-bubble ${m.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                  <p className="bubble-text">{m.text}</p>
                  <span className="bubble-time">{m.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-row bot-row">
                <div className="chat-avatar-mini">
                  <Sparkles size={12} className="text-gold" />
                </div>
                <div className="chat-bubble bubble-bot typing-bubble">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts in Chat Footer */}
          <div className="chatbot-quick-links">
            <Link to="/museums" onClick={onClose} className="chat-quick-link">
              <span>Browse All Museums</span>
              <ExternalLink size={11} />
            </Link>
            <Link to="/booking" onClick={onClose} className="chat-quick-link">
              <span>Book Tickets</span>
              <ExternalLink size={11} />
            </Link>
          </div>

          {/* Input Box */}
          <div className="chatbot-input-bar">
            <input
              type="text"
              className="chatbot-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about tickets, timings, exhibitions..."
            />
            <button
              type="button"
              className="chatbot-send-btn"
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
