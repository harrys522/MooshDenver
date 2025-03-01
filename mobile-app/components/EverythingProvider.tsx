
import 'react-native-get-random-values';
import { ActorSubclass, Identity } from "@dfinity/agent";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { createActor } from "@/services/icp-profiles"
import { AnonymousIdentity, SignIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { _SERVICE } from "@/services/icp-profiles/icp-profiles.did";

import * as SecureStore from 'expo-secure-store';
import { ProfileWingman } from '@/types';
import { Profile } from '@/services/types';
import { ActivityIndicator, Platform, Text } from 'react-native';
import { encryptProfiles, samplePublicKey } from '@/services/matchmaking';

export type IcpActor = ActorSubclass<_SERVICE>;
export const IcpContext = createContext<IcpActor>()

export const WingmanProfileContext = createContext<[ProfileWingman, (newVal: ProfileWingman) => void]>()
interface FriendsContextType {
    value: ProfileWingman[];
    setValue: (newValue: ProfileWingman[]) => void;
}
export const FriendsContext = createContext<[ProfileWingman[], (newValue: ProfileWingman[]) => void]>()

export const ProfilesContext = createContext<[Profile[], (newValue: Profile[]) => void]>()
export const MatchesContext = createContext<[Match[], (newValue: Match[]) => void]>()

function setItem(key: string, value: string | null) {
    try {
        if (Platform.OS === 'web') {
            if (!value) {
                localStorage.deleteItem(key)
            } else {
                localStorage.setItem(key, value)
            }
        } else {
            if (!value) {
                SecureStore.deleteItemAsync(key)
            } else {
                SecureStore.setItem(key, value)
            }

        }
    } catch (err) {
        console.error('Failed to set item: ' + key + ', value: ' + value)
        console.error(err)
    }
}
function getItem(key: string): string | null {
    try {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key)
        } else {
            return SecureStore.getItem(key)
        }
    } catch (err) {
        console.error('Failed to get item: ' + key)
        console.error(err)
        return null
    }
}

export const EverythingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [actor, setActor] = useState<IcpActor>();
    const [ownProfile, setOwnProfile] = useState<ProfileWingman>()

    const [friends, setFriends] = useState<ProfileWingman[]>([])
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [matches, setMatches] = useState<Matches[]>([])

    const [isLoading, setIsLoading] = useState<boolean>(true)

    // TODO: On set profiles update profiles with icp?

    async function load() {

        // TODO: Load the identity from local storage.

        console.log('loading id')
        var id = getItem('identity')
        var identity: Identity;

        const makeId = () => {
            console.log('making id')
            identity = Ed25519KeyIdentity.generate();

            setItem('identity', JSON.stringify((identity as Ed25519KeyIdentity).toJSON()))
        }

        if (!id) {
            makeId();
        } else {
            try {
                const identityObj = JSON.parse(id);

                identity = Ed25519KeyIdentity.fromJSON(identityObj)
                setItem('identity', JSON.stringify(identity))
            } catch (err) {
                console.error('Error loading identity: ' + err)
                setItem('identity', null)
                makeId()
                //return;
            }
        }

        console.log('making own prof')
        id = identity.getPrincipal().toString()

        if (!id) {
            alert('Id is null somehow')
            return;
        }

        // Load the profile for the user
        var ownProfileStr = getItem('ownProfile')
        if (!ownProfileStr) {
            // Make default profile.
            const prof: ProfileWingman = {
                id: id,
                name: 'New Profile',
                desc: 'This is a fresh profile',
                pfp: '',
            };

            setOwnProfile(prof)
        } else {
            const prof = JSON.parse(ownProfileStr)
            prof.id = id;
            setOwnProfile(prof)
        }

        console.log('getting friends')
        const friendsStr = getItem('friends')
        if (!friendsStr) {
            setFriends([])
        } else {
            setFriends(JSON.parse(friendsStr))
        }

        console.log('getting profiles')
        const profilesStr = getItem('profiles')
        if (!profilesStr) {
            setProfiles([])
        } else {
            setProfiles(JSON.parse(profilesStr))
        }

        console.log('getting matches')
        const matchesStr = getItem('matches')
        if (!matchesStr) {
            setMatches([])
        } else {
            setMatches(JSON.parse(matchesStr))
        }

        console.log('making actor')

        const actor = createActor(process.env.EXPO_PUBLIC_CANISTER_ID_ICP_PROFILES as string, {
            agentOptions: {
                host: process.env.EXPO_PUBLIC_ICP_HOST,
                identity: identity,
            },
        });

        console.log('done with actor')

        setActor(actor)

        console.log('done with actor')
    }

    useEffect(() => {
        if (ownProfile)
            setItem('ownProfile', JSON.stringify(ownProfile))
    }, [ownProfile])
    useEffect(() => {
        // TODO: Check against icp
        if (friends) {
            setItem('friends', JSON.stringify(profiles))
        }
    }, [friends])
    useEffect(() => {
        // TODO: Check against icp
        if (matches) {
            setItem('matches', JSON.stringify(matches))
        }
    }, [matches])

    useEffect(() => {
        // TODO: Also encrypt and periodically send to icp here. (Encrypted ofc).
        //
        const syncWithIcp = async () => {
            try {
                const profileSet = encryptProfiles(samplePublicKey, profiles)
                const profileEncoded = btoa(encodeURIComponent(JSON.stringify(profileSet)))

                if (actor) {
                    await actor.addProfile(profileEncoded)
                }
            } catch (err) {
                console.error('Error encoding in icp: ' + err)
            }
        }

        if (profiles) {
            setItem('profiles', JSON.stringify(profiles))

            syncWithIcp()
        }
    }, [profiles])

    useEffect(() => {
        const waitLoad = async () => {
            try {
                await load()
                console.log('Done?')
                console.log(actor)
                console.log(ownProfile)
                setIsLoading(false)
            } catch (err) {
                console.error(err)
            }
        }

        waitLoad()
    }, [])


    if (isLoading || (!actor || !ownProfile || !profiles)) {
        // TODO: Show fancier icon here.
        return <ActivityIndicator size='large' />
    }

    return (
        <IcpContext.Provider value={actor}>
            <WingmanProfileContext.Provider value={[ownProfile, setOwnProfile]}>
                <ProfilesContext.Provider value={[profiles, setProfiles]}>
                    <FriendsContext.Provider value={[friends, setFriends]}>
                        <MatchesContext.Provider value={[matches, setMatches]}>
                            {children}
                        </MatchesContext.Provider>
                    </FriendsContext.Provider>
                </ProfilesContext.Provider>
            </WingmanProfileContext.Provider>
        </IcpContext.Provider>
    );
};
