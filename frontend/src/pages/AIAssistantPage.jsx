import React, { useState, useRef, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import { AuthContext } from '../context/AuthContext';

import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import ChatInput from '../components/ChatInput';

Modal.setAppElement('#root');

const AIAssistantPage = () => {
    const { resourceId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [sessionId, setSessionId] = useState(location.state?.sessionId);
    const [resourceTitle, setResourceTitle] = useState('');
    
    const [messages, setMessages] = useState([
        { id: Date.now(), text: "Hello! I've processed the document. Ask me anything!", sender: 'ai', sources: [] }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentSources, setCurrentSources] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
    useEffect(scrollToBottom, [messages, isLoading, suggestions]);

    useEffect(() => {
        if (!sessionId) {
            alert("Could not establish a chat session. Please return to the homepage and try again.");
            navigate('/');
        }
        const fetchTitle = async () => {
            try {
                // Assuming the base URL is set up in an axios instance, otherwise use full URL.
                const res = await axios.get(`/api/resources/${resourceId}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setResourceTitle(res.data.title);
            } catch (err) { console.error("Could not fetch resource title", err); }
        };
        if (user?.token) { fetchTitle(); }
    }, [sessionId, resourceId, user?.token, navigate]);

    // --- (All handler functions remain unchanged) ---
    const handleSendMessage = async (messageText = userInput) => {
        if (!messageText.trim() || isLoading) return;
        const userMessage = { id: Date.now(), text: messageText, sender: 'user', sources: [] };
        const aiPlaceholder = { id: Date.now() + 1, text: '', sender: 'ai', sources: [] };
        const historyForAPI = messages.slice(-4).map(msg => ({ sender: msg.sender, text: msg.text }));
        
        setMessages(prev => [...prev, userMessage, aiPlaceholder]);
        setUserInput('');
        setSuggestions([]);
        setIsLoading(true);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_PYTHON_API_URL}/query/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, question: messageText, chat_history: historyForAPI }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const sourcesHeader = response.headers.get('X-Source-Chunks');
            const decodedSources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : [];
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let finalAnswer = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                finalAnswer += chunk;
                setMessages(prev => prev.map(msg => msg.id === aiPlaceholder.id ? { ...msg, text: finalAnswer, sources: decodedSources } : msg));
            }
            
            const answerParts = finalAnswer.split('SUGGESTION:');
            const mainAnswer = answerParts[0].trim();
            const extractedSuggestions = answerParts.slice(1).map(s => s.trim());
            
            setMessages(prev => prev.map(msg => msg.id === aiPlaceholder.id ? { ...msg, text: mainAnswer } : msg));
            setSuggestions(extractedSuggestions);
        } catch (error) {
            console.error("Request failed:", error);
            setMessages(prev => prev.map(msg => msg.id === aiPlaceholder.id ? { ...msg, text: 'Sorry, I encountered an error.', isError: true } : msg));
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        if (messages.length <= 1) return;
        setIsExporting(true);
        try {
            const history = messages.map(msg => ({ sender: msg.sender, text: msg.text }));
            const res = await axios.post(`${import.meta.env.VITE_PYTHON_API_URL}/export/pdf`, { chat_history: history }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'DocuMentor_Summary.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Sorry, there was an error creating your PDF report.");
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
    const openSourcesModal = (sources) => { setCurrentSources(sources); setModalIsOpen(true); };

    // --- The NEW, clean render block ---
    return (
        // Main chat container with updated styling
        <div className="flex flex-col border border-[#282828] rounded-lg shadow-xl h-[calc(100vh-7rem)] bg-[#181818]">
            <ChatHeader
                title={resourceTitle}
                onExport={handleExport}
                isExporting={isExporting}
                exportDisabled={isExporting || messages.length <= 1}
            />

            <MessageList
                messages={messages}
                isLoading={isLoading}
                onShowSources={openSourcesModal}
                chatEndRef={chatEndRef}
            />

            <ChatInput
                userInput={userInput}
                onInputChange={(e) => setUserInput(e.target.value)}
                onSendMessage={handleSendMessage}
                onSuggestionClick={handleSendMessage}
                onKeyPress={handleKeyPress}
                isLoading={isLoading}
                suggestions={suggestions}
            />
            
            {/* Modal with updated styling */}
            <Modal 
                isOpen={modalIsOpen} 
                onRequestClose={() => setModalIsOpen(false)} 
                style={{ 
                    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 50 }, 
                    content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', background: '#181818', border: '1px solid #282828', borderRadius: '10px', color: 'white', maxWidth: '90%', width: '800px', padding: '2rem' } 
                }} 
                contentLabel="Source Material"
            >
                <h2 className="text-2xl font-bold mb-4 text-white">Source Material</h2>
                <div className="max-h-[60vh] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {currentSources.map((source, index) => (
                        <div key={index} className="bg-black p-4 mb-3 rounded-lg border border-[#282828]">
                            <p className="text-gray-300 whitespace-pre-wrap">{source}</p>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={() => setModalIsOpen(false)} 
                    className="mt-6 w-full font-bold py-2 px-4 rounded-full text-black bg-white hover:bg-gray-300 transition-all cursor-pointer"
                >
                    Close
                </button>
            </Modal>
        </div>
    );
};

export default AIAssistantPage;