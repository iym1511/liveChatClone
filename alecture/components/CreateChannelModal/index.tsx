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
  setShowCreateChannelModal: (flags: boolean) => void;
}

// input 이 있으면 컴포넌트를 분리하자
// 서로 관련있는 데이터들이 가까워져서 유지보수가 편함
// VFC : Children이 없으면 사용
const CreateChannelModal:VFC<Props> = ({show, onCloseModal, setShowCreateChannelModal}) => {
  const [newChannel, onChangeNewChannel, setNewChannel] = useInput('');
  const { workspace } = useParams<{workspace : string, channel : string}>();

  const { data: userData , error, mutate } = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 2000, // 유지기간 2초동안에는 서버에 요청x 캐시된 것 사용. / 첫번째것만 요청
  });

  const { data: channelData , mutate:mutateChannel} = useSWR<IChannel[]>( 
    // 로그인 했을때만 채널 가져옴
    userData ? `http://localhost:3095/api/workspaces/${workspace}/channels` : null, fetcher
    );

  const onCreateChannel = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    axios
    .post(
      `http://localhost:3095/api/workspaces/${workspace}/channels`,
      {
        name: newChannel,
      },
      {
        withCredentials: true,
      },
    ).then((res)=>{
      setShowCreateChannelModal(false);
      // 생성하자마자 채널리스트 다시 불러오기 
      mutateChannel();
      setNewChannel('');
    }).catch((error) => {
      console.dir(error);
      toast.error(error.response?.data, {position: 'bottom-center'});
    })
  },[newChannel]);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>채널</span>
          <Input id="channel" value={newChannel} onChange={onChangeNewChannel} />
        </Label>
        <Button type="submit">생성하기</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
