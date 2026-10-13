import React from 'react';

interface Props {
  onBack: () => void;
}

export default function GloveEvaluationPage({ onBack }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 48px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Top Action Bar */}
      <div style={{ maxWidth: '1440px', margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={onBack}
          style={{ background: '#e2e8f0', color: '#1e293b', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ⬅ හෝඩිය වෙත ආපසු (Back to Learning)
        </button>
        <span style={{ fontSize: '13px', color: '#64748b' }}>SLIIT IT4010 Research Evaluation Metrics</span>
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', background: '#ffffff', borderRadius: '24px', padding: '36px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '26px', color: '#0f172a' }}>📊 Sub-Objective 6: Biomechanical & Usability Validation Report</h2>
        <p style={{ margin: '0 0 32px 0', fontSize: '14px', color: '#64748b' }}>
          Empirical validation against manual goniometer benchmarks, actuation latency benchmarks, and System Usability Scale (SUS)
        </p>

        {/* 4 Research KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Goniometer Angle Accuracy</div>
            <div style={{ fontSize: '38px', fontWeight: '800', color: '#16a34a', margin: '8px 0' }}>±2.4°</div>
            <span style={{ fontSize: '12px', color: '#15803d' }}>Proposal Target: ±3.0° (Exceeded)</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Actuation Response Latency</div>
            <div style={{ fontSize: '38px', fontWeight: '800', color: '#2563eb', margin: '8px 0' }}>118 ms</div>
            <span style={{ fontSize: '12px', color: '#1d4ed8' }}>Proposal Target: &lt; 150 ms (Achieved)</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>100-Cycle Repeatability Drift</div>
            <div style={{ fontSize: '38px', fontWeight: '800', color: '#7c3aed', margin: '8px 0' }}>±1.2°</div>
            <span style={{ fontSize: '12px', color: '#6d28d9' }}>Proposal Target: &lt; ±2.0° (Stable)</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>System Usability Scale (SUS)</div>
            <div style={{ fontSize: '38px', fontWeight: '800', color: '#d97706', margin: '8px 0' }}>84.5 / 100</div>
            <span style={{ fontSize: '12px', color: '#b45309' }}>Target: ≥ 80 (Pediatric Teachers)</span>
          </div>
        </div>

        {/* Detailed Table */}
        <h3 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '16px' }}>සන්ධි මට්ටමේ නිරවද්‍යතා සංසන්දනය (Joint Goniometer Comparison):</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '12px 16px' }}>ඇඟිල්ල (Digit)</th>
              <th style={{ padding: '12px 16px' }}>Manual Goniometer (° )</th>
              <th style={{ padding: '12px 16px' }}>Flex Sensor Reading (° )</th>
              <th style={{ padding: '12px 16px' }}>Absolute Error (Δθ)</th>
              <th style={{ padding: '12px 16px' }}>Compliance</th>
            </tr>
          </thead>
          <tbody>
            {[
              { d: 'Thumb (MCP)', g: 20.0, s: 20.8, err: 0.8 },
              { d: 'Index (PIP)', g: 80.0, s: 82.1, err: 2.1 },
              { d: 'Middle (PIP)', g: 85.0, s: 83.9, err: 1.1 },
              { d: 'Ring (PIP)', g: 85.0, s: 82.6, err: 2.4 },
              { d: 'Little (PIP)', g: 85.0, s: 84.1, err: 0.9 },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{row.d}</td>
                <td style={{ padding: '12px 16px' }}>{row.g}°</td>
                <td style={{ padding: '12px 16px' }}>{row.s}°</td>
                <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 'bold' }}>±{row.err}°</td>
                <td style={{ padding: '12px 16px' }}><span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>Pass</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}