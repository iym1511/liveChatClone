import React, { VFC, useCallback, useEffect, useRef } from 'react';
import { ChatArea, EachMention, Form, MentionsTextarea, SendButton, Toolbox } from '@components/ChatBox/style';
import autosize from 'autosize';
import { Mention, SuggestionDataItem } from 'react-mentions';
import useSWR from 'swr';
import { IUser } from '@typings/db';
import { useParams } from 'react-router';
import fetcher from '@utils/fetcher';
import gravatar from 'gravatar';

interface Props {
  chat: string;
  onSubmitForm: (e: any) => void;
  onChangeChat: (e: any) => void;
  placeholder?: string;
}

// 재사용 되더라도 공통되는 데이터는 여기서 hook으로 가져와도되고 재사용되는데 서로 다른 데이터는 props로 처리
const ChatBox: VFC<Props> = ({ chat, onSubmitForm, onChangeChat, placeholder }) => {
  const { workspace } = useParams<{ workspace: string }>();
  const {
    data: userData,
    error,
    mutate,
  } = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 2000, // 유지기간 2초동안에는 서버에 요청x 캐시된 것 사용. / 첫번째것만 요청
  });
  
  // 맴버 데이터
  const { data: memberData } = useSWR<IUser[]>(
    userData ? `http://localhost:3095/api/workspaces/${workspace}/members` : null,
    fetcher,
    );
    

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  
  // shft + enter 시 줄바꿈하면서 창 크기 커지는 라이브러리 사용
  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  // keydown 발생 시 작동되는 함수
  const onKeydownChat = useCallback(
    (e) => {
      if (e.key == 'Enter') {
        if (!e.shiftKey) {
          e.preventDefault();
          onSubmitForm(e);
        }
      }
    },
    [onSubmitForm],
  ); // props로 받은것들은 왠만하면 넣기

  // 공식 vscode typescript 가져옴
  const renderSuggestion = useCallback(
    (
      suggestion: SuggestionDataItem,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focus: boolean,
  ):  React.ReactNode => {
    if(!memberData) return;
    return (
      // focus로 emotion에 넘겨서 boolean값에 따라 css속성 적용 여부 설정
      <EachMention focus={focus}>
        <img src={gravatar.url(memberData[index].email, {s: '20px', d: 'retro'})} alt={memberData[index].nickname}/>
        <span>{highlightedDisplay}</span>
      </EachMention>
    )
  },
  [memberData]);

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        {/* @ 태그영역 */}
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyPress={onKeydownChat}
          placeholder={placeholder}
          inputRef={textareaRef}
          allowSuggestionsAboveCursor // 커서보다 위쪽에 Suggestion 생성
          >
        <Mention 
          appendSpaceOnAdd trigger="@" data={memberData?.map((v) => ({id : v.id, display: v.nickname})) || []}
          renderSuggestion={renderSuggestion}
        ></Mention>
        </MentionsTextarea>

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
};

export default ChatBox;
