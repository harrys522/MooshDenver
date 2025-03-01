import Principal = "mo:base/Principal";
import HashMap = "mo:base/HashMap";
import Iter = "mo:base/Iter";
import Debug = "mo:base/Debug";
import Int8 "mo:base/Int8";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import Random "mo:base/Random";

actor {

  type Profile = Text;
  type Friend = {
    id: Principal;
    name: Text;
    desc: Text;
    pfp: Text;
  };

  private var profiles = HashMap.HashMap<Principal, Profile>(10, Principal.equal, Principal.hash);
  type FriendSet = HashMap.HashMap<Principal, Bool>;
  private var friends  = HashMap.HashMap<Principal, FriendSet>(10, Principal.equal, Principal.hash);

  // For each account stores the current valid friend code and the last friend that was added.
  // The point of the friend code is to for fixers to add one another without direct communication.
  type FriendInvite = Text;
  private var friendInvites = HashMap.HashMap<Principal, (FriendInvite, ?Friend)>(10, Principal.equal, Principal.hash);

  // ------------------------------------------------------------------
  // Random string for invite code
  // ------------------------------------------------------------------
  func _generateRandomString(length : Nat) : async Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "";
    let entropy = await Random.blob();
    var randomGenerator = Random.Finite(entropy);

    for (_ in Iter.range(0, length - 1)) {
      switch (randomGenerator.byte()) {
        case (?byte) {
          let index = Nat8.toNat(byte) % chars.size();
          
          var i = 0;
          for (c : Char in chars.chars()) {
            if (i == index) {
              result #= Text.fromChar(c);
            };

            i := i + 1;
          };
        };
        case null {
          // If we run out of entropy, get more.
          let newEntropy = await Random.blob();
          randomGenerator := Random.Finite(newEntropy);
        };
      };
    };

    result
  };

  public func _generateInviteCode(): async Text {
    return await _generateRandomString(20);
  };

  // ------------------------------------------------------------------
  // Friend management.
  // ------------------------------------------------------------------

  public func _addFriend(user: Principal, newFriend: Principal) {
    switch (friends.get(user)) {
      case (null) {
        // If the Set doesn't exist, create a new one with the friend
        let newSet = HashMap.HashMap<Principal, Bool>(10, Principal.equal, Principal.hash);
        newSet.put(newFriend, true);
        friends.put(user, newSet);
      };
      case (?existingSet) {
        // If the Set exists, add the new friend to it
        existingSet.put(newFriend, true)
      };
    };
  };

  public func _removeFriend(user: Principal, existingFriend: Principal) {
    switch (friends.get(user)) {
      case (null) {
        // Make a new empty set.
        let newSet = HashMap.HashMap<Principal, Bool>(10, Principal.equal, Principal.hash);
        friends.put(user, newSet);
      };
      case (?existingSet) {
        // If the Set exists, add the new friend to it
        existingSet.delete(existingFriend);
      };
    };
  };

  public func _addMutualFriends(_friend1: Principal, _friend2: Principal) {
    _addFriend(_friend1, _friend2);
    _addFriend(_friend2, _friend1);
  };


  public func _addFriendInvite(user: Principal, name: Text, desc: Text, pfp: Text, friend: Principal, code: FriendInvite): async Text {
    // If the code matches the person's current code, then we're on!
    let f = friendInvites.get(friend);
    switch (f) {
      case (null) {};
      case (?f) {
        if (code == f.0) {
          _addFriend(user, friend);
          _addFriend(friend, user);

          // Generate a new invite code!
          let inviteCode = await _generateInviteCode();

          let friendData = {
            id = user;
            name = name;
            desc = desc;
            pfp = pfp;
          };

          friendInvites.put(friend, (inviteCode, ?friendData));
          return "Invited friend";
        };
      };
    };

    return "Failed to invite.";
  };

  public shared(msg) func addFriend(name: Text, desc: Text, pfp: Text, friend: Principal, code: FriendInvite): async Text {
    let user = msg.caller;

    return await _addFriendInvite(user, name, desc, pfp, friend, code);
  };

  public shared(msg) func removeFriend(friend: Principal) {
    let user = msg.caller;

    _removeFriend(user, friend);
    _removeFriend(friend, user);
  };

  public shared(msg) func getInvite(): async FriendInvite {
    let res = friendInvites.get(msg.caller);

    switch (res) {
      case (null) { 
        let code = await _generateInviteCode();
        friendInvites.put(msg.caller, (code, null));

        return code;
      };
      case (?res) { return res.0 };
    };
  };

  public shared(msg) func getLatestFriend(): async ?Friend {
    let res = friendInvites.get(msg.caller);

    switch (res) {
      case (null) { return null };
      case (?res) { return res.1 };
    };
  };

  func safeToArray<K, V>(map : ?HashMap.HashMap<K, V>) : [K] {
    switch (map) {
      case (null) { [] };
      case (?m) { Iter.toArray(m.keys()) };
    };
  };

  // ------------------------------------------------------------------
  // Basic getters and setters.
  // ------------------------------------------------------------------

  public func _addProfile(user: Principal, profile: Profile) {
      profiles.put(user, profile);
  };
  public func _removeProfile(user: Principal) {
      profiles.put(user, "");
  };
  public func _getFriends(user: Principal) : async [Principal] {
      return safeToArray(friends.get(user));
  };
  public func _getProfile(user: Principal) : async ?Profile {
      return profiles.get(user);
  };

  public shared(msg) func addProfile(profile: Profile) {
      _addProfile(msg.caller, profile)
  };
  public shared(msg) func removeProfile() {
      _removeProfile(msg.caller)
  };
  public shared(msg) func getFriends(): async [Principal] {
      return await _getFriends(msg.caller)
  };
  public shared(msg) func getProfile() : async ?Profile {
      return await _getProfile(msg.caller)
  };

  // ------------------------------------------------------------------
  // Real meet and potatos, the functions to find profiles.
  // ------------------------------------------------------------------
  
  func _getAllProfilesWithDepth(user: Principal, maxDepth : Int8) : async ([(Principal, Profile)]) {
      // Go through own friends, then go through friend's friends.

    var profilesMap = HashMap.HashMap<Principal, Profile>(10, Principal.equal, Principal.hash);

    func addProfilesForAccount(a: Principal): async () {
      let prof = await _getProfile(a);

      switch (prof) {
        case (null) { };
        case (?prof) {
          Debug.print("added to profiles map");
          profilesMap.put((a, prof));
        };
      };
    };

    func handleFriends(self: Principal, depth: Int8, maxDepth: Int8): async () {
      if (depth > maxDepth) {
        return;
      };

      // If I'm already added, then stop here.
      if (profilesMap.get(self) != null)
        return;

      await addProfilesForAccount(self);

      let aFriends = safeToArray(friends.get(self));
      for (friendId in aFriends.vals()) {
        Debug.print(debug_show(friendId));

        // Go through and add the friends' profiles.
        if (profilesMap.get(friendId) == null) {

          // // Removing this, not needed with new invite scheme. Friends are now always added simultaneously.
          // var valfriendId = false;
          // switch (friends.get(friendId)) {
          //   case null {
          //     valfriendId := false;
          //   };
          //   case (?friendSet) {
          //     // Is this always false????
          //     if (friendSet.get(self) != null) {
          //       valfriendId := true;
          //     };
          //   };
          // };
          // if (valfriendId) {
          //   await handleFriends(friendId, depth + 1, maxDepth);
          // };

          // TODO: Maybe add option to how many connections a user trusts with someone.
          await handleFriends(friendId, depth + 1, maxDepth);
        };
      };
    };

    await handleFriends(user, 0, maxDepth);

    return Iter.toArray(profilesMap.entries())
  };

  public shared(msg) func getAllProfilesWithDepth(maxDepth : Int8) : async ([(Principal, Profile)]) {
    return await _getAllProfilesWithDepth(msg.caller, maxDepth)
  };

  public shared(msg) func getAllProfilesBasic() : async ([(Principal, Profile)]) {
    return await _getAllProfilesWithDepth(msg.caller, 5)
  };

  // ------------------------------------------------------------------
  // Simple functions for testing.
  // ------------------------------------------------------------------

  public shared(msg) func getId(): async Text {
      return Principal.toText(msg.caller);
  };

  public func greet(name : Profile) : async Text {
    return "Hello, " # name # "!";
  };
};
