import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Float "mo:base/Float";
import Int "mo:base/Int";

actor IntelligentCredit {
    
    // Types for credit assessment
    public type CreditScore = {
        score: Nat; // 0-1000 scale
        riskLevel: RiskLevel;
        factors: [CreditFactor];
        calculatedAt: Int;
    };

    public type RiskLevel = {
        #VeryLow;   // 800-1000
        #Low;       // 650-799
        #Medium;    // 500-649
        #High;      // 350-499
        #VeryHigh;  // 0-349
    };

    public type CreditFactor = {
        name: Text;
        weight: Float;
        score: Float;
        impact: Text;
    };

    public type LoanApplication = {
        id: Text;
        studentId: Principal;
        requestedAmount: Nat;
        purpose: Text;
        academicInfo: AcademicInfo;
        financialInfo: FinancialInfo;
        status: ApplicationStatus;
        creditScore: ?CreditScore;
        createdAt: Int;
        processedAt: ?Int;
    };

    public type AcademicInfo = {
        gpa: Float;
        yearOfStudy: Nat;
        program: Text;
        university: Text;
        expectedGraduation: Text;
    };

    public type FinancialInfo = {
        monthlyIncome: Nat;
        monthlyExpenses: Nat;
        existingDebt: Nat;
        familyIncome: Nat;
    };

    public type ApplicationStatus = {
        #Submitted;
        #UnderReview;
        #Approved;
        #Rejected;
        #Disbursed;
    };

    public type LoanTerms = {
        approvedAmount: Nat;
        interestRate: Float;
        termMonths: Nat;
        monthlyPayment: Nat;
        gracePeriodMonths: Nat;
    };

    // State management
    private stable var applicationsEntries : [(Text, LoanApplication)] = [];
    private var applications = Map.HashMap<Text, LoanApplication>(10, Text.equal, Text.hash);

    private stable var creditScoresEntries : [(Principal, CreditScore)] = [];
    private var creditScores = Map.HashMap<Principal, CreditScore>(10, Principal.equal, Principal.hash);

    private stable var nextApplicationId : Nat = 1;

    // Initialize from stable storage
    system func preupgrade() {
        applicationsEntries := Map.toArray(applications);
        creditScoresEntries := Map.toArray(creditScores);
    };

    system func postupgrade() {
        applications := Map.fromIter<Text, LoanApplication>(
            applicationsEntries.vals(), applicationsEntries.size(), Text.equal, Text.hash
        );
        creditScores := Map.fromIter<Principal, CreditScore>(
            creditScoresEntries.vals(), creditScoresEntries.size(), Principal.equal, Principal.hash
        );
        applicationsEntries := [];
        creditScoresEntries := [];
    };

    // AI-powered credit scoring algorithm
    private func calculateCreditScore(academicInfo: AcademicInfo, financialInfo: FinancialInfo) : CreditScore {
        var totalScore : Float = 0.0;
        var factors : [CreditFactor] = [];

        // Academic Performance Factor (40% weight)
        let gpaScore = Float.min(academicInfo.gpa / 4.0 * 100, 100);
        let gpaFactor : CreditFactor = {
            name = "Academic Performance";
            weight = 0.4;
            score = gpaScore;
            impact = if (gpaScore >= 85) "Excellent GPA boosts creditworthiness" 
                    else if (gpaScore >= 70) "Good academic standing" 
                    else "Academic performance needs improvement";
        };
        factors := Array.append(factors, [gpaFactor]);
        totalScore += gpaScore * 0.4;

        // Financial Stability Factor (30% weight)
        let netIncome = Int.abs(financialInfo.monthlyIncome - financialInfo.monthlyExpenses);
        let financialScore = Float.min(Float.fromInt(netIncome) / 1000.0 * 100, 100);
        let financialFactor : CreditFactor = {
            name = "Financial Stability";
            weight = 0.3;
            score = financialScore;
            impact = if (financialScore >= 80) "Strong financial position" 
                    else if (financialScore >= 50) "Adequate financial management" 
                    else "Financial constraints identified";
        };
        factors := Array.append(factors, [financialFactor]);
        totalScore += financialScore * 0.3;

        // Program Viability Factor (20% weight)
        let programScore = getProgramScore(academicInfo.program);
        let programFactor : CreditFactor = {
            name = "Program Employability";
            weight = 0.2;
            score = programScore;
            impact = if (programScore >= 85) "High-demand field with excellent job prospects" 
                    else if (programScore >= 70) "Good career prospects" 
                    else "Moderate employment outlook";
        };
        factors := Array.append(factors, [programFactor]);
        totalScore += programScore * 0.2;

        // Year of Study Factor (10% weight)
        let yearScore = Float.fromInt(academicInfo.yearOfStudy) / 4.0 * 100;
        let yearFactor : CreditFactor = {
            name = "Academic Progress";
            weight = 0.1;
            score = yearScore;
            impact = if (yearScore >= 75) "Advanced student with proven commitment" 
                    else if (yearScore >= 50) "Good academic progress" 
                    else "Early stage student";
        };
        factors := Array.append(factors, [yearFactor]);
        totalScore += yearScore * 0.1;

        // Convert to 0-1000 scale
        let finalScore = Int.abs(Float.toInt(totalScore * 10));
        let riskLevel = getRiskLevel(finalScore);

        {
            score = finalScore;
            riskLevel = riskLevel;
            factors = factors;
            calculatedAt = Time.now();
        }
    };

    private func getProgramScore(program: Text) : Float {
        // Simplified program scoring based on market demand
        switch (program) {
            case ("Computer Science" or "Software Engineering" or "Data Science") { 95.0 };
            case ("Engineering" or "Medicine" or "Nursing") { 90.0 };
            case ("Business" or "Finance" or "Economics") { 85.0 };
            case ("Education" or "Psychology" or "Law") { 80.0 };
            case _ { 75.0 }; // Default score for other programs
        }
    };

    private func getRiskLevel(score: Nat) : RiskLevel {
        if (score >= 800) { #VeryLow }
        else if (score >= 650) { #Low }
        else if (score >= 500) { #Medium }
        else if (score >= 350) { #High }
        else { #VeryHigh }
    };

    // Public functions for loan processing
    public shared(msg) func submitLoanApplication(
        requestedAmount: Nat,
        purpose: Text,
        academicInfo: AcademicInfo,
        financialInfo: FinancialInfo
    ) : async Result.Result<LoanApplication, Text> {
        let caller = msg.caller;
        let applicationId = "APP-" # Int.toText(nextApplicationId);
        nextApplicationId += 1;

        let application : LoanApplication = {
            id = applicationId;
            studentId = caller;
            requestedAmount = requestedAmount;
            purpose = purpose;
            academicInfo = academicInfo;
            financialInfo = financialInfo;
            status = #Submitted;
            creditScore = null;
            createdAt = Time.now();
            processedAt = null;
        };

        applications.put(applicationId, application);
        
        // Immediately process the application
        await processApplication(applicationId)
    };

    public func processApplication(applicationId: Text) : async Result.Result<LoanApplication, Text> {
        switch (applications.get(applicationId)) {
            case (?app) {
                // Calculate credit score
                let creditScore = calculateCreditScore(app.academicInfo, app.financialInfo);
                creditScores.put(app.studentId, creditScore);

                // Determine approval status
                let status = if (creditScore.score >= 500) { #Approved } else { #Rejected };

                let updatedApp = {
                    app with 
                    status = status;
                    creditScore = ?creditScore;
                    processedAt = ?Time.now();
                };

                applications.put(applicationId, updatedApp);
                #ok(updatedApp)
            };
            case null {
                #err("Application not found")
            };
        }
    };

    public query func getApplication(applicationId: Text) : async ?LoanApplication {
        applications.get(applicationId)
    };

    public query func getStudentApplications(studentId: Principal) : async [LoanApplication] {
        let allApps = Array.fromIter(Map.vals(applications));
        Array.filter<LoanApplication>(allApps, func(app) = app.studentId == studentId)
    };

    public query func getCreditScore(studentId: Principal) : async ?CreditScore {
        creditScores.get(studentId)
    };

    public func generateLoanTerms(applicationId: Text) : async Result.Result<LoanTerms, Text> {
        switch (applications.get(applicationId)) {
            case (?app) {
                switch (app.creditScore) {
                    case (?score) {
                        let interestRate = calculateInterestRate(score.riskLevel);
                        let termMonths = 60; // 5 years standard
                        let gracePeriodMonths = 6; // 6 months grace period
                        
                        let terms : LoanTerms = {
                            approvedAmount = calculateApprovedAmount(app.requestedAmount, score.score);
                            interestRate = interestRate;
                            termMonths = termMonths;
                            monthlyPayment = calculateMonthlyPayment(app.requestedAmount, interestRate, termMonths);
                            gracePeriodMonths = gracePeriodMonths;
                        };
                        
                        #ok(terms)
                    };
                    case null {
                        #err("Credit score not available")
                    };
                }
            };
            case null {
                #err("Application not found")
            };
        }
    };

    private func calculateInterestRate(riskLevel: RiskLevel) : Float {
        switch (riskLevel) {
            case (#VeryLow) { 0.0 };    // 0% for excellent students
            case (#Low) { 0.02 };       // 2% for good students
            case (#Medium) { 0.05 };    // 5% for average students
            case (#High) { 0.08 };      // 8% for higher risk
            case (#VeryHigh) { 0.12 };  // 12% for very high risk
        }
    };

    private func calculateApprovedAmount(requested: Nat, creditScore: Nat) : Nat {
        if (creditScore >= 800) { requested }
        else if (creditScore >= 650) { requested * 90 / 100 }
        else if (creditScore >= 500) { requested * 75 / 100 }
        else { requested * 50 / 100 }
    };

    private func calculateMonthlyPayment(principal: Nat, annualRate: Float, termMonths: Nat) : Nat {
        if (annualRate == 0.0) {
            principal / termMonths
        } else {
            let monthlyRate = annualRate / 12.0;
            let factor = Float.pow(1.0 + monthlyRate, Float.fromInt(termMonths));
            let payment = Float.fromInt(principal) * monthlyRate * factor / (factor - 1.0);
            Int.abs(Float.toInt(payment))
        }
    };

    // Analytics and reporting
    public query func getApplicationStats() : async {
        totalApplications: Nat;
        approvedApplications: Nat;
        rejectedApplications: Nat;
        averageCreditScore: Float;
    } {
        let allApps = Array.fromIter(Map.vals(applications));
        let approved = Array.filter<LoanApplication>(allApps, func(app) = app.status == #Approved);
        let rejected = Array.filter<LoanApplication>(allApps, func(app) = app.status == #Rejected);
        
        let allScores = Array.fromIter(Map.vals(creditScores));
        let avgScore = if (allScores.size() > 0) {
            let total = Array.foldLeft<CreditScore, Float>(allScores, 0.0, func(acc, score) = acc + Float.fromInt(score.score));
            total / Float.fromInt(allScores.size())
        } else { 0.0 };

        {
            totalApplications = allApps.size();
            approvedApplications = approved.size();
            rejectedApplications = rejected.size();
            averageCreditScore = avgScore;
        }
    };
}
