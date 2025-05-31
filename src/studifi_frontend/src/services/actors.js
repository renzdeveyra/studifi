// Import mock actors for development
import {
  mockIdentityManager,
  mockIntelligentCredit,
  mockAutonomousFinance,
  mockGovernanceEngine,
  mockComplianceGateway
} from "./mockActors";

// Use mock actors for development
export const identityManagerActor = mockIdentityManager;
export const intelligentCreditActor = mockIntelligentCredit;
export const autonomousFinanceActor = mockAutonomousFinance;
export const governanceEngineActor = mockGovernanceEngine;
export const complianceGatewayActor = mockComplianceGateway;

/* 
 * NOTE: In a production environment, you would use the real actors:
 * 
 * import { Actor, HttpAgent } from "@dfinity/agent";
 * import { idlFactory as identityManagerIDL } from "../../declarations/identity_manager";
 * import { idlFactory as intelligentCreditIDL } from "../../declarations/intelligent_credit";
 * import { idlFactory as autonomousFinanceIDL } from "../../declarations/autonomous_finance";
 * import { idlFactory as governanceEngineIDL } from "../../declarations/governance_engine";
 * import { idlFactory as complianceGatewayIDL } from "../../declarations/compliance_gateway";
 * 
 * const agent = new HttpAgent({ host: process.env.DFX_NETWORK === "ic" ? "https://icp0.io" : "http://localhost:4943" });
 * 
 * if (process.env.DFX_NETWORK !== "ic") {
 *   agent.fetchRootKey().catch(err => {
 *     console.warn("Unable to fetch root key. Check if your local replica is running");
 *     console.error(err);
 *   });
 * }
 * 
 * export const identityManagerActor = Actor.createActor(identityManagerIDL, {
 *   agent,
 *   canisterId: process.env.CANISTER_ID_IDENTITY_MANAGER || process.env.IDENTITY_MANAGER_CANISTER_ID,
 * });
 * 
 * // ... and so on for other actors
 */
