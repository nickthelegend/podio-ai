import { registerRoot, Composition } from 'remotion';
import { SlideComposition } from '../../components/remotion/SlideComposition';
import React from 'react';

export const RemotionRoot: React.FC = () => {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Composition, {
      id: "SlideVideo",
      component: SlideComposition as React.FC<any>,
      defaultProps: {
        slides: [],
        brand: undefined
      },
      calculateMetadata: ({ props }) => {
        const slides = (props.slides as any[]) || [];
        let total = 0;
        slides.forEach((s: any) => {
          total += s.duration ? Math.ceil(s.duration * 30) : 150;
        });
        if (total === 0) total = 150;
        return {
          durationInFrames: total,
          fps: 30,
          width: 1280,
          height: 720
        };
      }
    })
  );
};

registerRoot(RemotionRoot);
