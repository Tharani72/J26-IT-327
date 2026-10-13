import React, { useState } from 'react';
import GlovePracticeSession from '../features/smart-glove/GlovePracticeSession';
import GloveTestBenchPage from './GloveTestBenchPage';
import GloveEvaluationPage from './GloveEvaluationPage';

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
  { id: 'v1', letter: 'අ', name: 'A', type: 'vowel', progress: 100, stars: 3, isDynamic: false },
  { id: 'v2', letter: 'ආ', name: 'Aa', type: 'vowel', progress: 85, stars: 3, isDynamic: false },
  { id: 'v3', letter: 'ඇ', name: 'Ae', type: 'vowel', progress: 60, stars: 2, isDynamic: false },
  { id: 'v4', letter: 'ඈ', name: 'Aae', type: 'vowel', progress: 40, stars: 1, isDynamic: true },
  { id: 'v5', letter: 'ඉ', name: 'I', type: 'vowel', progress: 90, stars: 3, isDynamic: false },
  { id: 'v6', letter: 'ඊ', name: 'Ii', type: 'vowel', progress: 75, stars: 2, isDynamic: false },
  { id: 'v7', letter: 'උ', name: 'U', type: 'vowel', progress: 50, stars: 1, isDynamic: false },
  { id: 'v8', letter: 'ඌ', name: 'Uu', type: 'vowel', progress: 20, stars: 0, isDynamic: false },
  { id: 'v9', letter: 'එ', name: 'E', type: 'vowel', progress: 80, stars: 2, isDynamic: false },
  { id: 'v10', letter: 'ඒ', name: 'Ee', type: 'vowel', progress: 30, stars: 1, isDynamic: false },
  { id: 'v11', letter: 'ඔ', name: 'O', type: 'vowel', progress: 10, stars: 0, isDynamic: false },
  { id: 'v12', letter: 'ඕ', name: 'Oo', type: 'vowel', progress: 0, stars: 0, isDynamic: true },
  { id: 'v13', letter: 'ඓ', name: 'Ai', type: 'vowel', progress: 0, stars: 0, isDynamic: false },
  { id: 'v14', letter: 'ඖ', name: 'Au', type: 'vowel', progress: 0, stars: 0, isDynamic: true },
  { id: 'v15', letter: 'ං', name: 'Binduwa', type: 'vowel', progress: 0, stars: 0, isDynamic: true },
  { id: 'v16', letter: 'ඃ', name: 'Visargaya', type: 'vowel', progress: 0, stars: 0, isDynamic: true },

  // ප්‍රධාන ව්‍යංජන (Consonants)
  { id: 'c1', letter: 'ක', name: 'Ka', type: 'consonant', progress: 95, stars: 3, isDynamic: false },
  { id: 'c2', letter: 'ඛ', name: 'Kha', type: 'consonant', progress: 10, stars: 0, isDynamic: false },
  { id: 'c3', letter: 'ග', name: 'Ga', type: 'consonant', progress: 65, stars: 2, isDynamic: false },
  { id: 'c4', letter: 'ඝ', name: 'Gha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c5', letter: 'ඞ', name: 'Nga', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c6', letter: 'ච', name: 'Cha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c7', letter: 'ඡ', name: 'Chha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c8', letter: 'ජ', name: 'Ja', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c9', letter: 'ඣ', name: 'Jha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c10', letter: 'ඤ', name: 'Nya', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c11', letter: 'ට', name: 'Ta', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c12', letter: 'ඨ', name: 'Tha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c13', letter: 'ඩ', name: 'Da', type: 'consonant', progress: 85, stars: 3, isDynamic: false },
  { id: 'c14', letter: 'ඪ', name: 'Dha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c15', letter: 'ණ', name: 'Na (Murdhaja)', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c16', letter: 'ත', name: 'Tha', type: 'consonant', progress: 45, stars: 1, isDynamic: false },
  { id: 'c17', letter: 'ථ', name: 'Thha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c18', letter: 'ද', name: 'Da', type: 'consonant', progress: 85, stars: 3, isDynamic: false },
  { id: 'c19', letter: 'ධ', name: 'Dha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c20', letter: 'න', name: 'Na (Dantaja)', type: 'consonant', progress: 30, stars: 1, isDynamic: false },
  { id: 'c21', letter: 'ප', name: 'Pa', type: 'consonant', progress: 70, stars: 2, isDynamic: false },
  { id: 'c22', letter: 'ඵ', name: 'Pha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c23', letter: 'බ', name: 'Ba', type: 'consonant', progress: 55, stars: 1, isDynamic: false },
  { id: 'c24', letter: 'භ', name: 'Bha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c25', letter: 'ම', name: 'Ma', type: 'consonant', progress: 90, stars: 3, isDynamic: false },
  { id: 'c26', letter: 'ය', name: 'Ya', type: 'consonant', progress: 20, stars: 0, isDynamic: false },
  { id: 'c27', letter: 'ර', name: 'Ra', type: 'consonant', progress: 10, stars: 0, isDynamic: false },
  { id: 'c28', letter: 'ල', name: 'La', type: 'consonant', progress: 40, stars: 1, isDynamic: false },
  { id: 'c29', letter: 'ව', name: 'Wa', type: 'consonant', progress: 60, stars: 2, isDynamic: true },
  { id: 'c30', letter: 'ශ', name: 'Sha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c31', letter: 'ෂ', name: 'Ssha', type: 'consonant', progress: 0, stars: 0, isDynamic: true },
  { id: 'c32', letter: 'ස', name: 'Sa', type: 'consonant', progress: 15, stars: 0, isDynamic: false },
  { id: 'c33', letter: 'හ', name: 'Ha', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c34', letter: 'ළ', name: 'La (Murdhaja)', type: 'consonant', progress: 0, stars: 0, isDynamic: false },
  { id: 'c35', letter: 'ෆ', name: 'Fa', type: 'consonant', progress: 0, stars: 0, isDynamic: false },

  // සඤ්ඤක සහ විශේෂ අකුරු
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

export default function GloveDashboardPage() {
  const [selectedLetter, setSelectedLetter] = useState<SignLetter | null>(null);
  const [filter, setFilter] = useState<'all' | 'vowels' | 'consonants' | 'special'>('all');
  
  // Navigation View State
  const [activeView, setActiveView] = useState<'dashboard' | 'testbench' | 'evaluation'>('dashboard');

  // Modal State
  const [showFitmentModal, setShowFitmentModal] = useState(false);
  const [fitmentStep, setFitmentStep] = useState<1 | 2 | 3>(1);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [simulatedAngles, setSimulatedAngles] = useState({ thumb: 0, index: 0, middle: 0, ring: 0, little: 0 });

  const filteredAlphabet = SLSL_ALPHABET.filter(item => {
    if (filter === 'vowels') return item.type === 'vowel';
    if (filter === 'consonants') return item.type === 'consonant';
    if (filter === 'special') return item.type === 'special';
    return true;
  });

  const startSizingCheck = () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);

    const interval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalibrating(false);
          setFitmentStep(3);
          return 100;
        }
        setSimulatedAngles({
          thumb: Math.floor(Math.random() * 40) + 20,
          index: Math.floor(Math.random() * 50) + 35,
          middle: Math.floor(Math.random() * 50) + 35,
          ring: Math.floor(Math.random() * 45) + 30,
          little: Math.floor(Math.random() * 45) + 25,
        });
        return prev + 10;
      });
    }, 300);
  };

  // IF TESTBENCH VIEW IS ACTIVE
  if (activeView === 'testbench') {
    return <GloveTestBenchPage onBack={() => setActiveView('dashboard')} />;
  }

  // IF EVALUATION VIEW IS ACTIVE
  if (activeView === 'evaluation') {
    return <GloveEvaluationPage onBack={() => setActiveView('dashboard')} />;
  }

  // DEFAULT VIEW: MAIN ALPHABET DASHBOARD
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Arial, sans-serif', paddingBottom: '60px' }}>
      
      {/* 1. HERO SECTION (With Floating Quick-Actions Dock right inside it!) */}
      <section style={{ maxWidth: '1550px', width: '95%', margin: '24px auto', padding: '0 16px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', 
          borderRadius: '24px', padding: '36px 48px', color: '#ffffff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.25)', flexWrap: 'wrap', gap: '24px'
        }}>
          <div style={{ maxWidth: '750px' }}>
            
            {/* Battery & Hardware Status Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '20px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span style={{ width: '10px', height: '10px', background: '#34d399', borderRadius: '50%', display: 'inline-block' }}></span>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Smart Glove සක්‍රියයි 🔋 95% බැටරිය</span>
            </div>

            <h2 style={{ fontSize: '36px', margin: '0 0 12px 0', fontWeight: '800' }}>
              ස්මාර්ට් ග්ලවුස් ඉගෙනුම් මැදිරිය 🧤
            </h2>
            <p style={{ fontSize: '16px', color: '#e0e7ff', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              ඔබට අවශ්‍ය අකුර තෝරාගෙන පුහුණුව අරඹන්න. ස්මාර්ට් ග්ලවුස් එක මගින් ඔබේ ඇඟිලි නිවැරදි සංඥා ඉරියව්වට මෘදුව නවා මගපෙන්වයි (Active Kinesthetic Guidance).
            </p>
            
            {/* ACTION BUTTONS DOCK (Header එකේ නැතිව මෙතැන ලස්සනට සවි කර ඇත) */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => { setShowFitmentModal(true); setFitmentStep(1); setCalibrationProgress(0); }}
                style={{ background: '#fbbf24', color: '#78350f', border: 'none', padding: '12px 22px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)' }}
              >
                <span>⚙️</span> ග්ලවුස් එක පළඳින්න (Fitment Check)
              </button>

              <button 
                onClick={() => setActiveView('testbench')}
                style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.4)', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>🛠️</span> Hardware Test Bench
              </button>

              <button 
                onClick={() => setActiveView('evaluation')}
                style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.4)', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>📊</span> Research Report
              </button>
            </div>
          </div>

          {/* Video Placeholder */}
          <div style={{ width: '320px', height: '210px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '20px', border: '2px solid rgba(255, 255, 255, 0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <span style={{ fontSize: '55px' }}>🤖🦾</span>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#cbd5e1', fontWeight: 'bold' }}>
              3D Smart Glove Demonstration Video
            </p>
          </div>
        </div>
      </section>

      {/* 2. ALPHABET DASHBOARD GRID */}
      <main style={{ maxWidth: '1550px', width: '95%', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '24px', color: '#0f172a', fontWeight: 'bold' }}>ශ්‍රී ලංකා සංඥා හෝඩිය (Complete SLSL Alphabet)</h3>
            <span style={{ fontSize: '14px', color: '#64748b' }}>සම්පූර්ණ සංඥා අකුරු {SLSL_ALPHABET.length}ක් ඇතුළත් කර ඇත</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '4px', borderRadius: '24px', flexWrap: 'wrap' }}>
            <button onClick={() => setFilter('all')} style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', background: filter === 'all' ? '#0f172a' : 'transparent', color: filter === 'all' ? '#fff' : '#475569', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
              සියල්ල ({SLSL_ALPHABET.length})
            </button>
            <button onClick={() => setFilter('vowels')} style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', background: filter === 'vowels' ? '#2563eb' : 'transparent', color: filter === 'vowels' ? '#fff' : '#475569', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
              ස්වර (16)
            </button>
            <button onClick={() => setFilter('consonants')} style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', background: filter === 'consonants' ? '#2563eb' : 'transparent', color: filter === 'consonants' ? '#fff' : '#475569', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
              ව්‍යංජන (35)
            </button>
            <button onClick={() => setFilter('special')} style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', background: filter === 'special' ? '#2563eb' : 'transparent', color: filter === 'special' ? '#fff' : '#475569', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
              සඤ්ඤක / විශේෂ (9)
            </button>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
          {filteredAlphabet.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedLetter(item)}
              style={{ background: '#ffffff', borderRadius: '18px', padding: '16px 12px', textAlign: 'center', border: selectedLetter?.id === item.id ? '2px solid #2563eb' : '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.03)', position: 'relative' }}
            >
              {item.isDynamic && (
                <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                  චලනය
                </span>
              )}
              <div style={{ fontSize: '38px', fontWeight: 'bold', color: '#1e293b', margin: '4px 0' }}>{item.letter}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{item.name}</div>
              <div style={{ fontSize: '13px', color: '#f59e0b', marginBottom: '8px' }}>{'★'.repeat(item.stars)}{'☆'.repeat(3 - item.stars)}</div>
              <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${item.progress}%`, height: '100%', background: item.progress > 75 ? '#10b981' : item.progress > 40 ? '#3b82f6' : item.progress > 0 ? '#f59e0b' : '#cbd5e1' }} />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '5px', display: 'block' }}>{item.progress}% පුහුණුයි</span>
            </div>
          ))}
        </div>
      </main>

      {/* 3. MODAL: GLOVE FITMENT CHECK */}
      {showFitmentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', maxWidth: '500px', width: '90%', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              {[1, 2, 3].map(stepNum => (
                <div key={stepNum} style={{ width: '32px', height: '6px', borderRadius: '3px', background: fitmentStep >= stepNum ? '#2563eb' : '#e2e8f0' }} />
              ))}
            </div>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#0f172a' }}>ග්ලවුස් එක පළඳින්න සහ පරීක්ෂා කරන්න 🧤</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>පියවර {fitmentStep} / 3</p>

            {fitmentStep === 1 && (
              <div>
                <div style={{ width: '100%', height: '160px', background: '#f1f5f9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '50px' }}>🧤✨</span>
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>පියවර 1: ග්ලවුස් එක අතට පළඳින්න</h4>
                <p style={{ fontSize: '14px', color: '#475569' }}>ඇඟිලි මුදු ඇඟිලි තුඩුවලට දමා, මැණික් කටුවේ ඇති Velcro පටි තදින් අලවන්න.</p>
                <button onClick={() => setFitmentStep(2)} style={{ marginTop: '20px', width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  ග්ලවුස් එක පැළඳුවා ➔ ඊළඟ පියවර
                </button>
              </div>
            )}

            {fitmentStep === 2 && (
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>පියවර 2: අතේ ප්‍රමාණය සහ කෝණ පරීක්ෂාව</h4>
                <p style={{ fontSize: '13px', color: '#475569' }}>අත දිගහැර (0°) පසුව මිට මොළවන්න (85°).</p>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '16px 0', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                    <span>Flex Sensors මිනුම්:</span>
                    <span style={{ color: '#2563eb' }}>{calibrationProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${calibrationProgress}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s' }} />
                  </div>
                </div>

                {!isCalibrating && calibrationProgress < 100 && (
                  <button onClick={startSizingCheck} style={{ width: '100%', background: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    🔄 පරීක්ෂාව ආරම්භ කරන්න
                  </button>
                )}
                {isCalibrating && <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: 'bold' }}>Analyzing Hand Range...</div>}
              </div>
            )}

            {fitmentStep === 3 && (
              <div>
                <div style={{ fontSize: '60px', marginBottom: '12px' }}>🎉✨</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#16a34a' }}>අතේ ප්‍රමාණය 100% ක් නිවැරදියි!</h4>
                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>සෙන්සර් කෝණ ඔබේ අතේ සයිස් එකට සාර්ථකව ගළපා ගන්නා ලදී.</p>
                <button onClick={() => setShowFitmentModal(false)} style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  දැන් පුහුණුව අරඹන්න 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. DYNAMIC PRACTICE SESSION OVERLAY */}
      {selectedLetter && (
        <GlovePracticeSession 
          letter={selectedLetter} 
          onClose={() => setSelectedLetter(null)} 
        />
      )}
    </div>
  );
}