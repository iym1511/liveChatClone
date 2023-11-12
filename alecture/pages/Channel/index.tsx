import Workspace from "@layouts/Workspace";
import React, { FC, useCallback } from "react";
import { Container, Header } from "@pages/Channel/style";
import ChatList from "@components/ChatList";
import useInput from "@hooks/useInput";
import ChatBox from "@components/ChatBox";

const Channel:FC = () => {
  const [chat, onChangeChat, setChat] = useInput('');
  const onSubmitForm = useCallback((e)=>{
    e.preventDefault();
    setChat('');
  },[])

  return (  
    <Container>
      <Header>채널!</Header>
      {/* <ChatList /> */}
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
    </Container>
  );
}

export default Channel;