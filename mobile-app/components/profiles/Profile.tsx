import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Profile } from '@/types';
import { ThemedText } from '../ThemedText';
import Icon from 'react-native-vector-icons/Ionicons';
import BackButton from '../BackButton';

interface ProfileItemProps {
    setProfile: (profile: any) => void;
    profile: Profile;
}

export function ProfileView({ setProfile, profile }: ProfileItemProps) {
    return (
        <View style={styles.container}>
            <BackButton navigate={() => setProfile(null)} />
            <View style={styles.profileContainer}>
                <ProfileItem label="Age" value={profile.age} />
                <ProfileItem label="Sex" value={profile.sex} />
                <ProfileItem label="Children" value={profile.children} />
                <ProfileItem label="Weight" value={`${profile.weight} kg`} />
                <ProfileItem label="Height" value={`${profile.height} cm`} />
                <ProfileItem label="Drugs" value={profile.drugs ? 'Yes' : 'No'} />
            </View>
        </View>
    );
}

const ProfileItem = ({ label, value }: { label: string; value: string | number }) => (
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
    backButton: {
        padding: 10,
        alignSelf: 'flex-start',
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

