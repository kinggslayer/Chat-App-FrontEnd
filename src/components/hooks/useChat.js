import { useState } from 'react';

export const useChat = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);

  const setActiveConversation = (chatName, chatId, isGroup = false) => {
    setActiveChat(chatName);
    setActiveChatId(chatId);
    setIsGroupChat(isGroup);
  };

  return {
    activeChat,
    activeChatId,
    isGroupChat,
    setActiveConversation,
  };
};