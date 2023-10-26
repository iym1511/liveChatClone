import React, { VFC, useCallback, useEffect, useRef } from "react";
import { ChatArea, EachMention, Form, MentionsTextarea, SendButton, Toolbox } from '@components/ChatBox/style';
import autosize from 'autosize';

interface Props {
  chat : string;
  onSubmitForm: (e: any) => void;
  onChangeChat: (e: any) => void;
  placeholder?: string;
}

// 재사용 되더라도 공통되는 데이터는 여기서 hook으로 가져와도되고 재사용되는데 서로 다른 데이터는 props로 처리
const ChatBox:VFC<Props> = ({chat, onSubmitForm, onChangeChat, placeholder}) => {

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // shft + enter 시 줄바꿈하면서 창 크기 커지는 라이브러리 사용
  useEffect(()=>{
    if(textareaRef.current){
      autosize(textareaRef.current);
    }
  },[])

  // keydown 발생 시 작동되는 함수
  const onKeydownChat = useCallback((e)=>{
    if(e.key == 'Enter'){
      if(!e.shiftKey){
        e.preventDefault();
        onSubmitForm(e);
      }
    }
  },[]);

  return (  
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea id="editor-chat" value={chat} onChange={onChangeChat} onKeyDown={onKeydownChat} placeholder={placeholder} ref={textareaRef}/>
        <Toolbox>
        <SendButton
            className={
              'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
              (chat?.trim() ? '' : ' c-texty_input__button--disabled')
            }
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
}
 
export default ChatBox;