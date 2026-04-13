'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const ZODIAC_SIGNS = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];
const MBTI_TYPES = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [zodiac, setZodiac] = useState('');
  const [mbti, setMbti] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const sendMessage = async (userMessage: string, isFirst = false) => {
    if (!zodiac || !mbti) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    if (!isFirst) setInput('');
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zodiac, mbti, message: userMessage }),
      });
      if (!res.ok) throw new Error('服务器开小差了...');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let botMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' };
      setMessages(prev => [...prev, botMessage]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content !== undefined) {
                botMessage.content += parsed.content;
                setMessages(prev => prev.map(m => m.id === botMessage.id ? { ...botMessage } : m));
              }
            } catch {}
          }
        }
      }
    } catch (e: any) {
      setError(e.message || '出了点问题，请重试~');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">星座 × MBTI 算命大师</h1>
            <p className="text-xs text-white/60">AI 驱动的搞笑命运预测</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {!hasStarted ? (
          <div className="max-w-md mx-auto mt-20">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">你的命运由AI主宰</h2>
              <p className="text-white/60">选择你的星座和MBTI，开启专属搞笑算命之旅</p>
            </div>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="zodiac" className="text-white">你的星座</Label>
                  <Select value={zodiac} onValueChange={setZodiac}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="选择你的星座" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZODIAC_SIGNS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mbti" className="text-white">你的MBTI</Label>
                  <Select value={mbti} onValueChange={setMbti}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="选择你的MBTI类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {MBTI_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {error && (
                  <Alert className="bg-red-500/20 border-red-500/30">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={() => { setHasStarted(true); sendMessage(`你好！我是${zodiac}座的${mbti}型人，快来给我算一卦吧！`, true); }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-6 text-lg"
                  disabled={!zodiac || !mbti || isLoading}
                >
                  {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 正在连接命运...</> : <><Sparkles className="mr-2 h-5 w-5" /> 开始算命</>}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <Card className="flex-1 flex flex-col bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-white/5 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500">
                    <AvatarFallback><Sparkles className="h-5 w-5 text-white" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-white text-base">算命大师</CardTitle>
                    <CardDescription className="text-white/50 text-xs">{zodiac} · {mbti}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <ScrollArea className="flex-1 p-4 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {msg.role === 'assistant' && (
                        <Avatar className="h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 shrink-0">
                          <AvatarFallback><Bot className="h-4 w-4 text-white" /></AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md'
                          : 'bg-white/10 text-white/90 rounded-bl-md'
                      }`}>
                        {msg.content || (isLoading && msg.role === 'assistant' ? <span className="animate-pulse">正在算命中...</span> : '')}
                      </div>
                      {msg.role === 'user' && (
                        <Avatar className="h-8 w-8 bg-indigo-500 shrink-0">
                          <AvatarFallback><User className="h-4 w-4 text-white" /></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </ScrollArea>
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
                      placeholder="问点啥..."
                      disabled={isLoading}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                    <Button
                      onClick={() => sendMessage(input)}
                      disabled={isLoading || !input.trim()}
                      size="icon"
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shrink-0"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                </div>
              </CardContent>
            </Card>
            <Button variant="ghost" onClick={() => { setHasStarted(false); setMessages([]); }} className="text-white/40 hover:text-white mt-2 text-xs">
              重新选择星座和MBTI
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
