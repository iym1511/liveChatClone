import React, { useCallback } from "react";

import gravator from 'gravatar';
import useSWR from "swr";
import { IDM, IUser } from "@typings/db";
import fetcher from "@utils/fetcher";
import { useParams } from "react-router";
import ChatBox from "@components/ChatBox";
import { Container, Header } from "@pages/DirectMessage/style";
import ChatList from "@components/ChatList";
import useInput from "@hooks/useInput";
import axios from "axios";

const DirectMessage = () => {
  const { workspace, id } = useParams<{workspace : string, id : string}>();
  const { data: userData } = useSWR(`http://localhost:3095/api/workspaces/${workspace}/users/${id}`, fetcher);
  // 내정보
  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher);
  const [chat, onChangeChat,setChat] = useInput('');

  // 채팅 받아오는곳
  const {data: chatData, mutate:mutateChat} = useSWR<IDM[]>( 
  `http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
  fetcher,
  );

  const onSubmitForm = useCallback((e)=> {
    e.preventDefault();

    if(chat?.trim()){
      axios.post(`http://localhost:3095/api/workspaces/${workspace}/dms/${id}/chats`,{
        content: chat,
      },{
          withCredentials: true,
      })
      .then(()=>{
        mutateChat(); //  SWR에서 데이터를 다시 불러와서 캐시를 갱신하는 역할을 합니다.
        setChat(''); // 버튼클릭 시 기존 채팅지우기
      })
      .catch(()=>{
        console.error
      })
    }
  },[chat])

  // 로딩
  if(!userData || !myData){
    return null;
  }


  return (  
    <Container>
      <Header>
        <img src={gravator.url(userData.email, { s: '24px', d: 'retro'})} alt={userData.nickname}></img>
        <span>{userData.nickname}</span>
      </Header>
      {/* 컴포넌트 위치를 미리 지정해도 좋다. */}
      {/* 전역 상태관리 라이브러리를 사용해도 컴포넌트상황에따라 props 로내려줘도 됨*/}
      <ChatList chatData={chatData}/>
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
    </Container>
  );
}

export default DirectMessage;