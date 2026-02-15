'use client';
import React, { useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  motion,
  useMotionValue,
  useTransform,
  PanInfo,
  AnimatePresence,
  Reorder,
} from 'framer-motion';
import {
  ChevronLeft,
  Heart,
  X,
  MapPin,
  DollarSign,
  Sparkles,
  Navigation,
  GripVertical,
  Calendar,
  Map,
  Clock,
  ChevronsDown,
  Trash2,
} from 'lucide-react';

type Mood = 'TRENDY' | 'VIBE' | 'CLASSIC' | 'RELAX' | string;

type ScheduleItem = {
  id: number;
  time: string;
  duration: string;
  title: string;
  description: string;
  type: string;
  icon: string;
  mood: Mood;
  spots: string;
  price: string;
  reason: string;
};

type ScheduleDay = {
  id: string;
  items: ScheduleItem[];
};

type Recommendation = ScheduleItem & {
  brandName?: string;
  rating?: number;
  area?: string;
  tags?: string[];
  isSponsored?: boolean;
  replaceId?: number;
  targetDay?: number;
};

const RouteDetail = ({ setStep }: { setStep: (s: number) => void }) => {
  const router = useRouter();
  const najeonGrad = 'linear-gradient(135deg, #5EEAD4 0%, #C084FC 100%)';
  const glassBorder = '2.5px solid rgba(255, 255, 255, 0.15)';
  const pearlColor = '#F0EAD6';

  const vibeStyles: Record<string, { grad: string; color: string; label: string }> = {
    TRENDY: { grad: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)', color: '#F43F5E', label: 'TRENDY' },
    VIBE: { grad: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)', color: '#A855F7', label: 'VIBE' },
    CLASSIC: { grad: 'linear-gradient(135deg, #2DD4BF 0%, #5EEAD4 100%)', color: '#2DD4BF', label: 'CLASSIC' },
    RELAX: { grad: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', color: '#10B981', label: 'RELAX' },
  };

  const [expandedDay, setExpandedDay] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleItem | null>(null);
  const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState(0);
  const [addMode, setAddMode] = useState<{ day: number } | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);
  const [swipeStates, setSwipeStates] = useState<{ [key: number]: number }>({});
  
  const isProcessing = useRef(false);

  const topThreeWeeks = [
    { id: 1, koLabel: '1주차', title: '성수-한남 트렌드 스캔', subTitle: '취향 맞춤형 팝업과 전시의 미식 여정', tags: ['팝업스토어', 'K-패션', '미식'], moodKey: 'TRENDY', metrics: { schedule: '7일', dist: '12.4km', time: '4.5시간' } },
    { id: 2, koLabel: '2주차', title: '을지로 감성 아카이브', subTitle: '레트로한 공간에서 즐기는 깊은 밤의 정취', tags: ['LP바', '레트로', '노포'], moodKey: 'VIBE', metrics: { schedule: '7일', dist: '10.2km', time: '5시간' } },
    { id: 3, koLabel: '3주차', title: '북촌-삼청 전통 투어', subTitle: '고즈넉한 한옥 사이로 발견하는 서울의 어제와 오늘', tags: ['한옥', '전통', '산책'], moodKey: 'CLASSIC', metrics: { schedule: '7일', dist: '8.7km', time: '3.5시간' } },
  ];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const failHintOpacity = useTransform(x, [-120, -60], [1, 0]);
  const successHintOpacity = useTransform(x, [60, 120], [0, 1]);

  const getCalculatedDate = (index: number) => {
    const baseDate = new Date('2026-02-15');
    baseDate.setDate(baseDate.getDate() + index);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return `${baseDate.getFullYear()}.${String(baseDate.getMonth() + 1).padStart(2, '0')}.${String(baseDate.getDate()).padStart(2, '0')} (${dayNames[baseDate.getDay()]})`;
  };

  const [schedule, setSchedule] = useState<ScheduleDay[]>([
    { id: 'day-1', items: [
      { id: 1, time: '09:00', duration: '3h', title: '경복궁 투어', description: '조선의 역사를 품은 궁궐 탐방', type: 'activity', icon: '🏛️', mood: 'CLASSIC', spots: '경복궁, 국립민속박물관', price: '무료', reason: '전통 문화를 깊이 있게 경험' },
      { id: 2, time: '12:30', duration: '1h', title: '점심 - 토속촌 삼계탕', description: '경복궁 인근 유명 맛집', type: 'meal', icon: '🍲', mood: 'CLASSIC', spots: '토속촌', price: '2만원', reason: '동선상 가까운 전통 한식' },
      { id: 3, time: '14:00', duration: '2h', title: '북촌 한옥마을 산책', description: '전통 한옥길을 걸으며', type: 'activity', icon: '🏘️', mood: 'CLASSIC', spots: '북촌 8경', price: '무료', reason: '오후 산책에 최적' },
    ]},
    { id: 'day-2', items: [
      { id: 4, time: '10:00', duration: '2h', title: '성수동 카페 투어', description: '핫플 카페 3곳 방문', type: 'activity', icon: '☕', mood: 'TRENDY', spots: '대림창고, 어니언', price: '1.5만원', reason: '젊은 감성의 트렌디한 공간' },
      { id: 5, time: '13:00', duration: '1h', title: '점심 - 성수 맛집', description: '감성 브런치 레스토랑', type: 'meal', icon: '🥐', mood: 'TRENDY', spots: '피카디리', price: '2.5만원', reason: '카페 투어 동선 연결' },
    ]},
    { id: 'day-3', items: [
      { id: 6, time: '11:00', duration: '3h', title: '한강 피크닉', description: '여의도 한강공원에서 힐링', type: 'activity', icon: '🌊', mood: 'RELAX', spots: '여의도 한강공원', price: '무료', reason: '자연 속 휴식' },
    ]},
  ]);

  const replacementOptions: Recommendation[] = [
    { id: 101, targetDay: 1, replaceId: 3, time: '14:00', duration: '2h', title: '인사동 전통차 체험', brandName: '익선다원', rating: 4.7, area: '인사동', tags: ['한옥', '포토스팟', '전통차'], description: '전통 찻집에서 한국 차 문화 체험', type: 'activity', icon: '🍵', mood: 'CLASSIC', spots: '익선다원, 차마시는뜰', price: '2만원', reason: '경복궁 동선과 연결, 전통 문화 심화', isSponsored: true },
    { id: 102, targetDay: 2, replaceId: 4, time: '10:00', duration: '2h', title: '을지로 감성 바 투어', brandName: 'Vinyl & Plastic', rating: 4.6, area: '을지로', tags: ['레트로', 'LP', '야경'], description: '레트로 감성 LP바와 루프탑', type: 'activity', icon: '🎵', mood: 'VIBE', spots: 'Vinyl&Plastic, 을지다락', price: '3만원', reason: '빈티지 감성, 성수와 다른 느낌' },
    { id: 103, targetDay: 2, replaceId: 4, time: '10:00', duration: '2.5h', title: '성수 팝업스토어 투어', brandName: '성수 팝업 셀렉션', rating: 4.5, area: '성수', tags: ['트렌드', '한정', '체험'], description: '요즘 가장 핫한 팝업 3곳', type: 'activity', icon: '🎪', mood: 'TRENDY', spots: '무신사, 젠틀몬스터', price: '무료', reason: '최신 트렌드 체험', isSponsored: false },
    { id: 104, targetDay: 3, replaceId: 6, time: '11:00', duration: '3h', title: '북한산 등산', brandName: '북한산 백운대', rating: 4.8, area: '북한산', tags: ['힐링', '전망', '피톤치드'], description: '가벼운 코스로 정상까지', type: 'activity', icon: '⛰️', mood: 'RELAX', spots: '북한산 백운대', price: '무료', reason: '더 적극적인 힐링' },
  ];

  const filteredOptions = useMemo(() => {
    let options = replacementOptions.filter(r => !excludedIds.includes(r.id));
    if (addMode) {
      const dayNo = addMode.day + 1;
      const dayMatched = options.filter((r) => r.targetDay === dayNo);
      return dayMatched.length ? dayMatched : options;
    }
    if (selectedSlot) {
      const matched = options.filter((r) => r.replaceId === selectedSlot.id);
      return matched.length ? matched : options;
    }
    return options;
  }, [addMode, selectedSlot, excludedIds]);

  const currentCard = filteredOptions[currentRecommendationIndex] ?? null;

  const handleRefresh = () => {
    setExcludedIds([]);
    setCurrentRecommendationIndex(0);
    x.set(0);
  };

  const handleSkip = () => {
    if (currentCard) setExcludedIds(prev => [...prev, currentCard.id]);
    const len = filteredOptions.length || 1;
    setCurrentRecommendationIndex(currentRecommendationIndex >= len - 1 ? len - 1 : currentRecommendationIndex + 1);
    x.set(0);
  };

  const handleAction = (item: Recommendation | null) => {
    if (!item || (!addMode && !selectedSlot) || isProcessing.current) return;
    isProcessing.current = true;

    const currentAddMode = addMode;
    const currentSelectedSlot = selectedSlot;

    setAddMode(null);
    setSelectedSlot(null);
    setCurrentRecommendationIndex(0);
    x.set(0);

    if (currentAddMode) {
      const dayIndex = currentAddMode.day;
      const added: ScheduleItem = {
        id: Date.now() + Math.floor(Math.random() * 1000000),
        time: item.time || '09:00',
        duration: item.duration,
        title: item.title,
        description: item.description,
        type: item.type,
        icon: item.icon,
        mood: item.mood,
        spots: item.spots,
        price: item.price,
        reason: item.reason,
      };

      setSchedule((currentSchedule) => {
        const alreadyExists = currentSchedule[dayIndex].items.some(i => i.id === added.id);
        if (alreadyExists) return currentSchedule;
        const newSchedule = [...currentSchedule];
        newSchedule[dayIndex] = {
          ...newSchedule[dayIndex],
          items: [...newSchedule[dayIndex].items, added].sort((a, b) => a.time.localeCompare(b.time))
        };
        return newSchedule;
      });
    } else if (currentSelectedSlot) {
      setSchedule((prev) =>
        prev.map((d) => ({
          ...d,
          items: d.items.map((i) =>
            i.id === currentSelectedSlot.id
              ? { id: currentSelectedSlot.id, time: item.time, duration: item.duration, title: item.title, description: item.description, type: item.type, icon: item.icon, mood: item.mood, spots: item.spots, price: item.price, reason: item.reason }
              : i
          ),
        }))
      );
    }

    setTimeout(() => { isProcessing.current = false; }, 500);
  };

  const handleCardDragEnd = (event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) handleAction(currentCard);
      else handleSkip();
    } else {
      x.set(0);
    }
  };

  const deleteScheduleItem = (dayIndex: number, itemId: number) => {
    setSchedule(prev => {
      const newSchedule = [...prev];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        items: newSchedule[dayIndex].items.filter(i => i.id !== itemId)
      };
      return newSchedule;
    });
  };

  return (
    <div className="no-scrollbar" style={{ flex: 1, background: '#020306', height: '100vh', overflowY: 'auto', paddingBottom: '20px' }}>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 헤더 */}
      <div style={{ padding: '20px 20px 0 20px' }}>
        <button onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={24} />
        </button>
      </div>

      <div style={{ padding: '20px 20px 10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', margin: '0 0 8px 0', lineHeight: 1.2 }}>
          당신의{' '}<span style={{ background: najeonGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>맞춤 여정</span>
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
          AI가 준비한 일정이에요!
        </p>
      </div>

      {/* 슬라이더 - 스와이프 */}
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div 
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const startX = touch.clientX;
            
            const handleMove = (moveE: TouchEvent) => {
              const deltaX = moveE.touches[0].clientX - startX;
              if (Math.abs(deltaX) > 50) {
                if (deltaX > 0 && currentSlide > 0) {
                  setCurrentSlide(currentSlide - 1);
                } else if (deltaX < 0 && currentSlide < topThreeWeeks.length - 1) {
                  setCurrentSlide(currentSlide + 1);
                }
                document.removeEventListener('touchmove', handleMove);
              }
            };
            
            document.addEventListener('touchmove', handleMove);
            document.addEventListener('touchend', () => {
              document.removeEventListener('touchmove', handleMove);
            }, { once: true });
          }}
          style={{ touchAction: 'pan-x' }}
        >
          {topThreeWeeks.map((bundle, idx) => {
            if (idx !== currentSlide) return null;
            const style = vibeStyles[bundle.moodKey];
            return (
              <motion.div 
                key={bundle.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ background: 'rgba(255,255,255,0.02)', border: glassBorder, borderRadius: '20px', padding: '16px' }}
              >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '14px', color: style.color, fontWeight: '900' }}>{bundle.koLabel}</span>
                  <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#fff', margin: '4px 0 6px' }}>{bundle.title}</h3>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px 0', lineHeight: 1.3 }}>{bundle.subTitle}</p>
                </div>
                <div style={{ width: '60px', height: '60px', background: style.grad, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', flexShrink: 0 }}>
                  <div style={{ color: '#000', fontSize: '18px' }}>{bundle.moodKey === 'TRENDY' ? '🔥' : bundle.moodKey === 'VIBE' ? '🎨' : '🧭'}</div>
                  <span style={{ fontSize: '9px', fontWeight: '950', color: '#000' }}>{bundle.moodKey}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} color={pearlColor} /><span style={{ fontSize: '10px', color: pearlColor, fontWeight: '800' }}>{bundle.metrics.schedule}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Map size={11} color={pearlColor} /><span style={{ fontSize: '10px', color: pearlColor, fontWeight: '800' }}>{bundle.metrics.dist}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} color={pearlColor} /><span style={{ fontSize: '10px', color: pearlColor, fontWeight: '800' }}>{bundle.metrics.time}</span></div>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {bundle.tags.map((t) => <span key={t} style={{ fontSize: '9px', color: style.color, fontWeight: '950', background: `${style.color}11`, padding: '3px 7px', borderRadius: '5px', border: `1px solid ${style.color}` }}>#{t}</span>)}
              </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* 인디케이터 - 최대 3개만 표시 */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
          {topThreeWeeks.map((_, idx) => {
            // 현재 슬라이드 기준 앞뒤 1개씩만 표시
            const distance = Math.abs(idx - currentSlide);
            if (distance > 1) return null;
            
            return (
              <div 
                key={idx} 
                onClick={() => setCurrentSlide(idx)} 
                style={{ 
                  width: currentSlide === idx ? '24px' : '8px', 
                  height: '8px', 
                  borderRadius: '4px', 
                  background: currentSlide === idx ? najeonGrad : 'rgba(255,255,255,0.2)', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s' 
                }} 
              />
            );
          })}
        </div>
      </div>

      {/* 일정 목록 - Reorder 기본 방식 */}
      <div style={{ padding: '20px' }}>
        <Reorder.Group axis="y" values={schedule} onReorder={setSchedule} style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {schedule.map((day, dayIndex) => {
            const isExpanded = expandedDay === dayIndex;
            return (
              <Reorder.Item key={day.id} value={day} style={{ listStyle: 'none', width: '100%', marginBottom: '24px' }}>
                <div style={{ background: isExpanded ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden' }}>
                  <div onClick={() => setExpandedDay(isExpanded ? -1 : dayIndex)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>{dayIndex + 1}일차</div>
                      <div style={{ fontSize: '11px', color: pearlColor, fontWeight: '700' }}>{getCalculatedDate(dayIndex)} · {day.items.length}개 일정</div>
                    </div>
                    <GripVertical size={20} color="rgba(255,255,255,0.35)" />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <Reorder.Group axis="y" values={day.items} onReorder={(newItems) => setSchedule((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, items: newItems } : d)))} style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                          {day.items.map((item) => {
                            const style = vibeStyles[item.mood] ?? { grad: najeonGrad, color: '#5EEAD4', label: String(item.mood) };
                            const swipeX = swipeStates[item.id] || 0;
                            
                            return (
                              <Reorder.Item key={item.id} value={item} style={{ listStyle: 'none', position: 'relative', overflow: 'hidden' }}>
                                {/* 빨간 삭제 배경 */}
                                <div 
                                  onClick={() => {
                                    deleteScheduleItem(dayIndex, item.id);
                                    setSwipeStates(prev => ({ ...prev, [item.id]: 0 }));
                                  }}
                                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: '#FF4D4D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '13px', cursor: 'pointer', zIndex: 1 }}
                                >
                                  삭제
                                </div>
                                
                                {/* 스와이프 컨텐츠 */}
                                <div
                                  onTouchStart={(e) => {
                                    const touch = e.touches[0];
                                    
                                    // 햄버거 영역이면 무시 (오른쪽 60px)
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    if (touch.clientX > rect.right - 60) return;
                                    
                                    const startX = touch.clientX;
                                    const startSwipeX = swipeX;
                                    let currentX = startSwipeX;
                                    
                                    const handleMove = (moveE: TouchEvent) => {
                                      const deltaX = moveE.touches[0].clientX - startX;
                                      currentX = Math.max(-80, Math.min(0, startSwipeX + deltaX));
                                      setSwipeStates(prev => ({ ...prev, [item.id]: currentX }));
                                    };
                                    
                                    const handleEnd = () => {
                                      // 마지막 currentX 값으로 판단
                                      if (currentX < -40) {
                                        setSwipeStates(prev => ({ ...prev, [item.id]: -80 }));
                                      } else {
                                        setSwipeStates(prev => ({ ...prev, [item.id]: 0 }));
                                      }
                                      document.removeEventListener('touchmove', handleMove);
                                      document.removeEventListener('touchend', handleEnd);
                                    };
                                    
                                    document.addEventListener('touchmove', handleMove);
                                    document.addEventListener('touchend', handleEnd);
                                  }}
                                  style={{ 
                                    transform: `translateX(${swipeX}px)`,
                                    transition: swipeX === 0 || swipeX === -80 ? 'transform 0.3s ease' : 'none',
                                    background: '#020306', 
                                    position: 'relative', 
                                    zIndex: 2,
                                    touchAction: 'pan-x',
                                  }}
                                >
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div onClick={() => { setSelectedSlot(item); setCurrentRecommendationIndex(0); setAddMode(null); }} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, cursor: 'pointer' }}>
                                    <span style={{ fontSize: '28px' }}>{item.icon}</span>
                                    <div>
                                      <div style={{ fontSize: '11px', fontWeight: '800', color: style.color, marginBottom: '2px' }}>{item.time} · {item.duration}</div>
                                      <div style={{ fontSize: '15px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>{item.title}</div>
                                      <div style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '6px', background: style.grad, fontSize: '9px', fontWeight: '900', color: '#000' }}>{style.label}</div>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <GripVertical size={20} color="rgba(255,255,255,0.18)" />
                                  </div>
                                </div>
                                </div>
                              </Reorder.Item>
                            );
                          })}
                        </Reorder.Group>
                        <div style={{ padding: '20px' }}>
                          <motion.div whileTap={{ scale: 0.95 }} onClick={() => { setAddMode({ day: dayIndex }); setSelectedSlot(null); setCurrentRecommendationIndex(0); }} style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '16px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Sparkles size={16} color="rgba(255,255,255,0.4)" /><span style={{ fontSize: '13px', fontWeight: '800', color: 'rgba(255,255,255,0.4)' }}>일정 추가하기</span>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div onClick={() => setExpandedDay(isExpanded ? -1 : dayIndex)} style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                    <ChevronsDown size={14} color="rgba(255,255,255,0.15)" />
                  </div>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>

      {/* 하단 버튼 */}
      {!selectedSlot && !addMode && (
        <div style={{ padding: '20px 20px 40px 20px', background: 'linear-gradient(to top, #020306 80%, transparent)' }}>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => router.push('/map')} style={{ width: '100%', background: najeonGrad, padding: '22px', borderRadius: '24px', border: 'none', color: '#000', fontWeight: '950', fontSize: '18px', cursor: 'pointer', boxShadow: '0 0 20px rgba(94, 234, 212, 0.5), 0 0 40px rgba(192, 132, 252, 0.3)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)', opacity: 0.3, pointerEvents: 'none' }} />
            경로 확인 하러가기
          </motion.button>
        </div>
      )}

      {/* 추천 모달 - 기존과 동일 */}
      <AnimatePresence>
        {(selectedSlot || addMode) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedSlot(null); setAddMode(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 40 }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 25 }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to bottom, #111418, #05070A)', padding: '30px 20px 50px', borderTopLeftRadius: '40px', borderTopRightRadius: '40px', zIndex: 50, borderTop: glassBorder }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 20px' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>{addMode ? 'AI 추천 장소' : '이 장소는 어떠세요?'}</h2>
              </div>
              <div style={{ height: '420px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                {currentCard ? (
                  <motion.div style={{ x, rotate, opacity, width: '100%', maxWidth: '380px', position: 'relative' }} drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={handleCardDragEnd}>
                    <motion.div style={{ position: 'absolute', top: '18px', left: '18px', background: '#FF4D4D', padding: '10px 16px', borderRadius: '14px', color: '#fff', fontWeight: '900', zIndex: 20, opacity: failHintOpacity, boxShadow: '0 8px 20px rgba(255,77,77,0.4)' }}>✕ PASS</motion.div>
                    <motion.div style={{ position: 'absolute', top: '18px', right: '18px', background: '#5EEAD4', padding: '10px 16px', borderRadius: '14px', color: '#000', fontWeight: '900', zIndex: 20, opacity: successHintOpacity, boxShadow: '0 8px 20px rgba(94,234,212,0.35)' }}>♥ PICK</motion.div>
                    <div style={{ borderRadius: '36px', border: glassBorder, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(18px)', boxShadow: '0 25px 60px rgba(0,0,0,0.55)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
                        {currentCard.isSponsored === false && <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'transparent', border: '1.5px solid #5EEAD4', color: '#5EEAD4', fontSize: '11px', fontWeight: '950', letterSpacing: '0.5px' }}>AD</div>}
                        {currentCard.isSponsored === true && <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'transparent', border: '1.5px solid rgb(244, 63, 94)', color: 'rgb(244, 63, 94)', fontSize: '11px', fontWeight: '950', letterSpacing: '0.5px' }}>SPONSORED</div>}
                      </div>
                      <div style={{ padding: '24px' }}>
                        <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>{currentCard.icon}</div>
                        <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: '8px' }}>{currentCard.brandName || currentCard.title}</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: '20px' }}>{currentCard.description}</div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <div style={{ padding: '8px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', fontSize: '12px', fontWeight: '800', color: '#FFD166' }}>★ {currentCard.rating?.toFixed(1) || '4.7'}</div>
                          <div style={{ padding: '8px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', fontSize: '12px', fontWeight: '800', color: 'rgba(255,255,255,0.8)' }}><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />{currentCard.area || '근처'}</div>
                          <div style={{ padding: '8px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', fontSize: '12px', fontWeight: '800', color: 'rgba(255,255,255,0.8)' }}><DollarSign size={14} style={{ display: 'inline', marginRight: '4px' }} />{currentCard.price}</div>
                        </div>
                        <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '900', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>추천 이유</div>
                          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{currentCard.reason}</div>
                        </div>
                        {currentCard.tags && <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>{currentCard.tags.map((t) => <div key={t} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.7)' }}>{t}</div>)}</div>}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div style={{ textAlign: 'center', paddingTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontSize: '48px' }}>🔄</div>
                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', fontWeight: '700' }}>모든 추천을 확인했어요!</div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRefresh} style={{ background: najeonGrad, border: 'none', borderRadius: '16px', padding: '16px 32px', color: '#000', fontSize: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 20px rgba(94,234,212,0.3)' }}>다시 보기</motion.button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', marginTop: '30px' }}>
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={handleSkip} style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,77,77,0.10)', border: '1px solid rgba(255,77,77,0.30)', color: '#FF4D4D', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', cursor: 'pointer' }}><X size={35} /></motion.button>
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleAction(currentCard); }} style={{ width: '70px', height: '70px', borderRadius: '50%', background: najeonGrad, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(94,234,212,0.30)', border: 'none', cursor: 'pointer' }}><Heart size={35} fill="#000" /></motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RouteDetail;
