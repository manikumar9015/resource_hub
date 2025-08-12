// frontend/src/components/ChatHeader.jsx
import React from 'react';
import { FiDownload, FiLoader } from 'react-icons/fi';

const ChatHeader = ({ title, onExport, isExporting, exportDisabled }) => {
    return (
        <div className="flex items-center justify-between p-3 border-b border-[#282828] flex-shrink-0">
            <h1 className="text-md font-semibold text-gray-400 truncate">
                Chat about: <span className="text-white font-bold">{title}</span>
            </h1>
            <button
                title="Export Conversation"
                onClick={onExport}
                disabled={exportDisabled}
                className="flex items-center gap-2 text-sm bg-white hover:bg-gray-300 text-black font-bold py-2 px-4 rounded-full transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
                {isExporting ? <FiLoader className="animate-spin" /> : <FiDownload />}
                <span>Export PDF</span>
            </button>
        </div>
    );
};

export default ChatHeader;