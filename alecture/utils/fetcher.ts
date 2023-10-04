import axios from "axios";

const fetcher = (url: string) => {
  axios.get(url,{
    withCredentials : true // 로그인 쿠키 생성시켜줌
  })
  .then((res) => res.data);
};

export default fetcher 