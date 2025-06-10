import React from 'react';
import { useTutorial } from '../contexts/TutorialContext';

const TutorialDebug = () => {
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    isCompleted,
    hasSeenTutorial,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    resetTutorial,
    progress,
  } = useTutorial();

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '0.5rem',
      borderRadius: '6px',
      fontSize: '0.7rem',
      zIndex: 20000,
      maxWidth: '200px',
      border: '1px solid #7fff00',
      lineHeight: '1.2',
    }}>
      <h4 style={{ margin: '0 0 0.3rem 0', color: '#7fff00', fontSize: '0.8rem' }}>Debug</h4>

      <div style={{ marginBottom: '0.2rem' }}>
        <strong>Status:</strong> {isActive ? 'Active' : 'Inactive'}
      </div>

      <div style={{ marginBottom: '0.2rem' }}>
        <strong>Step:</strong> {currentStep + 1}/{totalSteps}
      </div>

      <div style={{ marginBottom: '0.2rem' }}>
        <strong>Progress:</strong> {Math.round(progress)}%
      </div>

      <div style={{ marginBottom: '0.2rem' }}>
        <strong>Done:</strong> {isCompleted ? 'Y' : 'N'}
      </div>

      <div style={{ marginBottom: '0.2rem' }}>
        <strong>Seen:</strong> {hasSeenTutorial ? 'Y' : 'N'}
      </div>

      {currentStepData && (
        <div style={{ marginBottom: '0.2rem', fontSize: '0.6rem' }}>
          <strong>ID:</strong> {currentStepData.id}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <button
          onClick={startTutorial}
          style={{
            padding: '0.2rem 0.4rem',
            background: '#7fff00',
            color: '#000',
            border: 'none',
            borderRadius: '3px',
            fontSize: '0.6rem',
            cursor: 'pointer',
          }}
        >
          Start
        </button>

        <button
          onClick={nextStep}
          disabled={!isActive}
          style={{
            padding: '0.2rem 0.4rem',
            background: isActive ? '#7fff00' : '#666',
            color: isActive ? '#000' : '#ccc',
            border: 'none',
            borderRadius: '3px',
            fontSize: '0.6rem',
            cursor: isActive ? 'pointer' : 'not-allowed',
          }}
        >
          Next
        </button>

        <button
          onClick={previousStep}
          disabled={!isActive}
          style={{
            padding: '0.2rem 0.4rem',
            background: isActive ? '#7fff00' : '#666',
            color: isActive ? '#000' : '#ccc',
            border: 'none',
            borderRadius: '3px',
            fontSize: '0.6rem',
            cursor: isActive ? 'pointer' : 'not-allowed',
          }}
        >
          Prev
        </button>

        <button
          onClick={skipTutorial}
          disabled={!isActive}
          style={{
            padding: '0.2rem 0.4rem',
            background: isActive ? '#ff6b6b' : '#666',
            color: isActive ? '#fff' : '#ccc',
            border: 'none',
            borderRadius: '3px',
            fontSize: '0.6rem',
            cursor: isActive ? 'pointer' : 'not-allowed',
          }}
        >
          Skip
        </button>

        <button
          onClick={resetTutorial}
          style={{
            padding: '0.2rem 0.4rem',
            background: '#ff9500',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            fontSize: '0.6rem',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ marginTop: '0.3rem', fontSize: '0.6rem', opacity: 0.6 }}>
        Dev only
      </div>
    </div>
  );
};

export default TutorialDebug;
