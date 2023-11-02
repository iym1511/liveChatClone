import { IDM } from '@typings/db';
import React, { VFC } from 'react';
import { ChatWrapper } from './style';
import gravatar from 'gravatar';

interface Props {
  data : IDM;
}

const Chat: VFC<Props> = ({ data }) => {
  const user = data.Sender;
  return (  
    <ChatWrapper>
      <div className='chat-img'>
        <img src={gravatar.url(user.email, {s : '36px', d: 'retro'})} alt={user.nickname} />
      </div>
      <div className='chat-text'>
        <div className='chat-user'>
          <b>{user.nickname}</b>
          <span>{data.createdAt}</span>
        </div>
        {data.content}
      </div>
    </ChatWrapper>
  );
}

export default Chat;