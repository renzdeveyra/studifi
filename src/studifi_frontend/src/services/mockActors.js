// Mock data for development
const mockLoanApplications = [
  {
    id: "app-123456",
    status: { approved: null },
    requestedAmount: 5000,
    purpose: "Tuition fees",
    creditScore: { score: 780, riskLevel: { low: null } }
  }
];

const mockScholarships = [
  {
    id: "sch-123456",
    name: "STEM Excellence Scholarship",
    amount: 2500,
    description: "For outstanding students in STEM fields",
    deadline: "2025-06-30",
    eligibility: "GPA 3.5+, STEM major",
    sponsor: "TechCorp Foundation"
  },
  {
    id: "sch-789012",
    name: "First Generation Student Grant",
    amount: 1500,
    description: "Supporting first-generation college students",
    deadline: "2025-07-15",
    eligibility: "First-generation college student",
    sponsor: "Education Access Initiative"
  }
];

const mockProposals = [
  {
    id: "prop-123456",
    title: "Increase Loan Limits for Graduate Students",
    description: "Proposal to increase maximum loan amounts for graduate students by 20%",
    proposalType: { policyChange: null },
    votesFor: 1245,
    votesAgainst: 328,
    status: { active: null }
  },
  {
    id: "prop-789012",
    title: "New Scholarship for Arts Students",
    description: "Create a new scholarship fund for students in visual and performing arts",
    proposalType: { newScholarship: null },
    votesFor: 987,
    votesAgainst: 213,
    status: { active: null }
  }
];

// Mock actors for development
export const mockIdentityManager = {
  createProfile: async (profile) => {
    console.log("Creating profile:", profile);
    return { id: "user-" + Math.floor(Math.random() * 1000000) };
  },
  getProfile: async (id) => {
    console.log("Getting profile:", id);
    return {
      id: id || "user-123456",
      name: "Jane Student",
      email: "jane@university.edu",
      verified: true
    };
  }
};

export const mockIntelligentCredit = {
  submitLoanApplication: async (amount, purpose, academicInfo, financialInfo) => {
    console.log("Submitting loan application:", { amount, purpose, academicInfo, financialInfo });
    return {
      id: "app-" + Math.floor(Math.random() * 1000000),
      status: { pending: null },
      requestedAmount: amount,
      purpose,
      creditScore: { score: 750, riskLevel: { low: null } }
    };
  },
  getApplicationStats: async () => {
    return {
      totalApplications: 1247,
      approvedApplications: 982,
      rejectedApplications: 265,
      averageAmount: 4500,
      averageProcessingTime: 5 // seconds
    };
  }
};

export const mockAutonomousFinance = {
  getPortfolioStats: async () => {
    return {
      totalLoans: 982,
      activeLoans: 876,
      totalDisbursed: 2500000, // $2.5M
      repaymentRate: 0.97, // 97%
      averageInterestRate: 0.045 // 4.5%
    };
  }
};

export const mockGovernanceEngine = {
  getAllActiveProposals: async () => {
    return mockProposals;
  },
  getOpenScholarships: async () => {
    return mockScholarships;
  },
  getGovernanceStats: async () => {
    return {
      totalProposals: 47,
      activeProposals: 12,
      totalVotes: 28750,
      participationRate: 0.68 // 68%
    };
  },
  getTreasuryStats: async () => {
    return {
      totalFunds: 3750000, // $3.75M
      allocatedFunds: 2850000, // $2.85M
      reserveFunds: 900000, // $900K
      scholarshipFunds: 750000 // $750K
    };
  }
};

export const mockComplianceGateway = {
  getComplianceStats: async () => {
    return {
      verifiedUsers: 1350,
      pendingVerifications: 87,
      complianceRate: 0.99, // 99%
      averageVerificationTime: 24 // hours
    };
  }
};

// Use these mock actors during development
export const identityManagerActor = mockIdentityManager;
export const intelligentCreditActor = mockIntelligentCredit;
export const autonomousFinanceActor = mockAutonomousFinance;
export const governanceEngineActor = mockGovernanceEngine;
export const complianceGatewayActor = mockComplianceGateway;