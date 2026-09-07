'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rootCauseAgentApi, RootCauseChatMessage, RootCauseWhyStep } from '@/lib/api';
import { toast } from 'sonner';

interface RootCauseAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ncrId: string;
  onAccept: (rootCause: string, whyChain: RootCauseWhyStep[]) => void;
}

export function RootCauseAgentModal({ isOpen, onClose, ncrId, onAccept }: RootCauseAgentModalProps) {
  const [messages, setMessages] = useState<RootCauseChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ rootCause: string; whyChain: RootCauseWhyStep[] } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendTurn = async (nextMessages: RootCauseChatMessage[]) => {
    setIsSending(true);
    try {
      const response = await rootCauseAgentApi.chat(ncrId, nextMessages);
      const data = response.data.data;

      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);

      if (data.isComplete && data.rootCause) {
        setResult({ rootCause: data.rootCause, whyChain: data.whyChain || [] });
      }
    } catch {
      toast.error('Failed to reach the root cause assistant');
    } finally {
      setIsSending(false);
    }
  };

  // Start the analysis when the modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && !result) {
      sendTurn([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isSending || result) return;
    const nextMessages: RootCauseChatMessage[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(nextMessages);
    setInput('');
    sendTurn(nextMessages);
  };

  const handleClose = () => {
    setMessages([]);
    setInput('');
    setResult(null);
    onClose();
  };

  const handleAccept = () => {
    if (!result) return;
    onAccept(result.rootCause, result.whyChain);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-xl flex flex-col max-h-[85vh]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--brand-strong)]" />
            AI-Guided 5 Whys
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-[var(--brand)] text-[var(--text-on-brand)]'
                    : 'bg-[var(--surface-sunken)] text-[var(--text-body)]'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-[var(--surface-sunken)] text-[var(--text-muted)]">
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>

        {result ? (
          <div className="border-t border-[var(--border-default)] p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)] mb-1">Proposed Root Cause</p>
              <p className="text-[var(--text-body)]">{result.rootCause}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Discard
              </Button>
              <Button onClick={handleAccept}>Use This Root Cause</Button>
            </div>
          </div>
        ) : (
          <div className="border-t border-[var(--border-default)] p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={2}
                placeholder="Type your answer..."
                disabled={isSending}
                className="flex-1 rounded-md border border-[var(--border-default)] bg-[var(--surface-sunken)] text-[var(--text-strong)] placeholder:text-[var(--text-subtle)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-60"
              />
              <Button onClick={handleSend} disabled={isSending || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
