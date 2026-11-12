import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../audio/audioEngine';

export const DVSpectrumVisualizer = ({
  isPlaying,
  mode = 'spectrum-bars',
  className = 'w-full h-14 relative my-1',
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const analyser = audioEngine.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    // Smoothed bar heights
    const barCount = 46;
    const smoothedBars = new Array(barCount).fill(4);
    let simPhase = 0;

    // Particles mode state
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * (width || 300),
        y: Math.random() * (height || 60),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        hue: 260 + Math.random() * 60,
      });
    }

    const render = () => {
      animId = requestAnimationFrame(render);
      if (!ctx || width === 0 || height === 0) return;

      simPhase += 0.08;

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(freqData);
        analyser.getByteTimeDomainData(timeData);
      } else {
        freqData.fill(0);
        timeData.fill(128);
      }

      ctx.clearRect(0, 0, width, height);

      // 1. SPECTRUM BARS (Segmented neon bars)
      if (mode === 'spectrum-bars') {
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#38bdf8'); // cyan
        grad.addColorStop(0.3, '#818cf8'); // indigo
        grad.addColorStop(0.5, '#c084fc'); // bright fuchsia-purple center
        grad.addColorStop(0.7, '#a855f7'); // purple
        grad.addColorStop(1, '#38bdf8'); // cyan

        const barWidth = Math.max(2.4, (width - (barCount - 1) * 3) / barCount);
        const maxHeight = height * 0.82;
        const baselineY = height - 5;

        for (let i = 0; i < barCount; i++) {
          // Bell curve weight (center higher)
          const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
          const bellWeight = 1 - Math.pow(centerDist, 1.8) * 0.52;

          const freqIdx = Math.floor(Math.pow(i / barCount, 1.5) * (bufferLength * 0.7));
          const rawVal = freqData[freqIdx] || 0;
          const targetHeight = Math.max(3, (rawVal / 255) * maxHeight * bellWeight);

          smoothedBars[i] = smoothedBars[i] * 0.65 + targetHeight * 0.35;
          const h = smoothedBars[i];

          const x = i * (barWidth + 3);
          const y = baselineY - h;

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, h, [2, 2, 0, 0]);
          ctx.fill();

          // Peak glow highlight
          if (h > maxHeight * 0.45) {
            ctx.shadowColor = '#c084fc';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, y, barWidth, 2);
            ctx.shadowBlur = 0;
          }
        }

        // Draw flowing neon contour line
        ctx.beginPath();
        ctx.moveTo(0, baselineY);
        for (let i = 0; i < barCount; i++) {
          const x = i * (barWidth + 3) + barWidth / 2;
          const waveH = smoothedBars[i] * 0.4;
          const y = baselineY - waveH;
          if (i === 0) {
            ctx.lineTo(x, y);
          } else {
            const prevX = (i - 1) * (barWidth + 3) + barWidth / 2;
            const prevY = baselineY - smoothedBars[i - 1] * 0.4;
            const cx = (prevX + x) / 2;
            const cy = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, cx, cy);
          }
        }
        ctx.lineTo(width, baselineY);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(192, 132, 252, 0.6)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 2. CIRCULAR SPECTRUM (360 Radial Beams)
      else if (mode === 'circular') {
        const cx = width / 2;
        const cy = height / 2;
        const baseRadius = Math.min(width, height) * 0.28;
        const beamCount = 36;
        const maxBeamLen = Math.min(width, height) * 0.32;

        ctx.save();
        for (let i = 0; i < beamCount; i++) {
          const angle = (i / beamCount) * Math.PI * 2;
          const freqVal = freqData[i % bufferLength] || 0;
          const len = (freqVal / 255) * maxBeamLen * (isPlaying ? 1 : 0.1) + 4;

          const x1 = cx + Math.cos(angle) * baseRadius;
          const y1 = cy + Math.sin(angle) * baseRadius;
          const x2 = cx + Math.cos(angle) * (baseRadius + len);
          const y2 = cy + Math.sin(angle) * (baseRadius + len);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsl(${260 + (i / beamCount) * 80}, 90%, 65%)`;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 6;
          ctx.stroke();
        }

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // 3. WAVEFORM (Oscilloscope Neon Laser Beam)
      else if (mode === 'waveform') {
        ctx.save();
        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Secondary glow line
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // 4. PARTICLES (Audio-reactive Burst)
      else if (mode === 'particles') {
        const bassLevel = (freqData[2] || 0) / 255;
        const midLevel = (freqData[12] || 0) / 255;

        for (const p of particles) {
          // React to bass
          p.x += p.vx * (1 + bassLevel * 2.5);
          p.y += p.vy * (1 + midLevel * 2.5);

          // Bounce boundaries
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (1 + bassLevel * 1.2), 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha})`;
          ctx.shadowColor = `hsl(${p.hue}, 90%, 60%)`;
          ctx.shadowBlur = 8;
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying, mode]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
