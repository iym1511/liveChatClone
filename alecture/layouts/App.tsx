import React from 'react';
import loadable from '@loadable/component';
import { Redirect, Route, Switch } from 'react-router';

// "현재 페이지를 렌더링 하는 데에 필요한 코드만 로드되도록"
// -> 빠른 초기 로딩 속도
// -> 더 나은 사용자 경험으로 이어짐
// Loadable Components는 코드 스플리팅을 편하게 하도록 도와주는 서드파티 라이브러리입니다. 이 라이브러리의 이점은 서버 사이드 렌더링을 지원한다는 것입니다
const LogIn = loadable(() => import('@pages/Login'));
const SignUp = loadable(() => import('@pages/SignUp'));
const Workspace = loadable(() => import('@layouts/Workspace'));

// Switch 여러개 라우터중 딱 하나만 화면에 표시해주는 것
// 라우터 중 하나의 페이지만 들어가면 나머지는 없는 셈이 된다.
const App = () => {
  return (
    <Switch>
      <Redirect exact path='/' to="/login"/>
      <Route path="/login" component={LogIn}/>
      <Route path="/signup" component={SignUp}/>
      // Workspace 안에서 switch route를 사용
      // Workspace 의 주소를 포함해야 안에서도 사용가능
      {/* 파라미터가 있고 파라미터가 아닌 값이 있으면 파라미터가 아닌것을 위로 보내줘야함 */}
      {/* <Route path="/workspace/sleact" component={Workspace}/> */}
      <Route path="/workspace/:workspace" component={Workspace}/>
    </Switch>
  );
};

export default App;
