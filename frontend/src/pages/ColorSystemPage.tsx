import React from 'react';
import ColorSystemDemo from '../components/ColorSystemDemo';

const ColorSystemPage: React.FC = () => {
  return (
    <div className="color-system-page">
      <ColorSystemDemo 
        initialEmotion="joy"
        showAnimations={true}
        showGradients={true}
      />
    </div>
  );
};

export default ColorSystemPage;
