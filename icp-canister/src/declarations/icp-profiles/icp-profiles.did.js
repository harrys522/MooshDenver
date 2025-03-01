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
    '_generateInviteCode' : IDL.Func([], [IDL.Text], []),
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
