import React, { useState, useEffect } from 'react';

interface GloveTelemetry {
  glove_connected: boolean;
  battery: number;
  angles: {
    thumb: number;
    index: number;
    middle: number;
    ring: number;
    little: number;
  };
}

export const SmartGloveWidget: React.FC = () => {
  const [data, setData] = useState<GloveTelemetry>({
    glove_connected: false,
    battery: 100,
    angles: { thumb: 0, index: 0, middle: 0, ring: 0, little: 0 },
  });

  useEffect(() => {
    // Local ESP32 WebSocket එකට සම්බන්ධ වීම
    const ws = new WebSocket('ws://localhost:81');

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch (err) {
        console.error('Error parsing glove telemetry:', err);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ border: '2px solid #e2e8f0', padding: '16px', borderRadius: '16px', maxWidth: '320px', background: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>Smart Glove (C02)</h3>
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '12px', 
          fontWeight: 'bold',
          background: data.glove_connected ? '#dcfce7' : '#fee2e2',
          color: data.glove_connected ? '#15803d' : '#b91c1c'
        }}>
          {data.glove_connected ? 'Connected' : 'Offline'}
        </span>
      </div>

      <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>
        බැටරිය: <b>{data.battery}%</b>
      </p>

      <div style={{ marginTop: '12px' }}>
        {Object.entries(data.angles).map(([finger, angle]) => (
          <div key={finger} style={{ display: 'flex', alignItems: 'center', margin: '6px 0', fontSize: '12px', color: '#334155' }}>
            <span style={{ width: '60px', textTransform: 'capitalize' }}>{finger}</span>
            <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', margin: '0 8px', overflow: 'hidden' }}>
              <div style={{ width: `${(angle / 85) * 100}%`, height: '100%', background: '#3b82f6', transition: 'width 0.2s' }} />
            </div>
            <span style={{ width: '30px', textAlign: 'right', fontWeight: 'bold' }}>{angle}°</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => alert("Emergency cutoff disengaged all servos.")}
        style={{ marginTop: '16px', width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Emergency Stop (හදිසි නැවතුම)
      </button>
    </div>
  );
};

export default SmartGloveWidget;