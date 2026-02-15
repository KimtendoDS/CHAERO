'use client';

import React, { useState } from 'react';

// 같은 폴더(app/travel)에 있는 파일들을 불러옵니다
import RouteMaster from './RouteMaster'; 
import RouteDetail from './RouteDetail';

export default function TravelPage() {
  // step 1: RouteMaster (패키징 & 오버뷰)
  // step 2: RouteDetail (상세 스케줄 & 지도)
  // 처음엔 1번(Master)부터 보여줍니다.
  const [step, setStep] = useState<number>(1); 

  return (
    <div style={{ width: '100%', maxWidth: '430px', margin: '0 auto', background: '#020306', minHeight: '100vh' }}>
      
      {/* step이 1일 때는 Master(오버뷰)를 보여줘! */}
      {step === 1 && (
        <RouteMaster setStep={setStep} />
      )}

      {/* step이 2일 때는 Detail(상세)을 보여줘! */}
      {step === 2 && (
        <RouteDetail setStep={setStep} />
      )}
      
    </div>
  );
}