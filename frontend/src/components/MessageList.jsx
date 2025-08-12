// frontend/src/components/MessageList.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import { FaUserCircle, FaRobot, FaBook } from 'react-icons/fa';

const MessageList = ({ messages, isLoading, onShowSources, chatEndRef }) => {
    return (
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-4 my-6">
                    {/* Consistent icon backgrounds for both AI and User */}
                    <div className="bg-gray-900 p-2 rounded-full flex-shrink-0">
                        {msg.sender === 'ai' ? (
                            <FaRobot className="text-white text-lg" />
                        ) : (
                            <FaUserCircle className="text-white text-lg" />
                        )}
                    </div>
                    
                    <div className="flex-1 pt-1 min-w-0"> {/* Added min-w-0 to prevent overflow issues */}
                        {/* The prose classes handle markdown styling. Error text is now bold white. */}
                        <div className={`prose prose-invert max-w-none rounded-lg ${msg.sender === 'ai' ? 'bg-black/50 p-4' : ''} ${msg.isError ? 'text-white font-semibold' : 'text-gray-200'}`}>
                            <ReactMarkdown components={CodeBlock}>{msg.text}</ReactMarkdown>
                        </div>
                        
                        {/* "Show Sources" button with updated styling */}
                        {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && !isLoading && (
                            <button 
                                onClick={() => onShowSources(msg.sources)} 
                                className="mt-3 flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <FaBook /><span>Show Sources</span>
                            </button>
                        )}
                    </div>
                </div>
            ))}
            <div ref={chatEndRef} />
        </div>
    );
};

export default MessageList;