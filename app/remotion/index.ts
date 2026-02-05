import { registerRoot } from 'remotion';
import { SlideComposition } from '@/components/remotion/SlideComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* This composition is dynamic and will be driven by props passed from the player */}
      <SlideComposition slides={[]} /> 
    </>
  );
};

registerRoot(RemotionRoot);
