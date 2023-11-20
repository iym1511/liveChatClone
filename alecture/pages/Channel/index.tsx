import Workspace from '@layouts/Workspace';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Container, Header } from '@pages/Channel/style';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import ChatBox from '@components/ChatBox';
import { ChatAlert } from '@pages/DirectMessage/style';
import axios from 'axios';
import useSWRInfinite from 'swr/infinite';
import fetcher from '@utils/fetcher';
import { IChannel, IChat, IDM, IUser } from '@typings/db';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';
import useSWR from 'swr';
import { useParams } from 'react-router';
import makeSection from '@utils/makeSection';
import InviteChannelModal from '@components/InviteChannelModal';

const Channel: FC = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();

  // 내정보
  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher);
  const [chat, onChangeChat, setChat] = useInput('');
  const [chatAlert, setChatAlert] = useState(false);
  const [socket] = useSocket(workspace);
  const [showInviteChannelModal ,setShowInviteChannelModal] = useState(false);
  const {data: channelData} = useSWR<IChannel>(`http://localhost:3095/api/workspaces/${workspace}/channels/${channel}`,fetcher);

  // 옵티미스틱 UI 는 서버에 가기전에 바로 미리 보여준다. 
  // 💡 revalidate() 현재로써는 mutate()를 해주면 순서가 정렬됨
  // 0초 A: 안녕~(optimistic UI)
  // 1초 B: 안녕~
  // 2초 A: 안녕~(실제서버)

  // 과거 채팅리스트에서 채팅을 치면 최신목록으로 바로 스크롤을 내려줄려면 ref를
  // 이 컴포넌트에서 props로 내려줘야하기 때문에 forwardRef를 사용해서 props로 넘겨준다
  // 💡 HTML 엘리먼트가 아닌 React 컴포넌트에서 ref prop을 사용하려면 React에서 제공하는 forwardRef()라는 함수를 사용해야 합니다
  const scrollbarRef = useRef<Scrollbars>(null);
  

    // 맴버 데이터
    const { data: channelMembersData } = useSWR<IUser[]>(
      myData ? `http://localhost:3095/api/workspaces/${workspace}/members` : null,
      fetcher,
    );

  // 채팅 받아오는곳 (setSize : 페이지수를 바꿔줌)
  // useSWRInfinite를 쓰면 [{id:1},{id:2},{id:3},{id:4}] 1차원배열이 [[{id:1},{id:2}],[{id:3},{id:4}]] 2차원배열이 된다.
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IChat[]>(
    (index) => `http://localhost:3095/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  // 데이터 40 개중에 20개씩 사져오면 첫번째페이지부터 20 + 20 + 0 세번째 페이지 0 이되면 isEmpty, isReachingEnd는 true가 됨
  // 반대의 상황에서 데이터가 45개면 20 + 20 + 5 isEmpty는 0이 아니라서 false isReachingEnd는 여전히 데이터 가져옴
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();

      if (chat?.trim() && chatData && channelData) {
        // 💡 옵티미스틱 UI
        const savedChat = chat;
        // 서버쪽에 다녀오지 않아도 성공해서 데이터가 있는거처럼 보이게 미리 만듦
        mutateChat((prevChatData) => {
          // infinite 스크롤링은 2차원 배열이다.
          prevChatData?.[0].unshift({
            // unshift : 앞쪽에 추가
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            UserId: myData.id,
            User: myData,
            ChannelId: channelData.id,
            Channel: channelData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false) // 옵티미스틱 UI 할땐 이부분이 항상 false
          .then(() => {
            setChat(''); // 버튼클릭 시 기존 채팅지우기
            scrollbarRef.current?.scrollToBottom(); // 채팅 첬을때 맨 아래로
          });

        axios
          .post(
            `http://localhost:3095/api/workspaces/${workspace}/channels/${channel}/chats`,
            {
              content: chat,
            },
            {
              withCredentials: true,
            },
          )
          .then(() => {
            mutateChat(); //  SWR에서 데이터를 다시 불러와서 캐시를 갱신하는 역할을 합니다.
          })
          .catch(() => {
            console.error;
          });
      }
    },
    [chat, chatData, myData, channelData, workspace, channel],
  );

  //     (채팅이 최신것을 아래에 두기 위함) = 기존것 데이터를두고 새 데이터를 뒤집어서 출력 / flat() 배열을 1차원 배열로 만들어줌
  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);

  // DM 데이터 처리 (실시간으로 dm을 받는 암수)
  const onMessage = useCallback(
    (data: IChat) => {
      // myData.id !== Number(id) 내 채팅이 아닌것의 조건을 빼버리면 내 메시지가 두번 출력되는 현상 발생
      if (data.Channel.name === channel && data.UserId !== myData?.id) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data); // 가장 최신 배열에 가장 최신으로 데이터를 넣기 unshift: 맨앞push
          return chatData;
        }, false).then(() => {
          // 내가 스크롤바를 150px 이상 올렸을 때는 남이 채팅을 쳐도 스크롤바가 내려가지않음
          // 150px 이하로 찔끔 올렸을때는 남이 채팅 첬을대 스크롤바가 내려감
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              console.log('scrollToBottom!', scrollbarRef.current?.getValues());
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom(); // 맨 아래로
              }, 100);
            } else {
              console.log('채팅왔어!');
              setChatAlert(true);
            }
          }
        });
      }
    },
    [channel, myData, mutateChat],
  );

  const newChatClick = () => {
    setChatAlert(false);
    setTimeout(() => {
      scrollbarRef.current?.scrollToBottom(); // 맨 아래로
    }, 100);
  };

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);

  // 로딩 시 스크롤바 제일 아래로
  useEffect(() => {
    if (chatData?.length === 1) {
      // 채팅 데이터가 있어서 불러온 경우
      scrollbarRef.current?.scrollToBottom(); // 가장 아래쪽으로 내려줌
    }
  }, [chatData]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  },[]);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  },[])

  // 로딩
  if (!myData || !myData) {
    return null;
  }

  return (
    <Container>
      <Header>
        <span>#{channel}</span>
        <div className='header-right'>
          <span>{channelMembersData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia_view_header__button"
            aria-Label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          ></button>
          <i className='c-icon p-ia__view_header__button_icon c-icon--add-user' aria-hidden="true" />
        </div>
      </Header>
      {/* 컴포넌트 위치를 미리 지정해도 좋다. */}
      {/* 전역 상태관리 라이브러리를 사용해도 컴포넌트상황에따라 props 로 넘겨줌*/}
      <ChatList
        chatSections={chatSections}
        scrollRef={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
        setChatAlert={setChatAlert}
      />
      {chatAlert && <ChatAlert onClick={newChatClick}>새로운 채팅이 있습니다!</ChatAlert>}
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
      <InviteChannelModal 
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
    </Container>
  );
};

export default Channel;
