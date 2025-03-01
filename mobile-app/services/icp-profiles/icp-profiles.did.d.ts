import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Profile = string;
export interface _SERVICE {
  'addFriend' : ActorMethod<[Principal], undefined>,
  'addFriendDELETELATER' : ActorMethod<[Principal, Principal], undefined>,
  'addProfile' : ActorMethod<[Principal, Profile], undefined>,
  'getAllProfilesBasic' : ActorMethod<[Principal], Array<[Principal, Profile]>>,
  'getAllProfilesWithDepth' : ActorMethod<
    [Principal, number],
    Array<[Principal, Profile]>
  >,
  'getFriends' : ActorMethod<[Principal], Array<Principal>>,
  'getId' : ActorMethod<[], string>,
  'getProfile' : ActorMethod<[Principal], [] | [Profile]>,
  'greet' : ActorMethod<[Profile], string>,
  'removeFriend' : ActorMethod<[Principal], undefined>,
  'removeProfile' : ActorMethod<[Principal], undefined>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
