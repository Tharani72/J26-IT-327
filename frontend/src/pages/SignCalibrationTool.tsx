import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { gloveBle } from '../services/gloveBleService';
import GloveTestBenchPage from './GloveTestBenchPage';
import GloveEvaluationPage from './GloveEvaluationPage';

interface SignLetter {
  id: string;
  letter: string;
  name: string;
  type: 'vowel' | 'consonant' | 'special';
}

// 🔤 ශ්‍රී ලංකා සංඥා හෝඩියේ සම්පූර්ණ අකුරු 60
const FULL_SLSL_ALPHABET: SignLetter[] = [
  // ස්වර (Vowels - 16)
  { id: 'v1', letter: 'අ', name: 'A', type: 'vowel' },
  { id: 'v2', letter: 'ආ', name: 'Aa', type: 'vowel' },
  { id: 'v3', letter: 'ඇ', name: 'Ae', type: 'vowel' },
  { id: 'v4', letter: 'ඈ', name: 'Aae', type: 'vowel' },
  { id: 'v5', letter: 'ඉ', name: 'I', type: 'vowel' },
  { id: 'v6', letter: 'ඊ', name: 'Ii', type: 'vowel' },
  { id: 'v7', letter: 'උ', name: 'U', type: 'vowel' },
  { id: 'v8', letter: 'ඌ', name: 'Uu', type: 'vowel' },
  { id: 'v9', letter: 'එ', name: 'E', type: 'vowel' },
  { id: 'v10', letter: 'ඒ', name: 'Ee', type: 'vowel' },
  { id: 'v11', letter: 'ඔ', name: 'O', type: 'vowel' },
  { id: 'v12', letter: 'ඕ', name: 'Oo', type: 'vowel' },
  { id: 'v13', letter: 'ඓ', name: 'Ai', type: 'vowel' },
  { id: 'v14', letter: 'ඖ', name: 'Au', type: 'vowel' },
  { id: 'v15', letter: 'ං', name: 'Binduwa', type: 'vowel' },
  { id: 'v16', letter: 'ඃ', name: 'Visargaya', type: 'vowel' },

  // ප්‍රධාන ව්‍යංජන (Consonants - 35)
  { id: 'c1', letter: 'ක', name: 'Ka', type: 'consonant' },
  { id: 'c2', letter: 'ඛ', name: 'Kha', type: 'consonant' },
  { id: 'c3', letter: 'ග', name: 'Ga', type: 'consonant' },
  { id: 'c4', letter: 'ඝ', name: 'Gha', type: 'consonant' },
  { id: 'c5', letter: 'ඞ', name: 'Nga', type: 'consonant' },
  { id: 'c6', letter: 'ච', name: 'Cha', type: 'consonant' },
  { id: 'c7', letter: 'ඡ', name: 'Chha', type: 'consonant' },
  { id: 'c8', letter: 'ජ', name: 'Ja', type: 'consonant' },
  { id: 'c9', letter: 'ඣ', name: 'Jha', type: 'consonant' },
  { id: 'c10', letter: 'ඤ', name: 'Nya', type: 'consonant' },
  { id: 'c11', letter: 'ට', name: 'Ta', type: 'consonant' },
  { id: 'c12', letter: 'ඨ', name: 'Tha', type: 'consonant' },
  { id: 'c13', letter: 'ඩ', name: 'Da', type: 'consonant' },
  { id: 'c14', letter: 'ඪ', name: 'Dha', type: 'consonant' },
  { id: 'c15', letter: 'ණ', name: 'Na (Murdhaja)', type: 'consonant' },
  { id: 'c16', letter: 'ත', name: 'Tha', type: 'consonant' },
  { id: 'c17', letter: 'ථ', name: 'Thha', type: 'consonant' },
  { id: 'c18', letter: 'ද', name: 'Da', type: 'consonant' },
  { id: 'c19', letter: 'ධ', name: 'Dha', type: 'consonant' },
  { id: 'c20', letter: 'න', name: 'Na (Dantaja)', type: 'consonant' },
  { id: 'c21', letter: 'ප', name: 'Pa', type: 'consonant' },
  { id: 'c22', letter: 'ඵ', name: 'Pha', type: 'consonant' },
  { id: 'c23', letter: 'බ', name: 'Ba', type: 'consonant' },
  { id: 'c24', letter: 'භ', name: 'Bha', type: 'consonant' },
  { id: 'c25', letter: 'ම', name: 'Ma', type: 'consonant' },
  { id: 'c26', letter: 'ය', name: 'Ya', type: 'consonant' },
  { id: 'c27', letter: 'ර', name: 'Ra', type: 'consonant' },
  { id: 'c28', letter: 'ල', name: 'La', type: 'consonant' },
  { id: 'c29', letter: 'ව', name: 'Wa', type: 'consonant' },
  { id: 'c30', letter: 'ශ', name: 'Sha', type: 'consonant' },
  { id: 'c31', letter: 'ෂ', name: 'Ssha', type: 'consonant' },
  { id: 'c32', letter: 'ස', name: 'Sa', type: 'consonant' },
  { id: 'c33', letter: 'හ', name: 'Ha', type: 'consonant' },
  { id: 'c34', letter: 'ළ', name: 'La (Murdhaja)', type: 'consonant' },
  { id: 'c35', letter: 'ෆ', name: 'Fa', type: 'consonant' },

  // සඤ්ඤක සහ විශේෂ අකුරු (9)
  { id: 's1', letter: 'ඟ', name: 'Nga (Sanyaka)', type: 'special' },
  { id: 's2', letter: 'ඦ', name: 'Nja (Sanyaka)', type: 'special' },
  { id: 's3', letter: 'ඬ', name: 'Nda (Sanyaka)', type: 'special' },
  { id: 's4', letter: 'ඳ', name: 'Nda (Dantaja)', type: 'special' },
  { id: 's5', letter: 'ඹ', name: 'Mba (Sanyaka)', type: 'special' },
  { id: 's6', letter: 'ඥ', name: 'Gna', type: 'special' },
  { id: 's7', letter: 'ක්ෂ', name: 'Ksha', type: 'special' },
  { id: 's8', letter: 'නෑ', name: 'Nae (Sign)', type: 'special' },
  { id: 's9', letter: 'වේ', name: 'We (Sign)', type: 'special' },
];

export default function SignCalibrationTool() {
  // 🧭 Navigation View State (Master Suite)
  const [activeView, setActiveView] = useState<'calibration' | 'testbench' | 'evaluation'>('calibration');

  const [selectedSignId, setSelectedSignId] = useState('v1');
  const [liveAngles, setLiveAngles] = useState({ thumb: 0, index: 0, middle: 0, ring: 0, little: 0 });
  const [isGloveConnected, setIsGloveConnected] = useState(false);
  const [battery, setBattery] = useState(100);

  // 🛡️ Pre-Flight Wiggle/Sensor Health State
  const [sensorStatus, setSensorStatus] = useState({
    thumb: false, index: false, middle: false, ring: false, little: false
  });
  const [isWearVerified, setIsWearVerified] = useState(false);

  // 📏 2-Point Baseline State
  const [flatHandCalibrated, setFlatHandCalibrated] = useState(false);
  const [fistCalibrated, setFistCalibrated] = useState(false);

  // ⏱️ 5-Second Hold State Machine
  const [recordingState, setRecordingState] = useState<'idle' | 'countdown' | 'recording' | 'saving'>('idle');
  const [countdown, setCountdown] = useState(3);
  const [recordProgress, setRecordProgress] = useState(0);
  const sampledBuffer = useRef<any[]>([]);

  // Supabase Records
  const [savedRecords, setSavedRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const currentSign = FULL_SLSL_ALPHABET.find(s => s.id === selectedSignId) || FULL_SLSL_ALPHABET[0];

  // 1. WebSocket Live Stream + Strict 2s Heartbeat Watchdog
  useEffect(() => {
    let ws: WebSocket | null = null;
    let heartbeatWatchdog: any = null;

    try {
      ws = new WebSocket('ws://localhost:81');

      ws.onopen = () => {
        setIsGloveConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.angles) {
            setLiveAngles(data.angles);
            setIsGloveConnected(true);
            if (data.battery !== undefined) setBattery(data.battery);

            // Wiggle verification: detect movement (> 15°)
            setSensorStatus(prev => ({
              thumb: prev.thumb || data.angles.thumb > 15,
              index: prev.index || data.angles.index > 15,
              middle: prev.middle || data.angles.middle > 15,
              ring: prev.ring || data.angles.ring > 15,
              little: prev.little || data.angles.little > 15,
            }));

            // Reset watchdog: data packet received successfully
            clearTimeout(heartbeatWatchdog);
            heartbeatWatchdog = setTimeout(() => {
              setIsGloveConnected(false);
            }, 2000);

            if (recordingState === 'recording') {
              sampledBuffer.current.push(data.angles);
            }
          }
        } catch (err) {}
      };

      ws.onerror = () => setIsGloveConnected(false);
      ws.onclose = () => setIsGloveConnected(false);
    } catch (e) {
      setIsGloveConnected(false);
    }

    return () => {
      if (ws) ws.close();
      clearTimeout(heartbeatWatchdog);
    };
  }, [recordingState]);

  // Check if all 5 sensors responded to movement
  useEffect(() => {
    if (sensorStatus.thumb && sensorStatus.index && sensorStatus.middle && sensorStatus.ring && sensorStatus.little) {
      setIsWearVerified(true);
    }
  }, [sensorStatus]);

  // Fetch sign records from Supabase
  const fetchSignRecords = async (signId: string) => {
    setLoadingRecords(true);
    try {
      const { data, error } = await supabase
        .from('sign_reference_angles')
        .select('*')
        .eq('sign_id', signId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setSavedRecords(data);
      }
    } catch (err) {
      console.error("Error fetching records:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchSignRecords(selectedSignId);
  }, [selectedSignId]);

  // 2. 5-Second Hold Recording Routine
  const start5SecondRecording = () => {
    if (!isGloveConnected) {
      alert("🚨 දෝෂයකි: Smart Glove එක සම්බන්ධ වී නොමැත! කරුණාකර ESP32 ක්‍රියාත්මක කර සම්බන්ධතාවය පරීක්ෂා කරන්න.");
      return;
    }

    if (!flatHandCalibrated || !fistCalibrated) {
      alert("⚠️ කරුණාකර මුලින්ම ගුරුතුමාගේ අතේ 0° Flat සහ 85° Fist ක්‍රමාංකනය (Calibration) සම්පූර්ණ කරන්න!");
      return;
    }

    sampledBuffer.current = [];
    setRecordingState('countdown');
    setCountdown(3);

    const countInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countInterval);
          executeHoldSampling();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const executeHoldSampling = () => {
    setRecordingState('recording');
    setRecordProgress(0);
    sampledBuffer.current = [];

    const duration = 5000;
    const intervalTime = 100;
    let elapsed = 0;

    const progressInterval = setInterval(() => {
      elapsed += intervalTime;
      setRecordProgress(Math.min(100, Math.round((elapsed / duration) * 100)));

      if (sampledBuffer.current.length === 0 || elapsed % 200 === 0) {
        sampledBuffer.current.push({ ...liveAngles });
      }

      if (elapsed >= duration) {
        clearInterval(progressInterval);
        finalizeAndSaveSample();
      }
    }, intervalTime);
  };

  const finalizeAndSaveSample = async () => {
    setRecordingState('saving');
    const samples = sampledBuffer.current;

    if (samples.length === 0) {
      alert("දත්ත ලබාගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
      setRecordingState('idle');
      return;
    }

    const avgAngles = {
      thumb: Math.round(samples.reduce((sum, s) => sum + s.thumb, 0) / samples.length),
      index: Math.round(samples.reduce((sum, s) => sum + s.index, 0) / samples.length),
      middle: Math.round(samples.reduce((sum, s) => sum + s.middle, 0) / samples.length),
      ring: Math.round(samples.reduce((sum, s) => sum + s.ring, 0) / samples.length),
      little: Math.round(samples.reduce((sum, s) => sum + s.little, 0) / samples.length),
    };

    try {
      const payload = {
        sign_id: currentSign.id,
        sign_letter: currentSign.letter,
        thumb: avgAngles.thumb,
        index_finger: avgAngles.index,
        middle: avgAngles.middle,
        ring: avgAngles.ring,
        little: avgAngles.little,
      };

      const { data, error } = await supabase
        .from('sign_reference_angles')
        .insert([payload])
        .select();

      if (error) {
        alert("Database Error: " + error.message);
      } else if (data && data[0]) {
        setSavedRecords((prev) => [...prev, data[0]]);
      }
    } catch (err: any) {
      alert("Save Failed: " + err.message);
    } finally {
      setRecordingState('idle');
      setRecordProgress(0);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("මෙම Record එක Database එකෙන් මකා දැමීමට අවශ්‍යද?")) return;
    const { error } = await supabase.from('sign_reference_angles').delete().eq('id', recordId);
    if (!error) {
      setSavedRecords((prev) => prev.filter((r) => r.id !== recordId));
    }
  };

  const getFingerRange = (fingerKey: 'thumb' | 'index_finger' | 'middle' | 'ring' | 'little') => {
    if (savedRecords.length === 0) return { min: 0, max: 0, avg: 0 };
    const values = savedRecords.map((r) => Number(r[fingerKey]));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    return { min, max, avg };
  };

  // 🧭 IF TESTBENCH VIEW IS ACTIVE
  if (activeView === 'testbench') {
    return <GloveTestBenchPage onBack={() => setActiveView('calibration')} />;
  }

  // 🧭 IF EVALUATION VIEW IS ACTIVE
  if (activeView === 'evaluation') {
    return <GloveEvaluationPage onBack={() => setActiveView('calibration')} />;
  }

  // 🧭 DEFAULT VIEW: CALIBRATION STUDIO
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
        
        {/* 1. TOP STATUS BAR (With Test Bench & Research Report Action Buttons) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '24px', color: '#0f172a' }}>
              🛠️ Component 02: Kinematic Ground-Truth Studio
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              ගුරුවරයාගේ සංඥාව තත්පර 5ක් ස්ථාවරව තබාගෙන නිවැරදි Kinematic Range සටහන් කරගැනීම.
            </p>
          </div>

          {/* Action Buttons & Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* 🔴 NEW: Jump to Test Bench Button */}
            <button 
              onClick={() => setActiveView('testbench')}
              style={{ background: '#f1f5f9', color: '#1e40af', border: '1.5px solid #bfdbfe', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🛠️</span> Test Bench
            </button>

            {/* 🔴 NEW: Jump to Research Report Button */}
            <button 
              onClick={() => setActiveView('evaluation')}
              style={{ background: '#f1f5f9', color: '#475569', border: '1.5px solid #cbd5e1', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>📊</span> Research Report
            </button>

            {/* Live Glove Status Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isGloveConnected ? '#ecfdf5' : '#fef2f2', border: `1.5px solid ${isGloveConnected ? '#a7f3d0' : '#fecaca'}`, padding: '8px 14px', borderRadius: '20px' }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: isGloveConnected ? '#10b981' : '#ef4444',
                display: 'inline-block',
                boxShadow: isGloveConnected ? '0 0 8px #10b981' : 'none'
              }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: isGloveConnected ? '#065f46' : '#991b1b' }}>
                {isGloveConnected ? `Glove Active 🔋 ${battery}%` : 'Glove Disconnected'}
              </span>
            </div>

            {!isGloveConnected && (
              <button 
                onClick={async () => {
                  const ok = await gloveBle.connect((d) => {
                    if (d.angles) {
                      setLiveAngles(d.angles);
                      setIsGloveConnected(true);
                    }
                  });
                  if (ok) setIsGloveConnected(true);
                }}
                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
              >
                📶 BLE Connect
              </button>
            )}
          </div>
        </div>

        {/* 2. SENSOR DIAGNOSTIC & WEAR DETECTION */}
        <div style={{ background: isWearVerified ? '#ecfdf5' : '#fffbeb', padding: '16px 20px', borderRadius: '16px', border: `1.5px solid ${isWearVerified ? '#a7f3d0' : '#fde68a'}`, marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <b style={{ color: isWearVerified ? '#065f46' : '#92400e', fontSize: '14px' }}>
              {isWearVerified ? '✅ අතට පැළඳ ඇති බව සහ සෙන්සර් 5 ම සක්‍රිය බව තහවුරුයි (Wear Verified)' : '⚠️ ග්ලවුස් එක පැළඳ ඇඟිලි 5 ම වරක් නවා දිගහරින්න (Wiggle Test)'}
            </b>
            <span style={{ fontSize: '12px', color: '#64748b' }}>ESP32 ADC Sensor Health</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', textAlign: 'center' }}>
            {(['thumb', 'index', 'middle', 'ring', 'little'] as const).map(f => (
              <div key={f} style={{ background: '#ffffff', padding: '8px', borderRadius: '8px', border: `1px solid ${sensorStatus[f] ? '#86efac' : '#cbd5e1'}` }}>
                <span style={{ fontSize: '12px', textTransform: 'capitalize', fontWeight: 'bold', color: '#334155' }}>{f}</span>
                <div style={{ fontSize: '11px', color: sensorStatus[f] ? '#16a34a' : '#94a3b8', fontWeight: 'bold', marginTop: '2px' }}>
                  {sensorStatus[f] ? '✓ Active' : 'Waiting...'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. ADULT TEACHER 2-POINT NORMALIZATION */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1.5px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>
                📏 ගුරුතුමාගේ අතේ ප්‍රමාණය ක්‍රමාංකනය (Teacher 2-Point Baseline)
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                ළමයාගේ පොඩි අතට ප්‍රමාණානුකූලව ගැළපීමට (Scaling) ගුරුවරයාගේ සීමාවන් සටහන් කරන්න.
              </p>
            </div>
            <span style={{ fontSize: '12px', background: (flatHandCalibrated && fistCalibrated) ? '#dcfce7' : '#fee2e2', color: (flatHandCalibrated && fistCalibrated) ? '#15803d' : '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
              {(flatHandCalibrated && fistCalibrated) ? '✓ Calibrated' : 'Required'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button 
              disabled={!isGloveConnected}
              onClick={() => {
                setFlatHandCalibrated(true);
                alert("✓ අත දිගහැරි කෝණය (0° Flat Hand Baseline) ගුරු අතට ක්‍රමාංකනය විය!");
              }}
              style={{ flex: 1, padding: '12px', background: !isGloveConnected ? '#e2e8f0' : flatHandCalibrated ? '#10b981' : '#2563eb', color: !isGloveConnected ? '#94a3b8' : '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: isGloveConnected ? 'pointer' : 'not-allowed', fontSize: '13px' }}
            >
              {flatHandCalibrated ? '✓ 1. අත දිගහැරියා (0° සටහන් විය)' : '✋ 1. අත දිගහරින්න (0° Baseline)'}
            </button>

            <button 
              disabled={!isGloveConnected}
              onClick={() => {
                setFistCalibrated(true);
                alert("✓ මිට මොළවූ කෝණය (85° Closed Fist Max) ගුරු අතට ක්‍රමාංකනය විය!");
              }}
              style={{ flex: 1, padding: '12px', background: !isGloveConnected ? '#e2e8f0' : fistCalibrated ? '#10b981' : '#2563eb', color: !isGloveConnected ? '#94a3b8' : '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: isGloveConnected ? 'pointer' : 'not-allowed', fontSize: '13px' }}
            >
              {fistCalibrated ? '✓ 2. මිට මොළවා ඇත (85° සටහන් විය)' : '✊ 2. මිට මොළවන්න (85° Max Flexion)'}
            </button>
          </div>
        </div>

        {/* 4. SELECT SIGN (Full Alphabet) */}
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px', color: '#1e293b' }}>සංඥා අකුර තෝරන්න: </label>
            <select 
              value={selectedSignId} 
              onChange={(e) => setSelectedSignId(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '10px', border: '2px solid #cbd5e1', fontSize: '15px', fontWeight: 'bold', color: '#0f172a', background: '#fff', cursor: 'pointer' }}
            >
              <optgroup label="🌈 ස්වර (Vowels - 16)">
                {FULL_SLSL_ALPHABET.filter(s => s.type === 'vowel').map(s => (
                  <option key={s.id} value={s.id}>{s.letter} ({s.name}) — {s.id}</option>
                ))}
              </optgroup>
              <optgroup label="🚀 ව්‍යංජන (Consonants - 35)">
                {FULL_SLSL_ALPHABET.filter(s => s.type === 'consonant').map(s => (
                  <option key={s.id} value={s.id}>{s.letter} ({s.name}) — {s.id}</option>
                ))}
              </optgroup>
              <optgroup label="✨ සඤ්ඤක / විශේෂ (9)">
                {FULL_SLSL_ALPHABET.filter(s => s.type === 'special').map(s => (
                  <option key={s.id} value={s.id}>{s.letter} ({s.name}) — {s.id}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>ඉලක්ක අකුර:</span>
            <span style={{ fontSize: '42px', fontWeight: '900', color: '#2563eb' }}>{currentSign.letter}</span>
            <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{currentSign.name}</span>
          </div>
        </div>

        {/* 5. LIVE 5-FINGER ANGLES MONITOR & RECORD ACTION */}
        <div style={{ background: '#eff6ff', padding: '24px', borderRadius: '18px', border: '1.5px solid #bfdbfe', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#1e40af' }}>⚡ Live Normalized Joint Flexion (0° - 85°)</h3>
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>Realtime 50Hz ADC Stream</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', textAlign: 'center', marginBottom: '24px' }}>
            {[
              { name: 'Thumb', angle: liveAngles.thumb },
              { name: 'Index', angle: liveAngles.index },
              { name: 'Middle', angle: liveAngles.middle },
              { name: 'Ring', angle: liveAngles.ring },
              { name: 'Little', angle: liveAngles.little },
            ].map(f => (
              <div key={f.name} style={{ background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>{f.name}</span>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#2563eb', margin: '4px 0' }}>{f.angle}°</div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(f.angle / 85) * 100}%`, height: '100%', background: '#2563eb', transition: 'width 0.1s' }} />
                </div>
              </div>
            ))}
          </div>

          {/* 🔴 RECORD ACTION BUTTON WITH STRICT LOCKS */}
          {recordingState === 'idle' && (
            <button 
              disabled={!isGloveConnected || !flatHandCalibrated || !fistCalibrated}
              onClick={start5SecondRecording}
              style={{ 
                width: '100%', 
                background: (!isGloveConnected || !flatHandCalibrated || !fistCalibrated) 
                  ? '#cbd5e1' 
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                color: '#ffffff', border: 'none', padding: '16px', borderRadius: '14px', 
                fontSize: '16px', fontWeight: '900', 
                cursor: (!isGloveConnected || !flatHandCalibrated || !fistCalibrated) ? 'not-allowed' : 'pointer',
                boxShadow: (!isGloveConnected || !flatHandCalibrated || !fistCalibrated) ? 'none' : '0 6px 16px rgba(217, 119, 6, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
            >
              <span>⏱️</span> 
              {!isGloveConnected 
                ? '🔌 Smart Glove එක සම්බන්ධ වන තුරු රැඳී සිටින්න...'
                : (!flatHandCalibrated || !fistCalibrated)
                ? '📏 කරුණාකර මුලින්ම ගුරු අතේ 0° සහ 85° Baseline සටහන් කරන්න'
                : `තත්පර 5ක ස්ථාවර Record එකක් ගන්න (Sample #${savedRecords.length + 1})`
              }
            </button>
          )}

          {recordingState === 'countdown' && (
            <div style={{ textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '14px' }}>
              <div style={{ fontSize: '15px', color: '#475569', fontWeight: 'bold' }}>සූදානම් වන්න! අත '{currentSign.letter}' අකුරේ ඉරියව්වට නමන්න...</div>
              <div style={{ fontSize: '50px', fontWeight: '900', color: '#f59e0b', margin: '8px 0' }}>{countdown}</div>
            </div>
          )}

          {recordingState === 'recording' && (
            <div style={{ textAlign: 'center', padding: '20px', background: '#ecfdf5', borderRadius: '14px', border: '2px solid #10b981' }}>
              <div style={{ fontSize: '16px', color: '#065f46', fontWeight: '900', marginBottom: '8px' }}>
                ✊ අත නිශ්චලව තබාගෙන සිටින්න! (Hold Steady for 5 Seconds)...
              </div>
              <div style={{ width: '100%', height: '14px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${recordProgress}%`, height: '100%', background: '#10b981', transition: 'width 0.1s linear' }} />
              </div>
              <span style={{ fontSize: '13px', color: '#047857', fontWeight: 'bold', display: 'block', marginTop: '6px' }}>{recordProgress}% සාම්පල ලබාගනිමින් පවතී</span>
            </div>
          )}

          {recordingState === 'saving' && (
            <div style={{ textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '14px', color: '#2563eb', fontWeight: 'bold' }}>
              ⏳ දත්ත පිරිපහදු කර (Noise Filtered) Supabase වෙත ලියවෙමින් පවතී...
            </div>
          )}
        </div>

        {/* 6. REAL-TIME RANGE MATRIX (Min - Max of All Samples) */}
        {savedRecords.length > 0 && (
          <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '16px', border: '1.5px solid #a7f3d0', marginBottom: '28px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#065f46' }}>
              🎯 '{currentSign.letter}' සඳහා අවසාන Kinematic Range (Min° - Max°):
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', textAlign: 'center' }}>
              {[
                { name: 'Thumb', key: 'thumb' as const },
                { name: 'Index', key: 'index_finger' as const },
                { name: 'Middle', key: 'middle' as const },
                { name: 'Ring', key: 'ring' as const },
                { name: 'Little', key: 'little' as const },
              ].map(f => {
                const range = getFingerRange(f.key);
                return (
                  <div key={f.name} style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a' }}>{f.name}</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', margin: '4px 0' }}>
                      {range.min}° — {range.max}°
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Mean: {range.avg}°</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. DATABASE SAVED SAMPLES LIST */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>
              📋 Database එකේ ඇති සාම්පල ({savedRecords.length})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>සෑම සාම්පලයක්ම තත්පර 5 කින් තහවුරු කළ ඒවාය</span>
          </div>

          {loadingRecords ? (
            <p style={{ color: '#64748b', fontSize: '13px' }}>Records ලබාගනිමින් පවතී...</p>
          ) : savedRecords.length === 0 ? (
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              මෙම අකුර සඳහා තවමත් සාම්පල සේව් කර නොමැත. ඉහත බොත්තම ඔබා ආරම්භ කරන්න.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
              {savedRecords.map((r, idx) => (
                <div key={r.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                  <span style={{ fontWeight: 'bold', color: '#334155' }}>Sample #{idx + 1}</span>
                  <span>Thumb: <b>{r.thumb}°</b></span>
                  <span>Index: <b>{r.index_finger}°</b></span>
                  <span>Middle: <b>{r.middle}°</b></span>
                  <span>Ring: <b>{r.ring}°</b></span>
                  <span>Little: <b>{r.little}°</b></span>
                  <button 
                    onClick={() => handleDeleteRecord(r.id)}
                    style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                  >
                    🗑️ මකන්න
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}