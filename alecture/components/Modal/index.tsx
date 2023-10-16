import React, { FC, useCallback } from "react";
import { CloseModalButton, CreateModal } from "./style";

interface Props {
  show: boolean;
  onCloseModal: (e: any) => void; // event가 있는 함수를 넘겨 줄 때 e 지정
  children: React.ReactNode;
}

const Modal:FC<Props> = ({show, children, onCloseModal}) => {

  const stopPropagation = useCallback((e) => {
    // 상위(부모)에게 이벤트가 전달되지 않게 막아줌
    e.stopPropagation();
  },[]);

  if(!show) {
    return null;
  }

  return (  
    <div>
      <CreateModal onClick={onCloseModal}>
        <div onClick={stopPropagation}>
          <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton> // &times; = 'x' 모양
          {children}
        </div>
      </CreateModal>
    </div>
  );
}

export default Modal;