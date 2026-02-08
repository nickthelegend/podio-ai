import { registerRoot } from 'remotion';
import { SlideComposition } from '../../components/remotion/SlideComposition';
import React from 'react';

export const RemotionRoot: React.FC = () => {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(SlideComposition, { slides: [] })
  );
};

registerRoot(RemotionRoot);
