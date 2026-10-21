import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Languages, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ASSISTANT_LANGUAGES } from '@/lib/assistant-languages';

export default function ChatInput({
  onSend, isResponding, voice, selectedLang, onLangChange,
  autoSpeak, onAutoSpeakChange, onNewChat,
}) {
  const [text, setText] = useState('');
  const [showLangs, setShowLangs] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLangs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || isResponding) return;
    onSend(text.trim());
    setText('');
  };

  const toggleMic = () => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening(selectedLang, (transcript) => setText(transcript));
    }
  };

  const currentLang = ASSISTANT_LANGUAGES.find(l => l.code === selectedLang);

  return (
    <div className="border-t p-3 space-y-2 bg-card">
      <div className="flex items-center gap-1">
        <div className="relative" ref={langRef}>
          <Button
            variant="ghost" size="sm"
            className="h-8 px-2 text-xs gap-1"
            onClick={() => setShowLangs(!showLangs)}
          >
            <Languages className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentLang?.short}</span>
          </Button>
          {showLangs && (
            <div className="absolute bottom-10 left-0 bg-popover border rounded-lg shadow-xl p-1 z-20 max-h-60 overflow-y-auto min-w-[130px]">
              {ASSISTANT_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { onLangChange(lang.code); setShowLangs(false); }}
                  className={`block w-full text-left px-3 py-1.5 text-xs rounded hover:bg-accent transition-colors ${
                    selectedLang === lang.code ? 'font-bold text-primary' : ''
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {voice.ttsSupported && (
          <Button
            variant="ghost" size="sm"
            className={`h-8 px-2 ${autoSpeak ? 'text-primary' : ''}`}
            onClick={onAutoSpeakChange}
            title="Auto-speak responses"
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </Button>
        )}

        <Button
          variant="ghost" size="sm"
          className="h-8 px-2 ml-auto"
          onClick={onNewChat}
          title="New conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {voice.sttSupported && (
          <Button
            type="button"
            variant={voice.isListening ? 'destructive' : 'outline'}
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={toggleMic}
            title={voice.isListening ? 'Stop listening' : 'Start voice input'}
          >
            {voice.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        )}
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={voice.isListening ? 'Listening...' : 'Ask me anything...'}
          disabled={isResponding}
          className="flex-1 h-9"
        />
        <Button
          type="submit" size="icon"
          className="h-9 w-9 shrink-0"
          disabled={!text.trim() || isResponding}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}