import { View, StyleSheet, FlatList, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ProfileView } from '@/components/profiles/ProfileView';
import { router } from 'expo-router';
const logo = require('@/assets/images/dating-app-btc-logo.png');

// Main screen is the profiles
export default function ProfileScreen() {
  const profiles = [
    {
      "name": "tdowd",
      "age": 21,
      "sex": "heterosexual",
      "children": 0,
      "weight": 75,
      "height": 175,
      "drugs": false
    },
    {
      "name": "jdoe",
      "age": 25,
      "sex": "homosexual",
      "children": 2,
      "weight": 80,
      "height": 180,
      "drugs": true
    },
    {
      "name": "jane",
      "age": 30,
      "sex": "bisexual",
      "children": 1,
      "weight": 65,
      "height": 160,
      "drugs": false
    }
  ];
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  
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
                <TouchableOpacity onPress={() => {setSelectedProfile(profile)}}>
                  <ThemedText style={styles.profileText}>{profile.name} {profile.age}</ThemedText>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
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
