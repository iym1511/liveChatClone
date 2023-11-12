import React, { useCallback, useRef } from 'react';

import gravator from 'gravatar';
import useSWR from 'swr';
// swr 인피니티스크롤링 전용 메서드
import useSWRInfinite from 'swr/infinite';
import { IDM, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';
import ChatBox from '@components/ChatBox';
import { Container, Header } from '@pages/DirectMessage/style';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: userData } = useSWR(`http://localhost:3095/api/workspaces/${workspace}/users/${id}`, fetcher);
  // 내정보
  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher);
  const [chat, onChangeChat, setChat] = useInput('');

  // 과거 채팅리스트에서 채팅을 치면 최신목록으로 바로 스크롤을 내려줄려면 ref를
  // 이 컴포넌트에서 props로 내려줘야하기 때문에 forwardRef를 사용해서 props로 넘겨준다
  // 💡 HTML 엘리먼트가 아닌 React 컴포넌트에서 ref prop을 사용하려면 React에서 제공하는 forwardRef()라는 함수를 사용해야 합니다
  const scrollbarRef = useRef<Scrollbars>(null);

  // 채팅 받아오는곳 (setSize : 페이지수를 바꿔줌)
  // useSWRInfinite를 쓰면 [{id:1},{id:2},{id:3},{id:4}] 1차원배열이 [[{id:1},{id:2}],[{id:3},{id:4}]] 2차원배열이 된다.
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IDM[]>(
    (index) => `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  // 데이터 40 개중에 20개씩 사져오면 첫번째페이지부터 20 + 20 + 0 세번째 페이지 0 이되면 isEmpty, isReachingEnd는 true가 됨
  // 반대의 상황에서 데이터가 45개면 20 + 20 + 5 isEmpty는 0이 아니라서 false isReachingEnd는 여전히 데이터 가져옴
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();

      if (chat?.trim()) {
        axios
          .post(
            `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats`,
            {
              content: chat,
            },
            {
              withCredentials: true,
            },
          )
          .then(() => {
            mutateChat(); //  SWR에서 데이터를 다시 불러와서 캐시를 갱신하는 역할을 합니다.
            setChat(''); // 버튼클릭 시 기존 채팅지우기
          })
          .catch(() => {
            console.error;
          });
      }
    },
    [chat],
  );

  //     (채팅이 최신것을 아래에 두기 위함) = 기존것 데이터를두고 새 데이터를 뒤집어서 출력
  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);

  // 로딩
  if (!userData || !myData) {
    return null;
  }

  return (
    <Container>
      <Header>
        <img src={gravator.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname}></img>
        <span>{userData.nickname}</span>
      </Header>
      {/* 컴포넌트 위치를 미리 지정해도 좋다. */}
      {/* 전역 상태관리 라이브러리를 사용해도 컴포넌트상황에따라 props 로 넘겨줌*/}
      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
};

export default DirectMessage;
