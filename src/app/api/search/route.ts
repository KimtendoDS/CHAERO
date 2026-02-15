import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('q');

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json({ documents: [] });
    }

    const KAKAO_REST_KEY = '5b6cc5f1c19f7ef3d3930986db77019b'; // 📍 꼭 REST API 키인지 확인!

    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${KAKAO_REST_KEY}`,
          // 📍 핵심: 카카오 서버가 요구하는 KA 헤더를 강제로 정의합니다.
          // 형식: os/platform; origin/domain;
          'KA': 'os/javascript; origin/http://localhost:3000',
          'Origin': 'http://localhost:3000',
        },
        cache: 'no-store'
      }
    );

    const data = await res.json();

    if (!res.ok) {
      // 만약 여기서도 에러가 나면 터미널 로그를 확인하세요.
      console.error('카카오 응답 상세 에러:', data);
      return NextResponse.json({ documents: [] }, { status: res.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('서버 내부 에러:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}