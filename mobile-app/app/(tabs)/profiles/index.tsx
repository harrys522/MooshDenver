import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ProfileView } from '@/components/profiles/ProfileView';
import { router } from 'expo-router';

import { createActor } from "@/services/icp-profiles"
import { AnonymousIdentity, SignIdentity } from '@dfinity/agent';
import { Ed25519KeyIdentity } from "@dfinity/identity";

import { useContext } from 'react';
import { IcpContext } from '@/components/EverythingProvider';
import { profiles } from '@/services/test-profiles'

import { Button } from '@/components/Button';

import { styles } from '@/app/globalStyles'
import { BaseView } from '@/components/BaseView';

const logo = require('@/assets/images/dating-app-btc-logo.png');

// Main screen is the profiles
export default function ProfileScreen() {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const icp = useContext(IcpContext)

  return (
    <BaseView>
      <View>
        {/* TODO: RefreshControl to apply a matchAll function */}

        <FlatList
          data={profiles}
          renderItem={({ item: profile }) => (
            <View style={styles.profileItem}>
              <TouchableOpacity onPress={() => { router.push({ pathname: '/view-profile', params: { profile: encodeURIComponent(JSON.stringify(profile)) } }) }}>
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

        <Button title="Add profile" onPress={() => { router.push('/add-profiles') }} />
      </View>
    </BaseView >
  );
}

