import fetcher from "@utils/fetcher";
import axios from "axios";
import React, { FC, useCallback } from "react";
import useSWR from 'swr';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import { Channels, Chats, Header, MenuScroll, ProfileImg, RightMenu, WorkspaceName, WorkspaceWrapper, Workspaces } from "./style";

// 기본 프로필 랜덤 라이브러리
import gravatar from 'gravatar';

import Channel from "@pages/Channel";
import DirectMessage from "@pages/DirectMessage";

const Workspace:FC = ({children}) => {

  const {data, error, mutate} = useSWR('http://localhost:3095/api/users', fetcher,{
    dedupingInterval: 2000, // 유지기간 2초동안에는 서버에 요청x 캐시된 것 사용. / 첫번째것만 요청
  });
  
  const onLogout = useCallback(() => {
    axios.post('http://localhost:3095/api/users/logout', null, {
      withCredentials: true, // 쿠키 공유
    })
    .then((res)=>{
      mutate(res.data); // 호출 : 로그아웃 / OPIMISTIC UI mutate 서버의 요청이 가기전에 화면에 표시 (인스타 ❤️, 페이스북 👍)
    })
  },[])

  // data가 없으면 로그인 화면으로
  if(!data){
    return <Redirect to="/login" />
  }
  console.log(data);


  return (  
    <div>
      <Header>
        <RightMenu>
          <span>
            <ProfileImg src={gravatar.url(data.email, {s: '28px', d: 'retro' })} alt={data.nickname}/>
          </span>
        </RightMenu>
      </Header>
      <button onClick={onLogout}>로그아웃</button>
      <WorkspaceWrapper>
        <Workspaces>test</Workspaces>
        <Channels> 
          <WorkspaceName>Sleact</WorkspaceName>
          <MenuScroll>
            MenuScroll
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch> 
            <Route path="/workspace/channel" component={Channel}/>
            <Route path="/workspace/dm" component={DirectMessage}/>
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      {children}
    </div>
  );
}

export default Workspace;