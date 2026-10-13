import React, { useState } from 'react';
import SmartGloveWidget from '../features/smart-glove/SmartGloveWidget';

export default function PracticePage() {
  const [currentSign, setCurrentSign] = useState('අ');
  const [statusMessage, setStatusMessage] = useState('Glove එක සක්‍රියයි - පුහුණුව අරඹන්න');

  // C03 (Tutor) වෙත Glove Data යවන function එක
  const handleCompleteAttempt = () => {
    const gloveDataPayload = {
      sessionId: "sess_" + Date.now(),
      studentId: "std_01",
      lessonId: "sign-" + currentSign,
      component: "smart-glove",
      eventType: "attempt_completed",
      timestamp: new Date().toISOString(),
      data: {
        assistanceDurationMs: 520,
        resistanceDetected: false,
        finalAngles: [15, 80, 85, 85, 85],
        isGuidingSuccessful: true
      }
    };

    console.log("C03 ට Glove Telemetry Data සාර්ථකව යැවුණි:", gloveDataPayload);
    setStatusMessage("උත්සාහය සාර්ථකයි! දත්ත C03 වෙත යැවුණි.");
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#1e293b' }}>සංඥා පුහුණු පිටුව (Practice Session)</h2>
      <p style={{ color: '#64748b' }}>වත්මන් අකුර: <b style={{ fontSize: '20px', color: '#2563eb' }}>'{currentSign}'</b></p>

      <div style={{ display: 'flex', gap: '32px', marginTop: '20px', flexWrap: 'wrap' }}>
        {/* මැද ප්‍රධාන කොටස (Camera / Video Area) */}
        <div style={{ flex: 1, minWidth: '320px', background: '#e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '240px', background: '#cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            [ Component 01: Live Camera + 3D Hand Overlay ]
          </div>
          <button 
            onClick={handleCompleteAttempt}
            style={{ marginTop: '20px', padding: '12px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            සංඥාව සම්පූර්ණයි (Complete & Send to C03)
          </button>
          <p style={{ marginTop: '10px', fontSize: '13px', color: '#047857' }}>{statusMessage}</p>
        </div>

        {/* දකුණු පැත්තේ ඔයාගේ Component 02: Glove Widget එක */}
        <div>
          <SmartGloveWidget />
        </div>
      </div>
    </div>
  );
}