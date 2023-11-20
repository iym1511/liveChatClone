import React, { useCallback, useEffect, useRef, useState } from 'react';

import gravator from 'gravatar';
import useSWR, { mutate } from 'swr';
// swr 인피니티스크롤링 전용 메서드
import useSWRInfinite from 'swr/infinite';
import { IDM, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';
import ChatBox from '@components/ChatBox';
import { ChatAlert, Container, Header } from '@pages/DirectMessage/style';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';
import { DragOver } from '@pages/Channel/style';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: userData } = useSWR(`http://localhost:3095/api/workspaces/${workspace}/users/${id}`, fetcher);
  // 내정보
  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher);
  const [chat, onChangeChat, setChat] = useInput('');
  const [chatAlert, setChatAlert] = useState(false);
  const [socket] = useSocket(workspace);
  // 이미지 드래그 엔 드롭
  const [dragOver, setDragOver] = useState(false);

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

      if (chat?.trim() && chatData) {
        // 💡 옵티미스틱 UI
        const savedChat = chat;
        // 서버쪽에 다녀오지 않아도 성공해서 데이터가 있는거처럼 보이게 미리 만듦
        mutateChat((prevChatData) => {
          // infinite 스크롤링은 2차원 배열이다.
          prevChatData?.[0].unshift({
            // unshift : 앞쪽에 추가
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
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
          })
          .catch(() => {
            console.error;
          });
      }
    },
    [chat, chatData, myData, userData, workspace, id],
  );

  //     (채팅이 최신것을 아래에 두기 위함) = 기존것 데이터를두고 새 데이터를 뒤집어서 출력 / flat() 배열을 1차원 배열로 만들어줌
  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);

  // DM 데이터 처리 (실시간으로 dm을 받는 암수)
  const onMessage = useCallback(
    (data: IDM) => {
      // myData.id !== Number(id) 내 채팅이 아닌것의 조건을 빼버리면 내 메시지가 두번 출력되는 현상 발생
      if (data.SenderId === Number(id) && myData.id !== Number(id)) {
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
    [id, myData, mutateChat],
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

    // 사진 선택 버튼
    const onChangeFile = useCallback((e) => {
      e.preventDefault();
      console.log(e);
      const formData = new FormData();
      if (e.target.files) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.target.files.length; i++) {
          // If dropped items aren't files, reject them
          if (e.target.files[i].kind === 'file') {
            const file = e.target.files[i].getAsFile();
            console.log(e, '.... file[' + i + '].name = ' + file.name);
            formData.append('image', file);
          }
        }
        axios.post(`/api/workspaces/${workspace}/dms/${id}/images`, formData).then(()=> {
          setDragOver(false);
          mutateChat(); // 데이터 정리? 정렬?
        });
      }
    },[]);

    const onDrop = useCallback(
      (e) => {
        e.preventDefault();
        console.log(e);
        const formData = new FormData();
        if (e.dataTransfer.items) {
          // Use DataTransferItemList interface to access the file(s)
          for (let i = 0; i < e.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (e.dataTransfer.items[i].kind === 'file') {
              const file = e.dataTransfer.items[i].getAsFile();
              console.log('... file[' + i + '].name = ' + file.name);
              formData.append('image', file);
            }
          }
        } else {
          // Use DataTransfer interface to access the file(s)
          for (let i = 0; i < e.dataTransfer.files.length; i++) {
            console.log('... file[' + i + '].name = ' + e.dataTransfer.files[i].name);
            formData.append('image', e.dataTransfer.files[i]);
          }
        }
        axios.post(`/api/workspaces/${workspace}/dms/${id}/images`, formData).then(() => {
          setDragOver(false);
          localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
          mutateChat();
        });
      },
      [workspace, id, mutateChat],
    );

  // 업로드css화면 드래그 하는동안 보이게하는 함수
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    console.log(e);
    setDragOver(true);
  },[])


  // 로딩
  if (!userData || !myData) {
    return null;
  }

  return (
    // 이미지 드래그엔  드롭
    <Container onDrop={onDrop} onDragOver={onDragOver}>
      <Header>
        <img src={gravator.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname}></img>
        <span>{userData.nickname}</span>
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
      {chatAlert && (
        <ChatAlert onClick={newChatClick}>
          새로운 채팅이 있습니다!
        </ChatAlert>
      )}
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
      <input type="file" multiple onChange={onChangeFile}/>
      {dragOver && <DragOver>업로드!</DragOver>}
    </Container>
  );
};

export default DirectMessage;
