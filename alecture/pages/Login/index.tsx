import useInput from '@hooks/useInput';
import axios from 'axios';
import React, { FC, VFC, useCallback, useEffect, useState } from 'react';
import { Button, Error, Form, Header, Input, Label, LinkContainer, Success } from '../SignUp/styles';
import { Link, Redirect } from 'react-router-dom';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';

const LogIn:VFC = () => {
  // local주소가 fetcher의 매게변수로 들어간다.
  // mutate / 주기적으로 호출은 되지만 dedupingInterval 기간 내에는 캐시에서 불러옵니다.
  // 자기가 원할때 호출
  // data, error가 바뀌는순간 rerender
  const {data, error, mutate} = useSWR('http://localhost:3095/api/users', fetcher,{
    dedupingInterval: 2000, // 유지기간 2초동안에는 서버에 요청x 캐시된 것 사용. / 첫번째것만 요청
  });
  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setLogInError(false);
      axios
        .post(
          'http://localhost:3095/api/users/login',
          { email, password },
          {
            withCredentials: true,
          },
        )
        .then((response) => {
          mutate(response.data);
        })
        .catch((error) => {
          setLogInError(error.response?.status === 401);
        });
    },
    [email, password],
  );

  console.log(data);
  if (data === undefined) {
    return <div>로딩중...</div>;
  }

  // 내 정보가 들어가면 channel 이동 workspace의 children으로 channel 컴포넌트가 존재
  if(data) {
    return <Redirect to="/workspace/channel" />
  }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {logInError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default LogIn;
