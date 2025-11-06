import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { PageTitle } from '../components/common/PageTitle';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

export const AIChat: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'Você é um assistente de marketing especialista chamado NMS AI. Responda a perguntas sobre estratégias de marketing, mídias sociais, copywriting e SEO. Seja prestativo, criativo e forneça respostas práticas e acionáveis. Use formatação markdown para clareza quando apropriado.',
      },
    });
    setChat(chatSession);
    setMessages([{
        role: 'model',
        content: 'Olá! Sou o assistente de marketing da NMS. Como posso ajudar você a turbinar suas campanhas hoje?'
    }]);
  }, []);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: currentInput });
      const modelMessage: ChatMessage = { role: 'model', content: response.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      let errorMessageContent = 'Desculpe, ocorreu um erro ao me comunicar. Por favor, tente novamente.';
      if (error.message?.includes('Invalid API key') || error.message?.includes('API_KEY') || (error.response?.status === 401 || error.response?.status === 403)) {
        errorMessageContent = 'Erro: Chave API Gemini inválida ou não configurada. Por favor, verifique suas configurações no ambiente.';
      }
      const errorMessage: ChatMessage = { role: 'model', content: errorMessageContent };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">
      <PageTitle title="AI Chat" subtitle="Converse com um especialista em marketing a qualquer hora." />
      
      <Card className="mt-8 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light-bg dark:bg-dark-bg'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xl px-4 py-2 rounded-2xl bg-light-bg dark:bg-dark-bg">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-light-border dark:border-dark-border">
          <form onSubmit={handleSendMessage} className="flex items-center gap-4">
            <Input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte algo sobre marketing..."
              className="flex-grow"
              autoComplete="off"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="md" className="flex-shrink-0 !p-3">
                <SendIcon className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};