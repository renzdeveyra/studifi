import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Iter "mo:base/Iter";

actor IdentityManager {

    // Types for student identity and verification
    public type StudentProfile = {
        id: Principal;
        email: Text;
        fullName: Text;
        university: Text;
        studentId: Text;
        program: Text;
        yearOfStudy: Nat;
        gpa: Float;
        isVerified: Bool;
        kycStatus: KYCStatus;
        createdAt: Int;
        updatedAt: Int;
    };

    public type KYCStatus = {
        #Pending;
        #InProgress;
        #Verified;
        #Rejected;
    };

    public type UniversityVerification = {
        university: Text;
        studentId: Text;
        isValid: Bool;
        verifiedAt: Int;
    };

    public type VerificationRequest = {
        studentId: Text;
        university: Text;
        email: Text;
        fullName: Text;
        program: Text;
        yearOfStudy: Nat;
    };

    // State management
    private stable var studentProfilesEntries : [(Principal, StudentProfile)] = [];
    private var studentProfiles = Map.HashMap<Principal, StudentProfile>(10, Principal.equal, Principal.hash);

    private stable var verificationRequestsEntries : [(Text, VerificationRequest)] = [];
    private var verificationRequests = Map.HashMap<Text, VerificationRequest>(10, Text.equal, Text.hash);

    // Initialize from stable storage
    system func preupgrade() {
        studentProfilesEntries := Iter.toArray(studentProfiles.entries());
        verificationRequestsEntries := Iter.toArray(verificationRequests.entries());
    };

    system func postupgrade() {
        studentProfiles := Map.fromIter<Principal, StudentProfile>(
            studentProfilesEntries.vals(), studentProfilesEntries.size(), Principal.equal, Principal.hash
        );
        verificationRequests := Map.fromIter<Text, VerificationRequest>(
            verificationRequestsEntries.vals(), verificationRequestsEntries.size(), Text.equal, Text.hash
        );
        studentProfilesEntries := [];
        verificationRequestsEntries := [];
    };

    // Public functions for identity management
    public shared(msg) func createStudentProfile(request: VerificationRequest) : async Result.Result<StudentProfile, Text> {
        let caller = msg.caller;

        // Check if profile already exists
        switch (studentProfiles.get(caller)) {
            case (?existing) {
                return #err("Profile already exists for this principal");
            };
            case null {};
        };

        // Create new student profile
        let now = Time.now();
        let profile : StudentProfile = {
            id = caller;
            email = request.email;
            fullName = request.fullName;
            university = request.university;
            studentId = request.studentId;
            program = request.program;
            yearOfStudy = request.yearOfStudy;
            gpa = 0.0; // Will be updated after verification
            isVerified = false;
            kycStatus = #Pending;
            createdAt = now;
            updatedAt = now;
        };

        studentProfiles.put(caller, profile);
        verificationRequests.put(request.studentId, request);

        // In a real implementation, this would trigger HTTP outcalls to university APIs
        // For demo purposes, we'll simulate verification
        let _ = await simulateUniversityVerification(request);

        #ok(profile)
    };

    public query func getStudentProfile(studentId: Principal) : async ?StudentProfile {
        studentProfiles.get(studentId)
    };

    public shared(msg) func updateKYCStatus(status: KYCStatus) : async Result.Result<StudentProfile, Text> {
        let caller = msg.caller;

        switch (studentProfiles.get(caller)) {
            case (?profile) {
                let updatedProfile = {
                    profile with
                    kycStatus = status;
                    updatedAt = Time.now();
                };
                studentProfiles.put(caller, updatedProfile);
                #ok(updatedProfile)
            };
            case null {
                #err("Profile not found")
            };
        }
    };

    public shared(msg) func verifyStudent(gpa: Float) : async Result.Result<StudentProfile, Text> {
        let caller = msg.caller;

        switch (studentProfiles.get(caller)) {
            case (?profile) {
                let updatedProfile = {
                    profile with
                    gpa = gpa;
                    isVerified = true;
                    kycStatus = #Verified;
                    updatedAt = Time.now();
                };
                studentProfiles.put(caller, updatedProfile);
                #ok(updatedProfile)
            };
            case null {
                #err("Profile not found")
            };
        }
    };

    // Mock university verification - in production this would use HTTP outcalls
    private func simulateUniversityVerification(request: VerificationRequest) : async UniversityVerification {
        // Simulate API call delay
        let verification : UniversityVerification = {
            university = request.university;
            studentId = request.studentId;
            isValid = true; // Mock successful verification
            verifiedAt = Time.now();
        };

        Debug.print("Simulated university verification for: " # request.fullName);
        verification
    };

    // Query functions for frontend
    public query func getAllVerifiedStudents() : async [StudentProfile] {
        let profiles = studentProfiles.vals();
        Array.filter<StudentProfile>(Iter.toArray(profiles), func(p) = p.isVerified)
    };

    public query func getVerificationStats() : async {totalStudents: Nat; verifiedStudents: Nat; pendingVerifications: Nat} {
        let profiles = Iter.toArray(studentProfiles.vals());
        let verified = Array.filter<StudentProfile>(profiles, func(p) = p.isVerified);
        let pending = Array.filter<StudentProfile>(profiles, func(p) = p.kycStatus == #Pending);

        {
            totalStudents = profiles.size();
            verifiedStudents = verified.size();
            pendingVerifications = pending.size();
        }
    };

    // HTTP Outcalls for real university API integration (placeholder)
    // This would be implemented with the IC's HTTP outcalls feature
    public func verifyWithUniversityAPI(university: Text, studentId: Text) : async Result.Result<UniversityVerification, Text> {
        // Placeholder for HTTP outcall implementation
        // In production, this would make actual API calls to university systems
        #ok({
            university = university;
            studentId = studentId;
            isValid = true;
            verifiedAt = Time.now();
        })
    };
}
