import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Profile } from "@/types";
import { ThemedText } from "../ThemedText";
import { RangeSlider } from "@/components/profiles/Selectors";

interface BasicProfileProps {
    profile: Profile;
    setProfile: (profile: Profile) => void;
}

export default function BasicProfileScreen({ profile, setProfile }: BasicProfileProps) {
    return (
        <View style={styles.container}>
            <ThemedText style={styles.header}>Basic Profile Details</ThemedText>

            {/* First Name */}
            <TextInput
                style={styles.input}
                placeholder="First Name"
                value={profile.firstName}
                onChangeText={(text) => setProfile({ ...profile, firstName: text })}
            />

            {/* Last Name */}
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={profile.lastName}
                onChangeText={(text) => setProfile({ ...profile, lastName: text })}
            />

            {/* Email */}
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={profile.contactEmail}
                onChangeText={(text) => setProfile({ ...profile, contactEmail: text })}
            />

            {/* Max Distance Slider */}
            <View style={styles.sliderContainer}>
                <RangeSlider
                    label="Max Distance"
                    min={5}
                    max={500}
                    value={profile.maxDistance}
                    onChange={(value) => setProfile({ ...profile, maxDistance: value })}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2, // Android shadow
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 15,
    },
    input: {
        backgroundColor: "#f0f0f0",
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    sliderContainer: {
        marginTop: 10,
    },
    sliderLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 5,
    },
});
