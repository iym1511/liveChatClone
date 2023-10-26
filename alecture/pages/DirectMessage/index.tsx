import React, { useCallback } from "react";

import gravator from 'gravatar';
import useSWR from "swr";
import { IUser } from "@typings/db";
import fetcher from "@utils/fetcher";
import { useParams } from "react-router";
import ChatBox from "@components/ChatBox";
import { Container, Header } from "@pages/DirectMessage/style";
import ChatList from "@components/ChatList";
import useInput from "@hooks/useInput";

const DirectMessage = () => {
  const { workspace, id } = useParams<{workspace : string, id : string}>();
  const { data: userData } = useSWR(`http://localhost:3095/api/workspaces/${workspace}/users/${id}`, fetcher);
  // 내정보
  const { data: myData } = useSWR(`http://localhost:3095/api/users`, fetcher);
  const [chat, onChangeChat,setChat] = useInput('');

  const onSubmitForm = useCallback((e)=> {
    e.preventDefault();
    setChat('');
    console.log('asd');
  },[])

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
      <ChatList />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
    </Container>
  );
}

export default DirectMessage;