import React from 'react';

const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.267c-.597.043-1.15-.141-1.566-.518l-2.201-2.201a1.5 1.5 0 0 0-2.121 0l-2.201 2.201c-.415.377-.969.561-1.566.518l-3.722-.267A2.25 2.25 0 0 1 3 15.214V10.928c0-.97.616-1.813 1.5-2.097m14.25-6.118a2.25 2.25 0 0 0-2.25-2.25H5.25a2.25 2.25 0 0 0-2.25 2.25v4.286c0 .97.616 1.813 1.5 2.097" 
        />
    </svg>
);

export default ChatBubbleIcon;