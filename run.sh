#!/bin/sh

echo "dont forget to run dfx start with --host 0.0.0.0"

cd ./icp-canister/
dfx generate --network 'http://10.0.0.14:4943'

cd ..

# Update canister definitions
echo "Updating canister definitions."
\cp -f -r icp-canister/src/declarations/icp-profiles mobile-app/services

echo "Dont forget to replace generated env vars with EXPO_PUBLIC_ on mobile app"
