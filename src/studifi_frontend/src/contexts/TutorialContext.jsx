import React, { createContext, useContext, useState, useEffect } from 'react';

const TutorialContext = createContext();

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

// Tutorial steps configuration
export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to StudiFi!',
    content: 'Welcome to the future of education finance! StudiFi is a decentralized platform built on the Internet Computer blockchain that offers zero-fee student loans, instant approvals, and community-driven governance.',
    type: 'modal',
    position: 'center',
    showSkip: true,
    ctaText: 'Start Tour',
  },
  {
    id: 'sidebar-navigation',
    title: 'Your Navigation Hub',
    content: 'This is your main navigation sidebar. Notice the "On-Chain" indicator showing you\'re connected to the blockchain. Each section gives you access to different DeFi features.',
    target: '.sidebar',
    type: 'tooltip',
    position: 'right',
    highlight: true,
  },
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    content: 'Your dashboard provides a complete overview of your financial aid status. Everything updates in real-time on the blockchain, giving you full transparency.',
    target: '.dashboard-header',
    type: 'tooltip',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'apply-for-aid',
    title: 'Apply for Financial Aid',
    content: 'This is your gateway to DeFi education finance! Click here to start a loan application that gets processed by our AI in under 5 seconds - no traditional bank delays.',
    target: '[data-tutorial="apply-aid-btn"]',
    type: 'tooltip',
    position: 'bottom',
    highlight: true,
    pulse: true,
  },
  {
    id: 'wallet-integration',
    title: 'Web3 Wallet Connection',
    content: 'Connect your crypto wallet for seamless DeFi transactions. StudiFi supports multiple wallet types and enables zero-fee payments thanks to Internet Computer\'s reverse gas model.',
    target: '[data-tutorial="wallet-btn"]',
    type: 'tooltip',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'loan-status',
    title: 'Real-Time Loan Status',
    content: 'Track your loan applications in real-time. Unlike traditional lenders, every status update is recorded on the blockchain for complete transparency.',
    target: '[data-tutorial="loan-status"]',
    type: 'tooltip',
    position: 'left',
    highlight: true,
  },
  {
    id: 'scholarship-dao',
    title: 'DAO Scholarship Opportunities',
    content: 'Explore community-funded scholarships! Our DAO (Decentralized Autonomous Organization) allows token holders to vote on scholarship distributions - true democratic funding.',
    target: '[data-tutorial="scholarship-section"]',
    type: 'tooltip',
    position: 'left',
    highlight: true,
  },

  {
    id: 'defi-education',
    title: 'DeFi Education Hub',
    content: 'New to DeFi? Our education hub explains blockchain concepts, smart contracts, and decentralized finance in student-friendly language. Knowledge is power in Web3!',
    target: '[data-tutorial="education-link"]',
    type: 'tooltip',
    position: 'right',
    highlight: true,
  },
  {
    id: 'payment-system',
    title: 'Zero-Fee Payment System',
    content: 'StudiFi\'s payment system leverages Internet Computer\'s reverse gas model. When you pay with ICP tokens, there are absolutely zero transaction fees - more money stays in your pocket!',
    target: '[data-tutorial="payment-methods"]',
    type: 'tooltip',
    position: 'top',
    highlight: true,
  },
  {
    id: 'blockchain-benefits',
    title: 'Why Blockchain Matters',
    content: 'StudiFi runs on Internet Computer blockchain, which means: ✅ Zero transaction fees ✅ Instant finality ✅ Complete transparency ✅ Immutable loan terms ✅ No traditional banking delays',
    type: 'modal',
    position: 'center',
  },
  {
    id: 'completion',
    title: 'You\'re Ready to Go!',
    content: 'Congratulations! You now understand StudiFi\'s key features. Ready to revolutionize your education finance? Start by applying for your first DeFi loan or exploring our scholarship opportunities.',
    type: 'modal',
    position: 'center',
    ctaText: 'Apply for Loan',
    ctaAction: 'applyLoan',
    secondaryText: 'Explore Scholarships',
    secondaryAction: 'scholarship',
  },
];

export const TutorialProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // Check if user has completed tutorial on mount
  useEffect(() => {
    const tutorialStatus = localStorage.getItem('studifi-tutorial-completed');
    const hasSeenStatus = localStorage.getItem('studifi-tutorial-seen');
    
    if (tutorialStatus === 'true') {
      setIsCompleted(true);
    }
    
    if (hasSeenStatus === 'true') {
      setHasSeenTutorial(true);
    }
  }, []);

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStep(0);
    setHasSeenTutorial(true);
    localStorage.setItem('studifi-tutorial-seen', 'true');
  };

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    setIsActive(false);
    setIsCompleted(true);
    localStorage.setItem('studifi-tutorial-completed', 'true');
  };

  const completeTutorial = () => {
    setIsActive(false);
    setIsCompleted(true);
    localStorage.setItem('studifi-tutorial-completed', 'true');
  };

  const resetTutorial = () => {
    setIsCompleted(false);
    setHasSeenTutorial(false);
    setCurrentStep(0);
    localStorage.removeItem('studifi-tutorial-completed');
    localStorage.removeItem('studifi-tutorial-seen');
  };

  const shouldAutoStart = (isKycSubmitted) => {
    return isKycSubmitted && !hasSeenTutorial && !isCompleted;
  };

  const value = {
    // State
    isActive,
    currentStep,
    isCompleted,
    hasSeenTutorial,
    
    // Current step data
    currentStepData: TUTORIAL_STEPS[currentStep],
    totalSteps: TUTORIAL_STEPS.length,
    
    // Actions
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    resetTutorial,
    shouldAutoStart,
    
    // Utilities
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === TUTORIAL_STEPS.length - 1,
    progress: ((currentStep + 1) / TUTORIAL_STEPS.length) * 100,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export default TutorialContext;
