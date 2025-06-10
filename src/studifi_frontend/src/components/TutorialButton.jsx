import React from 'react';
import { useTutorial } from '../contexts/TutorialContext';
import './TutorialButton.scss';

const TutorialButton = ({ variant = 'default', className = '' }) => {
  const { startTutorial, isActive, isCompleted } = useTutorial();

  if (isActive) return null; // Don't show button during tutorial

  const handleClick = () => {
    startTutorial();
  };

  if (variant === 'help-menu') {
    return (
      <button 
        className={`tutorial-help-btn ${className}`}
        onClick={handleClick}
        title="Take Interactive Tour"
      >
        <span className="tutorial-help-icon">🎯</span>
        <span className="tutorial-help-text">
          {isCompleted ? 'Retake Tour' : 'Take Tour'}
        </span>
      </button>
    );
  }

  if (variant === 'floating') {
    return (
      <button 
        className={`tutorial-floating-btn ${className}`}
        onClick={handleClick}
        title="Need help? Take our interactive tour!"
      >
        <span className="tutorial-floating-icon">❓</span>
        <span className="tutorial-floating-tooltip">
          {isCompleted ? 'Retake Tour' : 'Take Interactive Tour'}
        </span>
      </button>
    );
  }

  // Default inline button
  return (
    <button 
      className={`tutorial-inline-btn ${className}`}
      onClick={handleClick}
    >
      <span className="tutorial-inline-icon">🚀</span>
      {isCompleted ? 'Retake Tutorial' : 'Take Tutorial'}
    </button>
  );
};

export default TutorialButton;
