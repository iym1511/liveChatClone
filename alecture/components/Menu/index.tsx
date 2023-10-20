import { CloseModalButton, CreateMenu } from "@components/Menu/style";
import React, {CSSProperties, FC, useCallback } from "react";

// typescript 는 프롭 타입 지정 필수
interface Props {
  show : boolean;
  onCloseModal: (e:any) => void; // event가 있는 함수를 넘겨 줄 때 e 지정
  style: CSSProperties; // css Props
  closeButton?: boolean;
  children: React.ReactNode;
}

const Menu: FC<Props> = ({children, style, show, onCloseModal, closeButton}) => {
  const stopPropagation = useCallback((e)=>{
    // 클릭이 부모테그에선 먹히지않고 본인만 적용
    e.stopPropagation();
  },[])
  
  if (!show) return null;

  return (  
    <CreateMenu onClick={onCloseModal}>
      <div style={style} onClick={stopPropagation}>
        {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
        {children} 
      </div>
    </CreateMenu>
  ); 
}

// props들 의 기본값
Menu.defaultProps = {
  closeButton: true,
}

export default Menu;