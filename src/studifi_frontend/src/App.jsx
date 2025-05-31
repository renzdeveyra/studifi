import { useState, useEffect } from "react";
import { identityManagerActor as identity_manager } from "./services/actors";
import { intelligentCreditActor as intelligent_credit } from "./services/actors";
import { autonomousFinanceActor as autonomous_finance } from "./services/actors";
import { governanceEngineActor as governance_engine } from "./services/actors";
import { complianceGatewayActor as compliance_gateway } from "./services/actors";

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    credit: null,
    finance: null,
    governance: null,
    compliance: null
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user profile
        const userProfile = await identity_manager.getProfile();
        setProfile(userProfile);

        // Fetch stats from different canisters
        const [creditStats, financeStats, governanceStats, complianceStats] = await Promise.all([
          intelligent_credit.getApplicationStats(),
          autonomous_finance.getPortfolioStats(),
          governance_engine.getGovernanceStats(),
          compliance_gateway.getComplianceStats()
        ]);

        setStats({
          credit: creditStats,
          finance: financeStats,
          governance: governanceStats,
          compliance: complianceStats
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading StudiFi platform...</div>;
  }

  return (
    <div className="app-container">
      <header>
        <h1>StudiFi</h1>
        <p>Decentralized Student Finance Platform</p>
        {profile && (
          <div className="user-profile">
            <p>Welcome, {profile.name}</p>
            <span className={profile.verified ? "verified" : "unverified"}>
              {profile.verified ? "Verified" : "Unverified"}
            </span>
          </div>
        )}
      </header>

      <main>
        <section className="dashboard">
          <h2>Platform Overview</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Credit Applications</h3>
              {stats.credit && (
                <>
                  <p>Total Applications: {stats.credit.totalApplications}</p>
                  <p>Approved: {stats.credit.approvedApplications}</p>
                  <p>Average Amount: ${stats.credit.averageAmount}</p>
                </>
              )}
            </div>
            
            <div className="stat-card">
              <h3>Finance Portfolio</h3>
              {stats.finance && (
                <>
                  <p>Active Loans: {stats.finance.activeLoans}</p>
                  <p>Total Disbursed: ${(stats.finance.totalDisbursed / 1000000).toFixed(2)}M</p>
                  <p>Repayment Rate: {(stats.finance.repaymentRate * 100).toFixed(1)}%</p>
                </>
              )}
            </div>
            
            <div className="stat-card">
              <h3>Governance</h3>
              {stats.governance && (
                <>
                  <p>Active Proposals: {stats.governance.activeProposals}</p>
                  <p>Total Votes: {stats.governance.totalVotes}</p>
                  <p>Participation: {(stats.governance.participationRate * 100).toFixed(1)}%</p>
                </>
              )}
            </div>
            
            <div className="stat-card">
              <h3>Compliance</h3>
              {stats.compliance && (
                <>
                  <p>Verified Users: {stats.compliance.verifiedUsers}</p>
                  <p>Pending Verifications: {stats.compliance.pendingVerifications}</p>
                  <p>Compliance Rate: {(stats.compliance.complianceRate * 100).toFixed(1)}%</p>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2023 StudiFi - Powered by Internet Computer</p>
      </footer>
    </div>
  );
}

export default App;
