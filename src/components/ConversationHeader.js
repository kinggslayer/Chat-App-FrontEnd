import { ConversationHeader, Avatar } from "@chatscope/chat-ui-kit-react";
import React from "react";

const CustomConversationHeader = ({ userName, info, avatarSrc }) => {
    return (
        <ConversationHeader>
            <Avatar name={userName} src={avatarSrc} size="md" />
            <ConversationHeader.Content userName={userName} info={info} />
        </ConversationHeader>
    );
};

export default CustomConversationHeader;
