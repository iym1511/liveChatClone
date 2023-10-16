import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, FormEvent, useCallback, useState } from 'react';
import useSWR from 'swr';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import {
  AddButton,
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceButton,
  WorkspaceName,
  WorkspaceWrapper,
  Workspaces,
} from './style';

// 기본 프로필 랜덤 라이브러리
import gravatar from 'gravatar';
// 에러 처리 라이브러리
import {toast} from 'react-toastify';
import Channel from '@pages/Channel';
import DirectMessage from '@pages/DirectMessage';
import Menu from '@components/Menu';
import { IUser } from '@typings/db';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';

const Workspace: FC = () => {
  // modal 토글 , Menu 토글
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);

  // input은 기왕이면 다른 컴포넌트로 빼는것이 좋다(랜더링 이슈)
  const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');
  const { data: userData , error, mutate } = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 2000, // 유지기간 2초동안에는 서버에 요청x 캐시된 것 사용. / 첫번째것만 요청
  });

  const onLogout = useCallback(() => {
    axios
      .post('http://localhost:3095/api/users/logout', null, {
        withCredentials: true, // 쿠키 공유
      })
      .then((res) => {
        mutate(res.data); // 호출 : 로그아웃 / OPIMISTIC UI mutate 서버의 요청이 가기전에 화면에 표시 (인스타 ❤️, 페이스북 👍)
      });
  }, []);

  // Menu 토글
  const onClickUserProfile = useCallback((e) => {
    e.stopPropagation();
    setShowUserMenu((prev) => !prev);
  }, []);

  // modal 토글
  const onClickCreateWorkspace = useCallback(()=>{
    setShowCreateWorkspaceModal((prev) => !prev);
  },[]);

  // 워크스페이스 생성
  const onCreateWorkspace = useCallback((e) => {
    e.preventDefault();
    // 필수값들 들어가 있는지 검사 (trim() : 띄어쓰기 막아줌)
    if(!newWorkspace || !newWorkspace.trim()) return
    if(!newUrl || !newUrl.trim()) return

    axios.post('http://localhost:3095/api/workspaces', {
      workspace : newWorkspace,
      url : newUrl,
    },{
      withCredentials : true,
    }).then((res) => {
      // 워크스페이스 생성 후 초기화
      mutate(res.data);
      setShowCreateWorkspaceModal((prev) => !prev);
      setNewWorkspace('');
      setNewUrl('');
    }).catch((error) => {
      console.dir(error);
      // 에러 처리 라이브러리
      toast.error(error.response?.data, {position: 'bottom-center'});
    })
    
  },[newWorkspace, newUrl]);

  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal((prev) => !prev);
  },[])

  // data가 없으면 로그인 화면으로
  if (!userData) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <Header>

        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} alt={userData.nickname} />
            {showUserMenu && (
              <Menu style={{ right: 0, top: 38 }} show={showUserMenu} onCloseModal={onClickUserProfile}>
                <ProfileModal>
                  <img src={gravatar.url(userData.email, { s: '36px', d: 'retro' })} alt={userData.nickname} />
                  <div>
                    <span id='profile-name'>{userData.nickname}</span>
                    <span id='profile-active'>Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
              </Menu>
            )}
          </span>
        </RightMenu>

      </Header>

      <WorkspaceWrapper>
        <Workspaces>
          { // 워크스페이스 list 출력
            userData?.Workspaces?.map((a) => {
              return (
                <Link key={a.id} to={`/workspace/${123}/channel/${a.name}`}>
                  <WorkspaceButton>{a.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
                </Link>
              )
            })
          }
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>

        <Channels>
          <WorkspaceName>Sleact</WorkspaceName>
          <MenuScroll>MenuScroll</MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path="/workspace/channel" component={Channel} />
            <Route path="/workspace/dm" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>

      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label id="workspace-label">
            <span>워크스페이스 이름</span>
            <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace} />
          </Label>
          <Label id="workspace-url-label">
            <span>워크스페이스 url</span>
            <Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
          </Label>
          <Button type="submit">생성하기</Button>
        </form>
      </Modal>

    </div>
  );
};

export default Workspace;
