import ReactMarkdown from 'react-markdown';
import { Volume2, Square } from 'lucide-react';
import ToolCallDisplay from './ToolCallDisplay';

function formatTime(ts) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function ChatMessage({ message, onSpeak, speakingId, ttsSupported }) {
  const isUser = message.role === 'user';
  const isSpeakingThis = speakingId === message.id;

  // Strip the [Page context: ...] prefix from display
  const displayContent = isUser
    ? (message.content || '').replace(/^\[Page context:.*?\]\n\n/s, '')
    : message.content || '';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{displayContent}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-1 prose-pre:bg-background prose-pre:text-xs">
              <ReactMarkdown>{displayContent}</ReactMarkdown>
            </div>
          )}
        </div>

        {message.tool_calls?.map((tc, i) => (
          <ToolCallDisplay key={i} toolCall={tc} />
        ))}

        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          {message.created_date && (
            <span className="text-[10px] text-muted-foreground">
              {formatTime(message.created_date)}
            </span>
          )}
          {!isUser && ttsSupported && displayContent && (
            <button
              onClick={() => isSpeakingThis ? null : onSpeak(message.content, message.id)}
              className="text-muted-foreground hover:text-primary transition-colors"
              title={isSpeakingThis ? 'Speaking...' : 'Listen'}
            >
              {isSpeakingThis
                ? <Square className="w-3 h-3 fill-current" />
                : <Volume2 className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}