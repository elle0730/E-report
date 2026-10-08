import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Volume2, VolumeX, Mic, MicOff,
  Bot, X, Sparkles, RefreshCw, ChevronDown, CheckCircle
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { useAuth } from '../context/AuthContext.js';

export const BensiFloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { language, setLanguage, t, speak, stopSpeaking, isSpeaking, listen, stopListening, isListening } = useAccessibility();
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [unreadAlert, setUnreadAlert] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('bensican_token');

  // Load chat history or set initial greeting based on language
  const loadChat = () => {
    if (!token) {
      // Unauthenticated public visitor greeting
      const greetingText = language === 'il'
        ? 'Kablaaw! Siak ni Bensi, ti automated digital assistant ti Barangay Bensican. Kasanoka a matulongan ita nga aldaw?'
        : language === 'tl'
        ? 'Mabuhay! Ako si Bensi, ang digital assistant ng Barangay Bensican. Paano kita matutulungan ngayon?'
        : 'Welcome! I am Bensi, your automated digital assistant for Barangay Bensican. How can I help you today?';
      setMessages([{
        id: 'init-public',
        sender_role: 'bensi',
        sender_name: 'Bensi AI Assistant',
        message: greetingText,
        created_at: new Date().toISOString()
      }]);
      return;
    }

    fetch('/api/bensi/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          const greetingText = language === 'il'
            ? 'Kablaaw! Siak ni Bensi, ti automated digital assistant ti Barangay Bensican. Kasanoka a matulongan ita nga aldaw?'
            : language === 'tl'
            ? 'Mabuhay! Ako si Bensi, ang digital assistant ng Barangay Bensican. Paano kita matutulungan ngayon?'
            : 'Welcome! I am Bensi, your automated digital assistant for Barangay Bensican. How can I help you today?';
          setMessages([{
            id: 'init-msg',
            sender_role: 'bensi',
            sender_name: 'Bensi AI Assistant',
            message: greetingText,
            created_at: new Date().toISOString()
          }]);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadChat();
  }, [language, token]);

  useEffect(() => {
    if (isOpen) {
      setUnreadAlert(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender_role: 'user',
      sender_name: user?.fullName || 'Resident',
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/bensi/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text,
          lang: language
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            sender_role: 'bensi',
            sender_name: data.handledBy === 'staff' ? 'Barangay Staff' : 'Bensi AI Assistant',
            message: data.reply || data.message || 'Thank you for reaching out to Barangay Bensican.',
            created_at: new Date().toISOString()
          }
        ]);
        if (!isOpen) {
          setUnreadAlert(true);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender_role: 'bensi',
            sender_name: 'Bensi AI Assistant',
            message: 'Barangay Bensican hotline is available at (075) 567-8901. Please try again in a moment.',
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `net-err-${Date.now()}`,
          sender_role: 'bensi',
          sender_name: 'Bensi AI Assistant',
          message: 'Barangay Bensican office hours are Monday to Friday, 8:00 AM - 5:00 PM. Hotlines: (075) 567-8901 or 911 for emergencies.',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      listen((spokenText) => {
        if (spokenText) {
          setInputText(prev => (prev ? `${prev} ${spokenText}` : spokenText));
        }
      });
    }
  };

  const quickPrompts = language === 'tl' ? [
    'Paano magsumbong ng problema?',
    'Oras ng opisina ng Barangay?',
    'Saan ang Barangay Hall?'
  ] : language === 'il' ? [
    'Kasanom ti agsumite ti report?',
    'Oras ti opisina ti Barangay?',
    'Ayan ti Barangay Hall?'
  ] : [
    'How do I submit a report?',
    'Barangay Hall office hours?',
    'Where is the Barangay Hall?'
  ];

  return (
    <aside aria-label="Bensi AI Assistant" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* EXPANDED CHAT WIDGET */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[410px] h-[550px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl border-3 border-emerald-500 shadow-2xl flex flex-col overflow-hidden mb-3 animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between border-b border-emerald-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 text-emerald-200">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight flex items-center gap-1.5">
                  <span>Bensi Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                </h3>
                <span className="text-[11px] text-emerald-200 block">
                  Barangay Bensican Support
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Selector */}
              <div className="flex bg-emerald-950/60 rounded-lg p-0.5 text-[10px] font-bold border border-emerald-600/40">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-0.5 rounded transition ${language === 'en' ? 'bg-white text-emerald-900' : 'text-emerald-200 hover:text-white'}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('tl')}
                  className={`px-1.5 py-0.5 rounded transition ${language === 'tl' ? 'bg-white text-emerald-900' : 'text-emerald-200 hover:text-white'}`}
                >
                  TL
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('il')}
                  className={`px-1.5 py-0.5 rounded transition ${language === 'il' ? 'bg-white text-emerald-900' : 'text-emerald-200 hover:text-white'}`}
                >
                  IL
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white transition ml-1"
                title="Minimize chat"
                aria-label="Minimize chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Chips */}
          <div className="bg-emerald-50/70 dark:bg-slate-800/80 px-3 py-2 border-b border-emerald-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="text-[11px] font-medium bg-white dark:bg-slate-750 hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-slate-700 shrink-0 transition"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/60">
            {messages.map((m, idx) => {
              const isMe = m.sender_role === 'resident' || m.sender_role === 'user';
              return (
                <div
                  key={m.id || idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {isMe ? 'You' : 'Bensi'}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-xs font-medium'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.message}</p>
                    {!isMe && (
                      <button
                        type="button"
                        onClick={() => speak(m.message)}
                        className="mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-700 text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                        title="Listen to response"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2 italic">
                <Bot className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Bensi is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-2.5 rounded-xl border transition ${
                isListening
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title={isListening ? 'Stop listening' : 'Voice dictation'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === 'tl' ? 'Magtanong kay Bensi...' : language === 'il' ? 'Agdamag ken ni Bensi...' : 'Ask Bensi anything...'}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 dark:text-white"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-full shadow-2xl border-2 border-white/60 transition-all transform hover:scale-105 active:scale-95 min-h-[52px]"
        aria-label="Open Bensi AI Chatbot"
        title="Chat with Bensi AI Assistant"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping"></span>
        </div>
        <span className="text-sm font-extrabold pr-1 hidden sm:inline">
          {isOpen ? 'Close Bensi' : 'Ask Bensi AI'}
        </span>
        {unreadAlert && !isOpen && (
          <span className="w-3 h-3 rounded-full bg-red-500 border border-white"></span>
        )}
      </button>
    </aside>
  );
};

