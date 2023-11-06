import Chat from "@components/Chat";
import { ChatZone, Section } from "@components/ChatList/style";
import { IDM } from "@typings/db";
import React, { VFC, useCallback, useRef } from "react";
import { Scrollbars } from 'react-custom-scrollbars';

interface Props {
  chatData? : IDM[];
}

const ChatList :VFC<Props> = ({ chatData }) => {

  const scrollbarRef = useRef(null);
  const onScroll = useCallback(() => {
  
  },[]);

  return (  
      <ChatZone>
        <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
          {chatData?.map((chat) => (
            <Chat key={chat.id} data={chat}/>
          ))}
        </Scrollbars>
      </ChatZone>
  );
}

export default ChatList;