import { StyleSheet, View, ScrollView, ImageBackground, Pressable, Linking } from 'react-native';
import { Profile, propertyTypes, getSelectedValues, Match, PublicProfile } from '@/types';
import { ThemedText } from '../ThemedText';
import BackButton from '../BackButton';
import { router } from 'expo-router';
import React, { useContext } from "react";
import { Button } from "../Button";
import { MatchesContext } from '@/components/EverythingProvider';

const backgroundImage = require('@/assets/images/Wallpaper_white.png');

interface ProfileReviewProps {
    profile: Profile;
    matches: Match[];
}

export const filterMatchesForProfile = (matches: Match[], profile: Profile) => {
    return matches
        .filter((m: Match) =>
            m.profiles.some(p => p.contactEmail === profile.contactEmail)
        )
        .map(match => {
            const other = match.profiles.find(p => p.contactEmail !== profile.contactEmail) as PublicProfile;
            return { match: other, score: match.score };
        }) ?? [];
};

export default function ProfileReviewScreen({ profile }: ProfileReviewProps) {
    const [matches] = useContext(MatchesContext);
    const myMatches = filterMatchesForProfile(matches, profile);

    return (
        <ImageBackground
            source={backgroundImage}
            style={styles.background}
        >
            <ScrollView style={styles.container}>
                <ThemedText style={styles.header}>Profile</ThemedText>
                <BackButton navigate={() => router.push('/profiles')} />

                {/* Basic Profile Info */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
                    <ProfileDetail label="First Name" value={profile.firstName} />
                    <ProfileDetail label="Last Name" value={profile.lastName} />
                    <ProfileDetail label="Email" value={profile.contactEmail} />
                    <ProfileDetail label="Location" value={profile.geolocation} />
                    <ProfileDetail label="Max Distance" value={`${profile.maxDistance} km`} />
                    {profile.lastModified && typeof profile.lastModified === "object" &&
                        <ProfileDetail label="Last Modified" value={profile.lastModified.toDateString()} />}
                </View>

                <View style={styles.section}>
<<<<<<< Updated upstream
                    <ThemedText style={styles.sectionTitle}>Delete</ThemedText>
                    <Button title="Delete profile" onPress={() => { setProfiles(profiles.filter((prof) => prof.contactEmail != profile.contactEmail)); router.push('/') }} />
=======
                    <ThemedText style={styles.sectionTitle}>Matches</ThemedText>
                    <Button title="Find matches" onPress={() => { }} />
                    {myMatches.length > 0 ? (
                        myMatches.map((match, index) => (
                            <Pressable onPress={() => Linking.openURL(
                                `mailto:${match.match.contactEmail}?cc=${profile.contactEmail}&subject=${encodeURIComponent("You're a match!")}&body=${encodeURIComponent("You both match through the Wingman matchmaker app thanks to the senders mutual connections.")}`
                            )}>
                                <View key={index} style={styles.matchCard}>
                                    <View style={styles.matchHeader}>
                                        <ThemedText style={styles.matchName}>
                                            {match.match.firstName} {match.match.lastInitial}
                                        </ThemedText>
                                        <ThemedText style={styles.matchScore}>
                                            {match.score}%
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={styles.matchDetails}>
                                        {getMatchReason(profile, match.match)}
                                    </ThemedText>
                                </View>
                            </Pressable>
                            
                        ))
                    ) : (
                        <ThemedText style={styles.emptyText}>No matches found.</ThemedText>
                    )}
>>>>>>> Stashed changes
                </View>

                {/* Interests & Preferences Summary */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Your Interests & Preferences</ThemedText>
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
        </ImageBackground>
    );
}

/**
 * Determines the reason why two profiles matched.
 */
const getMatchReason = (profile: Profile, match: PublicProfile): string => {
    const matchedReasons = match.properties.flatMap(property => {
        const matchingProfileProp = profile.properties.find(p => p.type === property.type);
        if (!matchingProfileProp) return [];

        // Exclude "Sex" from match reasons
        if (propertyTypes[property.type]?.name === "Sex") return [];

        const profileValues = getSelectedValues(property.type, matchingProfileProp.is, propertyTypes);
        const matchValues = getSelectedValues(property.type, property.is, propertyTypes);

        let reasons = [];

        if (matchingProfileProp.mustHave.some(v => property.is.includes(v))) {
            reasons.push(`You required "${matchValues}" and they have it.`);
        }
        if (matchingProfileProp.prefered.some(v => property.is.includes(v))) {
            reasons.push(`You preferred "${matchValues}" and they have it.`);
        }
        if (property.mustHave.some(v => matchingProfileProp.is.includes(v))) {
            reasons.push(`They required "${profileValues}" and you have it.`);
        }
        if (property.prefered.some(v => matchingProfileProp.is.includes(v))) {
            reasons.push(`They preferred "${profileValues}" and you have it.`);
        }

        return reasons.length ? [`Matched on ${propertyTypes[property.type].name}: ${reasons.join(" ")}.`] : [];
    });

    return matchedReasons.length ? matchedReasons.join("\n") : "No strong matches found.";
};

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
        backgroundColor: "#f2f2f2",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#333",
    },
    section: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
        paddingBottom: 8,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    label: {
        fontSize: 16,
        color: "#555",
        fontWeight: "600",
    },
    value: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    matchCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    matchHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    matchName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#222",
    },
    matchScore: {
        fontSize: 16,
        color: "#007AFF",
        fontWeight: "600",
    },
    matchDetails: {
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
    },
    emptyText: {
        fontSize: 16,
        textAlign: "center",
        color: "#777",
        marginTop: 10,
    },
    propertyGroup: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    propertyLabel: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#222",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 5,
    },
    propertyRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    propLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#007AFF",
        width: 120,
    },
    propValue: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    background: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
        alignItems: "center",
    }
});
