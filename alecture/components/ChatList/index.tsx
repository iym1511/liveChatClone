import Chat from '@components/Chat';
import { ChatZone, Section, StickyHeader } from '@components/ChatList/style';
import { IChat, IDM } from '@typings/db';
import React, { FC, RefObject, VFC, forwardRef, useCallback, useEffect, useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

interface Props {
  scrollRef: RefObject<Scrollbars>;
  isReachingEnd?: boolean;
  isEmpty: boolean;
  chatSections: { [key: string]: IDM[] };
  setSize: (f: (size: number) => number) => Promise<(IDM | IChat)[][] | undefined>;
  setChatAlert: (e: boolean) => void 
}

const ChatList: FC<Props> = ({ chatSections, setSize, isEmpty, scrollRef, isReachingEnd, setChatAlert }) => {
  const onScroll = useCallback((values) => {
    // 끝에 도달하면 불러오지 않기
    if (values.scrollTop === 0 && !isReachingEnd && !isEmpty) {
      console.log('가장 위');
      setSize((prevSize) => prevSize + 1).then(() => {
        // 스크롤 위치 유지
        if (scrollRef?.current) {
          scrollRef.current?.scrollTop(scrollRef.current?.getScrollHeight() - values.scrollHeight);
        }
      });
    } else {
      // 스크롤이 가장 아래쪽에 닿았을 때
      if (values.scrollTop + values.clientHeight >= values.scrollHeight) {
        // 원하는 동작을 수행
        setChatAlert(false);
      }
    }
  }, []);

  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
        {Object.entries(chatSections).map(([date, chats]) => {
          return (
            <Section className={`section-${date}`} key={date}>
              <StickyHeader>
                <button>{date}</button>
              </StickyHeader>
              {chats.map((chat) => (
                <Chat key={chat.id} data={chat} />
              ))}
            </Section>
          );
        })}
      </Scrollbars>
    </ChatZone>
  );
};

export default ChatList;
