import React, { useEffect, useRef } from 'react';
import { AgentStatus, AgentType } from '../../types/banking';

interface VoiceVisualizerProps {
  status: AgentStatus;
  agentType?: AgentType;
  height?: number;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  status,
  agentType = 'BANKING_ASSISTANT',
  height = 50
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const getColor = () => {
      switch (agentType) {
        case 'FRAUD_AGENT':
          return { primary: '#F59E0B', secondary: '#D97706', glow: 'rgba(245, 158, 11, 0.4)' };
        case 'LOANS_AGENT':
          return { primary: '#10B981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.4)' };
        case 'CUSTOMER_SERVICE_AGENT':
          return { primary: '#A855F7', secondary: '#7E22CE', glow: 'rgba(168, 85, 247, 0.4)' };
        default:
          return { primary: '#06B6D4', secondary: '#0284C7', glow: 'rgba(6, 182, 212, 0.4)' };
      }
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const colors = getColor();
      const numBars = 32;
      const barWidth = 3;
      const spacing = (width - (numBars * barWidth)) / (numBars + 1);

      let activityMultiplier = 0.15;
      if (status === 'SPEAKING') activityMultiplier = 0.85;
      else if (status === 'LISTENING') activityMultiplier = 0.65;
      else if (status === 'THINKING') activityMultiplier = 0.45;

      for (let i = 0; i < numBars; i++) {
        const x = spacing + i * (barWidth + spacing);
        const sinVal = Math.sin(phase + i * 0.3);
        const cosVal = Math.cos(phase * 0.8 + i * 0.2);
        
        let barHeight = (Math.abs(sinVal * cosVal) * 0.8 + 0.1) * (height * activityMultiplier);
        barHeight = Math.max(4, Math.min(height - 4, barHeight));

        const y = (height - barHeight) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, colors.primary);
        grad.addColorStop(1, colors.secondary);

        ctx.fillStyle = grad;
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = status === 'SPEAKING' || status === 'LISTENING' ? 8 : 2;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      phase += (status === 'SPEAKING' ? 0.12 : status === 'LISTENING' ? 0.08 : 0.03);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [status, agentType]);

  return (
    <div className="w-full flex items-center justify-center py-1">
      <canvas
        ref={canvasRef}
        width={240}
        height={height}
        className="w-full max-w-[280px] h-[45px]"
      />
    </div>
  );
};
