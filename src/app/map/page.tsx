'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { ChevronLeft, Navigation, Coffee, Utensils, MapPin } from 'lucide-react';

export default function MapPath({ onBack }: { onBack: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const mapRef = useRef<any>(null);
  const isMapInitialized = useRef(false);

  const routeData = [
    { 
      id: 1, name: '인천국제공항', time: '10:00', icon: <Navigation size={16} />,
      desc: '공항철도 직통열차 탑승 구역', cost: '9,500원', tip: 'QR 탑승 가능!',
      img: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=300&h=200&fit=crop',
      lat: 37.4602, lng: 126.4407 
    },
    { 
      id: 2, name: '명동 스테이', time: '12:00', dist: '52km', duration: '60분', icon: <Coffee size={16} />,
      desc: '체크인 및 짐 보관', cost: '무료', tip: '로비 무료 커피!',
      img: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=300&h=200&fit=crop',
      lat: 37.5635, lng: 126.9850
    },
    { 
      id: 3, name: '광장시장', time: '14:00', dist: '3.5km', duration: '15분', icon: <Utensils size={16} />,
      desc: '박가네 빈대떡 추천', cost: '25,000원', tip: '현금 지참 권장',
      img: 'https://images.unsplash.com/photo-1624300629298-e9de39c13ee5?w=300&h=200&fit=crop',
      lat: 37.5701, lng: 126.9993
    },
  ];

  const initMap = () => {
    const { naver } = window as any;
    const mapElement = document.getElementById('map');
    if (!naver || !mapElement || isMapInitialized.current) return;

    isMapInitialized.current = true;
    const map = new naver.maps.Map(mapElement, {
      center: new naver.maps.LatLng(37.5635, 126.9850), // 숙소(명동) 중심으로 초기화
      zoom: 12,
      zoomControl: false,
      logoControl: false,
    });
    mapRef.current = map;

    // --- 반경 표시 추가 시작 ---
    new naver.maps.Circle({
      map: map,
      center: new naver.maps.LatLng(37.5635, 126.9850), // 숙소 위치 (명동 스테이)
      radius: 3000, // 반경 3km (미터 단위)
      fillColor: '#5EEAD4', // 채우기 색상 (바꿀 수 있어요)
      fillOpacity: 0.2,    // 채우기 투명도
      strokeColor: '#5EEAD4', // 테두리 색상
      strokeOpacity: 0.5,   // 테두리 투명도
      strokeWeight: 2,      // 테두리 두께
      strokeStyle: 'dash',  // 테두리 스타일 (solid, dash 등)
    });
    // --- 반경 표시 추가 끝 ---

    const pathCoords: any[] = [];
    routeData.forEach((item, idx) => {
      const pos = new naver.maps.LatLng(item.lat, item.lng);
      pathCoords.push(pos);
      new naver.maps.Marker({
        position: pos,
        map: map,
        icon: {
          content: `
            <div style="display:flex; flex-direction:column; align-items:center;">
              <div style="background:rgba(5, 6, 10, 0.9); padding:5px 12px; border-radius:18px; border:2px solid #5EEAD4; font-weight:900; font-size:12px; margin-bottom:6px; box-shadow:0 4px 15px rgba(0,0,0,0.3); white-space:nowrap; color:#fff;">
                ${idx + 1}. ${item.name}
              </div>
              <div style="width:16px; height:16px; background:#5EEAD4; border:3px solid #05060A; border-radius:50%; box-shadow:0 0 10px #5EEAD4;"></div>
            </div>`,
          anchor: new naver.maps.Point(15, 45),
        }
      });
    });

    new naver.maps.Polyline({
      map: map, path: pathCoords, strokeColor: '#5EEAD4', strokeWeight: 5, strokeOpacity: 0.8, strokeStyle: 'shortdash'
    });
  };

  useEffect(() => {
    if ((window as any).naver) initMap();
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#fff', overflow: 'hidden' }}>
      <Script src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID}`} onLoad={initMap} />
      
      {/* 1. 지도 배경 (필터 제거됨: 원래 밝은 지도가 나옵니다) */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div id="map" style={{ width: '100%', height: '100%' }}></div>
      </div>

{/* 2. 상단 헤더 - Step 2 양식 완벽 복사 */}
<div style={{ 
  position: 'absolute', 
  top: 0, 
  width: '100%', 
  height: '80px', 
  background: 'linear-gradient(to bottom, rgba(10,10,10,0.8) 0%, transparent 100%)', // Step 2와 동일한 그라데이션
  padding: '30px 20px', 
  boxSizing: 'border-box', 
  display: 'flex', 
  alignItems: 'center', 
  zIndex: 10 
}}>
  {/* 뒤로가기 버튼: Step 2에서 복사해온 그대로 */}
  <button 
    onClick={onBack} 
    style={{ 
      background: 'rgba(255,255,255,0.1)', 
      border: 'none', 
      borderRadius: '50%', 
      width: '40px', 
      height: '40px', 
      color: '#fff', // 검정색이 아닌 화이트!
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justify: 'center', 
      backdropFilter: 'blur(5px)' 
    }}
  >
    <ChevronLeft size={24} />
  </button>

  {/* 중앙 타이틀: 버튼 위치에 영향받지 않도록 배치 */}
  <div style={{ 
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(18, 20, 28, 0.85)', // 나전칠기 다크 배경
    padding: '8px 20px', 
    borderRadius: '20px', 
    border: '1.5px solid #5EEAD4', 
    color: '#fff', 
    fontSize: '12px', 
    fontWeight: '900', 
    letterSpacing: '0.05em',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap'
  }}>
    CHAE-RO <span style={{ color: '#5EEAD4', marginLeft: '8px' }}>DAY 1</span>
  </div>
</div>

      {/* 3. 바텀 시트 (통합 구조 & 드래그 가능) */}
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={(event, info) => {
            if (info.offset.y < -80) setIsExpanded(true);
            if (info.offset.y > 80) setIsExpanded(false);
        }}
        animate={{ height: isExpanded ? '85vh' : '38vh' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ 
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
            background: 'rgba(5, 6, 10, 0.95)', backdropFilter: 'blur(25px)',
            borderRadius: '40px 40px 0 0', borderTop: '1px solid rgba(94, 234, 212, 0.3)',
            display: 'flex', flexDirection: 'column', touchAction: 'none',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.3)'
        }}
      >
        {/* 드래그 핸들 */}
        <div 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ width: '100%', padding: '20px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}
        >
          <div style={{ width: '50px', height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#5EEAD4', letterSpacing: '0.2em' }}>
            경로 상세 정보
          </h3>
        </div>

        {/* 실제 리스트 영역 */}
        <div 
          onPointerDown={(e) => e.stopPropagation()} 
          style={{ flex: 1, overflowY: 'auto', padding: '0 30px', scrollbarWidth: 'none' }}
        >
          {routeData.map((item, idx) => (
  <div key={item.id} style={{ position: 'relative', paddingLeft: '45px', marginBottom: '50px' }}>
    
    {/* 1. 세로 연결선 (숫자 아이콘 위치 기준) */}
    {idx !== routeData.length - 1 && (
      <div style={{ position: 'absolute', left: '14px', top: '35px', bottom: '-50px', width: '2px', borderLeft: '2px dashed rgba(94, 234, 212, 0.2)' }} />
    )}
    
    {/* 2. 숫자 아이콘 */}
    <div style={{ 
      position: 'absolute', left: 0, top: '2px', 
      width: '28px', height: '28px', borderRadius: '10px', 
      background: '#05060A', border: '1.5px solid #5EEAD4', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      color: '#5EEAD4', fontSize: '13px', fontWeight: '900', zIndex: 2 
    }}>
      {idx + 1}
    </div>

    {/* 상단 섹션: [텍스트 3행] + [우측 사진] */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 85px', gap: '15px', minHeight: '85px', alignItems: 'center' }}>
      
      {/* 왼쪽: 3행 구조 (높이가 사진 85px에 맞춰짐) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* 1행: 타이틀 */}
        <div style={{ fontSize: '19px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
          {item.name}
        </div>

        {/* 2행: 시간 + 금액 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#5EEAD4', fontWeight: '800' }}>{item.time}</span>
          <span style={{ 
            padding: '2px 8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', 
            fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '700',
            border: '1px solid rgba(255, 255, 255, 0.1)' 
          }}>
            {item.cost}
          </span>
        </div>

        {/* 3행: 팁 */}
        <div>
          <div style={{ 
            padding: '4px 10px', background: 'rgba(94, 234, 212, 0.1)', borderRadius: '6px', 
            border: '1px solid rgba(94, 234, 212, 0.2)', display: 'inline-flex'
          }}>
            <span style={{ color: '#5EEAD4', fontSize: '11px', fontWeight: '800' }}>
              💡 {item.tip}
            </span>
          </div>
        </div>
      </div>

      {/* 오른쪽: 사진 (3행 높이 점유) */}
      <img 
        src={item.img} 
        style={{ width: '85px', height: '85px', borderRadius: '22px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
      />
    </div>

    {/* 하단 섹션: 설명 (가로 전체 병합) */}
    <div style={{ marginTop: '16px' }}>
      <p style={{ 
        color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: '1.6', 
        fontWeight: '500', wordBreak: 'keep-all', letterSpacing: '-0.2px'
      }}>
        {item.desc}
      </p>

      {/* 이동 정보 (아이콘 포함) */}
      {item.dist && (
        <div style={{ 
          marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px',
          color: 'rgba(94, 234, 212, 0.6)', fontSize: '11px', fontWeight: '800'
        }}>
          <MapPin size={12} />
          <span>{item.dist} · {item.duration} 이동</span>
        </div>
      )}
    </div>
  </div>
))}
        </div>

      </motion.div>
    </div>
  );
}