import React, { useState } from 'react';
import { OwlPostMessage } from '../types';
import { soundEngine } from '../utils/audio';
import { Mail, Send, Sparkles, Feather, AlertCircle } from 'lucide-react';

interface OwlPostViewProps {
  messages: OwlPostMessage[];
  onMarkRead: (messageId: string) => void;
  onSendReply: (recipient: string, text: string) => void;
}

export const OwlPostView: React.FC<OwlPostViewProps> = ({
  messages,
  onMarkRead,
  onSendReply,
}) => {
  const [selectedMessage, setSelectedMessage] = useState<OwlPostMessage>(messages[0]);
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);

  const handleSelect = (msg: OwlPostMessage) => {
    soundEngine.playParchmentRustle();
    setSelectedMessage(msg);
    onMarkRead(msg.id);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    soundEngine.playParchmentRustle();
    onSendReply(selectedMessage.sender, replyText);
    setReplyText('');
    setReplySuccess(true);
    setTimeout(() => setReplySuccess(false), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto my-4 px-2 sm:px-4 space-y-6">
      {/* Header bar */}
      <div className="bg-[#14121a] border border-[#3b2e22] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="font-cinzel text-xl text-amber-200 font-bold tracking-wide flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <span>Owl Post & The Daily Prophet</span>
          </h2>
          <p className="text-xs text-[#a09080] font-garamond italic">
            The Owlery · Letters delivered by feather and claw from across the Wizarding World.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Letters list */}
        <div className="md:col-span-5 space-y-2 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-900/40">
          {messages.map((msg) => {
            const isSelected = selectedMessage.id === msg.id;
            return (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#291e14] border-amber-500/80 text-amber-200 shadow-md scale-[1.01]'
                    : 'bg-[#15131a] border-[#2e241b] text-[#c0b3a0] hover:border-amber-700/50 hover:bg-[#1d171d]'
                }`}
              >
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: msg.waxSealColor }}
                      title="Wax Seal"
                    />
                    <div className="font-cinzel text-xs font-bold truncate text-amber-300">
                      {msg.sender}
                    </div>
                  </div>
                  <div className="font-garamond font-semibold text-sm text-[#ddd0bc] truncate mt-0.5">
                    {msg.subject}
                  </div>
                  <div className="text-[11px] font-garamond italic text-[#8a7b6b] mt-0.5">
                    {msg.date}
                  </div>
                </div>

                {!msg.read && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected letter open view */}
        <div className="md:col-span-7 bg-[#ede2cb] text-[#2c1d11] rounded-lg p-6 sm:p-8 space-y-5 shadow-2xl border-4 border-[#7a5c36] relative overflow-hidden">
          {/* Faint parchment texture overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#bba282_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

          {/* Letter header */}
          <div className="border-b-2 border-[#8e6c43]/40 pb-4 relative">
            <div className="flex items-center justify-between text-xs font-cinzel text-[#5f3e20]">
              <span>{selectedMessage.date}</span>
              <span className="font-bold uppercase tracking-wider">{selectedMessage.senderRole}</span>
            </div>

            <h3 className="font-cinzel text-xl font-black text-[#2e1706] mt-2">
              {selectedMessage.subject}
            </h3>

            <div className="text-xs font-garamond italic text-[#4a301a] mt-0.5">
              From: {selectedMessage.sender}
            </div>
          </div>

          {/* Letter Body */}
          <div className="font-garamond text-base sm:text-lg leading-relaxed text-[#2a1b0e] whitespace-pre-line relative">
            {selectedMessage.body}
          </div>

          {/* Reply Form */}
          <div className="pt-4 border-t-2 border-[#8e6c43]/40 relative">
            <div className="font-cinzel text-xs font-bold text-[#442813] mb-2 flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5 text-[#73431f]" />
              <span>Pen a Reply by Owl:</span>
            </div>

            <form onSubmit={handleSend} className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Write your response to ${selectedMessage.sender}...`}
                rows={3}
                className="w-full p-3 bg-[#f5ede0] border border-[#96744f] rounded text-xs font-garamond text-[#2a1b0e] placeholder-[#8a7258] focus:outline-none focus:ring-1 focus:ring-[#7a5c36]"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-5 py-2 bg-[#3e2513] hover:bg-[#2b1709] disabled:opacity-50 text-amber-100 font-cinzel text-xs font-bold rounded shadow transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send via Barn Owl</span>
                </button>
              </div>
            </form>

            {replySuccess && (
              <div className="p-2.5 mt-2 bg-[#2d4229] text-emerald-100 rounded text-xs font-garamond italic animate-fadeIn flex items-center gap-2">
                <span>🦉</span>
                <span>Your owl takes wing into the twilight skies over Hogwarts!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
