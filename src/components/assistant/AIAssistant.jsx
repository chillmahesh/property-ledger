import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useVoice } from '@/hooks/useVoice';
import { DEFAULT_LANGUAGE } from '@/lib/assistant-languages';
import ChatPanel from './ChatPanel';

function getPageContext(pathname) {
  const map = [
    ['/dashboard', 'Dashboard - viewing property stats, alerts, and quick actions'],
    ['/properties', 'Properties list - viewing all properties'],
    ['/tenants', 'Tenants list - viewing all tenants'],
    ['/payments', 'Payments page - viewing rent payment history'],
    ['/expenses', 'Expenses page - viewing property expenses'],
    ['/reports', 'Reports page - viewing occupancy, revenue, and expense reports'],
    ['/settings', 'Settings page - viewing account and preferences'],
  ];
  for (const [path, ctx] of map) {
    if (pathname === path) return ctx;
  }
  if (pathname.startsWith('/properties/')) return 'Property details page - viewing a specific property with floors and rooms';
  if (pathname.startsWith('/rooms/')) return 'Room details page - viewing a specific room with beds';
  if (pathname.startsWith('/tenants/')) return 'Tenant details page - viewing a specific tenant with payments, deposits, and documents';
  if (pathname.startsWith('/alerts/')) return 'Alert details page - viewing filtered alert records';
  return 'Property Ledger application';
}

export default function AIAssistant() {
  const [panelState, setPanelState] = useState('closed');
  const [messages, setMessages] = useState([]);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLang, setSelectedLang] = useState(DEFAULT_LANGUAGE);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [initKey, setInitKey] = useState(0);

  const location = useLocation();
  const conversationRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const voice = useVoice();

  const autoSpeakRef = useRef(autoSpeak);
  const langRef = useRef(selectedLang);
  useEffect(() => { autoSpeakRef.current = autoSpeak; }, [autoSpeak]);
  useEffect(() => { langRef.current = selectedLang; }, [selectedLang]);

  const isOpen = panelState !== 'closed';

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const init = async () => {
      try {
        let conv;
        const storedId = sessionStorage.getItem('pl_assistant_conv_id');
        if (storedId) {
          conv = await base44.agents.getConversation(storedId);
        } else {
          conv = await base44.agents.createConversation({
            agent_name: 'property_assistant',
            metadata: { name: 'Property Assistant' },
          });
          sessionStorage.setItem('pl_assistant_conv_id', conv.id);
        }
        if (cancelled) return;

        conversationRef.current = conv;
        if (conv.messages) setMessages(conv.messages);

        unsubscribeRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
          if (cancelled) return;
          const msgs = data.messages || [];
          setMessages(msgs);

          const last = msgs[msgs.length - 1];
          if (last?.role === 'assistant' && last.content) {
            setIsResponding(false);
            if (autoSpeakRef.current && voice.ttsSupported) {
              setSpeakingId(last.id);
              voice.speak(last.content, langRef.current);
            }
          } else if (last?.role === 'user') {
            setIsResponding(true);
          }
        });
      } catch (err) {
        if (!cancelled) {
          setError('Unable to connect to the assistant. Please try again.');
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isOpen, initKey]);

  const handleSend = async (text) => {
    if (!conversationRef.current || isResponding) return;
    setError(null);
    setIsResponding(true);

    const context = `[Page context: ${getPageContext(location.pathname)}]\n\n`;

    setMessages(prev => [...prev, {
      role: 'user',
      content: text,
      created_date: new Date().toISOString(),
    }]);

    try {
      await base44.agents.addMessage(conversationRef.current, {
        role: 'user',
        content: context + text,
      });
    } catch (err) {
      setError('Failed to send message. Please try again.');
      setIsResponding(false);
    }
  };

  const handleNewChat = () => {
    sessionStorage.removeItem('pl_assistant_conv_id');
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    voice.stopSpeaking();
    conversationRef.current = null;
    setMessages([]);
    setError(null);
    setIsResponding(false);
    setSpeakingId(null);
    setInitKey(k => k + 1);
  };

  const handleClose = () => {
    voice.stopSpeaking();
    voice.stopListening();
    setPanelState('closed');
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {panelState === 'closed' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPanelState('open')}
            className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
            title="Open AI Assistant"
          >
            <Bot className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            {panelState === 'maximized' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              />
            )}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed z-50 ${
                panelState === 'maximized'
                  ? 'inset-0 lg:inset-4'
                  : 'bottom-20 lg:bottom-6 right-4 lg:right-6 w-[calc(100vw-2rem)] sm:w-[400px]'
              }`}
            >
              <ChatPanel
                messages={messages}
                isResponding={isResponding}
                error={error}
                onSend={handleSend}
                onNewChat={handleNewChat}
                voice={voice}
                selectedLang={selectedLang}
                onLangChange={setSelectedLang}
                autoSpeak={autoSpeak}
                onAutoSpeakChange={() => {
                  if (autoSpeak) voice.stopSpeaking();
                  setAutoSpeak(!autoSpeak);
                }}
                speakingId={speakingId}
                isMaximized={panelState === 'maximized'}
                onMinimize={() => setPanelState('closed')}
                onMaximize={() => setPanelState(prev => prev === 'maximized' ? 'open' : 'maximized')}
                onClose={handleClose}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}