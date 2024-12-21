import { useState, useEffect } from 'react';

export const useMessages = (host, activeChatId, isGroupChat, myUserId) => {
  const [messages, setMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChatId) return;

      try {
        const endpoint = isGroupChat
          ? `${host}/api/groups/${activeChatId}/messages`
          : `${host}/api/messages/${activeChatId}?senderId=${myUserId}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (response.ok) {
          isGroupChat? setGroupMessages(data):setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [activeChatId, myUserId, isGroupChat, host]);

//   const addMessage = (message) => {
//     setMessages(prevMessages => [...prevMessages, message]);
//   };
const addMessage = (message) => {
    console.log("helllo");
    setMessages((prevMessages) => {
      const exists = prevMessages.some(
        (msg) =>
          msg.createdAt === message.createdAt &&
          msg.sender === message.sender &&
          msg.content === message.content
      );
      if (!exists) {
        return [...prevMessages, message];
      }
      console.log("bhak");
      return prevMessages;
    });
  };
    const addgroupMessage = (message) => {
    setGroupMessages(prevMessages => [...prevMessages, message]);
  };


  return { messages, addMessage ,addgroupMessage,groupMessages};
};