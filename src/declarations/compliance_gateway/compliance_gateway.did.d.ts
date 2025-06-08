import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

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
export interface _SERVICE {
  'get_platform_stats' : ActorMethod<[], Statistics>,
  'perform_kyc_check' : ActorMethod<[Principal], StudiFiResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
