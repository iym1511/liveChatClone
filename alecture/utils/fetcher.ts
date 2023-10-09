import axios from "axios";

// 기존 방식은 프로미스 반환을 해주지 않아 데이터저장이 이루어 지지 않았음
// const fetcher = (url:string) => axios.get(url).then((res) => res.data);

const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url, {
      withCredentials: true, // 로그인 쿠키 생성시켜줌
    });
    return response.data;
  } catch (error) {
    // 에러 처리
    console.error("Fetch error:", error);
    throw error; // 에러를 다시 던져서 SWR에서 에러를 처리할 수 있도록 함
  }
};

export default fetcher;