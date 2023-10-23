import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, VFC, useCallback } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteWorkspaceModal: (flag: boolean) => void;
}

// input 이 있으면 컴포넌트를 분리하자
// 서로 관련있는 데이터들이 가까워져서 유지보수가 편함
// VFC : Children이 없으면 사용
const InviteWorkspaceModal: VFC<Props> = ({ show, onCloseModal, setShowInviteWorkspaceModal }) => {
  // 채널명 
  const [newMember, onChangeNewMember, setNewMember] = useInput('');

  const { workspace } = useParams<{workspace : string}>();

  const { data: userData , error, mutate } = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 2000, // 유지기간 2초동안에는 서버에 요청x 캐시된 것 사용. / 첫번째것만 요청
  });

  const { data: WorkspaceData , mutate:mutateChannel} = useSWR<IChannel[]>( 
    // 로그인 했을때만 채널 가져옴
    userData ? `http://localhost:3095/api/workspaces/${workspace}/members` : null, fetcher
    );

  const onInviteMember = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!newMember || !newMember.trim()) {
      return;
    }
    axios
    .post(
      `http://localhost:3095/api/workspaces/${workspace}/members`,
      {
        email: newMember,
      },
    ).then((res)=>{
      setShowInviteWorkspaceModal(false);
      // 서버에 요청 안보냄
      mutateChannel(res.data, false);
      setNewMember('');
    }).catch((error) => {
      console.dir(error);
      toast.error(error.response?.data, {position: 'bottom-center'});
    })
  },[workspace, newMember]);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>이메일</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteWorkspaceModal;
