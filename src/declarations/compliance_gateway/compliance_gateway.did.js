export const idlFactory = ({ IDL }) => {
  const Statistics = IDL.Record({
    'total_amount' : IDL.Nat64,
    'completed_count' : IDL.Nat32,
    'active_count' : IDL.Nat32,
    'average_amount' : IDL.Nat64,
    'total_count' : IDL.Nat32,
    'failed_count' : IDL.Nat32,
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
  const StudiFiResult = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : StudiFiError });
  return IDL.Service({
    'get_platform_stats' : IDL.Func([], [Statistics], ['query']),
    'perform_kyc_check' : IDL.Func([IDL.Principal], [StudiFiResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
