import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ProductContext } from './ProductContext';
import { CartContext } from './CartContext';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { allProducts, setSearchTerm } = useContext(ProductContext);
  const { setIsBudgetOpen } = useContext(CartContext);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your AI Assistant. How can I help you today? / Salam! Mein aapka AI Assistant hoon. Aaj mein aapki kya madad kar sakta hoon?' }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAIResponse = async (text) => {
    try {
      const res = await axios.post('http://127.0.0.1:5001/predict', { 
        message: text,
        products: allProducts
      });
      
      const { intent, response, search_query } = res.data;

      if (intent === 'budget_optimize') {
        setMessages(prev => [...prev, { role: 'assistant', text: response }]);
        // Removed auto-close and budget planner open to prevent disruption
      } else if (intent === 'search' && search_query) {
        setMessages(prev => [...prev, { role: 'assistant', text: response }]);
        setSearchTerm(search_query);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: response }]);
      }
    } catch (error) {
      const errorMsg = "AI Assistant is offline. Please start the AI service. / AI Assistant offline hai. Baraye meherbani AI service shuru karein.";
      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
      toast.error(errorMsg);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;
    const text = userInput;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setUserInput("");
    await handleAIResponse(text);
  };

  const startVoiceAssistant = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setMessages(prev => [...prev, { role: 'user', text: transcript }]);
        await handleAIResponse(transcript);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }

    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  return (
    <ChatContext.Provider value={{
      isChatOpen, setIsChatOpen, messages, setMessages, userInput, setUserInput,
      isListening, chatEndRef, handleSendMessage, startVoiceAssistant
    }}>
      {children}
    </ChatContext.Provider>
  );
};
