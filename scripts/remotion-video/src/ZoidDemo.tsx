import React from 'react';
import { useCurrentFrame, interpolate, Sequence, AbsoluteFill, Img, staticFile, spring, useVideoConfig, Easing } from 'remotion';

const SCENES = [
  { img: 'editor-welcome.png', title: 'Monaco Editor', desc: 'Full IntelliSense, multi-cursor, code folding' },
  { img: 'editor-terminal.png', title: 'Real Terminal', desc: 'xterm.js integrated with your system shell' },
  { img: 'editor-ai.png', title: 'AI-Powered Coding', desc: 'Chat with multiple AI models at once' },
  { img: 'editor-extensions.png', title: 'VS Code Extensions', desc: 'Browse & install from Open VSX registry' },
  { img: 'editor-git.png', title: 'Git Integration', desc: 'Stage, commit, branch, push, pull — fully built-in' },
  { img: 'editor-glass.png', title: 'Glassmorphism UI', desc: 'Black & white design with dark/light mode' },
];

const SceneCard: React.FC<{ src: string; title: string; desc: string; frame: number; dur: number }> = ({ src, title, desc, frame, dur }) => {
  const progress = frame / dur;
  const opacity = interpolate(progress, [0, 0.06, 0.8, 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scale = interpolate(progress, [0, 1], [1.08, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleY = interpolate(progress, [0, 0.15, 0.8, 1], [40, 0, 0, -20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const titleO = interpolate(progress, [0, 0.1, 0.85, 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={staticFile(`frames/${src}`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `scale(${scale})`,
          backgroundColor: '#000',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          padding: '80px 40px 50px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85) 40%)',
          transform: `translateY(${titleY}px)`,
          opacity: titleO,
        }}
      >
        <h2
          style={{
            color: '#fff',
            fontSize: 34,
            fontWeight: 700,
            margin: 0,
            fontFamily: 'Inter, -apple-system, sans-serif',
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 16,
            margin: '8px 0 0',
            fontFamily: 'Inter, -apple-system, sans-serif',
            fontWeight: 400,
          }}
        >
          {desc}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const ZoidDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDur = Math.floor(3 * fps);
  const cur = Math.min(Math.floor(frame / sceneDur), SCENES.length - 1);
  const local = frame - cur * sceneDur;

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={i * sceneDur} durationInFrames={sceneDur}>
          {cur === i ? <SceneCard src={s.img} title={s.title} desc={s.desc} frame={local} dur={sceneDur} /> : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
