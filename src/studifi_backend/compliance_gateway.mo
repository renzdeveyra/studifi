import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Option "mo:base/Option";
import Iter "mo:base/Iter";

actor ComplianceGateway {

    // Types for compliance and regulatory management
    public type ComplianceRecord = {
        id: Text;
        entityId: Principal;
        entityType: EntityType;
        complianceType: ComplianceType;
        status: ComplianceStatus;
        verificationData: VerificationData;
        expiryDate: ?Int;
        createdAt: Int;
        updatedAt: Int;
        verifiedBy: ?Principal;
    };

    public type EntityType = {
        #Student;
        #Donor;
        #University;
        #FinancialInstitution;
    };

    public type ComplianceType = {
        #KYC; // Know Your Customer
        #AML; // Anti-Money Laundering
        #StudentVerification;
        #InstitutionalVerification;
        #TaxCompliance;
        #DataPrivacy;
    };

    public type ComplianceStatus = {
        #Pending;
        #InProgress;
        #Verified;
        #Rejected;
        #Expired;
        #Suspended;
    };

    public type VerificationData = {
        documentType: Text;
        documentHash: Text;
        verificationMethod: Text;
        additionalInfo: Text;
        riskScore: Float;
    };

    public type AuditLog = {
        id: Text;
        timestamp: Int;
        actorPrincipal: Principal;
        action: Text;
        entityId: Principal;
        details: Text;
        ipAddress: ?Text;
        userAgent: ?Text;
    };

    public type RegulatoryReport = {
        id: Text;
        reportType: ReportType;
        period: ReportPeriod;
        data: Text; // JSON string containing report data
        generatedAt: Int;
        submittedAt: ?Int;
        status: ReportStatus;
    };

    public type ReportType = {
        #MonthlyLoanReport;
        #QuarterlyComplianceReport;
        #AnnualFinancialReport;
        #AMLSuspiciousActivity;
        #StudentDataPrivacy;
    };

    public type ReportPeriod = {
        startDate: Int;
        endDate: Int;
        description: Text;
    };

    public type ReportStatus = {
        #Draft;
        #Generated;
        #Submitted;
        #Approved;
        #Rejected;
    };

    public type RiskAssessment = {
        entityId: Principal;
        riskLevel: RiskLevel;
        riskFactors: [RiskFactor];
        score: Float;
        assessedAt: Int;
        validUntil: Int;
    };

    public type RiskLevel = {
        #Low;
        #Medium;
        #High;
        #Critical;
    };

    public type RiskFactor = {
        factor: Text;
        weight: Float;
        score: Float;
        description: Text;
    };

    // State management
    private stable var complianceRecordsEntries : [(Text, ComplianceRecord)] = [];
    private var complianceRecords = Map.HashMap<Text, ComplianceRecord>(10, Text.equal, Text.hash);

    private stable var auditLogsEntries : [(Text, AuditLog)] = [];
    private var auditLogs = Map.HashMap<Text, AuditLog>(10, Text.equal, Text.hash);

    private stable var regulatoryReportsEntries : [(Text, RegulatoryReport)] = [];
    private var regulatoryReports = Map.HashMap<Text, RegulatoryReport>(10, Text.equal, Text.hash);

    private stable var riskAssessmentsEntries : [(Principal, RiskAssessment)] = [];
    private var riskAssessments = Map.HashMap<Principal, RiskAssessment>(10, Principal.equal, Principal.hash);

    private stable var nextRecordId : Nat = 1;
    private stable var nextAuditId : Nat = 1;
    private stable var nextReportId : Nat = 1;

    // Initialize from stable storage
    system func preupgrade() {
        complianceRecordsEntries := Iter.toArray(complianceRecords.entries());
        auditLogsEntries := Iter.toArray(auditLogs.entries());
        regulatoryReportsEntries := Iter.toArray(regulatoryReports.entries());
        riskAssessmentsEntries := Iter.toArray(riskAssessments.entries());
    };

    system func postupgrade() {
        complianceRecords := Map.fromIter<Text, ComplianceRecord>(
            complianceRecordsEntries.vals(), complianceRecordsEntries.size(), Text.equal, Text.hash
        );
        auditLogs := Map.fromIter<Text, AuditLog>(
            auditLogsEntries.vals(), auditLogsEntries.size(), Text.equal, Text.hash
        );
        regulatoryReports := Map.fromIter<Text, RegulatoryReport>(
            regulatoryReportsEntries.vals(), regulatoryReportsEntries.size(), Text.equal, Text.hash
        );
        riskAssessments := Map.fromIter<Principal, RiskAssessment>(
            riskAssessmentsEntries.vals(), riskAssessmentsEntries.size(), Principal.equal, Principal.hash
        );

        complianceRecordsEntries := [];
        auditLogsEntries := [];
        regulatoryReportsEntries := [];
        riskAssessmentsEntries := [];
    };

    // KYC/AML Verification
    public shared(msg) func initiateKYCVerification(
        entityId: Principal,
        entityType: EntityType,
        documentType: Text,
        documentHash: Text
    ) : async Result.Result<ComplianceRecord, Text> {
        let caller = msg.caller;
        let recordId = "KYC-" # Int.toText(nextRecordId);
        nextRecordId += 1;

        let verificationData : VerificationData = {
            documentType = documentType;
            documentHash = documentHash;
            verificationMethod = "Document verification + Biometric";
            additionalInfo = "Initial KYC verification";
            riskScore = 0.0; // Will be calculated during verification
        };

        let record : ComplianceRecord = {
            id = recordId;
            entityId = entityId;
            entityType = entityType;
            complianceType = #KYC;
            status = #Pending;
            verificationData = verificationData;
            expiryDate = ?(Time.now() + (365 * 24 * 60 * 60 * 1000_000_000)); // 1 year validity
            createdAt = Time.now();
            updatedAt = Time.now();
            verifiedBy = null;
        };

        complianceRecords.put(recordId, record);

        // Log the action
        await logAuditEvent(caller, "KYC_INITIATED", entityId, "KYC verification initiated for " # documentType);

        // Start verification process
        await processKYCVerification(recordId);

        #ok(record)
    };

    private func processKYCVerification(recordId: Text) : async () {
        switch (complianceRecords.get(recordId)) {
            case (?record) {
                // Simulate KYC verification process
                // In production, this would integrate with external KYC providers

                let riskScore = calculateKYCRiskScore(record.verificationData);
                let status = if (riskScore < 0.3) { #Verified } else if (riskScore < 0.7) { #InProgress } else { #Rejected };

                let updatedVerificationData = {
                    record.verificationData with riskScore = riskScore;
                };

                let updatedRecord = {
                    record with
                    status = status;
                    verificationData = updatedVerificationData;
                    updatedAt = Time.now();
                };

                complianceRecords.put(recordId, updatedRecord);
                Debug.print("KYC verification processed for record: " # recordId);
            };
            case null {};
        };
    };

    private func calculateKYCRiskScore(verificationData: VerificationData) : Float {
        // Simplified risk scoring algorithm
        var riskScore : Float = 0.0;

        // Document type risk
        switch (verificationData.documentType) {
            case ("passport" or "national_id") { riskScore += 0.1; };
            case ("driver_license") { riskScore += 0.2; };
            case ("student_id") { riskScore += 0.3; };
            case _ { riskScore += 0.5; };
        };

        // Additional risk factors would be calculated here
        // For demo purposes, we'll use a random-like score based on document hash
        let hashLength = verificationData.documentHash.size();
        if (hashLength > 50) { riskScore += 0.1; } else { riskScore += 0.2; };

        riskScore
    };

    public shared(msg) func performAMLCheck(
        entityId: Principal,
        transactionAmount: Nat,
        transactionType: Text
    ) : async Result.Result<ComplianceRecord, Text> {
        let caller = msg.caller;
        let recordId = "AML-" # Int.toText(nextRecordId);
        nextRecordId += 1;

        let verificationData : VerificationData = {
            documentType = "transaction_data";
            documentHash = "tx_" # Int.toText(transactionAmount);
            verificationMethod = "AML screening";
            additionalInfo = "Transaction type: " # transactionType # ", Amount: " # Int.toText(transactionAmount);
            riskScore = calculateAMLRiskScore(transactionAmount, transactionType);
        };

        let status = if (verificationData.riskScore < 0.5) { #Verified } else { #InProgress };

        let record : ComplianceRecord = {
            id = recordId;
            entityId = entityId;
            entityType = #Student; // Default, would be determined from context
            complianceType = #AML;
            status = status;
            verificationData = verificationData;
            expiryDate = null; // AML checks don't expire
            createdAt = Time.now();
            updatedAt = Time.now();
            verifiedBy = ?caller;
        };

        complianceRecords.put(recordId, record);

        // Log the action
        await logAuditEvent(caller, "AML_CHECK", entityId, "AML check performed for transaction: " # Int.toText(transactionAmount));

        #ok(record)
    };

    private func calculateAMLRiskScore(amount: Nat, transactionType: Text) : Float {
        var riskScore : Float = 0.0;

        // Amount-based risk
        if (amount > 10000) { riskScore += 0.3; }
        else if (amount > 5000) { riskScore += 0.2; }
        else { riskScore += 0.1; };

        // Transaction type risk
        switch (transactionType) {
            case ("loan_disbursement") { riskScore += 0.1; };
            case ("scholarship_payment") { riskScore += 0.05; };
            case ("donation") { riskScore += 0.15; };
            case _ { riskScore += 0.2; };
        };

        riskScore
    };

    // Risk Assessment
    public func performRiskAssessment(entityId: Principal) : async Result.Result<RiskAssessment, Text> {
        let riskFactors = await calculateRiskFactors(entityId);
        let totalScore = Array.foldLeft<RiskFactor, Float>(riskFactors, 0.0, func(acc, factor) = acc + (factor.score * factor.weight));

        let riskLevel = if (totalScore < 0.3) { #Low }
                       else if (totalScore < 0.6) { #Medium }
                       else if (totalScore < 0.8) { #High }
                       else { #Critical };

        let assessment : RiskAssessment = {
            entityId = entityId;
            riskLevel = riskLevel;
            riskFactors = riskFactors;
            score = totalScore;
            assessedAt = Time.now();
            validUntil = Time.now() + (90 * 24 * 60 * 60 * 1000_000_000); // 90 days validity
        };

        riskAssessments.put(entityId, assessment);
        #ok(assessment)
    };

    private func calculateRiskFactors(entityId: Principal) : async [RiskFactor] {
        var factors : [RiskFactor] = [];

        // Check compliance history
        let complianceHistory = await getEntityComplianceHistory(entityId);
        let complianceFactor : RiskFactor = {
            factor = "Compliance History";
            weight = 0.4;
            score = if (complianceHistory.size() > 0) { 0.2 } else { 0.8 };
            description = "Based on previous compliance records";
        };
        factors := Array.append(factors, [complianceFactor]);

        // Check transaction patterns
        let transactionFactor : RiskFactor = {
            factor = "Transaction Patterns";
            weight = 0.3;
            score = 0.3; // Simplified scoring
            description = "Analysis of transaction behavior";
        };
        factors := Array.append(factors, [transactionFactor]);

        // Check verification status
        let verificationFactor : RiskFactor = {
            factor = "Identity Verification";
            weight = 0.3;
            score = 0.2; // Assume verified for demo
            description = "Identity verification completeness";
        };
        factors := Array.append(factors, [verificationFactor]);

        factors
    };

    // Audit Logging
    public shared(msg) func logAuditEvent(
        actorPrincipal: Principal,
        action: Text,
        entityId: Principal,
        details: Text
    ) : async () {
        let auditId = "AUDIT-" # Int.toText(nextAuditId);
        nextAuditId += 1;

        let auditLog : AuditLog = {
            id = auditId;
            timestamp = Time.now();
            actorPrincipal = actorPrincipal;
            action = action;
            entityId = entityId;
            details = details;
            ipAddress = null; // Would be captured from HTTP request in production
            userAgent = null; // Would be captured from HTTP request in production
        };

        auditLogs.put(auditId, auditLog);
    };

    // Regulatory Reporting
    public func generateComplianceReport(
        reportType: ReportType,
        period: ReportPeriod
    ) : async Result.Result<RegulatoryReport, Text> {
        let reportId = "RPT-" # Int.toText(nextReportId);
        nextReportId += 1;

        let reportData = await generateReportData(reportType, period);

        let report : RegulatoryReport = {
            id = reportId;
            reportType = reportType;
            period = period;
            data = reportData;
            generatedAt = Time.now();
            submittedAt = null;
            status = #Generated;
        };

        regulatoryReports.put(reportId, report);
        #ok(report)
    };

    private func generateReportData(reportType: ReportType, period: ReportPeriod) : async Text {
        // Generate report data based on type and period
        switch (reportType) {
            case (#MonthlyLoanReport) {
                "Monthly loan report data for period: " # period.description
            };
            case (#QuarterlyComplianceReport) {
                "Quarterly compliance report data for period: " # period.description
            };
            case (#AnnualFinancialReport) {
                "Annual financial report data for period: " # period.description
            };
            case (#AMLSuspiciousActivity) {
                "AML suspicious activity report for period: " # period.description
            };
            case (#StudentDataPrivacy) {
                "Student data privacy report for period: " # period.description
            };
        }
    };

    // Query functions
    public query func getComplianceRecord(recordId: Text) : async ?ComplianceRecord {
        complianceRecords.get(recordId)
    };

    public query func getEntityComplianceHistory(entityId: Principal) : async [ComplianceRecord] {
        let allRecords = Iter.toArray(complianceRecords.vals());
        Array.filter<ComplianceRecord>(allRecords, func(record) = record.entityId == entityId)
    };

    public query func getRiskAssessment(entityId: Principal) : async ?RiskAssessment {
        riskAssessments.get(entityId)
    };

    public query func getAuditLogs(entityId: ?Principal, limit: Nat) : async [AuditLog] {
        let allLogs = Iter.toArray(auditLogs.vals());
        let filteredLogs = switch (entityId) {
            case (?id) { Array.filter<AuditLog>(allLogs, func(log) = log.entityId == id) };
            case null { allLogs };
        };

        // Return most recent logs up to limit
        let sortedLogs = Array.sort<AuditLog>(filteredLogs, func(a, b) = Int.compare(b.timestamp, a.timestamp));
        if (sortedLogs.size() <= limit) { sortedLogs } else { Array.take<AuditLog>(sortedLogs, limit) }
    };

    public query func getComplianceStats() : async {
        totalRecords: Nat;
        verifiedRecords: Nat;
        pendingRecords: Nat;
        rejectedRecords: Nat;
        totalAuditLogs: Nat;
    } {
        let allRecords = Iter.toArray(complianceRecords.vals());
        let verified = Array.filter<ComplianceRecord>(allRecords, func(r) = r.status == #Verified);
        let pending = Array.filter<ComplianceRecord>(allRecords, func(r) = r.status == #Pending or r.status == #InProgress);
        let rejected = Array.filter<ComplianceRecord>(allRecords, func(r) = r.status == #Rejected);

        {
            totalRecords = allRecords.size();
            verifiedRecords = verified.size();
            pendingRecords = pending.size();
            rejectedRecords = rejected.size();
            totalAuditLogs = auditLogs.size();
        }
    };
}
