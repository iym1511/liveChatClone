import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@pages/SignUp/styles';
import React, { FC, VFC, useCallback } from 'react';

interface Props {
  show: boolean;
  onCloseModal: () => void;
}

// input 이 있으면 컴포넌트를 분리하자
// 서로 관련있는 데이터들이 가까워져서 유지보수가 편함
const CreateChannelModal:VFC<Props> = ({show, onCloseModal}) => {
  const [newChannel, onChangeNewChannel] = useInput('');

  const onCreateChannel = useCallback((e) => {
    e.stopPropagation();
  },[]);

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
