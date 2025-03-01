import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useState, useContext } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';

import { IcpContext } from '@/components/EverythingProvider';
import { profiles } from '@/services/test-profiles';
import { encryptProfiles, samplePublicKey, sendMatchmakingProfiles } from '@/services/matchmaking';

import { Button } from '@/components/Button';
import { BaseView } from '@/components/BaseView';

const logo = require('@/assets/images/Cloud_white.png');

export default function ProfileScreen() {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const icp = useContext(IcpContext);

  return (
    <BaseView style={styles.container}>
      <Image source={logo} style={styles.logo} />

      <FlatList
        data={profiles}
        renderItem={({ item: profile }) => (
          <TouchableOpacity
            style={styles.profileItem}
            onPress={() =>
              router.push({
                pathname: '/view-profile',
                params: { profile: encodeURIComponent(JSON.stringify(profile)) },
              })
            }
          >
            <ThemedText style={styles.profileText}>
              {profile.firstName} {profile.lastName}
            </ThemedText>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.buttonContainer}>
        {/* <Button
          title="Get ID"
          onPress={async () => {
            try {
              const id = await icp.getId();
              alert('Got id: ' + id);
            } catch (err) {
              alert(err);
              console.log(err);
            }
          }}
        />
        <Button
          title="Send Encrypted"
          onPress={async () => {
            try {
              const response = await sendMatchmakingProfiles([
                encryptProfiles(samplePublicKey, profiles),
              ]);
              alert('Got response: ' + response);
            } catch (err) {
              alert('ERROR:' + err);
              console.log(err);
            }
          }}
        /> */}
        <Button title="Add Profile" onPress={() => router.push('/add-profiles')} />
      </View>
    </BaseView>
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
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginVertical: 20,
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
});
