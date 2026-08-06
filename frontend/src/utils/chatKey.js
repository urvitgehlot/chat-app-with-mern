export const createChatKey = (chatType, chatId) => {
    return `${chatType}:${chatId}`;
};

export const parseChatKey = (chatKey) => {
    const [chatType, chatId] = chatKey.split(":");

    return { chatType, chatId };
};