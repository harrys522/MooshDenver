import { StyleSheet, View, ScrollView } from 'react-native';
import { Profile } from '@/types';
import { ThemedText } from '../ThemedText';
import BackButton from '../BackButton';

interface ProfileItemProps {
    setProfile: (profile: any) => void;
    profile: Profile;
}

export function ProfileView({ setProfile, profile }: ProfileItemProps) {
    return (
        <ScrollView style={styles.container}>
            <BackButton navigate={() => setProfile(null)} />
            <View style={styles.profileContainer}>
                <ProfileDetail label="First Name" value={profile.firstName} />
                <ProfileDetail label="Last Name" value={profile.lastName} />
                <ProfileDetail label="Email" value={profile.contactEmail} />
                <ProfileDetail label="Location" value={profile.geolocation} />
                <ProfileDetail label="Max Distance" value={`${profile.maxDistance} km`} />
                <ProfileDetail label="Last Modified" value={profile.lastModified.toDateString()} />
                {profile.properties.map((property, index) => (
                    <View key={index}>
                        <ProfileDetail label={`Property ${index + 1} Type`} value={property.type} />
                        <ProfileDetail label={`Property ${index + 1}`} value={property.is.join(', ')} />
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const ProfileDetail = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.itemRow}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText style={styles.value}>{value}</ThemedText>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    profileContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    label: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});

