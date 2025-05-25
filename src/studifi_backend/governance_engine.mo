import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Option "mo:base/Option";

actor GovernanceEngine {
    
    // Types for governance and scholarships
    public type Proposal = {
        id: Text;
        proposer: Principal;
        title: Text;
        description: Text;
        proposalType: ProposalType;
        status: ProposalStatus;
        votingPeriodEnd: Int;
        votesFor: Nat;
        votesAgainst: Nat;
        totalVotingPower: Nat;
        executionPayload: ?Text;
        createdAt: Int;
        executedAt: ?Int;
    };

    public type ProposalType = {
        #ScholarshipFund;
        #PolicyChange;
        #TreasuryAllocation;
        #ParameterUpdate;
        #CommunityInitiative;
    };

    public type ProposalStatus = {
        #Active;
        #Passed;
        #Rejected;
        #Executed;
        #Expired;
    };

    public type Vote = {
        proposalId: Text;
        voter: Principal;
        vote: VoteChoice;
        votingPower: Nat;
        timestamp: Int;
    };

    public type VoteChoice = {
        #For;
        #Against;
        #Abstain;
    };

    public type Scholarship = {
        id: Text;
        name: Text;
        description: Text;
        amount: Nat;
        criteria: ScholarshipCriteria;
        donor: ?Principal;
        status: ScholarshipStatus;
        recipients: [Principal];
        totalFunding: Nat;
        remainingFunding: Nat;
        createdAt: Int;
        deadline: Int;
    };

    public type ScholarshipCriteria = {
        minGPA: Float;
        requiredPrograms: [Text];
        yearOfStudyRange: (Nat, Nat);
        financialNeedRequired: Bool;
        maxRecipients: Nat;
        additionalRequirements: Text;
    };

    public type ScholarshipStatus = {
        #Open;
        #Closed;
        #Funded;
        #Distributed;
    };

    public type ScholarshipApplication = {
        id: Text;
        scholarshipId: Text;
        applicant: Principal;
        essay: Text;
        supportingDocuments: [Text];
        status: ApplicationStatus;
        score: ?Float;
        submittedAt: Int;
        reviewedAt: ?Int;
    };

    public type ApplicationStatus = {
        #Submitted;
        #UnderReview;
        #Approved;
        #Rejected;
        #Awarded;
    };

    public type Stakeholder = {
        id: Principal;
        stakeholderType: StakeholderType;
        votingPower: Nat;
        reputation: Float;
        joinedAt: Int;
        lastActive: Int;
    };

    public type StakeholderType = {
        #Student;
        #Donor;
        #University;
        #CommunityMember;
        #TeamMember;
    };

    // State management
    private stable var proposalsEntries : [(Text, Proposal)] = [];
    private var proposals = Map.HashMap<Text, Proposal>(10, Text.equal, Text.hash);

    private stable var votesEntries : [(Text, Vote)] = [];
    private var votes = Map.HashMap<Text, Vote>(10, Text.equal, Text.hash);

    private stable var scholarshipsEntries : [(Text, Scholarship)] = [];
    private var scholarships = Map.HashMap<Text, Scholarship>(10, Text.equal, Text.hash);

    private stable var applicationsEntries : [(Text, ScholarshipApplication)] = [];
    private var applications = Map.HashMap<Text, ScholarshipApplication>(10, Text.equal, Text.hash);

    private stable var stakeholdersEntries : [(Principal, Stakeholder)] = [];
    private var stakeholders = Map.HashMap<Principal, Stakeholder>(10, Principal.equal, Principal.hash);

    private stable var nextProposalId : Nat = 1;
    private stable var nextScholarshipId : Nat = 1;
    private stable var nextApplicationId : Nat = 1;

    // Treasury management
    private stable var treasuryBalance : Nat = 0;
    private stable var totalDonations : Nat = 0;

    // Initialize from stable storage
    system func preupgrade() {
        proposalsEntries := Map.toArray(proposals);
        votesEntries := Map.toArray(votes);
        scholarshipsEntries := Map.toArray(scholarships);
        applicationsEntries := Map.toArray(applications);
        stakeholdersEntries := Map.toArray(stakeholders);
    };

    system func postupgrade() {
        proposals := Map.fromIter<Text, Proposal>(
            proposalsEntries.vals(), proposalsEntries.size(), Text.equal, Text.hash
        );
        votes := Map.fromIter<Text, Vote>(
            votesEntries.vals(), votesEntries.size(), Text.equal, Text.hash
        );
        scholarships := Map.fromIter<Text, Scholarship>(
            scholarshipsEntries.vals(), scholarshipsEntries.size(), Text.equal, Text.hash
        );
        applications := Map.fromIter<Text, ScholarshipApplication>(
            applicationsEntries.vals(), applicationsEntries.size(), Text.equal, Text.hash
        );
        stakeholders := Map.fromIter<Principal, Stakeholder>(
            stakeholdersEntries.vals(), stakeholdersEntries.size(), Principal.equal, Principal.hash
        );
        
        proposalsEntries := [];
        votesEntries := [];
        scholarshipsEntries := [];
        applicationsEntries := [];
        stakeholdersEntries := [];
    };

    // Stakeholder management
    public shared(msg) func registerStakeholder(stakeholderType: StakeholderType) : async Result.Result<Stakeholder, Text> {
        let caller = msg.caller;
        
        switch (stakeholders.get(caller)) {
            case (?existing) {
                return #err("Stakeholder already registered");
            };
            case null {};
        };

        let votingPower = calculateInitialVotingPower(stakeholderType);
        let stakeholder : Stakeholder = {
            id = caller;
            stakeholderType = stakeholderType;
            votingPower = votingPower;
            reputation = 100.0; // Starting reputation
            joinedAt = Time.now();
            lastActive = Time.now();
        };

        stakeholders.put(caller, stakeholder);
        #ok(stakeholder)
    };

    private func calculateInitialVotingPower(stakeholderType: StakeholderType) : Nat {
        switch (stakeholderType) {
            case (#Student) { 10 };
            case (#Donor) { 50 };
            case (#University) { 100 };
            case (#CommunityMember) { 5 };
            case (#TeamMember) { 200 };
        }
    };

    // Proposal management
    public shared(msg) func createProposal(
        title: Text,
        description: Text,
        proposalType: ProposalType,
        votingPeriodDays: Nat
    ) : async Result.Result<Proposal, Text> {
        let caller = msg.caller;
        
        // Check if caller is a registered stakeholder
        switch (stakeholders.get(caller)) {
            case (?stakeholder) {
                let proposalId = "PROP-" # Int.toText(nextProposalId);
                nextProposalId += 1;

                let votingPeriodEnd = Time.now() + (votingPeriodDays * 24 * 60 * 60 * 1000_000_000);

                let proposal : Proposal = {
                    id = proposalId;
                    proposer = caller;
                    title = title;
                    description = description;
                    proposalType = proposalType;
                    status = #Active;
                    votingPeriodEnd = votingPeriodEnd;
                    votesFor = 0;
                    votesAgainst = 0;
                    totalVotingPower = 0;
                    executionPayload = null;
                    createdAt = Time.now();
                    executedAt = null;
                };

                proposals.put(proposalId, proposal);
                #ok(proposal)
            };
            case null {
                #err("Must be a registered stakeholder to create proposals")
            };
        }
    };

    public shared(msg) func vote(proposalId: Text, choice: VoteChoice) : async Result.Result<Vote, Text> {
        let caller = msg.caller;
        
        switch (stakeholders.get(caller)) {
            case (?stakeholder) {
                switch (proposals.get(proposalId)) {
                    case (?proposal) {
                        if (Time.now() > proposal.votingPeriodEnd) {
                            return #err("Voting period has ended");
                        };

                        if (proposal.status != #Active) {
                            return #err("Proposal is not active");
                        };

                        // Check if already voted
                        let voteKey = proposalId # "-" # Principal.toText(caller);
                        switch (votes.get(voteKey)) {
                            case (?existingVote) {
                                return #err("Already voted on this proposal");
                            };
                            case null {};
                        };

                        let vote : Vote = {
                            proposalId = proposalId;
                            voter = caller;
                            vote = choice;
                            votingPower = stakeholder.votingPower;
                            timestamp = Time.now();
                        };

                        votes.put(voteKey, vote);

                        // Update proposal vote counts
                        let updatedProposal = switch (choice) {
                            case (#For) {
                                {
                                    proposal with 
                                    votesFor = proposal.votesFor + stakeholder.votingPower;
                                    totalVotingPower = proposal.totalVotingPower + stakeholder.votingPower;
                                }
                            };
                            case (#Against) {
                                {
                                    proposal with 
                                    votesAgainst = proposal.votesAgainst + stakeholder.votingPower;
                                    totalVotingPower = proposal.totalVotingPower + stakeholder.votingPower;
                                }
                            };
                            case (#Abstain) {
                                {
                                    proposal with 
                                    totalVotingPower = proposal.totalVotingPower + stakeholder.votingPower;
                                }
                            };
                        };

                        proposals.put(proposalId, updatedProposal);
                        #ok(vote)
                    };
                    case null {
                        #err("Proposal not found")
                    };
                }
            };
            case null {
                #err("Must be a registered stakeholder to vote")
            };
        }
    };

    public func finalizeProposal(proposalId: Text) : async Result.Result<Proposal, Text> {
        switch (proposals.get(proposalId)) {
            case (?proposal) {
                if (Time.now() <= proposal.votingPeriodEnd) {
                    return #err("Voting period has not ended");
                };

                if (proposal.status != #Active) {
                    return #err("Proposal is not active");
                };

                // Determine if proposal passed (simple majority)
                let passed = proposal.votesFor > proposal.votesAgainst;
                let newStatus = if (passed) { #Passed } else { #Rejected };

                let updatedProposal = { proposal with status = newStatus };
                proposals.put(proposalId, updatedProposal);

                // Execute proposal if passed
                if (passed) {
                    await executeProposal(proposalId);
                };

                #ok(updatedProposal)
            };
            case null {
                #err("Proposal not found")
            };
        }
    };

    private func executeProposal(proposalId: Text) : async () {
        switch (proposals.get(proposalId)) {
            case (?proposal) {
                // Execute based on proposal type
                switch (proposal.proposalType) {
                    case (#ScholarshipFund) {
                        // Create new scholarship fund
                        Debug.print("Executing scholarship fund proposal: " # proposal.title);
                    };
                    case (#TreasuryAllocation) {
                        // Allocate treasury funds
                        Debug.print("Executing treasury allocation: " # proposal.title);
                    };
                    case (#PolicyChange) {
                        // Update system parameters
                        Debug.print("Executing policy change: " # proposal.title);
                    };
                    case (#ParameterUpdate) {
                        // Update system parameters
                        Debug.print("Executing parameter update: " # proposal.title);
                    };
                    case (#CommunityInitiative) {
                        // Execute community initiative
                        Debug.print("Executing community initiative: " # proposal.title);
                    };
                };

                let updatedProposal = {
                    proposal with 
                    status = #Executed;
                    executedAt = ?Time.now();
                };
                proposals.put(proposalId, updatedProposal);
            };
            case null {};
        };
    };

    // Scholarship management
    public shared(msg) func createScholarship(
        name: Text,
        description: Text,
        amount: Nat,
        criteria: ScholarshipCriteria,
        deadline: Int
    ) : async Result.Result<Scholarship, Text> {
        let caller = msg.caller;
        let scholarshipId = "SCHOL-" # Int.toText(nextScholarshipId);
        nextScholarshipId += 1;

        let scholarship : Scholarship = {
            id = scholarshipId;
            name = name;
            description = description;
            amount = amount;
            criteria = criteria;
            donor = ?caller;
            status = #Open;
            recipients = [];
            totalFunding = amount;
            remainingFunding = amount;
            createdAt = Time.now();
            deadline = deadline;
        };

        scholarships.put(scholarshipId, scholarship);
        #ok(scholarship)
    };

    public shared(msg) func applyForScholarship(
        scholarshipId: Text,
        essay: Text,
        supportingDocuments: [Text]
    ) : async Result.Result<ScholarshipApplication, Text> {
        let caller = msg.caller;
        
        switch (scholarships.get(scholarshipId)) {
            case (?scholarship) {
                if (scholarship.status != #Open) {
                    return #err("Scholarship is not open for applications");
                };

                if (Time.now() > scholarship.deadline) {
                    return #err("Application deadline has passed");
                };

                let applicationId = "APP-" # Int.toText(nextApplicationId);
                nextApplicationId += 1;

                let application : ScholarshipApplication = {
                    id = applicationId;
                    scholarshipId = scholarshipId;
                    applicant = caller;
                    essay = essay;
                    supportingDocuments = supportingDocuments;
                    status = #Submitted;
                    score = null;
                    submittedAt = Time.now();
                    reviewedAt = null;
                };

                applications.put(applicationId, application);
                #ok(application)
            };
            case null {
                #err("Scholarship not found")
            };
        }
    };

    // Treasury management
    public shared(msg) func donate(amount: Nat) : async Result.Result<Text, Text> {
        treasuryBalance += amount;
        totalDonations += amount;
        
        // Update donor's voting power
        switch (stakeholders.get(msg.caller)) {
            case (?stakeholder) {
                let bonusVotingPower = amount / 1000; // 1 voting power per 1000 units donated
                let updatedStakeholder = {
                    stakeholder with 
                    votingPower = stakeholder.votingPower + bonusVotingPower;
                    lastActive = Time.now();
                };
                stakeholders.put(msg.caller, updatedStakeholder);
            };
            case null {};
        };

        #ok("Donation of " # Int.toText(amount) # " received. Thank you!")
    };

    // Query functions
    public query func getProposal(proposalId: Text) : async ?Proposal {
        proposals.get(proposalId)
    };

    public query func getAllActiveProposals() : async [Proposal] {
        let allProposals = Array.fromIter(Map.vals(proposals));
        Array.filter<Proposal>(allProposals, func(p) = p.status == #Active)
    };

    public query func getScholarship(scholarshipId: Text) : async ?Scholarship {
        scholarships.get(scholarshipId)
    };

    public query func getOpenScholarships() : async [Scholarship] {
        let allScholarships = Array.fromIter(Map.vals(scholarships));
        Array.filter<Scholarship>(allScholarships, func(s) = s.status == #Open)
    };

    public query func getTreasuryStats() : async {balance: Nat; totalDonations: Nat; totalStakeholders: Nat} {
        {
            balance = treasuryBalance;
            totalDonations = totalDonations;
            totalStakeholders = Map.size(stakeholders);
        }
    };

    public query func getGovernanceStats() : async {
        totalProposals: Nat;
        activeProposals: Nat;
        passedProposals: Nat;
        totalVotes: Nat;
    } {
        let allProposals = Array.fromIter(Map.vals(proposals));
        let activeProposals = Array.filter<Proposal>(allProposals, func(p) = p.status == #Active);
        let passedProposals = Array.filter<Proposal>(allProposals, func(p) = p.status == #Passed or p.status == #Executed);

        {
            totalProposals = allProposals.size();
            activeProposals = activeProposals.size();
            passedProposals = passedProposals.size();
            totalVotes = Map.size(votes);
        }
    };
}
