import React, { useState } from "react";
import { View, Button, ScrollView, StyleSheet } from "react-native";
import { Profile, PropertyEntry } from "@/types";
import PreferenceSelector from "./PreferenceSelector";

export interface PreferenceSelectionScreenProps {
    profile: Profile;
    setProfile: (profile: Profile) => void;
}

export default function PreferenceSelectionScreen({ profile, setProfile }: PreferenceSelectionScreenProps) {
    const [modifiedProperties, setModifiedProperties] = useState<PropertyEntry[]>([...profile.properties]);

    const finalizePreferences = () => {
        setProfile({ ...profile, properties: modifiedProperties, lastModified: new Date() });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
            <PreferenceSelector preferenceType="prefered" properties={modifiedProperties} setProperties={setModifiedProperties} />
            <PreferenceSelector preferenceType="notPrefered" properties={modifiedProperties} setProperties={setModifiedProperties} />
            <PreferenceSelector preferenceType="mustHave" properties={modifiedProperties} setProperties={setModifiedProperties} />
            <PreferenceSelector preferenceType="cantHave" properties={modifiedProperties} setProperties={setModifiedProperties} />
            <Button title="Save Preferences" onPress={finalizePreferences} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 100, // Prevents cutoff at the bottom
    },
});
