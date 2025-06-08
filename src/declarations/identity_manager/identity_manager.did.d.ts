import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type CredentialArgument = { 'Text' : string } |
  { 'Boolean' : boolean } |
  { 'Number' : number };
export interface CredentialSpec {
  'arguments' : Array<[string, CredentialArgument]>,
  'credential_type' : string,
}
export interface IssuerInfo {
  'origin' : string,
  'canister_id' : [] | [Principal],
}
export type KycStatus = { 'Rejected' : null } |
  { 'InProgress' : null } |
  { 'Verified' : null } |
  { 'Expired' : null } |
  { 'Pending' : null };
export interface PaginatedResponse {
  'offset' : number,
  'limit' : number,
  'items' : Array<StudentProfile>,
  'total_count' : number,
  'has_more' : boolean,
}
export interface PaginationParams { 'offset' : number, 'limit' : number }
export interface Statistics {
  'total_amount' : bigint,
  'completed_count' : number,
  'active_count' : number,
  'average_amount' : bigint,
  'total_count' : number,
  'failed_count' : number,
}
export interface StudentProfile {
  'id' : Principal,
  'gpa' : number,
  'updated_at' : bigint,
  'student_id' : string,
  'created_at' : bigint,
  'email' : string,
  'university' : string,
  'year_of_study' : number,
  'is_verified' : boolean,
  'kyc_status' : KycStatus,
  'full_name' : string,
  'program' : string,
}
export interface StudentSearchFilters {
  'min_gpa' : [] | [number],
  'university' : [] | [string],
  'year_of_study' : [] | [number],
  'is_verified' : [] | [boolean],
  'kyc_status' : [] | [KycStatus],
  'max_gpa' : [] | [number],
  'program' : [] | [string],
}
export type StudiFiError = { 'InvalidInput' : string } |
  { 'NetworkError' : string } |
  { 'NotFound' : string } |
  { 'Unauthorized' : string } |
  { 'AlreadyExists' : string } |
  { 'InternalError' : string } |
  { 'Expired' : string } |
  { 'InsufficientFunds' : string };
export type StudiFiResult = { 'Ok' : StudentProfile } |
  { 'Err' : StudiFiError };
export type StudiFiResultBool = { 'Ok' : boolean } |
  { 'Err' : StudiFiError };
export type StudiFiResultText = { 'Ok' : string } |
  { 'Err' : StudiFiError };
export type StudiFiResultUnit = { 'Ok' : null } |
  { 'Err' : StudiFiError };
export type StudiFiResultVcResponse = { 'Ok' : VerifiableCredentialResponse } |
  { 'Err' : StudiFiError };
export type StudiFiResultVcSession = { 'Ok' : VcVerificationSession } |
  { 'Err' : StudiFiError };
export type StudiFiResultVerification = { 'Ok' : UniversityVerification } |
  { 'Err' : StudiFiError };
export interface UniversityApiConfig {
  'api_key_hash' : string,
  'rate_limit_per_hour' : number,
  'university_name' : string,
  'api_endpoint' : string,
  'is_active' : boolean,
  'supported_verification_types' : Array<string>,
}
export interface UniversityVerification {
  'is_valid' : boolean,
  'student_id' : string,
  'verification_method' : string,
  'university' : string,
  'verified_at' : bigint,
  'confidence_score' : number,
}
export interface VcVerificationSession {
  'id' : string,
  'status' : VcVerificationStatus,
  'user_principal' : Principal,
  'updated_at' : bigint,
  'request' : VerifiableCredentialRequest,
  'error_message' : [] | [string],
  'created_at' : bigint,
  'response' : [] | [VerifiableCredentialResponse],
}
export type VcVerificationStatus = { 'Failed' : null } |
  { 'InProgress' : null } |
  { 'Completed' : null } |
  { 'Expired' : null } |
  { 'Pending' : null };
export interface VerifiableCredentialRequest {
  'derivation_origin' : [] | [string],
  'issuer' : IssuerInfo,
  'credential_subject' : Principal,
  'credential_spec' : CredentialSpec,
}
export interface VerifiableCredentialResponse {
  'claims' : Array<[string, CredentialArgument]>,
  'verified' : boolean,
  'issued_at' : bigint,
  'subject' : Principal,
  'issuer' : string,
  'expires_at' : [] | [bigint],
  'verifiable_presentation' : string,
  'credential_type' : string,
}
export type VerificationPriority = { 'Low' : null } |
  { 'High' : null } |
  { 'Normal' : null } |
  { 'Urgent' : null };
export interface VerificationRequest {
  'additional_documents' : Array<string>,
  'student_id' : string,
  'email' : string,
  'university' : string,
  'expected_graduation' : string,
  'year_of_study' : number,
  'full_name' : string,
  'program' : string,
}
export interface VerificationStats {
  'verified_students' : number,
  'average_verification_time_hours' : number,
  'expired_verifications' : number,
  'total_students' : number,
  'rejected_verifications' : number,
  'pending_verifications' : number,
}
export interface _SERVICE {
  'add_university_config' : ActorMethod<
    [UniversityApiConfig],
    StudiFiResultUnit
  >,
  'batch_verify_students' : ActorMethod<
    [Array<VerificationRequest>, VerificationPriority],
    Array<StudiFiResultVerification>
  >,
  'create_student_profile' : ActorMethod<[VerificationRequest], StudiFiResult>,
  'create_vc_verification_session' : ActorMethod<
    [string, [] | [Principal], string, string],
    StudiFiResultVcSession
  >,
  'delete_my_profile' : ActorMethod<[], StudiFiResultUnit>,
  'generate_verification_report' : ActorMethod<[Principal], StudiFiResultText>,
  'get_all_verified_students' : ActorMethod<[], Array<StudentProfile>>,
  'get_my_profile' : ActorMethod<[], [] | [StudentProfile]>,
  'get_my_vc_sessions' : ActorMethod<[], Array<VcVerificationSession>>,
  'get_platform_stats' : ActorMethod<[], Statistics>,
  'get_student_profile' : ActorMethod<[Principal], [] | [StudentProfile]>,
  'get_university_configs' : ActorMethod<[], Array<UniversityApiConfig>>,
  'get_vc_session_status' : ActorMethod<[string], [] | [VcVerificationStatus]>,
  'get_verification_stats' : ActorMethod<[], VerificationStats>,
  'is_verification_expired' : ActorMethod<[Principal], boolean>,
  'process_vc_response' : ActorMethod<
    [string, string],
    StudiFiResultVcResponse
  >,
  'search_students' : ActorMethod<
    [StudentSearchFilters, [] | [PaginationParams]],
    PaginatedResponse
  >,
  'update_kyc_status' : ActorMethod<[KycStatus], StudiFiResult>,
  'update_student_profile' : ActorMethod<
    [[] | [string], [] | [string], [] | [string], [] | [number]],
    StudiFiResult
  >,
  'verify_presentation' : ActorMethod<[string], StudiFiResultBool>,
  'verify_student' : ActorMethod<[number], StudiFiResult>,
  'verify_with_university_api' : ActorMethod<
    [string, string],
    StudiFiResultVerification
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
