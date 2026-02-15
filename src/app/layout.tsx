import Script from "next/script"; // ✅ Next.js 전용 스크립트 로더

export default function RootLayout({ children }: { children: React.ReactNode }) {  
  return (
    <html lang="ko">
      <head>
        {/* ✅ 네이버 지도 스크립트 */}
        <Script
          strategy="afterInteractive" // 지도가 나오기 전 미리 로드하도록 설정
          src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`}          
        />      

        <Script 
  src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_ADDRESS_CLIENT_ID}&libraries=services"`}
  strategy="beforeInteractive" 
/>
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}