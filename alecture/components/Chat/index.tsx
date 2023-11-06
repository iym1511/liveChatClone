import { IDM } from '@typings/db';
import React, { VFC } from 'react';
import { ChatWrapper } from './style';
import gravatar from 'gravatar';
// 시간과 날짜를 관리해주는 라이브러리
import dayjs from 'dayjs';

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
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        {data.content}
      </div>
    </ChatWrapper>
  );
}

export default Chat;