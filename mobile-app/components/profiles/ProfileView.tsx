import { StyleSheet, View, ScrollView } from 'react-native';
import { Profile, propertyTypes, getSelectedValues } from '@/types';
import { ThemedText } from '../ThemedText';
import BackButton from '../BackButton';
import { router } from 'expo-router';

interface ProfileItemProps {
    profile: Profile;
}

export function ProfileView({ profile }: ProfileItemProps) {
    return (
        <ScrollView style={styles.container}>
            <BackButton navigate={() => router.back()} />
            <View style={styles.profileContainer}>
                <ProfileDetail label="First Name" value={profile.firstName} />
                <ProfileDetail label="Last Name" value={profile.lastName} />
                <ProfileDetail label="Email" value={profile.contactEmail} />
                <ProfileDetail label="Location" value={profile.geolocation} />
                <ProfileDetail label="Max Distance" value={`${profile.maxDistance} km`} />
                <ProfileDetail label="Last Modified" value={new Date(profile.lastModified).toDateString()} />

                {profile.properties.map((property, index) => {
                    const propertyType = propertyTypes[property.type];

                    if (!propertyType) {
                        return (
                            <View key={index}>
                                <ProfileDetail label={`Unknown Property ${index + 1}`} value={`Type ${property.type}`} />
                            </View>
                        );
                    }

                    const propertyName = propertyType.name;
                    let displayValue: string;

                    if (propertyType.validFields) {
                        displayValue = getSelectedValues(property.type, property.is, propertyTypes).join(', ');
                    } else if (propertyType.validRange) {
                        displayValue = property.is[0]?.toString() ?? "N/A";
                    } else if (propertyName === "Birthday") {
                        displayValue = new Date((property.is[0] ?? 0) * 1000).toDateString();
                    } else {
                        displayValue = property.is.join(', ');
                    }

                    return (
                        <View key={index}>
                            <ProfileDetail label={propertyName} value={displayValue} />
                        </View>
                    );
                })}
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
