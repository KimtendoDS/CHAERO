"use client";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Plane, Home as HomeIcon, Trees, Building2, UtensilsCrossed, Camera, Palette, ShoppingBag, Coffee, RotateCcw, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "react-datepicker/dist/react-datepicker.css";

declare global {
  interface Window {
    kakao: any;
  }
}

function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0); 
  const [address, setAddress] = useState("");
  const [lang, setLang] = useState("KR"); 
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isError, setIsError] = useState(false);  
  const [suggestions, setSuggestions] = useState<any[]>([]); 

  // 컴포넌트가 브라우저에 마운트(실행)되었는지 확인
  useEffect(() => {setMounted(true);}, []);
  const [activeIndex, setActiveIndex] = useState(3); // 8개 중 중간인 3~4번을 기본값으로  
  const scrollRef = useRef<HTMLDivElement>(null); // React.useRef -> useRef

  const router = useRouter(); // 라우터 인스턴스 생성

  /* 1. 기본값 오늘 날짜로 세팅 */
  const today = new Date();
  const [startDate, setStartDate] = useState<Date | null>(today);
  const [endDate, setEndDate] = useState<Date | null>(today);

  const mapElement = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  // 기존 예산 상태
  const [totalBudget, setTotalBudget] = useState("");
  const [mealCost, setMealCost] = useState("");

  // 1. 상태값 추가 (상단에 넣어주세요)
  const [selectedRadius, setSelectedRadius] = useState("");
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false);
  const [selectingType, setSelectingType] = useState<"start" | "end">("start");

  // 휠 선택을 위한 임시 상태 (시트 안에서 조절용)
  const [tempMonth, setTempMonth] = useState(new Date().getMonth() + 1);
  const [tempDay, setTempDay] = useState(new Date().getDate());

  /* 1. 상태 및 Ref 추가 */
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  // 1. 주소 선택 중인지 확인하는 상태
  const [isSelecting, setIsSelecting] = useState(false); 

// 1. 주소 검색 및 자동완성 통합 로직 (46번 라인 근처부터 시작되는 중복 useEffect들을 이걸로 교체)
  useEffect(() => {
    if (isSelecting) return;

    if (!address.trim()) {
      setSuggestions([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(address)}`);
        // ✅ 여기서 data를 정의합니다.
        const data = await res.json(); 

        if (data && data.documents) {
          const filtered = data.documents.map((item: any) => ({
            title: item.place_name,
            address: item.road_address_name || item.address_name,
            x: item.x, // 경도
            y: item.y  // 위도
          })).slice(0, 5);
          setSuggestions(filtered);
        }
      } catch (err) {
        console.error("카카오 API 호출 에러:", err);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [address, isSelecting]);
  // 카카오 주소
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        console.log("카카오 예열 완료!");
      });
    }
  }, []);

  useEffect(() => {
    if (step === 5) {
      // 0ms, 50ms, 150ms 세 번에 걸쳐 강제로 밀어버립니다 (타이밍 이슈 완결)
      const scrollContainer = scrollRef.current;
      if (scrollContainer) {
        const targetScroll = (scrollContainer.scrollWidth - scrollContainer.clientWidth) / 2;
        
        scrollContainer.scrollLeft = targetScroll; // 즉시 이동
        
        const timers = [0, 50, 150].map(delay => 
          setTimeout(() => {
            scrollContainer.scrollTo({ left: targetScroll, behavior: delay > 0 ? 'smooth' : 'auto' });
          }, delay)
        );
        
        return () => timers.forEach(clearTimeout);
      }
    }
  }, [step]);

  useEffect(() => {
  // @ts-ignore
  const { naver } = window as any;
  // @ts-ignore
  if (!mapElement.current || !window.naver) return;

  // 지도 생성 코드 앞에도 혹시 모르니 붙여주면 좋습니다.
  // @ts-ignore
  const newMap = new window.naver.maps.Map(mapElement.current, {
    // @ts-ignore
    center: new window.naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 15,
  });

  setMap(newMap); // ⭐ 생성된 지도 객체를 상태에 저장!
}, [step]); // step 2로 넘어왔을 때 실행되도록 설정되어 있을 겁니다.
    
  // 1. 외부 클릭 감지를 위한 useRef 추가
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 2. 바깥 영역 클릭 시 닫히는 함수
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setSuggestions([]); // 리스트 비우기 (닫기)
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 시트가 열릴 때 스크롤 위치를 현재 날짜로 이동
  useEffect(() => {
    if (isDateSheetOpen) {
      const currentViewDate = selectingType === "start" ? startDate : endDate;
      
      // 1. 변수를 미리 선언해둡니다.
      let m = 0;
      let d = 0;

      if (currentViewDate) {
        m = currentViewDate.getMonth() + 1;
        d = currentViewDate.getDate();
        
        setTempMonth(m);
        setTempDay(d);
        
        // 2. 이제 m과 d를 여기서 사용할 수 있습니다!
        setTimeout(() => {
          if (monthRef.current) {
            monthRef.current.scrollTo({ top: (m - 1) * 44, behavior: 'smooth' });
          }
          if (dayRef.current) {
            dayRef.current.scrollTo({ top: (d - 1) * 44, behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [isDateSheetOpen, selectingType]);

  /* 2. 날짜 생성을 위한 헬퍼 함수 */
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = (month: number) => {
    const year = new Date().getFullYear();
    return new Date(year, month, 0).getDate();
  };

  // [원문 그대로] useEffect 로직
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 4000);
      return () => clearTimeout(timer);
    }

    if (step === 2) {
      const initMap = () => {
        const { naver } = window as any;
        if (!naver || !naver.maps || !naver.maps.Service || !mapElement.current) {
          setTimeout(initMap, 100);
          return;
        }

        const searchQuery = address.trim();
        naver.maps.Service.geocode({ 
          query: searchQuery + " 주소" 
        }, (status: any, response: any) => {
          let finalCoord;
          if (status === naver.maps.Service.Status.OK && response.v2.meta.totalCount > 0) {
            const item = response.v2.addresses[0];
            finalCoord = new naver.maps.LatLng(item.y, item.x);
          } else {
            finalCoord = new naver.maps.LatLng(37.5665, 126.9780);
          }

          if (!mapElement.current) return;

          const map = new naver.maps.Map(mapElement.current, {
            center: finalCoord,
            zoom: 17,
            zoomControl: false,
            mapTypeControl: false,
          });

          new naver.maps.Marker({
            position: finalCoord,
            map: map,
            icon: {
              content: `
                <div style="filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.4));">
                  <svg width="45" height="45" viewBox="0 0 24 24" fill="none" style="overflow: visible;">
                    <defs>
                      <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#5EEAD4" />
                        <stop offset="50%" stop-color="#C084FC" />
                        <stop offset="100%" stop-color="#F472B6" />
                      </linearGradient>
                    </defs>
                    
                    {/* 1. 바깥쪽 테두리 (어두운 배경색으로 형태를 잡아줌) */}
                    <path 
                      d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" 
                      fill="white" 
                      stroke="#1E293B" 
                      stroke-width="3.5" 
                      stroke-linejoin="round"
                    />
                    
                    {/* 2. 안쪽 테두리 (나전칠기 그라데이션 포인트) */}
                    <path 
                      d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" 
                      fill="white" 
                      stroke="url(#mapGrad)" 
                      stroke-width="1.8" 
                      stroke-linejoin="round"
                    />
                    
                    {/* 중앙 원 아이콘 */}
                    <circle cx="12" cy="10" r="3" fill="#1E293B" />
                  </svg>
                </div>
              `,
              anchor: new naver.maps.Point(20, 40),
            },
          });
          window.dispatchEvent(new Event('resize'));
        });
      };
      initMap();
    }
  }, [step, address]);

  const handleConfirmLocation = () => {
    if (!address.trim()) {
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
      return;
    }
    setStep(2);
  };

  const najeonGrad = "linear-gradient(90deg, #5EEAD4 0%, #C084FC 50%, #F472B6 100%)";
  const realPearlBg = "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 25%, #F5F3FF 50%, #FAE8FF 75%, #F8FAFC 100%)";
  const auroraPearlBorder = "linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 1) 100%)";

  const languages = [
    { code: "KR", label: "한국어", flagImg: "https://flagcdn.com/w40/kr.png" },
    { code: "EN", label: "English", flagImg: "https://flagcdn.com/w40/us.png" },
    { code: "JP", label: "日本語", flagImg: "https://flagcdn.com/w40/jp.png" },
    { code: "CN", label: "简体中文", flagImg: "https://flagcdn.com/w40/cn.png" },
    { code: "TW", label: "繁體中文", flagImg: "https://flagcdn.com/w40/tw.png" },
    { code: "HK", label: "廣東話", flagImg: "https://flagcdn.com/w40/hk.png" },
    { code: "VN", label: "Tiếng Việt", flagImg: "https://flagcdn.com/w40/vn.png" },
    { code: "TH", label: "ไทย", flagImg: "https://flagcdn.com/w40/th.png" }
  ];
  const currentLang = languages.find(l => l.code === lang);

  const currencyMap: { [key: string]: { unit: string; rate: number } } = {
    KR: { unit: "KRW", rate: 1 },
    EN: { unit: "USD", rate: 0.00075 },
    JP: { unit: "JPY", rate: 0.11 },
    CN: { unit: "CNY", rate: 0.0054 },
    TW: { unit: "TWD", rate: 0.024 },
    HK: { unit: "HKD", rate: 0.0058 },
    VN: { unit: "VND", rate: 18.5 },
    TH: { unit: "THB", rate: 0.027 },
  };

  const currentCurrency = currencyMap[lang] || currencyMap["EN"];

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '"Pretendard", sans-serif', color: '#fff', width: '100%', maxWidth: '800px'}}>
  <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>


    {/* [여기에 추가!] 상단 도로 프로그레스 바 */}
      <div style={{ position: 'absolute', top: '0', left: 0, width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', zIndex: 100 }}>
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: `${(step / 6) * 100}%` }} // 현재 스텝 비율만큼 차오름
          transition={{ duration: 0.5, ease: "circOut" }}
          style={{ height: '100%', background: najeonGrad, boxShadow: '0 0 10px #5EEAD4' }}
        />
      </div>

        <AnimatePresence mode="wait">
          {/* [원복] Step 0: 인트로 애니메이션 */}
          {step === 0 && (
            <motion.div key="step0" exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '160px', height: '60px', marginBottom: '5px' }}>
                <svg width="160" height="60" viewBox="0 0 160 60" style={{ filter: 'drop-shadow(0 0 15px rgba(94, 234, 212, 0.3))' }}>
                  <defs>
                    <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5EEAD4" /><stop offset="50%" stopColor="#C084FC" /><stop offset="100%" stopColor="#F472B6" />
                    </linearGradient>
                  </defs>
                  <path d="M10,45 Q40,5 80,30 T150,15" fill="none" stroke="url(#roadGrad)" strokeWidth="14" strokeLinecap="round" strokeDasharray="250" strokeDashoffset="250" className="road-path" />
                  <path d="M10,45 Q40,5 80,30 T150,15" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="15, 20" strokeDashoffset="250" className="road-path-dash" />
                </svg>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {["C", "H", "A", "E", "-", "R", "O"].map((char, i) => (
                  <span key={i} className="char-anim" style={{ fontSize: '36px', fontWeight: '900', background: najeonGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animationDelay: `${0.2 + i * 0.1}s` }}>{char}</span>
                ))}
              </div>
              <p style={{ marginTop: '20px', color: 'rgba(255,255,255,0.25)', fontSize: '13px', letterSpacing: '0.4em' }}>PREMIUM TRAVEL CURATION</p>
            </motion.div>
          )}
          
          {/* Step 1: 위치 입력 */}
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, y: 0 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 0 }} 
              transition={{ duration: 0.2, y: { duration: 0 } }}
              style={{ flex: 1, padding: '0 25px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', position: 'relative' }}
            >
              {/* 1. 언어 선택 */}
              <div 
                onClick={() => setIsLangOpen(true)} 
                style={{ alignSelf: 'flex-end', marginTop: '60px', padding: '8px 14px', background: 'rgba(255,255,255,0.08)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}
              >
                <img src={currentLang?.flagImg} alt="" style={{ width: '20px', height: '14px', borderRadius: '2px', objectFit: 'cover' }} />
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{currentLang?.label}</span>
                <ChevronDown size={12} color="rgba(255,255,255,0.4)" />
              </div>

              {/* 2. 컨텐츠 영역 */}
              <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1.3', marginBottom: '24px' }}>
                  {lang === "KR" ? (
                    <>어떤 <span style={{ background: najeonGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>색채</span>의<br/>여행을 꿈꾸시나요?</>
                  ) : (
                    <>What <span style={{ background: najeonGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>color</span> of<br/>travel do you dream?</>
                  )}
                </h2>
                
                {/* 3. 입력창 & 자동완성 리스트 */}
                <div style={{ width: '100%', position: 'relative' }}>
                  <div style={{ background: najeonGrad, padding: '2px', borderRadius: '22px', boxShadow: isError ? '0 0 15px rgba(244, 114, 182, 0.4)' : 'none' }}>
                    <div style={{ background: realPearlBg, borderRadius: '20px', display: 'flex', alignItems: 'center', height: '64px', padding: '0 12px 0 20px' }}>
                      <input 
                        type="text" 
                        placeholder={lang === "KR" ? "어디에 머무르시나요?" : "Where are you staying?"} 
                        value={address} 
                        onChange={(e) => {     
                          setIsSelecting(false);            
                          setAddress(e.target.value); 
                        }} 
                        style={{ flex: 1, background: 'transparent', border: 'none', color: '#1F2937', fontSize: '17px', outline: 'none', fontWeight: '800' }} 
                      />                      
                    </div>
                  </div>

                  {/* 📍 리스트 영역에 ref 추가 */}
                  {suggestions && suggestions.length > 0 && (
                    <div 
                      ref={suggestionRef} 
                      style={{
                        position: 'absolute', top: '70px', left: 0, right: 0,
                        background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)',
                        borderRadius: '20px', zIndex: 100, overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: '1px solid #eee'
                      }}
                    >
                      {suggestions.map((item: any, idx: number) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            setIsSelecting(true);     
                            setAddress(item.address); 
                            setSuggestions([]);      
                            //setStep(2);
                            // 📍 수정된 지도 이동 로직
                            if (map && map.setCenter && item.x && item.y) {
                              const newPos = new window.naver.maps.LatLng(item.y, item.x);
                              map.setCenter(newPos); // 이제 에러 안 남!
                              map.setZoom(17);
                            } else {
                              // 만약 Step 1이라 지도가 아직 없다면, 콘솔에만 찍고 넘어갑니다.
                              console.log("지도가 아직 로드되지 않았습니다. 좌표만 저장합니다.");
                            }
                          }} // 📍 주소 선택 시 닫기 실행
                          style={{ 
                            padding: '16px 20px', borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid #f0f0f0', 
                            cursor: 'pointer', transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#1F2937' }}>{item.title}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{item.address}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. 버튼 영역 */}
                <div style={{ 
                  marginTop: '18px', 
                  background: address.trim() ? auroraPearlBorder : 'rgba(255,255,255,0.05)', 
                  padding: '1.5px', borderRadius: '20px', 
                  boxShadow: address.trim() ? '0 0 20px rgba(94, 234, 212, 0.3), 0 0 40px rgba(192, 132, 252, 0.15)' : 'none'
                }}>
                  <button 
                    disabled={!address.trim()} 
                    onClick={handleConfirmLocation} 
                    style={{ width: '100%', padding: '18px', borderRadius: '19px', background: address.trim() ? najeonGrad : 'rgba(255,255,255,0.05)', color: address.trim() ? '#1F2937' : 'rgba(255,255,255,0.2)', fontWeight: '900', border: 'none', cursor: address.trim() ? 'pointer' : 'default', fontSize: '17px' }}
                  >
                    {lang === "KR" ? "위치 확인하기" : "Confirm Location"}
                  </button>
                </div>
              </div>
              <div style={{ flex: 1 }} />
            </motion.div>
          )}
                    
          {/* Step 2: 지도 확인 */}
          {step === 2 && (
            <motion.div key="step2" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div ref={mapElement} style={{ position: 'absolute', inset: 0, backgroundColor: '#0F1115' }} />
              
              <div style={{ position: 'absolute', top: 0, width: '100%', height: '80px', background: 'linear-gradient(to bottom, rgba(10,10,10,0.8) 0%, transparent 100%)', padding: '30px 20px', boxSizing: 'border-box', zIndex: 10 }}>
                <button onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                  <ChevronLeft size={24} />
                </button>
              </div>

              <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.3, type: "spring", damping: 20 }} style={{ marginTop: 'auto', padding: '20px', zIndex: 10 }}>
                {/* 하단 카드: 나전칠기 컨셉의 어두운 배경으로 변경 */}
                <div style={{ 
                  background: '#12141C', // 어두운 배경색
                  borderRadius: '30px', 
                  padding: '28px', 
                  boxShadow: '0 -20px 40px rgba(0,0,0,0.5)', 
                  border: '1px solid rgba(255,255,255,0.1)' // 은은한 테두리
                }}>
                  <div style={{ marginBottom: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: najeonGrad }} />
                      {/* 다국어 처리 적용 */}
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '800', letterSpacing: '0.1em' }}>
                        {lang === "KR" ? "위치 확인" : "CONFIRM LOCATION"}
                      </span>
                    </div>
                    {/* 주소 텍스트 색상을 밝게 변경 */}
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', lineHeight: '1.4' }}>{address}</h3>
                  </div>

                  {/* 버튼: 다른 Step의 발광 스타일과 통일 */}
                  <div style={{ 
                    background: auroraPearlBorder, // 오로라 테두리
                    padding: '1.5px', 
                    borderRadius: '20px', 
                    boxShadow: '0 0 20px rgba(94, 234, 212, 0.3), 0 0 40px rgba(192, 132, 252, 0.15)' // 발광 효과
                  }}>
                    <button 
                      onClick={() => setStep(3)} 
                      style={{ 
                        width: '100%', 
                        padding: '18px', 
                        borderRadius: '19px', 
                        background: najeonGrad, 
                        color: '#1F2937', // 다른 스텝과 동일하게 진한 회색 글자색
                        fontWeight: '900', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '17px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {lang === "KR" ? "이 위치가 맞습니다" : "Confirm Location"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          /* Step 3: 50:50 레이아웃 & 럭셔리 휠 디자인 */
          {step === 3 && (
            <motion.div key="step3" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} style={{ flex: 1, padding: '0 25px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginTop: '25px' }}>
                <button onClick={() => setStep(2)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff' }}><ChevronLeft size={24} /></button>
              </div>
              
              <div style={{ marginTop: '28px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '900', lineHeight: '1.3' }}>언제 떠나시는<br/><span style={{ background: najeonGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>행복한 여행</span> 일정인가요?</h2>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginTop: '8px' }}>여행의 시작과 끝을 선택해주세요.</p>
              </div>

            {/* From/To 카드 섹션 */}
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '115px' }}> {/* 간격을 110px로 시원하게 벌림 */}
                
                {/* ⚡ 왼쪽 수직 연결 애니메이션 선 */}
                <div style={{ position: 'absolute', left: '32px', top: '50px', bottom: '50px', width: '2px', overflow: 'hidden', zIndex: 0 }}>
                  <svg width="2" height="100%">
                    <motion.line
                      x1="1" y1="0" x2="1" y2="100%"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                      animate={{ strokeDashoffset: [0, -10] }}
                      transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                    />
                  </svg>
                </div>

                {/* FROM 카드 */}
                <div onClick={() => { setSelectingType("start"); setIsDateSheetOpen(true); }} style={{ position: 'relative', zIndex: 1, padding: '24px', paddingLeft: '64px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: selectingType === "start" && isDateSheetOpen ? '1px solid #5EEAD4' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: '0.3s' }}>
                  <div style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: '#5EEAD4', boxShadow: '0 0 10px rgba(94, 234, 212, 0.5)' }} />
                  <div style={{ fontSize: '11px', color: '#5EEAD4', fontWeight: '900', letterSpacing: '1px' }}>FROM</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>{startDate.getMonth() + 1}월 {startDate.getDate()}일</div>
                </div>

                {/* ⚡ 중간 비행기 및 실시간 날짜 텍스트 (위치 gap에 맞춰 조정) */}
                <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', zIndex: 2, display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ background: '#0A0A0A', padding: '5px 0' }}
                  >
                    <Plane size={40} style={{ color: '#5EEAD4', transform: 'rotate(135deg)' }} /> 
                  </motion.div>
                  
                  <motion.div 
                    key={startDate.getTime() + endDate.getTime()}
                    initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                    style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '-0.5px' }}
                  >          
                  </motion.div>
                </div>

                {/* ⚡ 오른쪽 몇 박 며칠 뱃지 추가 */}
                <div style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', zIndex: 3 }}>
                  <div style={{ background: najeonGrad, padding: '6px 14px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                    <span style={{ fontSize: '13px', fontWeight: '900', color: '#130C1A' }}>
                      {(() => {
                        const heart = <span style={{ color: '#FF4D4D', marginRight: '4px' }}>❤️</span>;
                        const diff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {heart}
                            {diff <= 0 ? "당일치기" : `${diff}박 ${diff + 1}일`}
                          </div>
                        );
                      })()}
                    </span>
                  </div>
                </div>

                {/* TO 카드 */}
                <div onClick={() => { setSelectingType("end"); setIsDateSheetOpen(true); }} style={{ position: 'relative', zIndex: 1, padding: '24px', paddingLeft: '64px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: selectingType === "end" && isDateSheetOpen ? '1px solid #C084FC' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: '0.3s' }}>
                  <div style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', borderRadius: '4px', background: '#C084FC', boxShadow: '0 0 10px rgba(192, 132, 252, 0.5)' }} />
                  <div style={{ fontSize: '11px', color: '#C084FC', fontWeight: '900', letterSpacing: '1px' }}>TO</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>{endDate.getMonth() + 1}월 {endDate.getDate()}일</div>
                </div>
              </div>

              {/* 하단 확정 버튼 */}
              <div style={{ marginTop: 'auto', marginBottom: '40px' }}>
                <button 
                  onClick={() => setStep(4)} 
                  style={{ 
                    width: '100%', 
                    padding: '18px', 
                    borderRadius: '21px', 
                    background: najeonGrad, 
                    olor: '#130C1A', 
                    fontWeight: '900', 
                    fontSize: '17px',
                     boxShadow: '0 10px 20px rgba(0,0,0,0.2)' 
                  }}>
                  여정의 다음 단계로
                </button>
              </div>

              {/* 버텀 시트 */}
          <AnimatePresence>
            {isDateSheetOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDateSheetOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000 }} />
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#0F0F0F', borderRadius: '32px 32px 0 0', padding: '24px 24px 30px', zIndex: 1001, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 20px' }} />
                  <h3 style={{ textAlign: 'center', fontSize: '18px', fontWeight: '800', marginBottom: '25px' }}>{selectingType === "start" ? "출발일 선택" : "도착일 선택"}</h3>
                  
                  <div style={{ display: 'flex', width: '100%', height: '160px', position: 'relative', alignItems: 'center' }}>
                    {/* 가이드 인풋 박스 */}
                    <div style={{ position: 'absolute', left: '0', width: '48%', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 0 }} />
                    <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '1px', height: '80px', background: 'rgba(255,255,255,0.15)', zIndex: 2 }} />
                    <div style={{ position: 'absolute', right: '0', width: '48%', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 0 }} />

                    {/* 월 휠 (ref 추가) */}
                    <div 
                      ref={monthRef}
                      className="wheel-column" 
                      onScroll={(e:any) => {
                        const m = months[Math.round(e.target.scrollTop/44)];
                        if(m) {
                          setTempMonth(m);
                          const newDate = new Date(today.getFullYear(), m - 1, tempDay);
                          selectingType === "start" ? setStartDate(newDate) : setEndDate(newDate);
                        }
                      }}
                    >
                      <div style={{ height: '58px' }} />
                      {months.map(m => <div key={m} className={`wheel-item ${tempMonth === m ? (selectingType === "start" ? 'active-month' : 'active-day') : ''}`}>{m}월</div>)}
                      <div style={{ height: '58px' }} />
                    </div>

                    {/* 일 휠 (ref 추가) */}
                    <div 
                      ref={dayRef}
                      className="wheel-column" 
                      onScroll={(e:any) => {
                        const d = Math.round(e.target.scrollTop/44) + 1;
                        if(d > 0 && d <= daysInMonth(tempMonth)) {
                          setTempDay(d);
                          const newDate = new Date(today.getFullYear(), tempMonth - 1, d);
                          selectingType === "start" ? setStartDate(newDate) : setEndDate(newDate);
                        }
                      }}
                    >
                      <div style={{ height: '58px' }} />
                      {Array.from({ length: daysInMonth(tempMonth) }, (_, i) => i + 1).map(d => (
                        <div key={d} className={`wheel-item ${tempDay === d ? (selectingType === "start" ? 'active-month' : 'active-day') : ''}`}>{d}일</div>
                      ))}
                      <div style={{ height: '58px' }} />
                    </div>

                    {/* 그라데이션 오버레이 */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to bottom, #0F0F0F, transparent)', pointerEvents: 'none', zIndex: 3 }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to top, #0F0F0F, transparent)', pointerEvents: 'none', zIndex: 3 }} />
                  </div>

                  <button 
                    onClick={() => {
                      if (selectingType === "start") { 
                        // 출발일 선택 후에는 바로 도착일 선택으로 전환
                        setSelectingType("end"); 
                      } else { 
                        // [수정 포인트] 도착일 선택 후에는 단계 이동(setStep) 없이 시트만 닫음
                        setIsDateSheetOpen(false); 
                      }
                    }}
                    style={{ width: '100%', padding: '18px', borderRadius: '20px', background: najeonGrad, color: '#130C1A', fontWeight: '900', marginTop: '0px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    {selectingType === "start" ? "출발일 확정" : "종료일 확정"} <ChevronRight size={18} strokeWidth={3} />
                  </button>            
                </motion.div>
              </>
            )}
          </AnimatePresence>
            </motion.div>
          )}

           /* Step 4: 활동 반경 선택 (감성 이미지 복구) */
          {step === 4 && (
            <motion.div 
              key="step4" 
              initial={{ x: 300, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              exit={{ x: -300, opacity: 0 }} 
              style={{ 
                flex: 1, 
                padding: '0 25px', 
                display: 'flex', 
                flexDirection: 'column',
                height: '100dvh', // 화면 전체 높이에 딱 맞춤
                maxHeight: '100dvh'
              }}
            >
              {/* 1. 고정 헤더 영역 */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ marginTop: '25px' }}>
                  <button onClick={() => setStep(3)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff' }}><ChevronLeft size={24} /></button>
                </div>
                
                <div style={{ marginTop: '28px', marginBottom: '30px' }}>
                  <h2 style={{ fontSize: '26px', fontWeight: '900', lineHeight: '1.3' }}>
                    하나씩 알아가볼게요<br/>
                    <span style={{ background: najeonGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>컨디션</span>은 어떠세요?
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', marginTop: '8px' }}>가벼운 산책부터 설레는 드라이브</p>
                </div>
              </div>

              {/* 2. 스크롤 가능한 카드 영역 */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', // 내용이 많으면 여기서 스크롤 발생
                paddingBottom: '20px',
                msOverflowStyle: 'none', // 스크롤바 숨기기 (IE)
                scrollbarWidth: 'none', // 스크롤바 숨기기 (Firefox)
              }}>
                {/* 웹킷 브라우저 스크롤바 숨기기 스타일은 전역 CSS나 <style> 태그에 추가 필요 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { id: "5", label: "여유로운 산책", distance: "5km", desc: "도보나 자전거로 가볍게 둘러보기 좋아요" },
                    { id: "10", label: "도심 속 탐험", distance: "10km", desc: "대중교통으로 20분 내외의 거리예요" },
                    { id: "30", label: "광역권 드라이브", distance: "30km", desc: "차량으로 근교 명소까지 모두 포함해요" }
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedRadius(item.id)}
                      style={{
                        position: 'relative',
                        padding: '20px', // 패딩을 살짝 줄임
                        borderRadius: '24px',
                        background: selectedRadius === item.id ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                        border: selectedRadius === item.id ? '2px solid #5EEAD4' : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                        transition: '0.3s all ease',
                        overflow: 'hidden'
                      }}
                    >
                      {selectedRadius === item.id && (
                        <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '120px', height: '120px', background: '#5EEAD4', filter: 'blur(60px)', opacity: 0.1, zIndex: 0 }} />
                      )}

                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: selectedRadius === item.id ? '#5EEAD4' : 'rgba(255,255,255,0.4)', fontWeight: '700', marginBottom: '2px' }}>{item.label}</div>
                          <div style={{ fontSize: '20px', fontWeight: '900' }}>{item.distance}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{item.desc}</div>
                        </div>
                        
                        <div style={{ 
                          width: '28px', height: '28px', borderRadius: '50%', 
                          background: selectedRadius === item.id ? najeonGrad : 'rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <Check size={16} color={selectedRadius === item.id ? "#130C1A" : "rgba(255,255,255,0.1)"} strokeWidth={4} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. 고정 하단 버튼 영역 */}
              <div style={{ flexShrink: 0, paddingBottom: '40px', paddingTop: '20px' }}>
                <button 
                  onClick={() => setStep(5)} 
                  disabled={!selectedRadius}
                  style={{ 
                    width: '100%', 
                    padding: '20px', 
                    borderRadius: '22px', 
                    // 그라데이션 적용
                    background: selectedRadius ? najeonGrad : 'rgba(255,255,255,0.05)', 
                    // [수정] 완전 블랙 대신 깊은 조개껍데기 안쪽의 어두운 색상 사용
                    color: selectedRadius ? '#0F172A' : 'rgba(255,255,255,0.2)', 
                    fontWeight: '900', 
                    fontSize: '18px',
                    letterSpacing: '-0.5px',
                    border: 'none',
                    boxShadow: selectedRadius ? '0 10px 30px rgba(94, 234, 212, 0.3)' : 'none',
                    transition: '0.3s'
                  }}
                >
                  탐색 범위 확정
                </button>
              </div>
            </motion.div>
          )}

          /* Step 5: 여행 테마 선택 */
         {step === 5 && (
          <motion.div 
            key="step5" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              flex: 1, display: 'flex', flexDirection: 'column', 
              height: '100dvh', background: '#05060A', overflow: 'hidden',
              touchAction: 'none'
            }}
          >
            {/* 1. 상단 타이틀 구역 - 하단 마진(marginBottom) 추가로 카드와의 간격 확보 */}
            <div style={{ flexShrink: 0, padding: '25px 25px 0', zIndex: 10, marginBottom: '20px' }}>
              <button onClick={() => setStep(4)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff' }}>
                <ChevronLeft size={24} />
              </button>
              <div style={{ marginTop: '28px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#F8FAFC', lineHeight: '1.4' }}>
                  어떤 <span style={{ background: 'linear-gradient(90deg, #5EEAD4, #C084FC, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>여행을 주제로</span><br/>담아볼까요?
                </h2>
                {/* 선(Line) 제거: 단순 텍스트로 깔끔하게 정리 */}
                <div style={{ marginTop: '12px' }}>
                  <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0, fontWeight: '500' }}>
                    취향에 맞는 여행을 선택해 보세요
                  </p>
                </div>
              </div>
            </div>

            {/* 2. ⚡ 3D 무한 루프 스테이지 */}
<div style={{ 
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
  perspective: '1200px', position: 'relative', marginTop: '10px' 
}}>
  <motion.div 
    drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.05}
    onDragEnd={(_, info) => {
      const threshold = 40;
      const total = 8;
      if (info.offset.x < -threshold) setActiveIndex(prev => (prev + 1) % total);
      else if (info.offset.x > threshold) setActiveIndex(prev => (prev - 1 + total) % total);
    }}
    style={{ position: 'relative', width: '230px', height: '380px', zIndex: 60 }}
  >
    {[
      { id: 'heritage', label: '고즈넉한 한옥', icon: <HomeIcon size={32} />, desc: "전통의 선이 만드는 평온한 휴식" },
      { id: 'nature', label: '푸르른 자연', icon: <Trees size={32} />, desc: "바람과 나무가 들려주는 계절의 노래" },
      { id: 'urban', label: '화려한 도시', icon: <Building2 size={32} />, desc: "잠들지 않는 도시의 찬란한 야경" },
      { id: 'food', label: '로컬 맛집', icon: <UtensilsCrossed size={32} />, desc: "입안 가득 퍼지는 정성스러운 한 끼" },
      { id: 'photo', label: '인생샷 명소', icon: <Camera size={32} />, desc: "영원히 기록될 찰나의 눈부신 순간" },
      { id: 'art', label: '예술과 전시', icon: <Palette size={32} />, desc: "일상에 새로운 영감을 더하는 시간" },
      { id: 'market', label: '전통 시장', icon: <ShoppingBag size={32} />, desc: "생생한 삶의 에너지가 넘치는 곳" },
      { id: 'cafe', label: '감성 카페', icon: <Coffee size={32} />, desc: "향긋한 커피와 즐기는 여유" }
    ].map((item, index) => {
      const isSelected = selectedThemes.includes(item.id);
      const total = 8;
      let offset = index - activeIndex;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
      const absOffset = Math.abs(offset);
      if (absOffset > 2.2) return null;

      return (
        <motion.div
          key={item.id}
          onTap={() => {
            if (absOffset === 0) {
              if (isSelected) setSelectedThemes(selectedThemes.filter(t => t !== item.id));
              else setSelectedThemes([...selectedThemes, item.id]);
            } else { setActiveIndex(index); }
          }}
          animate={{ 
            x: offset * 135, 
            scale: 1 - absOffset * 0.18, 
            z: -absOffset * 250, 
            rotateY: offset * -32, 
            opacity: 1 - absOffset * 0.3, // ✅ 비선택 카드도 더 잘 보이게 투명도 완화 (0.5 -> 0.3)
            zIndex: 10 - Math.round(absOffset) 
          }}
          transition={{ type: 'spring', stiffness: 250, damping: 30 }}
          style={{
            position: 'absolute', width: '230px', height: '360px', borderRadius: '35px',
            // ✅ 선택 시 민트색 광택, 미선택 시에도 활성화된 다크 네이비 배경
            background: isSelected 
              ? 'radial-gradient(circle at 50% 0%, rgba(94, 234, 212, 0.15), transparent), #0B1220' 
              : '#0F172A', 
            // ✅ 선택 시 굵은 민트색 보더, 미선택 시 은은한 보더
            border: isSelected 
              ? '2.5px solid #5EEAD4' 
              : '1px solid rgba(255,255,255,0.15)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden',
            boxShadow: isSelected ? '0 0 30px rgba(94, 234, 212, 0.2)' : 'none'
          }}
        >
          {/* ✨ 상단 체크 배지 */}
          <div style={{
            marginTop: '30px', width: '34px', height: '34px', borderRadius: '50%',
            background: isSelected ? '#5EEAD4' : 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.1)',
            transition: '0.3s'
          }}>
            {isSelected 
              ? <Check size={20} color="#05060A" strokeWidth={4} /> 
              : <div style={{}} />
            }
          </div>

          {/* 3. 아이콘 & 라벨 */}
          <div style={{ 
            marginTop: '20px', 
            color: isSelected ? '#5EEAD4' : 'rgba(255,255,255,0.6)', // ✅ 미선택 시에도 아이콘 보임
            transition: '0.3s'
          }}>
            {item.icon}
          </div>
          <span style={{ 
            fontSize: '20px', 
            fontWeight: '900', 
            color: isSelected ? '#F8FAFC' : 'rgba(255,255,255,0.8)', // ✅ 글자 밝게 유지
            marginTop: '10px',
            transition: '0.3s'
          }}>
            {item.label}
          </span>
          
          {/* ✨ 4. 설명 박스 */}
          <div style={{ position: 'relative', width: '80%', padding: '15px 0', marginTop: '15px' }}>
            <div style={{ 
              position: 'absolute', top: 0, left: 0, right: 0, height: '1px', 
              background: isSelected ? 'linear-gradient(90deg, transparent, #5EEAD4, transparent)' : 'rgba(255,255,255,0.05)' 
            }} />
            <p style={{ 
              fontSize: '12px', 
              color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)', 
              textAlign: 'center', margin: 0, lineHeight: '1.6' 
            }}>{item.desc}</p>
            <div style={{ 
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', 
              background: isSelected ? 'linear-gradient(90deg, transparent, #C084FC, transparent)' : 'rgba(255,255,255,0.05)' 
            }} />
          </div>

          {/* ✨ 5. 카드 하단 일체형 제휴 섹션 (뱃지 및 배너 복구) */}
          <div style={{ 
            marginTop: 'auto', 
            width: '100%', 
            padding: '0 15px 9px', // 하단 여백 살짝 조정
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px', 
            // 선택되지 않았을 때도 0.4 정도의 투명도로 존재감을 줍니다
            opacity: isSelected ? 1 : 0.4, 
            transition: 'all 0.4s ease'
          }}>
            {/* 첫 번째 배너: 명동교자 (AD) */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', 
              padding: '10px 12px', 
              borderRadius: '16px', 
              width: '80%', 
              alignSelf: 'center',
              border: isSelected ? '1px solid rgba(94, 234, 212, 0.2)' : '1px solid transparent'
            }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '8px', 
                background: 'rgba(255,255,255,0.05)', flexShrink: 0, 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <span style={{ fontSize: '14px' }}>🍱</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#F8FAFC' }}>명동 교자 본점</span>
                  {/* AD 뱃지 */}
                  <span style={{ 
                    fontSize: '8px', color: '#5EEAD4', 
                    border: '1px solid #5EEAD4', padding: '1px 4px', 
                    borderRadius: '4px', fontWeight: 'bold', zoom: 0.8
                  }}>AD</span>
                </div>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>수집가 전용 10% 쿠폰</p>
              </div>
            </div>

            {/* 두 번째 배너: 국립중앙박물관 (Sponsored) */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              background: isSelected ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', 
              padding: '10px 12px', 
              borderRadius: '16px', 
              width: '80%', 
              alignSelf: 'center',
              border: isSelected ? '1px solid rgba(192, 132, 252, 0.2)' : '1px solid transparent'
            }}>
              <div style={{ 
                width: '32px', height: '32px', borderRadius: '8px', 
                background: 'rgba(255,255,255,0.05)', flexShrink: 0, 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                <span style={{ fontSize: '14px' }}>🏛️</span>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#F8FAFC' }}>국립중앙박물관</span>
                  {/* Sponsored 뱃지 */}
                  <span style={{ 
                    fontSize: '8px', color: '#C084FC', 
                    border: '1px solid #C084FC', padding: '1px 4px', 
                    borderRadius: '4px', fontWeight: 'bold', zoom: 0.8
                  }}>Sponsored</span>
                </div>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>공식 파트너십 유물 전시</p>
              </div>
            </div>
          </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

            {/* 3. 하단 버튼 구역 */}
            <div style={{ flexShrink: 0, padding: '20px 25px 40px', zIndex: 10, display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AnimatePresence>
                {selectedThemes.length > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} style={{ position: 'relative' }}>
                    <button onClick={() => setSelectedThemes([])} style={{ width: '64px', height: '64px', borderRadius: '22px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                      <RotateCcw size={22} />
                    </button>
                    <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'linear-gradient(135deg, #5EEAD4, #C084FC)', color: '#05060A', fontSize: '12px', fontWeight: '900', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #05060A' }}>{selectedThemes.length}</div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => setStep(6)} disabled={selectedThemes.length === 0} style={{ flex: 1, height: '64px', borderRadius: '22px', background: selectedThemes.length > 0 ? 'linear-gradient(90deg, #5EEAD4, #C084FC, #F472B6)' : 'rgba(255,255,255,0.04)', color: selectedThemes.length > 0 ? '#05060A' : 'rgba(255,255,255,0.15)', fontWeight: '900', fontSize: '18px', transition: '0.3s' }}>
                {selectedThemes.length > 0 ? `주제 담기` : '주제를 골라주세요'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div 
            key="step6" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              flex: 1, display: 'flex', flexDirection: 'column', 
              height: '100dvh', background: '#05060A', overflow: 'hidden'
            }}
          >
            {/* 1. 상단 헤더 구역 (뒤로가기 추가) */}
            <div style={{ flexShrink: 0, padding: '25px 25px 0', zIndex: 10 }}>
              <button 
                onClick={() => setStep(5)} // 다시 조각 선택으로
                style={{ 
                  background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', 
                  width: '40px', height: '40px', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ 
                    display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                    background: 'rgba(94, 234, 212, 0.1)', border: '1px solid rgba(94, 234, 212, 0.2)',
                    color: '#5EEAD4', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '12px'
                  }}
                >
                  PACKING COMPLETE
                </motion.div>
                <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#F8FAFC', lineHeight: '1.3' }}>
                  이제 <span style={{ background: 'linear-gradient(90deg, #5EEAD4, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>채비</span>가 끝났습니다
                </h2>
              </div>
            </div>

            {/* 2. 중앙 가방 구역 (간격 조정: 위로 살짝 올림) */}
            <div style={{ 
              flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: '-20px' // 위쪽 여백을 줄여 타이틀과 가깝게 배치
            }}>
              <div style={{ position: 'relative' }}>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  style={{ 
                    position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%',
                    width: '220px', height: '220px', borderRadius: '50%',
                    background: 'radial-gradient(circle, #5EEAD4 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0
                  }} 
                />
                
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  style={{ fontSize: '110px', zIndex: 1, position: 'relative', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
                >
                  🧳
                </motion.div>

                {/* PCS 네임택 */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }} animate={{ x: 45, opacity: 1, rotate: -12 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  style={{ 
                    position: 'absolute', bottom: '15px', right: '-15px',
                    background: '#F8FAFC', padding: '8px 16px', borderRadius: '2px',
                    boxShadow: '4px 4px 0px #C084FC', zIndex: 2
                  }}
                >
                  <span style={{ color: '#64748B', fontSize: '7px', fontWeight: '900', display: 'block' }}>ITEM COUNT</span>
                  <span style={{ color: '#0F172A', fontSize: '15px', fontWeight: '900' }}>{selectedThemes.length} PCS</span>
                </motion.div>
              </div>
            </div>

            {/* 3. 하단 버튼 구역 (여백 최적화) */}
            <div style={{ padding: '0 25px 50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* 옵션 1: AI 자동 일정 (이 부분을 수정하세요) */}
                <button 
                  onClick={() => setStep(7)} // 👈 alert 대신 setStep(7)로 변경!
                  style={{ 
                    width: '100%', height: '70px', borderRadius: '22px', 
                    background: 'linear-gradient(90deg, #5EEAD4, #C084FC)', 
                    border: 'none', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px',
                    boxShadow: '0 10px 25px rgba(94, 234, 212, 0.2)',
                    cursor: 'pointer' // 마우스 커서 추가
                  }}
                >
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ color: '#05060A', fontSize: '17px', fontWeight: '900' }}>스마트 자동 일정 확인</span>
                    <span style={{ color: 'rgba(5,6,10,0.6)', fontSize: '10px', fontWeight: '800' }}>AI 최적 동선 계산</span>
                  </div>
                  <ArrowRight color="#05060A" size={22} strokeWidth={3} />
                </button>

              <div style={{ display: 'flex', alignItems: 'center', width: '80%', gap: '15px', margin: '15px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ color: 'rgb(255 255 255 / 42%)', fontSize: '13px', fontWeight: '900' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* 3. 하단 버튼 구역 - 두 번째 버튼 수정 */}
              <button 
                onClick={() => setStep(8)} // 👈 상세 설정(예산) 단계인 Step 8로 이동!
                style={{ 
                  width: '100%', height: '70px', borderRadius: '22px', 
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', padding: '0 24px', gap: '12px',
                  cursor: 'pointer' // 클릭 가능하게 커서 추가
                }}
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ color: '#F8FAFC', fontSize: '16px', fontWeight: '800' }}>직접 상세 설정하기</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>예산, 이동수단 선택</span>
                </div>
                <ArrowRight color="rgba(255,255,255,0.3)" size={20} />
              </button>
            </div>
          </motion.div>
        )}

                {step === 7 && (
            <motion.div 
              key="step7"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100dvh', 
                background: '#05060A', 
                padding: '40px',
                overflow: 'hidden'
              }}
            >
              {/* 중앙 요리 애니메이션 */}
              <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '50px' }}>
                
                {/* 배경 글로우 */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    width: '180px', 
                    height: '180px', 
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #5EEAD4 0%, transparent 70%)', 
                    filter: 'blur(40px)'
                  }} 
                />

                {/* 중앙 프라이팬 */}
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '100px',
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
                  }}
                >
                  🍳
                </motion.div>

                {/* 날아오는 재료들 */}
                {[
                  { emoji: '🏛️', delay: 0, angle: -45 },
                  { emoji: '☕', delay: 0.3, angle: 45 },
                  { emoji: '🌊', delay: 0.6, angle: -135 },
                  { emoji: '🎨', delay: 0.9, angle: 135 },
                  { emoji: '🍜', delay: 1.2, angle: 0 },
                  { emoji: '🛍️', delay: 1.5, angle: 180 }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: Math.cos(item.angle * Math.PI / 180) * 120,
                      y: Math.sin(item.angle * Math.PI / 180) * 120,
                      scale: 0,
                      opacity: 0
                    }}
                    animate={{ 
                      x: [
                        Math.cos(item.angle * Math.PI / 180) * 120,
                        0
                      ],
                      y: [
                        Math.sin(item.angle * Math.PI / 180) * 120,
                        0
                      ],
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2, 
                      delay: item.delay,
                      ease: "easeInOut"
                    }}
                    style={{ 
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      fontSize: '32px',
                      filter: 'drop-shadow(0 4px 12px rgba(94, 234, 212, 0.4))'
                    }}
                  >
                    {item.emoji}
                  </motion.div>
                ))}

                {/* 김이 모락모락 */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`steam-${i}`}
                    animate={{ 
                      y: [20, -40],
                      opacity: [0, 0.6, 0],
                      scale: [0.5, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2, 
                      delay: i * 0.5,
                      ease: "easeOut"
                    }}
                    style={{ 
                      position: 'absolute',
                      top: '30%',
                      left: `${40 + i * 10}%`,
                      fontSize: '24px',
                      filter: 'blur(2px)'
                    }}
                  >
                    💨
                  </motion.div>
                ))}

                {/* 셰프 모자 (좌측 상단) */}
                <motion.div
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    position: 'absolute',
                    top: '-125px',
                    left: '35px',
                    fontSize: '116px',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }}
                >
                  👨‍🍳
                </motion.div>
              </div>

              {/* 문구 영역 */}
              <div style={{ width: '100%', maxWidth: '320px', textAlign: 'center' }}>
                {/* 메인 타이틀 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontSize: '22px',
                    fontWeight: '900',
                    color: '#F8FAFC',
                    marginBottom: '8px',
                    background: 'linear-gradient(90deg, #5EEAD4, #C084FC)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  채로 셰프가 조리하는 중
                </motion.div>

                {/* 순환 문구 */}
                <div style={{ height: '28px', overflow: 'hidden', position: 'relative', marginBottom: '30px' }}>
                  <motion.div
                    animate={{ y: [0, -28, -56, -84] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 8, 
                      times: [0, 0.25, 0.5, 0.75, 1], 
                      ease: "easeInOut" 
                    }}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    {[
                      '여행 재료를 손질하는 중...',
                      '최적의 맛을 조합하는 중...',
                      '특별한 레시피를 완성하는 중...',
                      '당신만의 코스를 플레이팅 중...'
                    ].map((txt, idx) => (
                      <span 
                        key={idx} 
                        style={{ 
                          height: '28px', 
                          color: 'rgba(255,255,255,0.6)', 
                          fontSize: '14px', 
                          fontWeight: '700',
                          display: 'block', 
                          lineHeight: '28px'
                        }}
                      >
                        {txt}
                      </span>
                    ))}
                  </motion.div>
                </div>

                {/* 로딩바 (조리 진행도) */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      color: 'rgba(255,255,255,0.4)',
                      letterSpacing: '1px'
                    }}>
                      조리 진행도
                    </span>
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ 
                        fontSize: '11px', 
                        fontWeight: '900', 
                        color: '#5EEAD4'
                      }}
                    >
                      COOKING...
                    </motion.span>
                  </div>

                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    background: 'rgba(255,255,255,0.08)', 
                    borderRadius: '6px', 
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 4.5, ease: "easeOut" }}
                      style={{ 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #5EEAD4, #C084FC)',
                        boxShadow: '0 0 20px rgba(94, 234, 212, 0.6)',
                        position: 'relative'
                      }}
                    >
                      {/* 반짝이는 포인트 */}
                      <motion.div
                        animate={{ x: [-10, 10, -10] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        style={{ 
                          position: 'absolute', 
                          right: '0', 
                          top: '-2px', 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          background: '#fff', 
                          boxShadow: '0 0 15px #fff, 0 0 25px #5EEAD4' 
                        }} 
                      />
                    </motion.div>

                    {/* 윤곽선 애니메이션 */}
                    <motion.div
                      animate={{ x: ['0%', '100%'] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '30px',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                      }}
                    />
                  </div>
                </div>

                {/* 하단 설명 */}
                <p style={{ 
                  color: 'rgba(255,255,255,0.3)', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  letterSpacing: '0.5px',
                  lineHeight: '1.5'
                }}>
                  AI가 당신의 취향을 분석하여<br />
                  최상의 여행 레시피를 준비하고 있습니다
                </p>
              </div>

              {/* 자동 전환 트리거 */}
              <motion.div 
                style={{ position: 'absolute', opacity: 0 }}
                onViewportEnter={() => {
                  const timer = setTimeout(() => {
                    //setStep(13), 5000
                    router.push('/travel');
                  }, 5000);                  
                  return () => clearTimeout(timer);
                }} 
              />
            </motion.div>
          )}


         {/* Step 8: 예산 설정 */}
        {step === 8 && (
          <motion.div 
            key="step8" 
            initial={{ x: 300, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -300, opacity: 0 }} 
            style={{ flex: 1, padding: '0 25px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', height: '100dvh', background: '#05060A' }}
          >    

            {/* 상단 네비게이션 */}
            <div style={{ marginTop: '25px', flexShrink: 0 }}>
              <button 
                onClick={() => setStep(6)} 
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            {/* 타이틀 구역 (나전칠기 그라데이션 적용) */}
            <div style={{ marginTop: '28px', marginBottom: '22px', flexShrink: 0 }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1.3', color: '#fff' }}>
                {lang === "KR" ? (
                  <>여행의 <span style={{ background: 'linear-gradient(90deg, #5EEAD4, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>규모</span>를<br/>알려주시겠어요?</>
                ) : (
                  <>How much is your<br/><span style={{ background: 'linear-gradient(90deg, #5EEAD4, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>budget</span> for travel?</>
                )}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '8px' }}>
                {currentLang?.label} 통화 기준으로 실시간 환산됩니다.
              </p>
            </div>

            {/* 💰 중앙 입력 카드 (디자인 정제) */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '32px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(15px)', boxSizing: 'border-box', marginBottom: '16px' }}>
              
              {/* 1. 총 예산 입력 */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', color: '#C084FC', fontWeight: '900', letterSpacing: '0.05em' }}>총 예산</label>
                  {totalBudget > 0 && (
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#5EEAD4' }}>
                      ≈ {currentCurrency.unit} {(Number(totalBudget) * currentCurrency.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#C084FC', fontWeight: '900', fontSize: '18px', zIndex: 1 }}>₩</span>
                  <input 
                    type="number" placeholder="0" value={totalBudget} 
                    onChange={(e) => setTotalBudget(e.target.value)} 
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '18px 20px 18px 45px', color: '#fff', fontSize: '22px', fontWeight: '800', outline: 'none', boxSizing: 'border-box', textAlign: 'right' }} 
                  />
                </div>
              </div>

              {/* 2. 한끼 식사 예산 입력 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', color: '#5EEAD4', fontWeight: '900', letterSpacing: '0.05em' }}>최대 식사 비용</label>
                  {mealCost > 0 && (
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#C084FC' }}>
                      ≈ {currentCurrency.unit} {(Number(mealCost) * currentCurrency.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#5EEAD4', fontWeight: '900', fontSize: '18px', zIndex: 1 }}>₩</span>
                  <input 
                    type="number" placeholder="0" value={mealCost} 
                    onChange={(e) => setMealCost(e.target.value)} 
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '18px 20px 18px 45px', color: '#fff', fontSize: '22px', fontWeight: '800', outline: 'none', boxSizing: 'border-box', textAlign: 'right' }} 
                  />
                </div>
              </div>
            </div>

            {/* 📊 실시간 환율 정보 (LIVE EXCHANGE) */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '28px', padding: '22px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', marginBottom: '20px' }}>
              <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#5EEAD4', color: '#05060A', padding: '4px 14px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.05em' }}>
                환율
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '10px' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: '42px', height: '28px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', margin: '0 auto 8px' }}>
                    <img src={currentLang?.flagImg} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>1.00 {currentCurrency.unit}</div>
                </div>
                
                {/* 환전 아이콘 구역 (새로고침 아이콘 -> 교차 화살표로 복구) */}
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5EEAD4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 10l4-4m0 0l-4-4m4 4H3M7 14l-4 4m0 0l4 4m-4-4h18"/>
                  </svg>
                </div>

                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: '42px', height: '28px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)', margin: '0 auto 8px' }}>
                    <img src="https://flagcdn.com/w80/kr.png" alt="KR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#5EEAD4' }}>
                    {Math.round(1 / currentCurrency.rate).toLocaleString()} KRW
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 완료 버튼 */}
            <div style={{ marginTop: 'auto', paddingBottom: '30px' }}>
              <button 
                onClick={() => setStep(11)}
                style={{ 
                  width: '100%', height: '65px', borderRadius: '22px', 
                  background: 'linear-gradient(90deg, #5EEAD4, #C084FC)', 
                  border: 'none', color: '#05060A', fontSize: '18px', fontWeight: '900',
                  boxShadow: '0 8px 20px rgba(94, 234, 212, 0.15)', cursor: 'pointer'
                }}
              >
                예산 설정 완료하기
              </button>
            </div>
          </motion.div>
        )}

  
          {/* --- Step 12: 상세 일정 (지도) --- */}
          <AnimatePresence>
            {step === 12 && (
              <motion.div 
                key="step12-detail"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                style={{ position: 'fixed', inset: 0, zIndex: 100 }}
              >
                {/* 상세 페이지에서 뒤로가기 하면 마스터(13)로 이동 */}
                <RouteDetail onBack={() => setStep(13)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- Step 13: 마스터 일정 (전체 요약) --- */}
          <AnimatePresence>
            {step === 13 && (
              <motion.div 
                key="step12-master"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 20 }}
                style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#05060A' }}
              >
                {/* 마스터 페이지에서 날짜 선택하면 다시 상세(12)로 이동 */}
                <RouteMaster onDaySelect={(day) => {
                  // console.log(day + "일 선택됨"); 
                  setStep(12);
                }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 7: 예산 설정 */}
          {step === 127 && (
            <motion.div key="step4" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} style={{ flex: 1, padding: '0 25px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', height: '100%' }}>
              <div style={{ marginTop: '25px' }}>
                <button onClick={() => setStep(3)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={24} /></button>
              </div>

              <div style={{ marginTop: '28px', marginBottom: '22px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1.3' }}>
                  {lang === "KR" ? <>여행의 <span style={{ background: najeonGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>규모</span>를<br/>알려주시겠어요?</> : <>How much is your<br/><span style={{ background: najeonGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>budget</span> for travel?</>}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '8px' }}>{currentLang?.label} 통화 기준으로 실시간 환산됩니다.</p>
              </div>

              <div style={{ background: 'rgba(30, 20, 40, 0.7)', borderRadius: '32px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(15px)', boxSizing: 'border-box', marginBottom: '16px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', color: '#C084FC', fontWeight: '900', letterSpacing: '0.05em' }}>TOTAL BUDGET</label>
                    {totalBudget > 0 && (
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#F472B6' }}>
                        ≈ {currentCurrency.unit} {(Number(totalBudget) * currentCurrency.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#F472B6', fontWeight: '900', fontSize: '18px', zIndex: 1 }}>₩</span>
                    <input type="number" placeholder="0" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 20px 16px 45px', color: '#fff', fontSize: '20px', fontWeight: '800', outline: 'none', boxSizing: 'border-box', textAlign: 'right' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', color: '#5EEAD4', fontWeight: '900', letterSpacing: '0.05em' }}>MAX MEAL COST</label>
                    {mealCost > 0 && (
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#5EEAD4' }}>
                        ≈ {currentCurrency.unit} {(Number(mealCost) * currentCurrency.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#5EEAD4', fontWeight: '900', fontSize: '18px', zIndex: 1 }}>₩</span>
                    <input type="number" placeholder="0" value={mealCost} onChange={(e) => setMealCost(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 20px 16px 45px', color: '#fff', fontSize: '20px', fontWeight: '800', outline: 'none', boxSizing: 'border-box', textAlign: 'right' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '28px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', marginBottom: '20px' }}>
                  <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#5EEAD4', color: '#130C1A', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.05em' }}>
                    LIVE EXCHANGE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '10px' }}>
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ width: '46px', height: '30px', borderRadius: '6px', overflow: 'hidden', border: '2px solid #C084FC', margin: '0 auto 6px' }}>
                          <img src={currentLang?.flagImg} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '900', color: '#fff' }}>1.00 {currentCurrency.unit}</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5EEAD4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 10l4-4m0 0l-4-4m4 4H3M7 14l-4 4m0 0l4 4m-4-4h18"/>
                        </svg>
                      </div>
                      <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ width: '46px', height: '30px', borderRadius: '6px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', margin: '0 auto 6px' }}>
                          <img src="https://flagcdn.com/w80/kr.png" alt="KR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '900', color: '#5EEAD4' }}>
                          {Math.round(1 / currentCurrency.rate).toLocaleString()} KRW
                        </div>
                      </div>
                  </div>
              </div>

              <div style={{ marginTop: 'auto', marginBottom: '40px' }}>
                <div style={{ background: auroraPearlBorder, padding: '1px', borderRadius: '22px' }}>
                  <button onClick={() => setStep(5)} disabled={!totalBudget || !mealCost} style={{ width: '100%', padding: '18px', borderRadius: '21px', background: najeonGrad, color: '#130C1A', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '17px', opacity: (totalBudget && mealCost) ? 1 : 0.4 }}>
                    {lang === "KR" ? "다음 단계로" : "Continue"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 언어 모달 - [원복] */}
        {isLangOpen && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
            <div onClick={() => setIsLangOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ position: 'absolute', bottom: 0, width: '100%', background: '#0F0F0F', borderRadius: '30px 30px 0 0', padding: '20px 25px 50px', boxSizing: 'border-box', maxHeight: '75%', overflowY: 'auto' }}>
              <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 25px' }} />
              {languages.map((l) => (
                <div key={l.code} onClick={() => { setLang(l.code); setIsLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '18px', borderRadius: '15px', background: lang === l.code ? 'rgba(94, 234, 212, 0.1)' : 'transparent', marginBottom: '8px', cursor: 'pointer', border: lang === l.code ? '1px solid rgba(94, 234, 212, 0.3)' : '1px solid transparent' }}>
                  <img src={l.flagImg} alt="" style={{ width: '28px', height: '20px', borderRadius: '3px', objectFit: 'cover' }} /><span style={{ flex: 1, fontSize: '16px', fontWeight: '700', color: lang === l.code ? '#5EEAD4' : '#fff' }}>{l.label}</span>{lang === l.code && <Check size={20} color="#5EEAD4" />}
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .char-anim { opacity: 0; transform: translateY(15px); animation: charFadeUp 0.7s ease forwards; }
        @keyframes charFadeUp { to { opacity: 1; transform: translateY(0); } }
        .road-path { stroke-dasharray: 250; stroke-dashoffset: 250; animation: drawRoad 2.5s ease-in-out forwards; animation-delay: 0.1s; }
        .road-path-dash { stroke-dasharray: 15, 20; stroke-dashoffset: 250; animation: drawRoad 2.5s ease-in-out forwards; animation-delay: 0.2s; }
        @keyframes drawRoad { to { stroke-dashoffset: 0; } }
        .custom-datepicker-wrapper { width: 100%; display: flex; justify-content: center; }
        .react-datepicker { background-color: transparent !important; border: none !important; font-family: inherit !important; width: 100% !important; }
        .react-datepicker__header { background-color: transparent !important; border-bottom: 1px solid rgba(255,255,255,0.1) !important; }
        .react-datepicker__current-month, .react-datepicker__day-name { color: #fff !important; font-weight: 800 !important; }
        .react-datepicker__day { color: rgba(255,255,255,0.8) !important; font-weight: 600 !important; border-radius: 10px !important; }
        .react-datepicker__day:hover { background-color: rgba(255,255,255,0.1) !important; }
        .react-datepicker__day--in-range { background: rgba(192, 132, 252, 0.2) !important; color: #5EEAD4 !important; }
        .react-datepicker__day--selected, .react-datepicker__day--range-start, .react-datepicker__day--range-end { background: ${najeonGrad} !important; color: #1F2937 !important; font-weight: 900 !important; }
        .react-datepicker__day--disabled { color: rgba(255,255,255,0.1) !important; }
        .wheel-column { height: 220px; overflow-y: scroll; scroll-snap-type: y mandatory; -ms-overflow-style: none; scrollbar-width: none; }

        .wheel-column::-webkit-scrollbar { display: none; }
        .wheel-item { height: 54px; display: flex; align-items: center; justify-content: center; scroll-snap-align: center; color: rgba(255,255,255,0.15); font-size: 18px; transition: 0.3s; }
        
        /* 월 선택 시 민트빛 하이라이트 */
        .active-month { color: #5EEAD4 !important; font-size: 24px !important; font-weight: 900 !important; text-shadow: 0 0 15px rgba(94, 234, 212, 0.4); }
        
        /* 일 선택 시 퍼플빛 하이라이트 */
        .active-day { color: #C084FC !important; font-size: 24px !important; font-weight: 900 !important; text-shadow: 0 0 15px rgba(192, 132, 252, 0.4); }
        .wheel-column { height: 200px; overflow-y: scroll; scroll-snap-type: y mandatory; -ms-overflow-style: none; scrollbar-width: none; }
        .wheel-column::-webkit-scrollbar { display: none; }
        .wheel-item { height: 50px; display: flex; align-items: center; justify-content: center; scroll-snap-align: center; color: rgba(255,255,255,0.2); font-size: 16px; transition: 0.2s; }
        
        /* 선택된 항목 강조 */
        .active-month { color: #5EEAD4 !important; font-size: 20px !important; font-weight: 900 !important; }
        .active-day { color: #C084FC !important; font-size: 20px !important; font-weight: 900 !important; }

        .wheel-column { flex: 1; height: 160px; overflow-y: scroll; scroll-snap-type: y mandatory; -ms-overflow-style: none; scrollbar-width: none; }
        .wheel-column::-webkit-scrollbar { display: none; }
        .wheel-item { height: 44px; display: flex; align-items: center; justify-content: center; scroll-snap-align: center; color: rgba(255,255,255,0.15); font-size: 15px; transition: 0.2s; }
        .active-month { color: #5EEAD4 !important; font-size: 19px !important; font-weight: 900 !important; }
        .active-day { color: #C084FC !important; font-size: 19px !important; font-weight: 900 !important; }
      `}</style>
    </div>
  );
}

const Home = dynamic(() => Promise.resolve(HomeContent), {
  ssr: false,
});

export default Home;