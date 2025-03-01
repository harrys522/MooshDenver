
import 'react-native-get-random-values';
import { ActorSubclass } from "@dfinity/agent";
import { createContext, ReactNode, useContext, useState } from "react";

import { createActor } from "@/services/icp-profiles"
import { AnonymousIdentity, SignIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { _SERVICE } from "@/services/icp-profiles/icp-profiles.did";

export type IcpActor = ActorSubclass<_SERVICE>;
export const IcpContext = createContext<IcpActor>()

export const IcpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [actor, setActor] = useState(undefined);

    function getActor() {
        if (actor == undefined) {
            // TODO: Load the identity from local storage.
            const identity = Ed25519KeyIdentity.generate();

            // How do the profiles add one another???
            // They have to have some data in common...

            const actor = createActor(process.env.EXPO_PUBLIC_CANISTER_ID_ICP_PROFILES as string, {
                agentOptions: {
                    host: process.env.EXPO_PUBLIC_ICP_HOST,
                    identity: identity,
                },
            });

            return actor;
        } else {
            return actor;
        }
    }

    return (
        <IcpContext.Provider value={getActor()}>
            {children}
        </IcpContext.Provider>
    );
};
