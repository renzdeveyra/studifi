import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type CredentialArgument = { 'Text' : string } |
  { 'Boolean' : boolean } |
  { 'Number' : number };
export interface CredentialRequest {
  'credential_subject' : string,
  'credential_spec' : CredentialSpec,
}
export interface CredentialSpec {
  'arguments' : Array<[string, CredentialArgument]>,
  'credential_type' : string,
}
export interface GetCredentialRequest {
  'signed_id_alias' : SignedIdAlias,
  'prepared_context' : Uint8Array | number[],
  'credential_spec' : CredentialSpec,
}
export interface IssuedCredentialData { 'vc_jws' : string }
export interface PrepareCredentialRequest {
  'signed_id_alias' : SignedIdAlias,
  'credential_spec' : CredentialSpec,
}
export interface PreparedCredentialData {
  'prepared_context' : Uint8Array | number[],
}
export interface SignedIdAlias { 'credential_jws' : string }
export interface Statistics {
  'total_amount' : bigint,
  'completed_count' : number,
  'active_count' : number,
  'average_amount' : bigint,
  'total_count' : number,
  'failed_count' : number,
}
export type StudiFiError = { 'InvalidInput' : string } |
  { 'NetworkError' : string } |
  { 'NotFound' : string } |
  { 'Unauthorized' : string } |
  { 'AlreadyExists' : string } |
  { 'InternalError' : string } |
  { 'Expired' : string } |
  { 'InsufficientFunds' : string };
export type StudiFiResult = { 'Ok' : string } |
  { 'Err' : StudiFiError };
export type StudiFiResultUnit = { 'Ok' : null } |
  { 'Err' : StudiFiError };
export interface _SERVICE {
  'add_student' : ActorMethod<
    [string, string, string, number],
    StudiFiResultUnit
  >,
  'derivation_origin' : ActorMethod<[], StudiFiResult>,
  'get_credential' : ActorMethod<
    [GetCredentialRequest],
    { 'Ok' : IssuedCredentialData } |
      { 'Err' : StudiFiError }
  >,
  'get_platform_stats' : ActorMethod<[], Statistics>,
  'prepare_credential' : ActorMethod<
    [PrepareCredentialRequest],
    { 'Ok' : PreparedCredentialData } |
      { 'Err' : StudiFiError }
  >,
  'vc_consent_message' : ActorMethod<[CredentialSpec], StudiFiResult>,
  'verify_student' : ActorMethod<[string], StudiFiResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
