import React, { useEffect, useState } from 'react';
import { useTutorial } from '../contexts/TutorialContext';
import './TutorialOverlay.scss';

const TutorialOverlay = ({ navigateTo }) => {
  const {
    isActive,
    currentStepData,
    currentStep,
    totalSteps,
    nextStep,
    previousStep,
    skipTutorial,
    isFirstStep,
    isLastStep,
    progress,
  } = useTutorial();

  const [targetElement, setTargetElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Update target element and position when step changes
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    // Handle navigation for specific tutorial steps
    if (currentStepData.id === 'scholarship-dao' && navigateTo) {
      // Navigate to dashboard to show scholarship section
      navigateTo('dashboard');
      // Add a small delay to allow navigation to complete
      setTimeout(() => {
        const element = document.querySelector(currentStepData.target);
        setTargetElement(element);
        if (element) {
          updateTooltipPosition(element);
          if (currentStepData.highlight) {
            element.classList.add('tutorial-highlight');
            if (currentStepData.pulse) {
              element.classList.add('tutorial-pulse');
            }
          }
        }
      }, 300);
      return;
    }

    if (currentStepData.target) {
      const element = document.querySelector(currentStepData.target);
      setTargetElement(element);

      if (element) {
        updateTooltipPosition(element);

        // Add highlight class
        if (currentStepData.highlight) {
          element.classList.add('tutorial-highlight');
          if (currentStepData.pulse) {
            element.classList.add('tutorial-pulse');
          }
        }
      }
    } else {
      setTargetElement(null);
    }

    // Cleanup previous highlights
    return () => {
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight', 'tutorial-pulse');
      });
    };
  }, [isActive, currentStep, currentStepData, navigateTo]);

  const updateTooltipPosition = (element) => {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = rect.top + scrollTop;
    let left = rect.left + scrollLeft;

    // Adjust position based on desired placement
    switch (currentStepData.position) {
      case 'top':
        top = rect.top + scrollTop - 10;
        left = rect.left + scrollLeft + (rect.width / 2);
        break;
      case 'bottom':
        top = rect.bottom + scrollTop + 10;
        left = rect.left + scrollLeft + (rect.width / 2);
        break;
      case 'left':
        top = rect.top + scrollTop + (rect.height / 2);
        left = rect.left + scrollLeft - 10;
        break;
      case 'right':
        top = rect.top + scrollTop + (rect.height / 2);
        left = rect.right + scrollLeft + 10;
        break;
      default:
        // Center position
        break;
    }

    setTooltipPosition({ top, left });
  };

  const handleCtaClick = () => {
    if (currentStepData.ctaAction && navigateTo) {
      navigateTo(currentStepData.ctaAction);
    }
    nextStep();
  };

  const handleSecondaryClick = () => {
    if (currentStepData.secondaryAction && navigateTo) {
      navigateTo(currentStepData.secondaryAction);
    }
    nextStep();
  };

  if (!isActive || !currentStepData) return null;

  // Modal type tutorial step
  if (currentStepData.type === 'modal') {
    return (
      <div className="tutorial-overlay">
        <div className="tutorial-backdrop" />
        <div className="tutorial-modal">
          <div className="tutorial-header">
            <h2 className="tutorial-title">{currentStepData.title}</h2>
            <div className="tutorial-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="progress-text">
                {currentStep + 1} of {totalSteps}
              </span>
            </div>
          </div>

          <div className="tutorial-content">
            <div className="tutorial-icon">
              {isFirstStep ? '🚀' : isLastStep ? '🎉' : '💡'}
            </div>
            <p className="tutorial-text">{currentStepData.content}</p>
          </div>

          <div className="tutorial-actions">
            {currentStepData.showSkip && (
              <button className="tutorial-btn tutorial-btn-skip" onClick={skipTutorial}>
                Skip Tutorial
              </button>
            )}
            
            {!isFirstStep && (
              <button className="tutorial-btn tutorial-btn-secondary" onClick={previousStep}>
                Previous
              </button>
            )}

            {currentStepData.ctaText ? (
              <button className="tutorial-btn tutorial-btn-primary" onClick={handleCtaClick}>
                {currentStepData.ctaText}
              </button>
            ) : (
              <button className="tutorial-btn tutorial-btn-primary" onClick={nextStep}>
                {isLastStep ? 'Complete' : 'Next'}
              </button>
            )}

            {currentStepData.secondaryText && (
              <button className="tutorial-btn tutorial-btn-secondary" onClick={handleSecondaryClick}>
                {currentStepData.secondaryText}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tooltip type tutorial step
  if (currentStepData.type === 'tooltip') {
    // If target element not found, show a modal instead for critical steps
    if (!targetElement && currentStepData.id === 'scholarship-dao') {
      return (
        <div className="tutorial-overlay">
          <div className="tutorial-backdrop" />
          <div className="tutorial-modal">
            <div className="tutorial-header">
              <h2 className="tutorial-title">{currentStepData.title}</h2>
              <div className="tutorial-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="progress-text">
                  {currentStep + 1} of {totalSteps}
                </span>
              </div>
            </div>

            <div className="tutorial-content">
              <div className="tutorial-icon">🏛️</div>
              <p className="tutorial-text">{currentStepData.content}</p>
              <p className="tutorial-text" style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '1rem' }}>
                Navigate to your Dashboard to see the Scholarship section.
              </p>
            </div>

            <div className="tutorial-actions">
              <button className="tutorial-btn tutorial-btn-secondary" onClick={() => navigateTo('dashboard')}>
                Go to Dashboard
              </button>

              {!isFirstStep && (
                <button className="tutorial-btn tutorial-btn-secondary" onClick={previousStep}>
                  Previous
                </button>
              )}

              <button className="tutorial-btn tutorial-btn-primary" onClick={nextStep}>
                {isLastStep ? 'Complete' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (targetElement) {
    return (
      <div className="tutorial-overlay">
        <div className="tutorial-backdrop tutorial-backdrop-transparent" />
        
        <div 
          className={`tutorial-tooltip tutorial-tooltip-${currentStepData.position}`}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <div className="tutorial-tooltip-arrow" />
          
          <div className="tutorial-tooltip-header">
            <h3 className="tutorial-tooltip-title">{currentStepData.title}</h3>
            <div className="tutorial-progress-mini">
              {currentStep + 1}/{totalSteps}
            </div>
          </div>

          <div className="tutorial-tooltip-content">
            <p className="tutorial-tooltip-text">{currentStepData.content}</p>
          </div>

          <div className="tutorial-tooltip-actions">
            <button className="tutorial-btn-mini tutorial-btn-skip" onClick={skipTutorial}>
              Skip
            </button>
            
            {!isFirstStep && (
              <button className="tutorial-btn-mini tutorial-btn-secondary" onClick={previousStep}>
                Back
              </button>
            )}

            <button className="tutorial-btn-mini tutorial-btn-primary" onClick={nextStep}>
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
    }
  }

  return null;
};

export default TutorialOverlay;
