'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  ChevronLeft, ChevronRight, ChefHat, BookOpen,
  Utensils, Coffee, MapPin, Theater, ShoppingBag, Camera, Leaf, Moon, Zap, TrendingUp,
  List, Calendar, Clock, Map, Palette, Flame, Compass,
  Car, PersonStanding, Plane, Bike, Footprints, ChevronsDown
} from 'lucide-react';

const RouteMaster = ({ setStep }: { setStep: (s: number) => void }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState<number | null>(null);

  const najeonGrad = "linear-gradient(135deg, #5EEAD4 0%, #C084FC 100%)";
  const glassBorder = "1px solid rgba(255, 255, 255, 0.12)";
  const pointColor = "#F0EAD6"; 

  const vibeStyles: Record<string, { grad: string, color: string, icon: React.ReactNode }> = {
    TRENDY: { grad: "linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)", color: "#F43F5E", icon: <Flame size={20}/> },
    VIBE: { grad: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)", color: "#A855F7", icon: <Palette size={20}/> },
    CLASSIC: { grad: "linear-gradient(135deg, #2DD4BF 0%, #5EEAD4 100%)", color: "#2DD4BF", icon: <Compass size={20}/> },
    RELAX: { grad: "linear-gradient(135deg, #10B981 0%, #34D399 100%)", color: "#10B981", icon: <Leaf size={20}/> },
  };

  const getIngredientRankStyle = (index: number) => {
    if (index === 0) return { background: vibeStyles.CLASSIC.grad, color: '#000' };
    if (index === 1) return { background: vibeStyles.VIBE.grad, color: '#000' };
    if (index === 2) return { background: vibeStyles.TRENDY.grad, color: '#000' };
    return { background: 'rgba(255, 255, 255, 0.08)', color: '#fff' };
  };

  useEffect(() => { setIsMounted(true); }, []);

  const analysisStats = [
    { label: "음식", value: 88, color: "#5EEAD4", icon: <Utensils size={10} /> },
    { label: "카페", value: 62, color: "#C084FC", icon: <Coffee size={10} /> },
    { label: "관광", value: 95, color: "#F472B6", icon: <MapPin size={10} /> },
    { label: "문화", value: 45, color: "#5EEAD4", icon: <Theater size={10} /> },
    { label: "쇼핑", value: 70, color: "#C084FC", icon: <ShoppingBag size={10} /> },
    { label: "경험", value: 82, color: "#F472B6", icon: <Camera size={10} /> },
    { label: "힐링", value: 55, color: "#5EEAD4", icon: <Leaf size={10} /> },
    { label: "심야", value: 38, color: "#C084FC", icon: <Moon size={10} /> },
  ];

  const premiumCategories = [
    { title: '장소', accentColor: '#5EEAD4', items: [{ name: '경복궁', count: 12, icon: '🏛️' }, { name: '한강공원', count: 10, icon: '🌊' }, { name: '명동거리', count: 8, icon: '🛍️' }] },
    { title: '맛집', accentColor: '#C084FC', items: [{ name: '카페', count: 15, icon: '☕' }, { name: '한식당', count: 12, icon: '🍲' }, { name: '디저트', count: 9, icon: '🍰' }] },
    { title: '문화', accentColor: '#5EEAD4', items: [{ name: '미술관', count: 6, icon: '🖼️' }, { name: '독립서점', count: 5, icon: '📖' }, { name: '공연장', count: 4, icon: '🎸' }] },
    { title: '쇼핑', accentColor: '#C084FC', items: [{ name: '편집샵', count: 11, icon: '👕' }, { name: '팝업스토어', count: 9, icon: '🎪' }, { name: '소품샵', count: 7, icon: '🕯️' }] },
    { title: '액티비티', accentColor: '#F472B6', items: [{ name: '원데이클래스', count: 8, icon: '🎨' }, { name: '한강 자전거', count: 6, icon: '🚲' }, { name: '남산 하이킹', count: 5, icon: '👟' }] },
    { title: '심야', accentColor: '#C084FC', items: [{ name: 'LP바', count: 7, icon: '🎵' }, { name: '심야식당', count: 6, icon: '🌃' }, { name: '라운지', count: 4, icon: '🍸' }] },
    { title: '경험', accentColor: '#5EEAD4', items: [{ name: '한복 체험', count: 9, icon: '👘' }, { name: '쿠킹 클래스', count: 4, icon: '🍳' }, { name: '전통 차', count: 4, icon: '🍵' }] },
    { title: '자연', accentColor: '#F472B6', items: [{ name: '숲길 산책', count: 5, icon: '🌲' }, { name: '루프탑 가든', count: 3, icon: '🌿' }, { name: '수목원', count: 3, icon: '🌸' }] }
  ];

  const totalWeekCount = 28;
  const allWeeks = Array.from({ length: totalWeekCount }, (_, i) => {
    const moods = ["TRENDY", "VIBE", "CLASSIC", "RELAX"];
    const mIdx = i % 4;
    return {
      id: i + 1,
      koLabel: `${i + 1}주차`,
      title: i === 0 ? "성수-한남 트렌드 스캔" : i === 1 ? "을지로 감성 아카이브" : i === 2 ? "북촌-삼청 전통 투어" : `서울 탐험 ${i + 1}주차`,
      subTitle: i === 0 ? "취향 맞춤형 팝업과 전시의 미식 여정" : i === 1 ? "레트로한 공간에서 즐기는 깊은 밤의 정취" : "고즈넉한 한옥 사이로 발견하는 서울의 어제와 오늘",
      tags: i === 0 ? ["팝업스토어", "K-패션", "미식"] : i === 1 ? ["LP바", "레트로", "노포"] : ["서울", "로컬", "탐험"],
      logic: i === 0 ? "당신이 선호하는 '힙한 브랜드'와 '전시' 위주로 베이스를 깔았습니다." : i === 1 ? "밤의 풍미를 더했습니다. 빈티지한 감성과 야경을 메인으로 조리했어요." : "균형 잡힌 로컬 탐험과 휴식을 위해 정밀 설계된 코스입니다.",
      moodKey: moods[mIdx],
      metrics: { schedule: "7일", dist: "12.4km", time: "4.5시간" },
      details: [
        { label: "주간 테마", val: i === 0 ? "트렌드 스캔" : i === 1 ? "감성 아카이브" : "로컬 탐험" },
        { label: "활동 당도", val: "매우 높음" },
        { label: "이동 효율", val: "최상(A+)" },
        { label: "평균 예산", val: `${Math.floor((50 + Math.random() * 30) / 7)}만/일` },
      ],
    };
  });

  if (!isMounted) return null;

  return (
    <>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes flowDown { from { background-position: 0 0; } to { background-position: 0 24px; } }
        .flowing-dash { animation: flowDown 1.5s linear infinite; }
      `}</style>

      {/* [1] 메인 영역 - paddingBottom 제거 */}
      <div className="no-scrollbar" style={{ flex: 1, background: '#020306', height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingBottom: '20px', boxSizing: 'border-box', filter: showAllWeeks ? 'brightness(0.5) blur(4px)' : 'none', transition: 'all 0.5s ease' }}>
        
        {/* 헤더 */}
        <div style={{ padding: '20px 20px 0 20px' }}>
          <button onClick={() => router.push('/?step=6')} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><ChevronLeft size={24} /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><ChefHat size={16} color="#5EEAD4" /><span style={{ fontSize: '11px', color: '#5EEAD4', fontWeight: '800', letterSpacing: '1px' }}>CHEF CHAERO'S MASTERPIECE</span></div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', lineHeight: '1.4', letterSpacing: '-0.8px', margin: 0 }}>당신을 위해 만든 <span style={{ background: najeonGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>맛있는 여행 레시피</span></h1>
          <div style={{ marginTop: '9px' }}><p style={{ color: '#94A3B8', fontSize: '14px', margin: 0, fontWeight: '500' }}>2026.01.01 ~ 2026.03.30</p></div>
        </div>

        {/* 차트 */}
        <div style={{ padding: '0 20px', margin: '20px 0' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: glassBorder, padding: '30px 10px 16px 10px', height: '170px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {analysisStats.map((stat, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '8px', fontWeight: '800', color: stat.color, marginBottom: '6px' }}>{stat.value}%</span>
                <motion.div initial={{ height: 0 }} whileInView={{ height: `${stat.value * 0.5}%` }} style={{ width: '8px', background: `linear-gradient(to top, ${stat.color}44, ${stat.color})`, borderRadius: '4px' }} />
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</span>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.2)' }}>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 핵심 재료 */}
        <div style={{ marginBottom: '30px', position: 'relative' }}>
          <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><TrendingUp size={14} color="#5EEAD4" /><span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>이번 여정의 핵심 재료</span></div>
          <div className="no-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '12px', padding: '0 20px', scrollPadding: '0 20px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
            {premiumCategories.map((cat, catIdx) => (
              <div key={catIdx} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: glassBorder, padding: '16px', minWidth: '170px', flexShrink: 0, scrollSnapAlign: 'start' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#fff', marginBottom: '14px', borderLeft: `3px solid ${cat.accentColor}`, paddingLeft: '8px' }}>{cat.title}</div>
                {cat.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < 2 ? '12px' : '0' }}>
                    <div style={{ ...getIngredientRankStyle(i), width: '22px', height: '22px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '950' }}>{i + 1}</div>
                    <div style={{ flex: 1, fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.icon} {item.name}</div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: cat.accentColor }}>{item.count}</div>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ minWidth: '8px', height: '1px' }} />
          </div>
        </div>

        {/* TOP 3 리스트 */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={16} color="#C084FC" /> 시작 추천 코스</div>
          {allWeeks.slice(0, 3).map((bundle) => {
            const isExpanded = expandedId === bundle.id;
            const style = vibeStyles[bundle.moodKey];
            return (
              <motion.div key={bundle.id} onClick={() => setExpandedId(isExpanded ? null : bundle.id)} layout style={{ background: isExpanded ? `rgba(255,255,255,0.04)` : 'rgba(255,255,255,0.02)', border: isExpanded ? `1px solid ${style.color}55` : glassBorder, borderRadius: '24px', cursor: 'pointer', overflow: 'hidden' }}>
                <div style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', gap: '10px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <span style={{ fontSize: '16px', color: style.color, fontWeight: '900' }}>{bundle.koLabel}</span>
                      <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', margin: '4px 0' }}>{bundle.title}</h3>
                      <p style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 12px 0' }}>{bundle.subTitle}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={10} color={pointColor}/><span style={{ fontSize: '10px', color: pointColor, fontWeight: '800' }}>{bundle.metrics.schedule}</span></div>
                        <div style={{ width: '1px', height: '8px', background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Map size={10} color={pointColor}/><span style={{ fontSize: '10px', color: pointColor, fontWeight: '800' }}>{bundle.metrics.dist}</span></div>
                        <div style={{ width: '1px', height: '8px', background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} color={pointColor}/><span style={{ fontSize: '10px', color: pointColor, fontWeight: '800' }}>{bundle.metrics.time}</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>{bundle.tags.map(t => (<span key={t} style={{ fontSize: '10px', color: style.color, fontWeight: '950', background: `${style.color}11`, padding: '4px 8px', borderRadius: '6px', border: `1px solid ${style.color}` }}>#{t}</span>))}</div>
                    </div>
                    <div style={{ width: '85px', background: style.grad, borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', flexShrink: 0 }}>
                      <div style={{ color: '#000' }}>{style.icon}</div>
                      <span style={{ fontSize: '11px', fontWeight: '950', color: '#000' }}>{bundle.moodKey}</span>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div style={{ marginTop: '18px', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Zap size={15} color={style.color} />
                          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0 }}><b>셰프의 노트:</b> {bundle.logic}</p>
                        </div>
                        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                          {bundle.details.map((d, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', fontWeight: '800' }}>{d.label}</span>
                              <span style={{ fontSize: '12px', color: '#fff', fontWeight: '900', borderLeft: `2px solid ${style.color}`, paddingLeft: '10px' }}>{d.val}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', background: 'rgba(255,255,255,0.03)' }}><ChevronsDown size={14} color="rgba(255,255,255,0.15)" /></div>
              </motion.div>
            );
          })}
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => setShowAllWeeks(true)} style={{ width: '100%', padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', color: '#fff', fontWeight: '900', fontSize: '18px', marginTop: '8px', cursor: 'pointer' }}>전체 일정 보기</motion.button>
        </div>

        {/* 하단 버튼 - 스크롤 컨텐츠 안에 위치 */}
        {!showAllWeeks && (
          <div style={{ padding: '20px 20px 40px 20px', background: 'linear-gradient(to top, #020306 80%, transparent)' }}>
            <motion.button 
              whileTap={{ scale: 0.96 }} 
              onClick={() => setStep?.(2)}
              style={{ 
                width: '100%', 
                background: najeonGrad, 
                padding: '22px', 
                borderRadius: '24px', 
                border: 'none', 
                color: '#000', 
                fontWeight: '950', 
                fontSize: '18px', 
                boxShadow: '0 0 20px rgba(94, 234, 212, 0.5), 0 0 40px rgba(192, 132, 252, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)', opacity: 0.3, pointerEvents: 'none' }} />
              상세 일정 만들기              
            </motion.button>
          </div>
        )}
      </div>

      {/* [3] 바텀시트 */}
      <AnimatePresence>
        {showAllWeeks && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAllWeeks(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, backdropFilter: 'blur(20px)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 35, stiffness: 300 }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '90vh', background: '#05070A', borderRadius: '32px 32px 0 0', zIndex: 201, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, textAlign: 'center' }}>
                <div style={{ width: '45px', height: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', margin: '0 auto 20px auto' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '950', color: '#fff', margin: 0 }}>제 레시피가  <span style={{ background: najeonGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>마음에 드세요?</span></h2>
              </div>
              <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '30px 20px 120px 20px', display: 'flex', flexDirection: 'column' }}>
                {allWeeks.map((week, index) => {
                  const isSheetExpanded = bottomSheetExpanded === week.id;
                  const style = vibeStyles[week.moodKey];
                  const TravelIcons = [Car, PersonStanding, Plane, Bike, Footprints];
                  const RandomIcon = TravelIcons[index % TravelIcons.length];
                  return (
                    <div key={week.id} style={{ display: 'flex', gap: '10px', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#05070A', border: `2px solid ${isSheetExpanded ? style.color : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '950', color: isSheetExpanded ? style.color : '#fff', zIndex: 2 }}>{week.id}</div>
                        {index < allWeeks.length - 1 && (
                          <div style={{ flex: 1, width: '2px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '4px 0' }}>
                            <div className="flowing-dash" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', backgroundImage: `linear-gradient(to bottom, ${style.color} 50%, transparent 50%)`, backgroundSize: '2px 14px', opacity: 0.2, zIndex: 1 }} />
                            {index % 2 === 0 && (<div style={{ position: 'relative', zIndex: 3, background: '#05070A', padding: '10px 0', color: style.color, opacity: 0.8 }}><RandomIcon size={22} strokeWidth={2.5} /></div>)}
                          </div>
                        )}
                      </div>
                      <motion.div layout onClick={() => setBottomSheetExpanded(isSheetExpanded ? null : week.id)} style={{ flex: 1, background: isSheetExpanded ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: isSheetExpanded ? `1px solid ${style.color}44` : '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden', marginBottom: '32px' }}>
                        <div style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', gap: '12px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <span style={{ fontSize: '16px', color: style.color, fontWeight: '900' }}>{week.koLabel}</span>
                              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', margin: '4px 0' }}>{week.title}</h3>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={10} color={pointColor}/><span style={{ fontSize: '10px', color: pointColor, fontWeight: '800' }}>{week.metrics.schedule}</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Map size={10} color={pointColor}/><span style={{ fontSize: '10px', color: pointColor, fontWeight: '800' }}>{week.metrics.dist}</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} color={pointColor}/><span style={{ fontSize: '10px', color: pointColor, fontWeight: '800' }}>{week.metrics.time}</span></div>
                              </div>
                              <div style={{ display: 'flex', gap: '2px' }}>{week.tags.map(t => (<span key={t} style={{ fontSize: '10px', color: style.color, fontWeight: '950', background: `${style.color}11`, padding: '4px 8px', borderRadius: '6px', border: `1px solid ${style.color}` }}>#{t}</span>))}</div>
                            </div>
                            <div style={{ width: '65px', background: style.grad, borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', flexShrink: 0 }}>
                              <div style={{ color: '#000' }}>{style.icon}</div>
                              <span style={{ fontSize: '11px', fontWeight: '950', color: '#000' }}>{week.moodKey}</span>
                            </div>
                          </div>
                          <AnimatePresence>
                            {isSheetExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                                <div style={{ marginTop: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '16px' }}>
                                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}><b>셰프의 노트:</b> {week.logic}</p>
                                </div>
                                <div style={{ marginTop: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                                  {week.details.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontWeight: '800' }}>{d.label}</span>
                                      <span style={{ fontSize: '12px', color: '#fff', fontWeight: '800', borderLeft: `2px solid ${style.color}`, paddingLeft: '8px' }}>{d.val}</span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', background: 'rgba(255,255,255,0.03)' }}><ChevronsDown size={14} color="rgba(255,255,255,0.1)" /></div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RouteMaster;
