export const idlFactory = ({ IDL }) => {
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
  const StudiFiResult = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : StudiFiError });
  const SignedIdAlias = IDL.Record({ 'credential_jws' : IDL.Text });
  const CredentialArgument = IDL.Variant({
    'Text' : IDL.Text,
    'Boolean' : IDL.Bool,
    'Number' : IDL.Float64,
  });
  const CredentialSpec = IDL.Record({
    'arguments' : IDL.Vec(IDL.Tuple(IDL.Text, CredentialArgument)),
    'credential_type' : IDL.Text,
  });
  const GetCredentialRequest = IDL.Record({
    'signed_id_alias' : SignedIdAlias,
    'prepared_context' : IDL.Vec(IDL.Nat8),
    'credential_spec' : CredentialSpec,
  });
  const IssuedCredentialData = IDL.Record({ 'vc_jws' : IDL.Text });
  const Statistics = IDL.Record({
    'total_amount' : IDL.Nat64,
    'completed_count' : IDL.Nat32,
    'active_count' : IDL.Nat32,
    'average_amount' : IDL.Nat64,
    'total_count' : IDL.Nat32,
    'failed_count' : IDL.Nat32,
  });
  const PrepareCredentialRequest = IDL.Record({
    'signed_id_alias' : SignedIdAlias,
    'credential_spec' : CredentialSpec,
  });
  const PreparedCredentialData = IDL.Record({
    'prepared_context' : IDL.Vec(IDL.Nat8),
  });
  return IDL.Service({
    'add_student' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Nat32],
        [StudiFiResultUnit],
        [],
      ),
    'derivation_origin' : IDL.Func([], [StudiFiResult], ['query']),
    'get_credential' : IDL.Func(
        [GetCredentialRequest],
        [IDL.Variant({ 'Ok' : IssuedCredentialData, 'Err' : StudiFiError })],
        [],
      ),
    'get_platform_stats' : IDL.Func([], [Statistics], ['query']),
    'prepare_credential' : IDL.Func(
        [PrepareCredentialRequest],
        [IDL.Variant({ 'Ok' : PreparedCredentialData, 'Err' : StudiFiError })],
        [],
      ),
    'vc_consent_message' : IDL.Func(
        [CredentialSpec],
        [StudiFiResult],
        ['query'],
      ),
    'verify_student' : IDL.Func([IDL.Text], [StudiFiResult], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
