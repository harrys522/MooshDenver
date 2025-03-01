export const idlFactory = ({ IDL }) => {
  const FriendInvite = IDL.Text;
  const Profile = IDL.Text;
  const Friend = IDL.Record({
    'id' : IDL.Principal,
    'pfp' : IDL.Text,
    'desc' : IDL.Text,
    'name' : IDL.Text,
  });
  return IDL.Service({
    '_addFriend' : IDL.Func([IDL.Principal, IDL.Principal], [], ['oneway']),
    '_addFriendInvite' : IDL.Func(
        [
          IDL.Principal,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Principal,
          FriendInvite,
        ],
        [IDL.Text],
        [],
      ),
    '_addMutualFriends' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [],
        ['oneway'],
      ),
    '_addProfile' : IDL.Func([IDL.Principal, Profile], [], ['oneway']),
    '_generateInviteCode' : IDL.Func([], [IDL.Text], []),
    '_getFriends' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Principal)], []),
    '_getProfile' : IDL.Func([IDL.Principal], [IDL.Opt(Profile)], []),
    '_removeFriend' : IDL.Func([IDL.Principal, IDL.Principal], [], ['oneway']),
    '_removeProfile' : IDL.Func([IDL.Principal], [], ['oneway']),
    'addFriend' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Principal, FriendInvite],
        [IDL.Text],
        [],
      ),
    'addProfile' : IDL.Func([Profile], [], ['oneway']),
    'getAllProfilesBasic' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, Profile))],
        [],
      ),
    'getAllProfilesWithDepth' : IDL.Func(
        [IDL.Int8],
        [IDL.Vec(IDL.Tuple(IDL.Principal, Profile))],
        [],
      ),
    'getFriends' : IDL.Func([], [IDL.Vec(IDL.Principal)], []),
    'getId' : IDL.Func([], [IDL.Text], []),
    'getInvite' : IDL.Func([], [FriendInvite], []),
    'getLatestFriend' : IDL.Func([], [IDL.Opt(Friend)], []),
    'getProfile' : IDL.Func([], [IDL.Opt(Profile)], []),
    'greet' : IDL.Func([Profile], [IDL.Text], []),
    'removeFriend' : IDL.Func([IDL.Principal], [], ['oneway']),
    'removeProfile' : IDL.Func([], [], ['oneway']),
  });
};
export const init = ({ IDL }) => { return []; };
