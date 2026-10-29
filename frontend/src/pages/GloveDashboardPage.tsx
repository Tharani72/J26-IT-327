import React, { useState, useEffect } from 'react';
import GlovePracticeSession from '../features/smart-glove/GlovePracticeSession';
import { supabase } from '../services/supabase';
import { gloveBle } from '../services/gloveBleService';

interface SignLetter {
  id: string;
  letter: string;
  name: string;
  type: 'vowel' | 'consonant' | 'special';
  progress: number;
  stars: number;
  isDynamic: boolean;
}

const SLSL_ALPHABET: SignLetter[] = [
  // ස්වර (Vowels - 16)
  { id: 'v1', letter: 'අ', name: 'A', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v2', letter: 'ආ', name: 'Aa', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v3', letter: 'ඇ', name: 'Ae', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v4', letter: 'ඈ', name: 'Aae', type: 'vowel', progress: 0, stars: 0, isDynamic: true },
  { id: 'v5', letter: 'ඉ', name: 'I', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v6', letter: 'ඊ', name: 'Ii', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v7', letter: 'උ', name: 'U', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v8', letter: 'ඌ', name: 'Uu', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v9', letter: 'එ', name: 'E', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v10', letter: 'ඒ', name: 'Ee', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v11', letter: 'ඔ', name: 'O', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v12', letter: 'ඕ', name: 'Oo', type: 'vowel', progress: 0, stars: 0, isDynamic: true },
  { id: 'v13', letter: 'ඓ', name: 'Ai', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v14', letter: 'ඖ', name: 'Au', type: 'vowel', progress: 0, stars: 0, isDynamic: true },
  { id: 'v15', letter: 'ං', name: 'Binduwa', type: 'vowel', progress: 0, stars: 0, isDynamic: true },
  { id: 'v16', letter: 'ඃ', name: 'Visargaya', type: 'vowel', progress: 0, stars: 0, isDynamic: true },

  // ප්‍රධාන ව්‍යංජන (Consonants - 35)
  { id: 'c1', letter: 'ක', name: 'Ka', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c2', letter: 'ඛ', name: 'Kha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c3', letter: 'ග', name: 'Ga', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c4', letter: 'ඝ', name: 'Gha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c5', letter: 'ඞ', name: 'Nga', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c6', letter: 'ච', name: 'Cha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c7', letter: 'ඡ', name: 'Chha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c8', letter: 'ජ', name: 'Ja', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c9', letter: 'ඣ', name: 'Jha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c10', letter: 'ඤ', name: 'Nya', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c11', letter: 'ට', name: 'Ta', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c12', letter: 'ඨ', name: 'Tha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c13', letter: 'ඩ', name: 'Da', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c14', letter: 'ඪ', name: 'Dha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c15', letter: 'ණ', name: 'Na (Murdhaja)', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c16', letter: 'ත', name: 'Tha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c17', letter: 'ථ', name: 'Thha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c18', letter: 'ද', name: 'Da', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c19', letter: 'ධ', name: 'Dha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c20', letter: 'න', name: 'Na (Dantaja)', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c21', letter: 'ප', name: 'Pa', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c22', letter: 'ඵ', name: 'Pha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c23', letter: 'බ', name: 'Ba', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c24', letter: 'භ', name: 'Bha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c25', letter: 'ම', name: 'Ma', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c26', letter: 'ය', name: 'Ya', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c27', letter: 'ර', name: 'Ra', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c28', letter: 'ල', name: 'La', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c29', letter: 'ව', name: 'Wa', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c30', letter: 'ශ', name: 'Sha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c31', letter: 'ෂ', name: 'Ssha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c32', letter: 'ස', name: 'Sa', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c33', letter: 'හ', name: 'Ha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c34', letter: 'ළ', name: 'La (Murdhaja)', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c35', letter: 'ෆ', name: 'Fa', type: 'consonant', progress: 0, stars: 0, isDynamic: false },

  // සඤ්ඤක සහ විශේෂ අකුරු (9)
  { id: 's1', letter: 'ඟ', name: 'Nga (Sanyaka)', type: 'special', progress: 0, stars: 0, isDynamic: true },
  { id: 's2', letter: 'ඦ', name: 'Nja (Sanyaka)', type: 'special', progress: 0, stars: 0, isDynamic: true },
  { id: 's3', letter: 'ඬ', name: 'Nda (Sanyaka)', type: 'special', progress: 0, stars: 0, isDynamic: false },
  { id: 's4', letter: 'ඳ', name: 'Nda (Dantaja)', type: 'special', progress: 0, stars: 0, isDynamic: true },
  { id: 's5', letter: 'ඹ', name: 'Mba (Sanyaka)', type: 'special', progress: 0, stars: 0, isDynamic: false },
  { id: 's6', letter: 'ඥ', name: 'Gna', type: 'special', progress: 0, stars: 0, isDynamic: false },
  { id: 's7', letter: 'ක්ෂ', name: 'Ksha', type: 'special', progress: 0, stars: 0, isDynamic: false },
  { id: 's8', letter: 'නෑ', name: 'Nae (Sign)', type: 'special', progress: 0, stars: 0, isDynamic: true },
  { id: 's9', letter: 'වේ', name: 'We (Sign)', type: 'special', progress: 0, stars: 0, isDynamic: true },
];

const ITEMS_PER_PAGE = 12;

// 🎨 High-Contrast Professional Kid Themes (Crisp, Ultra-Sharp & Playful)
const CARD_THEMES = [
  {
    topAccent: '#38bdf8', // Sky Blue
    letterColor: '#0369a1',
    badgeBg: '#e0f2fe',
    badgeColor: '#0284c7',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    barGrad: 'linear-gradient(90deg, #38bdf8, #0284c7)',
    dotIcon: '🔹'
  },
  {
    topAccent: '#fb7185', // Rose Pink
    letterColor: '#be123c',
    badgeBg: '#ffe4e6',
    badgeColor: '#e11d48',
    glowColor: 'rgba(251, 113, 133, 0.35)',
    barGrad: 'linear-gradient(90deg, #fb7185, #e11d48)',
    dotIcon: '🌸'
  },
  {
    topAccent: '#34d399', // Mint Emerald
    letterColor: '#047857',
    badgeBg: '#d1fae5',
    badgeColor: '#059669',
    glowColor: 'rgba(52, 211, 153, 0.35)',
    barGrad: 'linear-gradient(90deg, #34d399, #059669)',
    dotIcon: '🍀'
  },
  {
    topAccent: '#fb923c', // Sunset Coral
    letterColor: '#c2410c',
    badgeBg: '#ffedd5',
    badgeColor: '#ea580c',
    glowColor: 'rgba(251, 146, 60, 0.35)',
    barGrad: 'linear-gradient(90deg, #fb923c, #ea580c)',
    dotIcon: '🍊'
  },
  {
    topAccent: '#c084fc', // Lilac Gem
    letterColor: '#7e22ce',
    badgeBg: '#f3e8ff',
    badgeColor: '#9333ea',
    glowColor: 'rgba(192, 132, 252, 0.35)',
    barGrad: 'linear-gradient(90deg, #c084fc, #9333ea)',
    dotIcon: '💜'
  },
  {
    topAccent: '#facc15', // Warm Gold
    letterColor: '#a16207',
    badgeBg: '#fef9c3',
    badgeColor: '#ca8a04',
    glowColor: 'rgba(250, 204, 21, 0.35)',
    barGrad: 'linear-gradient(90deg, #facc15, #ca8a04)',
    dotIcon: '⭐'
  }
];

export default function GloveDashboardPage() {
  const [alphabetList, setAlphabetList] = useState<SignLetter[]>(SLSL_ALPHABET);
  const [selectedLetter, setSelectedLetter] = useState<SignLetter | null>(null);
  const [filter, setFilter] = useState<'all' | 'vowels' | 'consonants' | 'special'>('vowels');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredLetterId, setHoveredLetterId] = useState<string | null>(null);

  // Live Glove Status
  const [gloveOnline, setGloveOnline] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(0);

  // Navigation View State
  const [activeView, setActiveView] = useState<'dashboard' | 'testbench' | 'evaluation'>('dashboard');

  // Modal State
  const [showFitmentModal, setShowFitmentModal] = useState(false);
  const [fitmentStep, setFitmentStep] = useState<1 | 2 | 3>(1);
  const [isConnecting, setIsConnecting] = useState(false);

  // Supabase Data Load & Realtime Sync
  useEffect(() => {
    const fetchStudentProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('student_sign_progress')
          .select('*')
          .eq('student_id', 'kavisa-01');

        if (!error && data && data.length > 0) {
          setAlphabetList(prevList =>
            prevList.map(letterItem => {
              const saved = data.find(d => d.letter_id === letterItem.id);
              if (saved) {
                return {
                  ...letterItem,
                  progress: saved.progress ?? letterItem.progress,
                  stars: saved.stars ?? letterItem.stars,
                };
              }
              return letterItem;
            })
          );
        }
      } catch (err) {
        console.error("Error fetching progress from Supabase:", err);
      }
    };

    fetchStudentProgress();

    const channel = supabase
      .channel('realtime_dashboard_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_sign_progress' },
        () => {
          fetchStudentProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredAlphabet = alphabetList.filter(item => {
    if (filter === 'vowels') return item.type === 'vowel';
    if (filter === 'consonants') return item.type === 'consonant';
    if (filter === 'special') return item.type === 'special';
    return true;
  });

  const totalPages = Math.ceil(filteredAlphabet.length / ITEMS_PER_PAGE);
  const displayedLetters = filteredAlphabet.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (newFilter: 'all' | 'vowels' | 'consonants' | 'special') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };


  return (
    <div style={{ 
      minHeight: '100vh', 
      fontFamily: "'Quicksand', 'Nunito', 'Chalkboard SE', 'Comic Sans MS', sans-serif", 
      padding: '24px 0 60px',
      userSelect: 'none'
    }}>
      
      {/* 🌟 KEYFRAMES & MICRO-INTERACTIONS */}
      <style>{`
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .kid-glass-card {
          position: relative;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 28px;
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .kid-glass-card:active {
          transform: scale(0.96) translateY(2px) !important;
        }
      `}</style>

      {/* 1. HERO SECTION */}
      <section style={{ maxWidth: '1400px', width: '92%', margin: '0 auto 24px', padding: '0 12px' }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.75)', 
          backdropFilter: 'blur(24px)',
          borderRadius: '32px', 
          padding: '26px 36px', 
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.05), inset 0 2px 4px rgba(255, 255, 255, 0.95)', 
          border: '2px solid rgba(255, 255, 255, 0.9)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap', 
          gap: '20px'
        }}>
          <div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: gloveOnline ? '#ecfdf5' : '#fef2f2', 
              border: `1.5px solid ${gloveOnline ? '#a7f3d0' : '#fecaca'}`, 
              padding: '6px 14px', 
              borderRadius: '24px', 
              marginBottom: '10px' 
            }}>
              <span style={{ 
                width: '10px', 
                height: '10px', 
                background: gloveOnline ? '#10b981' : '#ef4444', 
                borderRadius: '50%', 
                display: 'inline-block', 
                boxShadow: `0 0 8px ${gloveOnline ? '#10b981' : '#ef4444'}` 
              }}></span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: gloveOnline ? '#065f46' : '#991b1b' }}>
                {gloveOnline ? `Smart Glove සක්‍රියයි 🔋 ${batteryLevel}% බැටරිය` : 'Smart Glove විසන්ධි වී ඇත (Offline)'}
              </span>
            </div>

            <h1 style={{ fontSize: '32px', margin: '4px 0 8px 0', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
              ස්මාර්ට් ග්ලවුස් ඉගෙනුම් මැදිරිය 🧤✨
            </h1>
            <p style={{ fontSize: '15px', color: '#475569', margin: 0, fontWeight: '700', maxWidth: '650px' }}>
              කැමති අකුරක් තෝරන්න! ස්මාර්ට් ග්ලවුස් එකෙන් ඔයාගේ ඇඟිලි නිවැරදි සංඥාවට මෘදුව නවා පෙන්වාවි.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
  {/* ළමයාට අවශ්‍ය එකම බොත්තම පමණක් මෙහි තබන්න */}
  <button 
    onClick={() => { setShowFitmentModal(true); setFitmentStep(1); }}
    style={{ 
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
      color: '#ffffff', 
      border: '2px solid rgba(255, 255, 255, 0.7)', 
      padding: '14px 28px', 
      borderRadius: '22px', 
      fontWeight: '800', 
      fontSize: '15px', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      boxShadow: '0 8px 20px rgba(217, 119, 6, 0.3)',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <span style={{ fontSize: '18px' }}>🧤</span> ග්ලවුස් එක පළඳින්න (Fitment Check)
  </button>
</div>
        </div>
      </section>

      {/* 2. ALPHABET DASHBOARD */}
      <main style={{ maxWidth: '1400px', width: '92%', margin: '0 auto', padding: '0 12px' }}>
        
        {/* Navigation Bar */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.72)', 
          backdropFilter: 'blur(24px)', 
          padding: '16px 26px', 
          borderRadius: '28px', 
          marginBottom: '24px',
          border: '2px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.04), inset 0 2px 4px rgba(255, 255, 255, 0.95)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a', fontWeight: '900' }}>
              {filter === 'vowels' && '🌈 ස්වර අකුරු (Vowels)'}
              {filter === 'consonants' && '🚀 ව්‍යංජන අකුරු (Consonants)'}
              {filter === 'special' && '✨ සඤ්ඤක / විශේෂ අකුරු'}
              {filter === 'all' && '📚 සියලුම සංඥා අකුරු'}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '800' }}>
              අකුරු {filteredAlphabet.length} න් {displayedLetters.length} ක් පෙන්වයි
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '6px', borderRadius: '24px', border: '1.5px solid #e2e8f0' }}>
            {[
              { id: 'vowels', label: '🌈 ස්වර (16)' },
              { id: 'consonants', label: '🚀 ව්‍යංජන (35)' },
              { id: 'special', label: '✨ සඤ්ඤක (9)' },
              { id: 'all', label: 'සියල්ල (60)' },
            ].map(tab => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange(tab.id as any)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '18px',
                    border: 'none',
                    background: active ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                    color: active ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '800',
                    boxShadow: active ? '0 6px 14px rgba(37, 99, 235, 0.35)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 💎 3. GLASS EFFECT CRYSTAL CARDS */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', 
          gap: '22px', 
          marginBottom: '32px' 
        }}>
          {displayedLetters.map((item, index) => {
            const theme = CARD_THEMES[index % CARD_THEMES.length];
            const isHovered = hoveredLetterId === item.id;
            const isSelected = selectedLetter?.id === item.id;

            return (
              <div
                key={item.id}
                className="kid-glass-card"
                onClick={() => setSelectedLetter(item)}
                onMouseEnter={() => setHoveredLetterId(item.id)}
                onMouseLeave={() => setHoveredLetterId(null)}
                style={{
                  // 🔴 මෙතන තමයි Transparency එක වැඩි කරලා තියෙන්නේ (0.60)
                  background: isHovered 
                    ? 'rgba(255, 255, 255, 0.85)' 
                    : 'rgba(255, 255, 255, 0.60)',
                  border: isSelected
                    ? '3px solid #2563eb'
                    : isHovered
                    ? `2.5px solid ${theme.topAccent}`
                    : '2px solid rgba(255, 255, 255, 0.6)', // Border එකත් ටිකක් transparent කළා
                  padding: '24px 18px 20px',
                  boxShadow: isHovered
                    ? `0 20px 32px -8px ${theme.glowColor}, 0 8px 16px rgba(15, 23, 42, 0.06), inset 0 2px 4px rgba(255, 255, 255, 0.8)`
                    : '0 10px 24px -6px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: '235px',
                }}
              >
                {/* 🌟 Top Color Accent Indicator Bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '25%',
                  right: '25%',
                  height: '4px',
                  background: theme.topAccent,
                  borderRadius: '0 0 6px 6px',
                  boxShadow: `0 2px 8px ${theme.topAccent}`,
                }} />

                {/* 🏷️ Top Badges: Sparkle and Motion Indicator */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    filter: isHovered ? 'scale(1.2)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }}>
                    {theme.dotIcon}
                  </span>

                  {item.isDynamic && (
                    <span style={{ 
                      fontSize: '11px', 
                      background: 'rgba(254, 243, 199, 0.85)', // මේකත් ටිකක් transparent කළා
                      color: '#92400e', 
                      border: '1.2px solid #fde68a', 
                      padding: '3px 10px', 
                      borderRadius: '12px', 
                      fontWeight: '800',
                      boxShadow: '0 2px 4px rgba(217, 119, 6, 0.12)'
                    }}>
                      👋 චලනය
                    </span>
                  )}
                </div>

                {/* 🔤 ULTRA-SHARP BOLD SINHALA LETTER (ඉංග්‍රීසි අකුර ඉවත් කර සිංහල අකුර ලොකු කර ඇත) */}
                <div style={{
                  fontSize: '65px', 
                  fontWeight: '900',
                  color: theme.letterColor,
                  margin: '12px 0 16px 0', 
                  lineHeight: '1.1',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>
                  {item.letter}
                </div>

                {/* ⭐ 3D SOLID GOLD STARS */}
                <div style={{ 
                  display: 'flex', 
                  gap: '4px', 
                  margin: '8px 0 6px 0', 
                  fontSize: '17px',
                }}>
                  {[1, 2, 3].map(starIndex => (
                    <span 
                      key={starIndex}
                      style={{ 
                        filter: starIndex <= item.stars 
                          ? 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.5))' 
                          : 'grayscale(100%) opacity(25%)',
                        transform: (isHovered && starIndex <= item.stars) ? 'scale(1.18)' : 'scale(1)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                {/* 🧪 CLEAN PROGRESS BAR */}
                <div style={{ width: '100%' }}>
                  <div style={{ 
                    background: 'rgba(241, 245, 249, 0.6)', // Progress bar Background එකත් transparent කළා
                    height: '10px', 
                    borderRadius: '12px', 
                    padding: '2px',
                    border: '1.5px solid rgba(226, 232, 240, 0.8)',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${item.progress}%`, 
                      height: '100%', 
                      background: theme.barGrad,
                      borderRadius: '10px',
                      boxShadow: item.progress > 0 ? `0 0 8px ${theme.glowColor}` : 'none',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                  
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#334155', 
                    marginTop: '5px', 
                    display: 'block', 
                    fontWeight: '900',
                    textAlign: 'center'
                  }}>
                    {item.progress}% පුහුණුයි
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. PAGE SWITCHER */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', margin: '20px 0' }}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ 
                padding: '11px 22px', 
                borderRadius: '20px', 
                border: '2px solid rgba(255, 255, 255, 0.95)', 
                background: currentPage === 1 ? 'rgba(226, 232, 240, 0.7)' : 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(16px)',
                color: currentPage === 1 ? '#94a3b8' : '#1e3a8a', 
                fontWeight: '800', 
                fontSize: '14px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                transition: 'all 0.2s'
              }}
            >
              ◀ පෙර අකුරු
            </button>

            <span style={{ 
              background: 'rgba(255, 255, 255, 0.85)', 
              backdropFilter: 'blur(16px)',
              border: '2px solid rgba(255, 255, 255, 0.95)',
              padding: '9px 22px', 
              borderRadius: '18px', 
              fontWeight: '900', 
              color: '#0f172a',
              fontSize: '14px',
              boxShadow: '0 6px 18px rgba(0,0,0,0.04)'
            }}>
              පිටුව {currentPage} / {totalPages}
            </span>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ 
                padding: '11px 22px', 
                borderRadius: '20px', 
                border: '2px solid rgba(255, 255, 255, 0.95)', 
                background: currentPage === totalPages ? 'rgba(226, 232, 240, 0.7)' : 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(16px)',
                color: currentPage === totalPages ? '#94a3b8' : '#1e3a8a', 
                fontWeight: '800', 
                fontSize: '14px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                transition: 'all 0.2s'
              }}
            >
              ඊළඟ අකුරු ▶
            </button>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 🟢 5. REAL BLUETOOTH & 2-POINT CALIBRATION MODAL (With Close ✕ Button)     */}
      {/* ========================================================================= */}
      {showFitmentModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowFitmentModal(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}
        >
          <div style={{ 
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.96)', 
            backdropFilter: 'blur(24px)', 
            borderRadius: '32px', 
            padding: '36px', 
            maxWidth: '480px', 
            width: '90%', 
            textAlign: 'center', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255, 255, 255, 0.95)',
            border: '2px solid rgba(255, 255, 255, 0.95)'
          }}>
            
            {/* ❌ CLOSE BUTTON */}
            <button
              onClick={() => setShowFitmentModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#f1f5f9',
                border: '1.5px solid #e2e8f0',
                color: '#64748b',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Step Indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              {[1, 2, 3].map(stepNum => (
                <div key={stepNum} style={{ width: '40px', height: '6px', borderRadius: '4px', background: fitmentStep >= stepNum ? '#2563eb' : '#e2e8f0' }} />
              ))}
            </div>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', color: '#0f172a', fontWeight: '900' }}>ග්ලවුස් එක පළඳින්න 🧤</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', fontWeight: 'bold' }}>පියවර {fitmentStep} / 3</p>

            {/* Step 1: Bluetooth Connection */}
            {fitmentStep === 1 && (
              <div>
                <div style={{ width: '100%', height: '140px', background: '#eff6ff', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1.5px solid #dbeafe' }}>
                  <span style={{ fontSize: '56px' }}>🧤📶</span>
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '17px', color: '#1e293b' }}>පියවර 1: ස්මාර්ට් ග්ලවුස් එක සම්බන්ධ කරන්න</h4>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
                  ග්ලවුස් එක අතට පැළඳ Switch එක On කරන්න. පසුව පහත බොත්තම ඔබා Bluetooth මගින් සම්බන්ධ කරන්න.
                </p>

                <button 
                  disabled={isConnecting}
                  onClick={async () => {
                    setIsConnecting(true);
                    const success = await gloveBle.connect((data) => {
                      if (data.battery) setBatteryLevel(data.battery);
                      setGloveOnline(true);
                    });
                    setIsConnecting(false);
                    if (success) {
                      setGloveOnline(true);
                      setFitmentStep(2);
                    }
                  }}
                  style={{ 
                    marginTop: '20px', 
                    width: '100%', 
                    background: isConnecting ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '14px', 
                    borderRadius: '18px', 
                    fontWeight: 'bold', 
                    fontSize: '15px', 
                    cursor: isConnecting ? 'not-allowed' : 'pointer', 
                    boxShadow: '0 6px 18px rgba(37, 99, 235, 0.4)' 
                  }}
                >
                  {isConnecting ? '⏳ සම්බන්ධ වෙමින් පවතී...' : '📶 බ්ලූටූත් මගින් ග්ලවුස් එක සම්බන්ධ කරන්න'}
                </button>
              </div>
            )}

            {/* Step 2: 2-Point Calibration */}
            {fitmentStep === 2 && (
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '17px', color: '#1e293b' }}>පියවර 2: අතේ ප්‍රමාණය ක්‍රමාංකනය (Calibration)</h4>
                <p style={{ fontSize: '13px', color: '#475569', marginBottom: '18px', lineHeight: '1.5' }}>
                  1. අත දිගහැර පළමු බොත්තම ඔබන්න. <br />
                  2. පසුව මිට මොළවා දෙවන බොත්තම ඔබන්න.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <button 
                    onClick={() => {
                      gloveBle.sendCommand({ action: "CALIBRATE_FLAT" });
                      alert("✓ අත දිගහැරි කෝණය (0° Flat Hand Baseline) සාර්ථකව සටහන් කරගන්නා ලදී!");
                    }}
                    style={{ padding: '14px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
                  >
                    ✋ 1. අත දිගහරින්න (0° Baseline)
                  </button>

                  <button 
                    onClick={() => {
                      gloveBle.sendCommand({ action: "CALIBRATE_FIST" });
                      alert("✓ මිට මොළවූ කෝණය (85° Closed Fist Max) සාර්ථකව සටහන් කරගන්නා ලදී!");
                      setFitmentStep(3);
                    }}
                    style={{ padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                  >
                    ✊ 2. මිට මොළවන්න (85° Max Flexion)
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success Confirmation */}
            {fitmentStep === 3 && (
              <div>
                <div style={{ fontSize: '60px', marginBottom: '10px' }}>🎉✨</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#16a34a', fontWeight: '900' }}>අතේ ප්‍රමාණය 100% ක් නිවැරදියි!</h4>
                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>සෙන්සර් කෝණ ඔබේ අතේ සයිස් එකට සාර්ථකව ගළපා ගන්නා ලදී.</p>
                <button onClick={() => setShowFitmentModal(false)} style={{ width: '100%', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', padding: '14px', borderRadius: '18px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 6px 18px rgba(22, 163, 74, 0.4)' }}>
                  දැන් පුහුණුව අරඹන්න 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. DYNAMIC PRACTICE SESSION OVERLAY */}
      {selectedLetter && (
        <GlovePracticeSession 
          letter={selectedLetter} 
          onClose={() => setSelectedLetter(null)} 
        />
      )}
    </div>
  );
}