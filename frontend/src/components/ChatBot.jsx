// Import React and necessary icons
import React, { useContext, useState, useEffect } from 'react';
import { X, Mic, MicOff, RotateCcw, ChevronRight, MessageSquare, Calculator } from 'lucide-react';
import { ShopContext } from '../context/ShopContext'; // Global state context

const ChatBot = () => {
  // Extract chatbot and budget data from ShopContext
  const { 
    isChatOpen, setIsChatOpen, messages, setMessages, userInput, setUserInput,
    isListening, chatEndRef, handleSendMessage, startVoiceAssistant,
    isNotAdmin, setIsBudgetOpen, isOverBudget
  } = useContext(ShopContext);

  // --- RESPONSIVE LOGIC (Mobile check) ---
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;

  // Do not show chatbot for admin users
  if (!isNotAdmin) return null;

  return (
    <>
      {/* Floating Buttons (Right side buttons) */}
      <div style={{...floatingContainer, bottom: isMobile ? '20px' : '30px', right: isMobile ? '20px' : '30px'}}>
        {/* Button to open Budget Planner */}
        <button onClick={() => setIsBudgetOpen(true)} style={{ ...fabStyle, width: isMobile ? '50px' : '60px', height: isMobile ? '50px' : '60px', backgroundColor: isOverBudget ? '#ef4444' : '#4ade80' }} title="Budget Planner">
          <Calculator size={isMobile ? 20 : 24} color="#fff" />
        </button>
        {/* Button to open Smart Assistant */}
        <button onClick={() => setIsChatOpen(!isChatOpen)} style={{ ...fabStyle, width: isMobile ? '50px' : '60px', height: isMobile ? '50px' : '60px', backgroundColor: '#111' }} title="Smart Assistant">
          <MessageSquare size={isMobile ? 20 : 24} color="#fff" />
        </button>
      </div>

      {/* Chat Window (When chatbot is open) */}
      {isChatOpen && (
        <div style={{
          ...chatWindow, 
          bottom: isMobile ? '80px' : '100px', 
          right: isMobile ? '10px' : '30px', 
          width: isMobile ? '90vw' : '330px',
          height: isMobile ? '70vh' : '520px'
        }}>
          {/* Chat Header */}
          <div style={chatHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={onlineDot}></div>
              <span>Smart Assistant</span>
            </div>
            <X size={18} onClick={() => setIsChatOpen(false)} style={{ cursor: 'pointer' }} />
          </div>
          
          {/* Message Area */}
          <div style={messageArea}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...msgBubble, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: m.role === 'user' ? '#111' : '#f0f0f0', color: m.role === 'user' ? '#fff' : '#111' }}>
                {m.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input and Voice Buttons */}
          <div style={optionsContainerStyle}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="Ask a question..." 
                style={inputStyle}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <button type="submit" style={sendButtonStyle}>
                <ChevronRight size={22} />
              </button>
            </form>

            <div style={buttonsWrapperStyle}>
              {/* Voice Assistant button */}
              <button 
                onClick={startVoiceAssistant} 
                style={{
                  ...optionButtonStyle, 
                  backgroundColor: isListening ? '#ef4444' : '#f3f4f6', 
                  color: isListening ? '#fff' : '#111',
                }}
              >
                {isListening ? (
                  <><MicOff size={18} /> Listening... (Stop)</>
                ) : (
                  <><Mic size={18} /> Voice Assistant (Speak)</>
                )}
              </button>

              {/* Button to reset chat */}
              <button onClick={() => { setMessages([{ role:'assistant', text:'Chat has been reset. How can I assist you further?'}]); }} style={resetBtnStyle}>
                <RotateCcw size={14} /> Reset Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Styles
const floatingContainer = { position: 'fixed', bottom: '30px', right: '30px', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 1000 };
const fabStyle = { width: '60px', height: '60px', borderRadius: '50%', border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.3s' };
const chatWindow = { position: 'fixed', bottom: '100px', right: '30px', width: '330px', height: '520px', backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10002 };
const chatHeader = { padding: '15px', backgroundColor: '#111', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600' };
const onlineDot = { width: '8px', height: '8px', backgroundColor: '#4ade80', borderRadius: '50%' };
const messageArea = { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' };
const msgBubble = { padding: '10px 14px', borderRadius: '15px', fontSize: '13px', maxWidth: '85%', lineHeight: '1.4' };
const optionsContainerStyle = { padding: '12px', backgroundColor: '#f9fafb', borderTop: '1px solid #eee' };
const inputStyle = { flex: 1, padding: '12px 18px', borderRadius: '30px', border: '1px solid #e0e0e0', outline: 'none', fontSize: '14px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' };
const sendButtonStyle = { backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const buttonsWrapperStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };
const optionButtonStyle = { border: 'none', padding: '12px', borderRadius: '25px', fontSize: '12.5px', cursor: 'pointer', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', gap: '10px' };
const resetBtnStyle = { background: 'none', border: 'none', color: '#999', fontSize: '11px', cursor: 'pointer', marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };

export default ChatBot;
