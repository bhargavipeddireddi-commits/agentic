import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import API from '../services/api';
import useAuthStore from '../store/useAuthStore';
import ReactMarkdown from 'react-markdown'; // I should have installed this, let me check

const Assistant = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (user) {
      setMessages([
        { 
          role: 'assistant', 
          content: `Hello ${user?.profile?.fullName || 'there'}! I'm your Academic AI Assistant. How can I help you with your exams, electives, or career goals today?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [user]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestions = [
    "When is my next exam?",
    "Show elective recommendations",
    "What is the attendance policy?",
    "Show my profile details",
    "What are the career prospects?",
    "Campus events this week"
  ];

  const handleSend = async (textToSubmit) => {
    const query = typeof textToSubmit === 'string' ? textToSubmit : input;
    if (!query.trim() || loading) return;

    const userMessage = { role: 'user', content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await API.post('/assistant/query', { query });
      const assistantMessage = { 
        role: 'assistant', 
        content: response.data.response || response.data || "I'm not sure how to answer that. Could you rephrase?", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble processing that right now. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto border border-border rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-text">Academic Assistant</h3>
            <div className="flex items-center text-xs text-green-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
              Online & Ready
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, i) => (
          <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-primary text-white ml-3' : 'bg-gray-100 text-gray-500 mr-3'}`}>
                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl ${message.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-100 text-text rounded-tl-none'}`}>
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <p className={`text-[10px] mt-2 opacity-50 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[80%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-500 mr-3 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input */}
      <div className="p-6 border-t border-border bg-white">
        {(messages.length === 1 || messages[messages.length - 1]?.content?.toLowerCase().includes('help') || messages[messages.length - 1]?.content?.toLowerCase().includes('assistant')) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(s)}
                disabled={loading}
                className="text-xs font-semibold px-3 py-2 bg-gray-50 border border-border rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask about exams, electives, or policies..."
            className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all ${input.trim() ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-widest">Powered by SSA AI Model</p>
      </div>
    </div>
  );
};

export default Assistant;
