import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles,
  MessageSquare,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your AI real estate assistant for Dubai property market. How can I help you today?\n\nI can help you with:\n• Finding properties matching your criteria\n• Explaining Dubai real estate market\n• Mortgage and financing options\n• Investment advice and ROI calculations\n• Information about different areas in Dubai"
    }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage,
        session_id: sessionId
      });
      
      // Save session ID
      if (response.data.session_id) {
        setSessionId(response.data.session_id);
      }

      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.response 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your AI real estate assistant for Dubai property market. How can I help you today?"
    }]);
  };

  const suggestedQuestions = [
    "What areas in Dubai are best for investment?",
    "How does the mortgage process work in UAE?",
    "What are the costs involved in buying property?",
    "Tell me about Palm Jumeirah properties"
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col" data-testid="ai-assistant-page">
      {/* Header */}
      <div 
        className="relative rounded-2xl overflow-hidden p-6 mb-6 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600)'
        }}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-['Manrope'] flex items-center gap-2">
                AI Assistant
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </h1>
              <p className="text-muted-foreground text-sm">Your 24/7 real estate consultant</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="btn-outline-gold"
            onClick={startNewChat}
          >
            <Plus className="w-4 h-4 mr-2" /> New Chat
          </Button>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="bg-card border-border/50 flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                )}
                <div
                  className={`
                    max-w-[80%] rounded-2xl px-4 py-3
                    ${message.role === 'user' 
                      ? 'bg-[#D4AF37] text-black' 
                      : 'bg-[#1A1A1A] text-white'
                    }
                  `}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="bg-[#1A1A1A] rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-4">
            <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-[#1A1A1A] border-white/10 hover:border-[#D4AF37]/50 text-white"
                  onClick={() => {
                    setInput(question);
                  }}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about Dubai real estate..."
              className="flex-1 bg-[#1A1A1A] border-transparent focus:border-[#D4AF37]"
              disabled={loading}
              data-testid="ai-chat-input"
            />
            <Button 
              className="btn-gold"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              data-testid="ai-chat-send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistantPage;
