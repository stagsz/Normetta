'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  organizationProfileAgentApi,
  RootCauseChatMessage,
  ProfileInterviewInsights,
} from '@/lib/api';
import { toast } from 'sonner';

export default function Step6AIInterview() {
  const { setStep } = useOnboardingStore();
  const [messages, setMessages] = useState<RootCauseChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [insights, setInsights] = useState<ProfileInterviewInsights | null>(null);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendTurn = async (nextMessages: RootCauseChatMessage[]) => {
    setIsSending(true);
    try {
      const response = await organizationProfileAgentApi.chat(nextMessages);
      const data = response.data.data;

      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);

      if (data.isComplete && data.insights) {
        setInsights(data.insights);
      }
    } catch {
      toast.error("Couldn't reach the setup assistant — you can skip this for now.");
    } finally {
      setIsSending(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
    sendTurn([]);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isSending || insights) return;
    const nextMessages: RootCauseChatMessage[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(nextMessages);
    setInput('');
    sendTurn(nextMessages);
  };

  const handleContinue = () => setStep(7);

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] py-12 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-[var(--brand-soft)] rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-[var(--brand-strong)]" />
            </div>
            <CardTitle className="text-xl">A few quick follow-up questions</CardTitle>
            <CardDescription>
              Your company is set up. Want to spend two minutes with our setup assistant? It'll ask a few
              follow-ups based on what you already told us, and use your answers to fine-tune your
              recommended assessment scope.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleContinue}>
              Skip for now
            </Button>
            <Button className="flex-1" onClick={handleStart}>
              Let's talk
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] py-12 px-4">
      <Card className="w-full max-w-xl flex flex-col max-h-[85vh]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--brand-strong)]" />
            Setup Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-3">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-[var(--brand)] text-white'
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

        {insights ? (
          <div className="border-t border-[var(--border-default)] p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)] mb-1">What we'll focus on</p>
              <p className="text-[var(--text-body)]">{insights.summary}</p>
            </div>
            <Button className="w-full" onClick={handleContinue}>
              Continue
            </Button>
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
                className="flex-1 rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-60"
              />
              <Button onClick={handleSend} disabled={isSending || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              className="mt-2 text-xs text-[var(--text-subtle)] hover:text-[var(--text-body)] transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
