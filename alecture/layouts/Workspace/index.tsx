import fetcher from "@utils/fetcher";
import axios from "axios";
import React, { FC, useCallback } from "react";
import useSWR from 'swr';
import { Link, Redirect } from 'react-router-dom';
import { Header, ProfileImg, RightMenu } from "./style";

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
            <ProfileImg src="" alt={data.nickname}/>
          </span>
        </RightMenu>
      </Header>
      <button onClick={onLogout}>로그아웃</button>
      {children}
    </div>
  );
}

export default Workspace;