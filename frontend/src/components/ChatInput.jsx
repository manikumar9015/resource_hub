// frontend/src/components/ChatInput.jsx
import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { FaPaperPlane, FaQuestionCircle } from 'react-icons/fa';

const ChatInput = ({ userInput, onInputChange, onSendMessage, onSuggestionClick, onKeyPress, isLoading, suggestions }) => {
    return (
        <div className="w-full bg-black/50 p-4 border-t border-[#282828] flex-shrink-0">
            {suggestions.length > 0 && (
                <div className="mb-3">
                    <h3 className="text-sm text-gray-400 mb-2 flex items-center gap-2"><FaQuestionCircle /> Suggestions:</h3>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i} 
                                onClick={() => onSuggestionClick(s)} 
                                className="bg-transparent hover:border-white text-white text-sm py-1.5 px-3 rounded-full transition-colors border border-gray-700 cursor-pointer"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex items-center gap-3">
                <div className="relative flex-grow">
                    <TextareaAutosize
                        value={userInput}
                        onChange={onInputChange}
                        onKeyDown={onKeyPress}
                        placeholder="Ask a question..."
                        className="w-full bg-black border border-[#282828] rounded-lg p-3 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-white resize-none shadow-sm transition-colors"
                        maxRows={5}
                        disabled={isLoading}
                    />
                    <button 
                        onClick={onSendMessage} 
                        disabled={isLoading || !userInput.trim()} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white disabled:text-gray-700 transition-colors cursor-pointer"
                    >
                        <FaPaperPlane className="text-xl" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;