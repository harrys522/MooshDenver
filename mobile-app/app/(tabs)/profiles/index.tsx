import { View, StyleSheet, FlatList, ImageBackground, TouchableOpacity, Text, RefreshControl, Platform, Image } from 'react-native';
import { useState } from 'react';
import { useContext } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';

import { createActor } from "@/services/icp-profiles"
import { AnonymousIdentity, SignIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from "@dfinity/identity";

import { MatchesContext, ProfilesContext } from '@/components/EverythingProvider';
import { getPublicKey } from '@/services/matchmaking';
import { IcpContext } from '@/components/EverythingProvider';
import { profiles } from '@/services/test-profiles';
import { encryptProfiles, samplePublicKey, sendMatchmakingProfiles } from '@/services/matchmaking';

import dummyProfiles from '@/services/dummyProfiles.json'

import { Button } from '@/components/Button';
import { BaseView } from '@/components/BaseView';
import { getProperty, Match, MatchWith, Profile, propertyTypes, PublicProfile } from '@/types';

const logo = require('@/assets/images/Wingman.png');
const backgroundImage = require('@/assets/images/Wallpaper_Gray.png');

export default function ProfileScreen() {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const [profiles, setProfiles] = useContext(ProfilesContext);
  const [matches, setMatches] = useContext(MatchesContext);
  const [fetchingMatches, setFetchingMatches] = useState(false);

  const icp = useContext(IcpContext)

  const getMatchesForProfile = (prof: Profile): MatchWith[] => {
    return matches.filter((m: Match) => ((m.profiles[0].contactEmail == prof.contactEmail) || ((m.profiles[1].contactEmail == prof.contactEmail)))).map(match => {
      var other: PublicProfile;

      if (match.profiles[0].contactEmail == prof.contactEmail)
        other = match.profiles[1]
      else
        other = match.profiles[0]

      return {
        match: other,
        score: match.score,
      }
    }) ?? []
  }

  const fetchMatches = async () => {
    setFetchingMatches(true)

    try {
      // Get profiles from icp.
      let icpProfiles = await icp.getAllProfilesBasic()
      let encryptedProfiles = []

      for (let i = 0; i < icpProfiles.length; i++) {
        console.log(icpProfiles[i])
        try {
          encryptedProfiles.push(JSON.parse(decodeURIComponent(atob(icpProfiles[i][1]))))
        } catch (err) {
          console.log("Couldn't decode profile: " + encryptedProfiles)
        }
      }

      const response = await sendMatchmakingProfiles(encryptedProfiles)

      setMatches(response)

      //const response = await sendMatchmakingProfiles([encryptProfiles(samplePublicKey, profiles)])

      // response is an array of matches
    } catch (err) {
      alert('Failed to fetch matches: ' + err)
    } finally {
      setFetchingMatches(false)
    }
  }

  const addRandom = async () => {
    const unique = dummyProfiles.filter(d => !profiles.find(p => d.contactEmail === p.contactEmail))
    setProfiles([...profiles, unique[Math.ceil(Math.random() * (unique.length - 1))]])
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
    >
      <BaseView
        refreshControl={
          <RefreshControl
            refreshing={fetchingMatches}
            onRefresh={fetchMatches}
          />
        }
      >
        <View>
          {/* TODO: RefreshControl to apply a matchAll function */}

          <Button title="Add profile 💘" onPress={() => { router.push('/add-profiles') }} />

          <FlatList
            data={profiles}
            renderItem={({ item: profile }) => {
              const matches = getMatchesForProfile(profile);
              const n = matches.length;

              return (
                <View style={styles.profileItem}>
                  <TouchableOpacity onPress={() => {
                    router.push({
                      pathname: '/view-profile',
                      params: {
                        profile: encodeURIComponent(JSON.stringify(profile)),
                        matches: encodeURIComponent(JSON.stringify(getMatchesForProfile(profile)))
                      }
                    })
                  }}>
                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View>
                        <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>
                          {profile.firstName} {profile.lastName}
                        </ThemedText>

                        <Text> {
                          (new Date()).getFullYear() - (new Date(getProperty(profile, "Birthday", propertyTypes)?.is[0] * 1000) ?? new Date()).getFullYear()
                        } y/o </Text>
                      </View>

                      <Text style={{ fontWeight: '900', fontSize: 20 }}>
                        {
                          matches.length
                        }
                        {
                          (n == 0 ? '💔' : '') +
                          (n == 1 ? '❤️' : '') +
                          (n == 2 ? '❤️' : '') +
                          (n >= 3 ? '💕' : '')
                        }
                      </Text>
                    </View >
                  </TouchableOpacity >
                </View >
              )
            }}
            keyExtractor={(item, index) => index.toString()}
          />
          < Image source={logo} style={styles.logo} />

          <Button title="(Add test profiles)" onPress={() => { addRandom() }} />
          <Button title="(Delete all profiles)" onPress={() => { setProfiles([]) }} />

          {
            (Platform.OS == "web") && (
              <Button title="(Matchmake)" onPress={() => { fetchMatches() }} />
            )
          }
          <View style={{ marginBottom: 200 }} />
        </View >
      </BaseView >
    </ImageBackground >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F7F9FC',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginVertical: 20,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  listContent: {
    width: '100%',
    paddingVertical: 10,
  },
  profileItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    gap: 10, // Ensures spacing between buttons
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  }
});
