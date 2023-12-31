// import useSocket from '@hooks/useSocket';
// import { CollapseButton } from '@components/DMList/styles';
// import useSocket from '@hooks/useSocket';
import { IUser, IUserWithOnline } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import useSWR from 'swr';
import { CollapseButton } from '@components/DMList/styles';
import { NavLink } from 'react-router-dom';
import useSocket from '@hooks/useSocket';
import EachDM from '@components/EachDM/EachDM';

const DMList: FC = () => {

  const { workspace } = useParams<{ workspace?: string }>();
  const [socket] = useSocket(workspace);
  const { data: userData, error, mutate } = useSWR<IUser>('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 2000, // 2초
  });
  
  console.log(workspace);
  const { data: memberData } = useSWR<IUserWithOnline[]>(
    userData ? `http://localhost:3095/api/workspaces/${workspace}/members` : null,
    fetcher,
  );

  // const [socket] = useSocket(workspace);
  const [channelCollapse, setChannelCollapse] = useState(false);
  const [onlineList, setOnlineList] = useState<number[]>([]);

  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

  useEffect(() => {
    console.log('DMList: workspace 바꼈다', workspace);
    setOnlineList([]);
  }, [workspace]);

  useEffect(() => {
    // 서버에 누가 들어왔는지 확인
    socket?.on('onlineList', (data: number[]) => {
      setOnlineList(data);
    });
    // socket?.on('dm', onMessage);
    // console.log('socket on dm', socket?.hasListeners('dm'), socket);
    return () => {
      // socket?.off('dm', onMessage);
      // console.log('socket off dm', socket?.hasListeners('dm'));
      socket?.off('onlineList');
    };
  }, [socket]);

  return (
    <>
      <h2>
        <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
          <i
            className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
            data-qa="channel-section-collapse"
            aria-hidden="true"
          />
        </CollapseButton>
        <span>Direct Messages</span>
      </h2>
      <div>
        {!channelCollapse &&
          memberData?.map((member) => {
            const isOnline = onlineList.includes(member.id);
            return (
              <EachDM key={member.id} member={member} isOnline={isOnline}/> // 안본 메시지 알람을 위해 boolean값 props
              // NavLink 는 activeClassName에 selected를 주어 클릭시 하이라이트를 편하게 줄 수 있다.
              // <NavLink key={member.id} activeClassName="selected" to={`/workspace/${workspace}/dm/${member.id}`}>
              //    {/* Online일때 빈 아이콘이 초록색으로 변경됨 */}
              //   <i
              //     className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
              //       isOnline ? 'c-presence--active c-icon--presence-online' : 'c-icon--presence-offline'
              //     }`}
              //     aria-hidden="true"
              //     data-qa="presence_indicator"
              //     data-qa-presence-self="false"
              //     data-qa-presence-active="false"
              //     data-qa-presence-dnd="false"
              //   />
              //   <span>{member.nickname}</span>
              //   {member.id === userData?.id && <span> (나)</span>}
              // </NavLink>
            );
          })}
      </div>
    </>
  );
};

export default DMList;
