import { IChat, IDM } from '@typings/db';
import React, { VFC, memo, useMemo } from 'react';
import { ChatWrapper } from './style';
import gravatar from 'gravatar';
// 시간과 날짜를 관리해주는 라이브러리
import dayjs from 'dayjs';
import regexifyString from 'regexify-string';
import { Link, useParams } from 'react-router-dom';

interface Props {
  data : (IDM | IChat);
}

const Chat: VFC<Props> = ({ data }) => {
  const { workspace } = useParams<{ workspace: string }>();
  const user = 'Sender' in data ? data.Sender : data.User;

  // @[제로초1](7)
  // \d 숫자 +는 1개 이상 ?는 0개나 1개, *는 0개 이상 g는 모두찾기
  // @[제로초]12](7)
  // +? 1개이상 최대한 조금
  // |는 또는을 의미하고 \n는 줄바꿈

  // useMemo (값을 캐싱)
  // props가 똑같으면 부모컴포넌트는 바껴도 자식컴포넌트는 안바뀐다 (리랜더링 안댐)
  const result = useMemo(() => regexifyString({
    input: data.content,
    pattern: /@\[(.+?)]\((\d+?)\)|\n/g, // 줄바꿈도 구현되어 있음
    // 정규식에 매칭되는것이 걸림
    decorator(match, index){
      const arr: string[] | null = match.match(/@\[(.+?)]\((\d+?)\)/)!; // 아이디 찾음
      if(arr){
        return(
          // 태그를 한 그사람 workspace로 이동
          <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
            @{arr[1]}
          </Link>
        )
      }
      return <br key={index} />; // 줄바꾸기
    },
  }),[data.content]);

  return (  
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{result}</p>
      </div>
    </ChatWrapper>
  );
}
// React.memo를 사용하여 컴포넌트 캐싱 
export default memo(Chat);