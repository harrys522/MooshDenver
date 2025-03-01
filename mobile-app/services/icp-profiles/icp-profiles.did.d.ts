import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Friend {
  'id' : Principal,
  'pfp' : string,
  'desc' : string,
  'name' : string,
}
export type FriendInvite = string;
export type Profile = string;
export interface _SERVICE {
  '_addFriend' : ActorMethod<[Principal, Principal], undefined>,
  '_addFriendInvite' : ActorMethod<
    [Principal, string, string, string, Principal, FriendInvite],
    string
  >,
  '_addMutualFriends' : ActorMethod<[Principal, Principal], undefined>,
  '_addProfile' : ActorMethod<[Principal, Profile], undefined>,
  '_generateInviteCode' : ActorMethod<[], string>,
  '_getFriends' : ActorMethod<[Principal], Array<Principal>>,
  '_getProfile' : ActorMethod<[Principal], [] | [Profile]>,
  '_removeFriend' : ActorMethod<[Principal, Principal], undefined>,
  '_removeProfile' : ActorMethod<[Principal], undefined>,
  'addFriend' : ActorMethod<
    [string, string, string, Principal, FriendInvite],
    string
  >,
  'addProfile' : ActorMethod<[Profile], undefined>,
  'getAllProfilesBasic' : ActorMethod<[], Array<[Principal, Profile]>>,
  'getAllProfilesWithDepth' : ActorMethod<
    [number],
    Array<[Principal, Profile]>
  >,
  'getFriends' : ActorMethod<[], Array<Principal>>,
  'getId' : ActorMethod<[], string>,
  'getInvite' : ActorMethod<[], FriendInvite>,
  'getLatestFriend' : ActorMethod<[], [] | [Friend]>,
  'getProfile' : ActorMethod<[], [] | [Profile]>,
  'greet' : ActorMethod<[Profile], string>,
  'removeFriend' : ActorMethod<[Principal], undefined>,
  'removeProfile' : ActorMethod<[], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
