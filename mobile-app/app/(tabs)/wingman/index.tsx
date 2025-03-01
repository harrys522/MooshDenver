import { View, StyleSheet, Text, FlatList, SafeAreaView, Image, TouchableOpacity, Modal, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRef, useState } from 'react';

import { useContext } from 'react';
import { FriendsContext, IcpContext, WingmanProfileContext } from '@/components/EverythingProvider';

import QRCode from "react-qr-code";
import { BaseView } from '@/components/BaseView';

import React, { useEffect } from "react";
import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';

import { Pressable } from 'react-native';

import { Button } from '@/components/Button';

import { styles } from '@/app/globalStyles';
import { ProfileWingman } from '@/types';
import { WingmanProfile } from '@/components/WingmanProfile';

import { OwnModal } from '@/components/OwnModal';
import { Principal } from '@dfinity/principal';

import { ActivityIndicator } from 'react-native';

const QRScannerScreen = () => {

  {
    /*
  <Pressable style={styles.closeCameraButton} onPress={onClose}>
    <Text style={styles.closeCameraButtonText}>Close</Text>
  </Pressable>
    */
  }
};

// Main screen is the profiles
export default function ProfileScreen() {

  const [camera, setCamera] = useState<boolean>(false);

  const [editProfile, setEditProfile] = useState<boolean>(false);
  const [ownProfile, setOwnProfile] = useContext(WingmanProfileContext)
  const [friends, setFriends] = useContext(FriendsContext)

  const icp = useContext(IcpContext)
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [isFetchingInviteCode, setisFetchingInviteCode] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>('');
  const inviteCodeRef = useRef(inviteCode); // Keeps track of latest invite code
  const [scanCooldown, setScanCooldown] = useState<boolean>(false);

  const [scannedProfile, setScannedProfile] = useState<ProfileWingman | null>(null);
  const [scannedInvite, setScannedInvite] = useState<string | null>(null);
  const [isProfileScanned, setIsProfileScanned] = useState<boolean>(true);

  const scanLock = useRef(false)

  const handleQrCodeScan = (result: string) => {
    if (scanLock.current || scanCooldown) return;

    scanLock.current = true;
    setScanCooldown(true)

    const { profile, invite } = JSON.parse(decodeURIComponent(atob(result)))

    console.log(JSON.stringify(profile))

    setScannedProfile(profile)
    setScannedInvite(invite)
    setIsProfileScanned(true)

    scanLock.current = false;
    setScanCooldown(false)
  }

  const addFriend = async (inviteCode: string, profile: ProfileWingman) => {
    try {
      console.log(inviteCode, Principal.fromText(profile.id))
      const response = await icp.addFriend(ownProfile.name, ownProfile.desc, ownProfile.pfp, Principal.fromText(profile.id), inviteCode);
      console.log(response)

      if (response == 'Invited friend') {
        alert('Friend added')
        setFriends([...friends, profile])
      } else {
        alert('Failed to add friend')
      }
    } catch (err) {
      console.error(err)
    } finally {
    }
  }
  const removeFriend = async (id: string) => {

    // Delete the friendship.
    icp.removeFriend(Principal.fromText(id)).then(() => {
      console.log('Got rid of friend')
    }).catch((err) => {
      console.error('Error adding friend: ' + err)
    })

    setFriends(friends.filter((v) => (v.id !== id)))
  }

  useEffect(() => {
    const fetchInviteCode = async () => {
      setisFetchingInviteCode(true)

      try {
        const invite = await icp.getInvite()

        if (inviteCodeRef.current != invite && inviteCodeRef.current != "") {
          setIsProfileScanned(false)
          setScannedProfile(null)

          // New friend was added!
          const friend = await icp.getLatestFriend();

          try {
            if (friend) {
              const f = friend[0]
              if (f) {
                const fFormatted: ProfileWingman = {
                  id: f.id.toString(),
                  name: f.name,
                  desc: f.desc,
                  pfp: f.pfp,
                }
                console.log('Scanning profile')

                setScannedProfile(fFormatted)
              }
            }
          } catch (err) {
            alert('Error setting scanned profile: ' + err)
          }
        }

        console.log('Setting invite code, was: ' + inviteCodeRef.current + ' is: ' + invite)
        inviteCodeRef.current = invite;
        setInviteCode(invite)
        setisFetchingInviteCode(false);
      } catch (err) {
        console.error(err)
        setisFetchingInviteCode(false);
      }
    }

    setInterval(() => {
      // Don't want to fetch twice unnecesarily.
      // TODO: Also fetch for missing friends
      if (!isFetchingInviteCode) {
        console.log('Fetching invite code...')
        fetchInviteCode()
      }
    }, 2000)

    fetchInviteCode();
  }, [])

  if (camera)
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, display: 'flex', flexDirection: 'column', }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Pressable style={{ padding: 10 }} onPress={() => setCamera(false)}>
                <Text style={{ fontSize: 17 }}> X </Text>
              </Pressable>
            </View>

            <Text style={{ fontSize: 17, textAlign: 'center', margin: 10, fontWeight: 'bold', }}> Scan your pall's qr code </Text>
          </View>

          <CameraView
            style={{ flex: 1 }}
            onBarcodeScanned={(code: BarcodeScanningResult) => {
              setCamera(false); handleQrCodeScan(code.data);
            }}
          >

          </CameraView>
        </View>
      </SafeAreaView>
    )

  return (
    <BaseView>

      { /* Need profile data + invite code in base64 */}
      { /* TODO: Camera button to scan qr */}
      { /* TODO: Button to trigger camera */}


      <View style={style.qrContainer}>
        {
          inviteCode != '' ? (
            <View style={style.qrContainer}>
              <QRCode
                style={{
                  flex: 1, width: '40%'
                }}
                value={btoa(encodeURIComponent(JSON.stringify({ profile: ownProfile, invite: inviteCode })))}
              />
              <Text> {ownProfile.id} </Text>
              <Text> {inviteCode} </Text>
            </View>
          ) : (
            <ActivityIndicator size='large' />
          )
        }

      </View>

      <Button title="Add wingman" onPress={() => {
        if (!cameraPermission?.granted) {
          alert('Need camera permission to continue.')
          requestCameraPermission()
        } else {
          setCamera(true)
        }
      }} />

      <View>
        <View style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
          <WingmanProfile profile={ownProfile} />
        </View>

        <Button title="Edit profile" onPress={() => {
          setEditProfile(true);
        }} />
      </View>

      {
        friends.length > 0 && (
          <View style={{ marginBottom: 300 }}>
            <Text> Friends: </Text>
            <FlatList
              data={friends}
              renderItem={({ item: friend }) => (
                <View style={styles.profileItem}>
                  <View style={{ display: 'flex', flexDirection: 'row' }}>
                    <View style={{ flex: 6 }}>
                      <WingmanProfile profile={friend} />
                    </View>
                    <Button title="X" onPress={() => { removeFriend(friend.id) }} />
                  </View>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )
      }

      {
        (!isProfileScanned || scannedProfile) && (
          <OwnModal
            visible={(scannedInvite != null && scannedProfile != null) || !isProfileScanned}
            onClose={() => { setScannedProfile(null); setScannedInvite(null) }}
          >
            {
              !scannedProfile ? (
                <>
                  <ActivityIndicator size='large' />
                  <Text> Loading invite data </Text>
                </>
              ) : (
                <WingmanProfile profile={scannedProfile} />
              )
            }

            {
              scannedProfile && (
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <Button title="Cancel" onPress={() => {
                    if (!isProfileScanned) {
                      removeFriend(scannedProfile.id)
                    }
                    setScannedProfile(null); setScannedInvite(null); setIsProfileScanned(true);
                  }} />
                  {
                    (isProfileScanned && scannedInvite) ? (
                      <Button title="Add friend" onPress={
                        () => {
                          addFriend(scannedInvite, scannedProfile);
                          setScannedProfile(null); setScannedInvite(null)
                        }
                      } />
                    ) : (
                      <Button title="Accept friend" onPress={
                        () => {
                          setFriends([...friends, scannedProfile])
                          setIsProfileScanned(true);
                          setScannedProfile(null); setScannedInvite(null)
                        }
                      } />
                    )
                  }
                </View>
              )
            }
          </OwnModal>
        )
      }

      <OwnModal
        visible={editProfile}
        onClose={() => { setEditProfile(false) }}
      >
        <Text> Name: </Text>
        <TextInput
          style={styles.searchInput}
          value={ownProfile.name}
          onChangeText={(t) => { setOwnProfile(prevState => ({ ...prevState, name: t, })) }}
        />

        <Text> Bio: </Text>
        <TextInput
          style={styles.searchInput}
          value={ownProfile.desc}
          onChangeText={(t) => { setOwnProfile(prevState => ({ ...prevState, desc: t, })) }}
        />

        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <Button title="Done" onPress={() => { setEditProfile(false) }} />
        </View>
      </OwnModal>

    </BaseView >
  );
}

const style = StyleSheet.create({

  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, .7)',
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  modalContent: {
    padding: 20,
    backgroundColor: 'white',
  },

  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
