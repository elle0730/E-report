import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Send, Volume2, Mic, MicOff, Bot,
  User, CheckCircle, AlertCircle, Phone, ArrowLeft, Sparkles
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { useAuth } from '../context/AuthContext.js';

export const BensiChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, t, speak, stopSpeaking, isSpeaking, listen, stopListening, isListening } = useAccessibility();
  const { user } = useAuth();

  const handleBack = () => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/resident/dashboard');
    }
  };

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [staffPresence, setStaffPresence] = useState<{ isStaffActive: boolean; staff: any[] }>({
    isStaffActive: false,
    staff: []
  });
  const [handoverAlert, setHandoverAlert] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('bensican_token');

  // Load chat history & check staff presence
  const loadChat = () => {
    // Check presence
    fetch('/api/bensi/presence', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStaffPresence({
          isStaffActive: data.isStaffActive,
          staff: data.staff || []
        });
      })
      .catch(() => {});

    // Check history
    fetch('/api/bensi/history', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          // Default initial greeting in current language
          const greetingText = language === 'il'
            ? 'Kablaaw! Siak ni Bensi, ti automated digital assistant ti Barangay Bensican. Kasanoka a matulongan ita nga aldaw?'
            : language === 'tl'
            ? 'Mabuhay! Ako si Bensi, ang digital assistant ng Barangay Bensican. Paano kita matutulungan ngayon?'
            : 'Mabuhay! I am Bensi, your automated digital assistant for Barangay Bensican. How can I help you today?';
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
    const interval = setInterval(loadChat, 8000); // Poll presence & updates every 8s
    return () => clearInterval(interval);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender_role: 'resident',
      sender_name: user?.fullName || 'Resident',
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/bensi/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          lang: language
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.handledBy === 'staff') {
          setHandoverAlert(data.message);
          setMessages(prev => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              sender_role: 'bensi',
              sender_name: 'Bensi System Alert',
              message: `[Handover to Official]: ${data.message}`,
              created_at: new Date().toISOString()
            }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              id: `resp-${Date.now()}`,
              sender_role: 'bensi',
              sender_name: data.botName || 'Bensi AI Assistant',
              message: data.message,
              created_at: new Date().toISOString()
            }
          ]);
          // Automatically speak reply if requested or available
          speak(data.message);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      listen((spoken) => {
        setInputText(spoken);
        handleSendMessage(spoken);
      });
    }
  };

  // Quick prompt chips
  const quickChips = [
    { label_en: 'What are office hours?', label_tl: 'Kailan bukas ang hall?', label_il: 'Kaano ti lukat ti opisina?', q: 'What are the office hours of Barangay Bensican?' },
    { label_en: 'How to file a report?', label_tl: 'Paano magsumbong?', label_il: 'Kasanot agipadamag?', q: 'How do I submit a report or concern?' },
    { label_en: 'What do statuses mean?', label_tl: 'Kahulugan ng status?', label_il: 'Kayat a sawen ti status?', q: 'What do the report statuses mean?' },
    { label_en: 'About Lupon hearings', label_tl: 'Tungkol sa pagdinig ng Lupon', label_il: 'Maipapan iti panagdengngeg ti Lupon', q: 'Tell me about hearings and subpoenas.' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-4 animate-fade-in">
      {/* Presence & Header Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-3 border-emerald-300 dark:border-slate-700 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-emerald-400 min-h-[44px] min-w-[44px]"
            title={t('back')}
            aria-label={t('back')}
          >
            <ArrowLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs sm:text-sm font-semibold pr-1 hidden sm:inline">{t('back')}</span>
          </button>

          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Bensi Digital Assistant
              </h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                staffPresence.isStaffActive
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${staffPresence.isStaffActive ? 'bg-blue-600' : 'bg-emerald-600'} animate-pulse`} />
                {staffPresence.isStaffActive ? 'Barangay Staff Online' : 'AI Assistant Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multilingual helper speaking Ilocano, Tagalog, and English.
            </p>
          </div>
        </div>

        {/* Emergency Call Hotline Button */}
        <a
          href="tel:091755523674"
          className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold rounded-xl text-xs flex items-center gap-2 border border-emerald-300 dark:border-emerald-700 min-h-[48px]"
        >
          <Phone className="w-4 h-4 text-emerald-600" />
          <span>Call Barangay: 0917-555-BENSI</span>
        </a>
      </div>

      {/* Staff Handover Alert Banner */}
      {staffPresence.isStaffActive && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/60 rounded-2xl border-2 border-blue-400 flex items-start gap-3 text-blue-900 dark:text-blue-200 animate-pulse">
          <Sparkles className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>Official Online Handover:</strong> A barangay administrator is available right now. Bensi has handed over this chat. You may message the active staff directly.
          </div>
        </div>
      )}

      {/* Chat Messages Box */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border-3 border-slate-200 dark:border-slate-800 p-6 min-h-[420px] max-h-[520px] overflow-y-auto space-y-4 shadow-inner">
        {messages.map((m) => {
          const isUser = m.sender_role === 'resident';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-500 px-1">
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-emerald-600" />}
                <span className="font-bold">{m.sender_name}</span>
                <span>• {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div
                className={`p-4 rounded-2xl max-w-lg text-base leading-relaxed whitespace-pre-line shadow-xs border ${
                  isUser
                    ? 'bg-emerald-600 text-white border-emerald-700 rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-tl-none'
                }`}
              >
                {m.message}

                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                      onClick={() => speak(m.message)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
                      title="Read aloud"
                    >
                      <Volume2 className="w-4 h-4" /> Listen
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap gap-2">
        {quickChips.map((chip, idx) => {
          const label = language === 'il' ? chip.label_il : language === 'tl' ? chip.label_tl : chip.label_en;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip.q)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition"
            >
              💬 {label}
            </button>
          );
        })}
      </div>

      {/* Input Box & Voice Button */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border-3 border-emerald-300 dark:border-slate-700 shadow-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone speech-to-text button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-3 rounded-2xl border transition min-h-[48px] min-w-[48px] flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white animate-pulse border-red-600'
                : 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
            }`}
            title="Speak into microphone"
            aria-label="Speak into microphone"
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question or tap the microphone to talk..."
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-slate-600 text-base dark:bg-slate-900 focus:border-emerald-600 font-medium"
          />

          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black rounded-2xl flex items-center gap-2 transition min-h-[48px]"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

