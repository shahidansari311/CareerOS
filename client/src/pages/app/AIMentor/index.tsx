import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const suggestedPrompts = [
  "Review my latest resume",
  "How do I prepare for a React interview?",
  "What projects should I build for backend?",
  "Analyze my current skill gaps"
];

export default function AIMentorPage() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, presetMsg?: string) => {
    e?.preventDefault();
    const msg = presetMsg || input;
    if (!msg.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: msg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.reply }]);
    } catch (error) {
      toast.error('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto h-[calc(100vh-4rem)] flex flex-col animate-in fade-in duration-500">
      <div className="text-center mb-8 shrink-0">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bot size={32} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-heading text-foreground">Your AI Career Mentor</h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          I know your current year, your skills, and your goals. How can I help you advance your career today?
        </p>
      </div>

      <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm flex flex-col min-h-0 mb-6">
        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto flex flex-col space-y-6">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-end">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {suggestedPrompts.map((prompt, i) => (
                  <Button key={i} variant="outline" className="justify-start h-auto py-3 text-left" onClick={() => handleSubmit(undefined, prompt)}>
                    <Sparkles size={16} className="text-accent mr-2 shrink-0" />
                    <span className="text-sm whitespace-normal text-muted-foreground">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent/10 text-accent'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-surface-muted text-foreground rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-surface-muted text-foreground rounded-tl-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-muted-foreground" size={16} />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border bg-background/50 shrink-0">
          <form className="relative flex items-center" onSubmit={handleSubmit}>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="w-full pl-4 pr-12 h-14 bg-surface text-base rounded-xl shadow-sm border-border focus-visible:ring-accent" 
              placeholder="Ask me anything about your career path..." 
            />
            <Button disabled={isLoading || !input.trim()} type="submit" size="icon" className="absolute right-2 h-10 w-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50">
              <Send size={18} />
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-3">
            AI Mentor uses advanced models. Responses may take a few seconds and should be verified.
          </p>
        </div>
      </div>
    </div>
  );
}
