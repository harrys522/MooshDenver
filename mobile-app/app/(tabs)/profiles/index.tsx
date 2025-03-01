import { View, StyleSheet, FlatList, SafeAreaView, Image, TouchableOpacity, Button } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ProfileView } from '@/components/profiles/ProfileView';
import { router } from 'expo-router';

import { createActor } from "@/services/icp-profiles"
import { AnonymousIdentity, SignIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from "@dfinity/identity";

import { useContext } from 'react';
import { IcpContext } from '@/components/IcpProvider';
import { profiles } from '@/services/test-profiles'
import { encryptProfiles, samplePublicKey } from '@/services/matchmaking';

const logo = require('@/assets/images/dating-app-btc-logo.png');

// Main screen is the profiles
export default function ProfileScreen() {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const icp = useContext(IcpContext)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <ThemedText style={styles.title}>Profiles</ThemedText>
      </View>

      {selectedProfile ? (<ProfileView setProfile={setSelectedProfile} profile={selectedProfile} />) :
        <View>
          {/* TODO: RefreshControl to apply a matchAll function */}
          <FlatList
            data={profiles}
            renderItem={({ item: profile }) => (
              <View style={styles.profileItem}>
                <TouchableOpacity onPress={() => { setSelectedProfile(profile) }}>
                  <ThemedText style={styles.profileText}>{profile.firstName} {profile.lastName}</ThemedText>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <Button title="Hello" onPress={async () => {
            try {
              const id = await icp.getId();
              alert('Got id: ' + id)
            } catch (err) {
              alert(err)
              console.log(err)
            }
          }} />
          <Button title="Send encrypted" onPress={async () => {
            try {
              const response = await encryptProfiles(samplePublicKey, profiles);
              alert('Got response: ' + response)
            } catch (err) {
              alert(err)
              console.log(err)
            }
          }} />
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/profiles/add-profile')}>
            <ThemedText style={styles.addButtonText}>Add Profile</ThemedText>
          </TouchableOpacity>
        </View>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    marginTop: 40, // Offset for the status bar, though this should be handled by SafeAreaView!
  },
  header: {
    padding: 20,
    backgroundColor: '#0D1B2A',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 20,
  },
  profileItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  profileText: {
    fontSize: 18,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#0D1B2A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  addButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  }
});
