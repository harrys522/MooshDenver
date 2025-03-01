import { StyleSheet, View, ScrollView } from 'react-native';
import { Profile, propertyTypes, getSelectedValues, Match } from '@/types';
import { ThemedText } from '../ThemedText';
import BackButton from '../BackButton';
import { router } from 'expo-router';
import React from "react";
import { Button } from "../Button";

interface ProfileReviewProps {
    profile: Profile;
    matches: Match[];
}

export default function ProfileReviewScreen({ profile }: ProfileReviewProps) {
    return (
        <ScrollView style={styles.container}>
            <ThemedText style={styles.header}>Profile</ThemedText>
            <BackButton navigate={() => { router.push('/profiles') }} />

            {/* Basic Profile Info */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
                <ProfileDetail label="First Name" value={profile.firstName} />
                <ProfileDetail label="Last Name" value={profile.lastName} />
                <ProfileDetail label="Email" value={profile.contactEmail} />
                <ProfileDetail label="Location" value={profile.geolocation} />
                <ProfileDetail label="Max Distance" value={`${profile.maxDistance} km`} />
                {profile.lastModified && typeof profile.lastModified === "object" && <ProfileDetail label="Last Modified" value={profile.lastModified.toDateString()} />}
            </View>

            {/* Match Button */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Match</ThemedText>
                <Button title="Find matches" onPress={() => { }} />

            </View>

            {/* Property Summary */}
            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Summary</ThemedText>
                {profile.properties.length > 0 ? (
                    profile.properties.map((property, index) => (
                        <View key={index} style={styles.propertyGroup}>
                            <ThemedText style={styles.propertyLabel}>
                                {propertyTypes[property.type]?.name}
                            </ThemedText>
                            <PropertySummary label="Selected" values={property.is} typeIndex={property.type} />
                            <PropertySummary label="Preferred" values={property.prefered} typeIndex={property.type} />
                            <PropertySummary label="Not Preferred" values={property.notPrefered} typeIndex={property.type} />
                            <PropertySummary label="Must Have" values={property.mustHave} typeIndex={property.type} />
                            <PropertySummary label="Can't Have" values={property.cantHave} typeIndex={property.type} />
                        </View>
                    ))
                ) : (
                    <ThemedText style={styles.emptyText}>No properties set.</ThemedText>
                )}
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

const PropertySummary = ({
    label,
    values,
    typeIndex,
}: {
    label: string;
    values: number[];
    typeIndex: number;
}) => {
    if (!values.length) return null;

    return (
        <View style={styles.propertyRow}>
            <ThemedText style={styles.propLabel}>{label}: </ThemedText>
            <ThemedText style={styles.propValue}>
                {values.map((index) => propertyTypes[typeIndex]?.validFields?.[index] ?? index).join(", ")}
            </ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#222",
    },
    section: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#222",
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    label: {
        fontSize: 16,
        color: "#444",
        fontWeight: "600",
    },
    value: {
        fontSize: 16,
        color: "#222",
        fontWeight: "500",
    },
    propertyGroup: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
    },
    propertyLabel: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#222",
    },
    propertyRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    propLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#007AFF",
    },
    propValue: {
        fontSize: 14,
        color: "#222",
    },
    emptyText: {
        fontSize: 16,
        textAlign: "center",
        color: "#777",
        marginTop: 10,
    },
});
