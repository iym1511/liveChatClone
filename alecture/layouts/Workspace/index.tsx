import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, FormEvent, VFC, useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { Link, Redirect, Route, Switch, useParams } from 'react-router-dom';
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
  WorkspaceModal,
  WorkspaceName,
  WorkspaceWrapper,
  Workspaces,
} from './style';

// 기본 프로필 랜덤 라이브러리
import gravatar from 'gravatar';
// 에러 처리 라이브러리
import { toast } from 'react-toastify';
import Channel from '@pages/Channel';
import DirectMessage from '@pages/DirectMessage';
import Menu from '@components/Menu';
import { IChannel, IUser } from '@typings/db';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import InviteChannelModal from '@components/InviteChannelModal';
import DMList from '@components/DMList';
import ChannelList from '@components/ChannelList';
import { disconnect } from 'process';
import useSocket from '@hooks/useSocket';

const Workspace: VFC = () => {
  // modal 토글 , Menu 토글
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);

  // input은 기왕이면 다른 컴포넌트로 빼는것이 좋다(랜더링 이슈)
  const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');

  // 본인의 위치가 이딘지 알려줌
  const { workspace } = useParams<{ workspace: string }>();

  const {
    data: userData,
    error,
    mutate,
  } = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 2000, // 유지기간 2초동안에는 서버에 요청x 캐시된 것 사용. / 첫번째것만 요청
  });

  const { data: channelData } = useSWR<IChannel[]>(
    // 로그인 했을때만 채널 가져옴
    userData ? `http://localhost:3095/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );

  // 맴버 데이터
  const { data: memberData } = useSWR<IUser[]>(
    userData ? `http://localhost:3095/api/workspaces/${workspace}/members` : null,
    fetcher,
  );

  const [socket, disconnect ] = useSocket(workspace);

  useEffect(()=>{
    if(channelData && userData && socket){
      console.log(socket);
      socket?.emit("login",{id : userData.id, channels: channelData.map((y)=> y.id)});
    }
  },[userData, channelData, socket]);

  // socket연결을 끊어줄 때
  useEffect(()=>{
    return () => {
      disconnect();
    }
  },[workspace, disconnect])

  const onLogout = useCallback(() => {
    axios
      .post('http://localhost:3095/api/users/logout', null, {
        withCredentials: true, // 쿠키 공유
      })
      .then((res) => {
        mutate(false, false); // 호출 : 로그아웃 / OPIMISTIC UI mutate 서버의 요청이 가기전에 화면에 표시 (인스타 ❤️, 페이스북 👍)
      });
  }, [mutate]);

  // Menu 토글
  const onClickUserProfile = useCallback((e) => {
    e.stopPropagation();
    setShowUserMenu((prev) => !prev);
  }, []);

  // modal 토글
  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal((prev) => !prev);
  }, []);

  // 워크스페이스 생성
  const onCreateWorkspace = useCallback(
    (e) => {
      e.preventDefault();
      // 필수값들 들어가 있는지 검사 (trim() : 띄어쓰기 막아줌)
      if (!newWorkspace || !newWorkspace.trim()) return;
      if (!newUrl || !newUrl.trim()) return;

      axios
        .post(
          'http://localhost:3095/api/workspaces',
          {
            workspace: newWorkspace,
            url: newUrl,
          },
          {
            withCredentials: true,
          },
        )
        .then((res) => {
          // 워크스페이스 생성 후 초기화
          mutate(res.data);
          setShowCreateWorkspaceModal((prev) => !prev);
          setNewWorkspace('');
          setNewUrl('');
        })
        .catch((error) => {
          console.dir(error);
          // 에러 처리 라이브러리
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newWorkspace, newUrl],
  );

  // 화면에 있는 모든 모달을 닫아주는 메소드
  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteWorkspaceModal(false);
    setShowInviteChannelModal(false);
  }, []);

  // 채널 만들기 모달
  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, []);

  // 채널 생성하기
  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  // 모달
  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  },[]);

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
                    <span id="profile-name">{userData.nickname}</span>
                    <span id="profile-active">Active</span>
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
          {
            // 워크스페이스 list 출력
            userData?.Workspaces?.map((a) => {
              return (
                <Link key={a.id} to={`/workspace/${a.url}/channel/일반`}>
                  <WorkspaceButton>{a.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
                </Link>
              );
            })
          }
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>

        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
          <MenuScroll>
            <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{ top: 95, left: 80 }}>
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
            {/* 채널,Dm 서버 생성 swr을 사용하기때문에 데이터를 props로 안넘겨줘도됨*/}
            <ChannelList />
            <DMList />
          </MenuScroll>
        </Channels>

        <Chats>
          <Switch>
            {/* 로그인,회원가입할때 ReDirect로 넘어온 주소와 해당 주소로 넘어갔을때 아래의 컴포넌트를 보여줌*/}
            <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
            <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
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
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateChannelModal}
      />
      <InviteWorkspaceModal show={showInviteWorkspaceModal} onCloseModal={onCloseModal} setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}></InviteWorkspaceModal>
      {/* 404 발생 왜지?*/}
      <InviteChannelModal show={showInviteChannelModal} onCloseModal={onCloseModal} setShowInviteChannelModal={setShowInviteChannelModal}></InviteChannelModal>
    </div>
  );
};

export default Workspace;
