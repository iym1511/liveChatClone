import useInput from '@hooks/useInput';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Button, Error, Form, Header, Input, Label, LinkContainer, Success } from '../SignUp/styles';
import { Link } from 'react-router-dom';
import useSWR from 'swr'
import fetcher from '@utils/fetcher';

const LogIn = () => {
  // local주소가 fetcher의 매게변수로 들어간다.
  // mutate / 주기적으로 호출은 되지만 dedupingInterval 기간 내에는 캐시에서 불러옵니다.
  const {data, error, mutate} = useSWR('http://localhost:3095/api/users', fetcher,{
    dedupingInterval: 100000,
  });
  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');

  const onSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLogInError(false);
    try {
      await axios.post(
        '/api/users/login',
        {
          email,
          password,
        },
        { // 로그인 요청 시 사용자의 인증 정보를 쿠키로 전송하기 위함 (서버는 로그인한 사용자에 대한 정보를 쿠키를 통해 받음)
          withCredentials: true,
        },
      );
      mutate();
    } catch (err) {
      setLogInError(true);
    }
  }, [email,password]);

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
