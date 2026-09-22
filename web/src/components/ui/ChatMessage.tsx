import React from 'react';
import { ChatMessageProps } from '../../types';

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwn,
  onImageClick,
  className = '',
  'data-testid': testId,
}) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      data-testid={testId || `chat-message-${message.id}`}
      className={`flex flex-col max-w-[85%] md:max-w-[70%] mb-3 ${
        isOwn ? 'ml-auto items-end' : 'mr-auto items-start'
      } ${className}`}
    >
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className="text-xs font-medium text-slate-400">
          {isOwn ? 'Tú' : message.sender?.firstName || 'Médico Veterinario'}
        </span>
        <span className="text-[10px] text-slate-500">{formattedTime}</span>
      </div>

      <div
        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {message.attachmentUrl && (
          <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
            <img
              src={message.attachmentUrl}
              alt="Adjunto clínico"
              onClick={() => onImageClick && onImageClick(message.attachmentUrl!)}
              className="max-h-48 w-auto rounded object-cover cursor-pointer hover:opacity-90 transition-opacity"
            />
          </div>
        )}
      </div>
    </div>
  );
};
