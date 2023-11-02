import { useCallback } from 'react';
import io from 'socket.io-client';

// 아무 key값이 들어올수 있으니 이런 형식으로 타입 지정
const sockets: {[key: string]: SocketIOClient.Socket} = {};

const backUrl = "http://localhost:3095";

const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  console.log('rerender', workspace);
  const disconnect  = useCallback(() => {
    if(workspace) {
      sockets[workspace].disconnect();
      // 연결 끊을때는 지우기
      delete sockets[workspace];
    }
  },[workspace])

  if(!workspace) {
      // 한번 맺었던 연결을 끊는 함수 (끝맺음을 잘하자)
    return [undefined, disconnect];
  }

  // 기존에 없었으면 만듦
  if(!sockets[workspace]){
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      // 연결을 할 때 폴링하지말고 웹 소켓만 사용
      transports : ['websocket'],
    })
  }
  

  // // 서버에 hello 라는 이벤트 명 으로 world라는 데이터를 보냄
  // sockets[workspace].emit('hello','world');
  // // 이벤트명 일치할때만 받음, 받는곳
  // sockets[workspace].on('message',(data) => {
  //   console.log(data);
  // });
  // sockets[workspace].on('onlineList',(data) => {
  //   console.log(data);
  // });


  return [sockets[workspace], disconnect]
}

export default useSocket;