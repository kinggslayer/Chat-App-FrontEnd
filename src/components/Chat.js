import { MainContainer,ChatContainer } from "@chatscope/chat-ui-kit-react";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import '../chat.css';
import React, {useState} from "react";
import CustomSidebar from "./CustomSidebar";
import CustomConversationHeader from "./ConversationHeader";
import CustomMessageList from "./MessageList";

const Chat = () => {
    const [showMessageList, setShowMessageList] = useState(false);
    const onClick = () => {
        setShowMessageList(true);
    };
    return (
        <div className="chat" height='100px'>
            {/* <MainContainer height="500px">
                <ChatContainer> */}
                    {/* <CustomSidebar   onclick={onClick}/> */}
                    {/* <CustomConversationHeader/> */}
                     <CustomMessageList />
                {/* </ChatContainer> */}
            {/* </MainContainer>  */}
        </div>
    );
};

export default Chat;
