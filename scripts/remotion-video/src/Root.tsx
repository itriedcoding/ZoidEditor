import React from 'react';
import { Composition } from 'remotion';
import { ZoidDemo } from './ZoidDemo';

const FPS = 30;
const DURATION = 18 * FPS;

export const Root: React.FC = () => {
  return (
    <Composition
      id="ZoidDemo"
      component={ZoidDemo}
      durationInFrames={DURATION}
      fps={FPS}
      width={1400}
      height={900}
    />
  );
};
