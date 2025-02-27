# Notes

Three parts:
- Icp canister
- SGX enclave
- Matchmaking wasm module

Canister announces the the enclave with a public key and attestation.

Issue: This is a pain the but to set up. Why should people host this?
I guess it's free? Also for the culture. Probably better this way actually.

This also guarantees privacy is preserved...


How do I host the canister automatically?

Easiest option: Run two programs.
One registers and administers canister with the protocol.
One runs the SGX enclave, types can be shared.

Make a shell script that compiles both things.



Really want a friends of friends system!
How to store the data in an encrypted format for all the users?
DONT HAVE TO!
Because there's only one matchmaker for now.
So each user will publish a record of their profiles on icp, then I'll have some simple permissions for viewing.
THEN, the matching algorithm will do it's magic.
__Fact__: You can even choose what algorithm to use in this case lets say.


Issue: How could I make the backend decentralized?
Also, how do the fixers work out the private key for the app?

New design:
- One public canister for users to share encrypted profiles based on friend permissions
- Once permissions are shared then they can be fed into the dating algo
- That all works programatically inside of icp
- There's a backend server that does the matchmaking, but it runs in sgx


How does the app work?
- The app connects to icp via the 


# TODO:

- download debtap
- install ego binaries
- run ego stuff
- 

- [ ] install ego tools for local dev
- [ ] rent a bare metal machine to test sgx
- [ ] 





