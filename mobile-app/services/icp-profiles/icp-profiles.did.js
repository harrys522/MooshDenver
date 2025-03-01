export const idlFactory = ({ IDL }) => {
  const Profile = IDL.Text;
  return IDL.Service({
    'addFriend' : IDL.Func([IDL.Principal], [], ['oneway']),
    'addFriendDELETELATER' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [],
        ['oneway'],
      ),
    'addProfile' : IDL.Func([IDL.Principal, Profile], [], ['oneway']),
    'getAllProfilesBasic' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Tuple(IDL.Principal, Profile))],
        [],
      ),
    'getAllProfilesWithDepth' : IDL.Func(
        [IDL.Principal, IDL.Int8],
        [IDL.Vec(IDL.Tuple(IDL.Principal, Profile))],
        [],
      ),
    'getFriends' : IDL.Func([IDL.Principal], [IDL.Vec(IDL.Principal)], []),
    'getId' : IDL.Func([], [IDL.Text], []),
    'getProfile' : IDL.Func([IDL.Principal], [IDL.Opt(Profile)], []),
    'greet' : IDL.Func([Profile], [IDL.Text], ['query']),
    'removeFriend' : IDL.Func([IDL.Principal], [], ['oneway']),
    'removeProfile' : IDL.Func([IDL.Principal], [], ['oneway']),
  });
};
export const init = ({ IDL }) => { return []; };
