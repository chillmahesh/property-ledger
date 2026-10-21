import { useRef, useEffect } from 'react';
import { Minimize2, Maximize2, X, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

const SUGGESTIONS = [
  "Who hasn't paid rent this month?",
  'Show vacant beds',
  'Which documents expire this week?',
  'Show occupancy rate',
  'Find tenants vacating soon',
  'Add a new tenant',
];

export default function ChatPanel({
  messages, isResponding, error, onSend, onNewChat,
  voice, selectedLang, onLangChange, autoSpeak, onAutoSpeakChange,
  speakingId, isMaximized, onMinimize, onMaximize, onClose,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isResponding]);

  return (
    <div className={`flex flex-col bg-card border rounded-2xl shadow-2xl overflow-hidden ${
      isMaximized ? 'w-full h-full rounded-none' : 'w-full h-[600px] max-h-[80vh]'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b bg-primary/5 shrink-0">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-heading font-bold truncate">Property Ledger Assistant</h3>
          <p className="text-[10px] text-muted-foreground">AI-powered property management copilot</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onMinimize} title="Minimize">
          <Minimize2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onMaximize} title={isMaximized ? 'Restore' : 'Maximize'}>
          {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose} title="Close">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && !error && (
          <div className="text-center py-6 space-y-4">
            <div className="p-3 rounded-2xl bg-primary/10 inline-block">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground px-4">
              👋 Hi! I'm your Property Ledger assistant. I can help you manage properties,
              tenants, rent, expenses, and more. Ask me anything or try a suggestion below!
            </p>
            <div className="flex flex-col gap-1.5 items-center max-w-[280px] mx-auto">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => onSend(s)}
                  className="w-full text-xs px-3 py-2 rounded-lg border hover:bg-accent hover:border-primary/30 transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage
            key={msg.id || i}
            message={msg}
            onSpeak={voice.speak}
            speakingId={speakingId}
            ttsSupported={voice.ttsSupported}
          />
        ))}

        {isResponding && <TypingIndicator />}

        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={onNewChat}>
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSend}
        isResponding={isResponding}
        voice={voice}
        selectedLang={selectedLang}
        onLangChange={onLangChange}
        autoSpeak={autoSpeak}
        onAutoSpeakChange={onAutoSpeakChange}
        onNewChat={onNewChat}
      />
    </div>
  );
}