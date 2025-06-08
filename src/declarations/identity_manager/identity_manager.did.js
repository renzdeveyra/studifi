export const idlFactory = ({ IDL }) => {
  const UniversityApiConfig = IDL.Record({
    'api_key_hash' : IDL.Text,
    'rate_limit_per_hour' : IDL.Nat32,
    'university_name' : IDL.Text,
    'api_endpoint' : IDL.Text,
    'is_active' : IDL.Bool,
    'supported_verification_types' : IDL.Vec(IDL.Text),
  });
  const StudiFiError = IDL.Variant({
    'InvalidInput' : IDL.Text,
    'NetworkError' : IDL.Text,
    'NotFound' : IDL.Text,
    'Unauthorized' : IDL.Text,
    'AlreadyExists' : IDL.Text,
    'InternalError' : IDL.Text,
    'Expired' : IDL.Text,
    'InsufficientFunds' : IDL.Text,
  });
  const StudiFiResultUnit = IDL.Variant({
    'Ok' : IDL.Null,
    'Err' : StudiFiError,
  });
  const VerificationRequest = IDL.Record({
    'additional_documents' : IDL.Vec(IDL.Text),
    'student_id' : IDL.Text,
    'email' : IDL.Text,
    'university' : IDL.Text,
    'expected_graduation' : IDL.Text,
    'year_of_study' : IDL.Nat32,
    'full_name' : IDL.Text,
    'program' : IDL.Text,
  });
  const VerificationPriority = IDL.Variant({
    'Low' : IDL.Null,
    'High' : IDL.Null,
    'Normal' : IDL.Null,
    'Urgent' : IDL.Null,
  });
  const UniversityVerification = IDL.Record({
    'is_valid' : IDL.Bool,
    'student_id' : IDL.Text,
    'verification_method' : IDL.Text,
    'university' : IDL.Text,
    'verified_at' : IDL.Nat64,
    'confidence_score' : IDL.Float64,
  });
  const StudiFiResultVerification = IDL.Variant({
    'Ok' : UniversityVerification,
    'Err' : StudiFiError,
  });
  const KycStatus = IDL.Variant({
    'Rejected' : IDL.Null,
    'InProgress' : IDL.Null,
    'Verified' : IDL.Null,
    'Expired' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const StudentProfile = IDL.Record({
    'id' : IDL.Principal,
    'gpa' : IDL.Float64,
    'updated_at' : IDL.Nat64,
    'student_id' : IDL.Text,
    'created_at' : IDL.Nat64,
    'email' : IDL.Text,
    'university' : IDL.Text,
    'year_of_study' : IDL.Nat32,
    'is_verified' : IDL.Bool,
    'kyc_status' : KycStatus,
    'full_name' : IDL.Text,
    'program' : IDL.Text,
  });
  const StudiFiResult = IDL.Variant({
    'Ok' : StudentProfile,
    'Err' : StudiFiError,
  });
  const VcVerificationStatus = IDL.Variant({
    'Failed' : IDL.Null,
    'InProgress' : IDL.Null,
    'Completed' : IDL.Null,
    'Expired' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const IssuerInfo = IDL.Record({
    'origin' : IDL.Text,
    'canister_id' : IDL.Opt(IDL.Principal),
  });
  const CredentialArgument = IDL.Variant({
    'Text' : IDL.Text,
    'Boolean' : IDL.Bool,
    'Number' : IDL.Float64,
  });
  const CredentialSpec = IDL.Record({
    'arguments' : IDL.Vec(IDL.Tuple(IDL.Text, CredentialArgument)),
    'credential_type' : IDL.Text,
  });
  const VerifiableCredentialRequest = IDL.Record({
    'derivation_origin' : IDL.Opt(IDL.Text),
    'issuer' : IssuerInfo,
    'credential_subject' : IDL.Principal,
    'credential_spec' : CredentialSpec,
  });
  const VerifiableCredentialResponse = IDL.Record({
    'claims' : IDL.Vec(IDL.Tuple(IDL.Text, CredentialArgument)),
    'verified' : IDL.Bool,
    'issued_at' : IDL.Nat64,
    'subject' : IDL.Principal,
    'issuer' : IDL.Text,
    'expires_at' : IDL.Opt(IDL.Nat64),
    'verifiable_presentation' : IDL.Text,
    'credential_type' : IDL.Text,
  });
  const VcVerificationSession = IDL.Record({
    'id' : IDL.Text,
    'status' : VcVerificationStatus,
    'user_principal' : IDL.Principal,
    'updated_at' : IDL.Nat64,
    'request' : VerifiableCredentialRequest,
    'error_message' : IDL.Opt(IDL.Text),
    'created_at' : IDL.Nat64,
    'response' : IDL.Opt(VerifiableCredentialResponse),
  });
  const StudiFiResultVcSession = IDL.Variant({
    'Ok' : VcVerificationSession,
    'Err' : StudiFiError,
  });
  const StudiFiResultText = IDL.Variant({
    'Ok' : IDL.Text,
    'Err' : StudiFiError,
  });
  const Statistics = IDL.Record({
    'total_amount' : IDL.Nat64,
    'completed_count' : IDL.Nat32,
    'active_count' : IDL.Nat32,
    'average_amount' : IDL.Nat64,
    'total_count' : IDL.Nat32,
    'failed_count' : IDL.Nat32,
  });
  const VerificationStats = IDL.Record({
    'verified_students' : IDL.Nat32,
    'average_verification_time_hours' : IDL.Float64,
    'expired_verifications' : IDL.Nat32,
    'total_students' : IDL.Nat32,
    'rejected_verifications' : IDL.Nat32,
    'pending_verifications' : IDL.Nat32,
  });
  const StudiFiResultVcResponse = IDL.Variant({
    'Ok' : VerifiableCredentialResponse,
    'Err' : StudiFiError,
  });
  const StudentSearchFilters = IDL.Record({
    'min_gpa' : IDL.Opt(IDL.Float64),
    'university' : IDL.Opt(IDL.Text),
    'year_of_study' : IDL.Opt(IDL.Nat32),
    'is_verified' : IDL.Opt(IDL.Bool),
    'kyc_status' : IDL.Opt(KycStatus),
    'max_gpa' : IDL.Opt(IDL.Float64),
    'program' : IDL.Opt(IDL.Text),
  });
  const PaginationParams = IDL.Record({
    'offset' : IDL.Nat32,
    'limit' : IDL.Nat32,
  });
  const PaginatedResponse = IDL.Record({
    'offset' : IDL.Nat32,
    'limit' : IDL.Nat32,
    'items' : IDL.Vec(StudentProfile),
    'total_count' : IDL.Nat32,
    'has_more' : IDL.Bool,
  });
  const StudiFiResultBool = IDL.Variant({
    'Ok' : IDL.Bool,
    'Err' : StudiFiError,
  });
  return IDL.Service({
    'add_university_config' : IDL.Func(
        [UniversityApiConfig],
        [StudiFiResultUnit],
        [],
      ),
    'batch_verify_students' : IDL.Func(
        [IDL.Vec(VerificationRequest), VerificationPriority],
        [IDL.Vec(StudiFiResultVerification)],
        [],
      ),
    'create_student_profile' : IDL.Func(
        [VerificationRequest],
        [StudiFiResult],
        [],
      ),
    'create_vc_verification_session' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Principal), IDL.Text, IDL.Text],
        [StudiFiResultVcSession],
        [],
      ),
    'delete_my_profile' : IDL.Func([], [StudiFiResultUnit], []),
    'generate_verification_report' : IDL.Func(
        [IDL.Principal],
        [StudiFiResultText],
        ['query'],
      ),
    'get_all_verified_students' : IDL.Func(
        [],
        [IDL.Vec(StudentProfile)],
        ['query'],
      ),
    'get_my_profile' : IDL.Func([], [IDL.Opt(StudentProfile)], ['query']),
    'get_my_vc_sessions' : IDL.Func(
        [],
        [IDL.Vec(VcVerificationSession)],
        ['query'],
      ),
    'get_platform_stats' : IDL.Func([], [Statistics], ['query']),
    'get_student_profile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(StudentProfile)],
        ['query'],
      ),
    'get_university_configs' : IDL.Func(
        [],
        [IDL.Vec(UniversityApiConfig)],
        ['query'],
      ),
    'get_vc_session_status' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(VcVerificationStatus)],
        ['query'],
      ),
    'get_verification_stats' : IDL.Func([], [VerificationStats], ['query']),
    'is_verification_expired' : IDL.Func(
        [IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'process_vc_response' : IDL.Func(
        [IDL.Text, IDL.Text],
        [StudiFiResultVcResponse],
        [],
      ),
    'search_students' : IDL.Func(
        [StudentSearchFilters, IDL.Opt(PaginationParams)],
        [PaginatedResponse],
        ['query'],
      ),
    'update_kyc_status' : IDL.Func([KycStatus], [StudiFiResult], []),
    'update_student_profile' : IDL.Func(
        [
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Nat32),
        ],
        [StudiFiResult],
        [],
      ),
    'verify_presentation' : IDL.Func(
        [IDL.Text],
        [StudiFiResultBool],
        ['query'],
      ),
    'verify_student' : IDL.Func([IDL.Float64], [StudiFiResult], []),
    'verify_with_university_api' : IDL.Func(
        [IDL.Text, IDL.Text],
        [StudiFiResultVerification],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
