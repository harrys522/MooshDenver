import React, { useState } from "react";
import { View, Button, FlatList, StyleSheet } from "react-native";
import { Profile, PropertyEntry } from "@/types";
import PreferenceSelector from "./PreferenceSelector";
import { ThemedText } from "../ThemedText";

export interface PreferenceSelectionScreenProps {
    profile: Profile;
    setProfile: (profile: Profile) => void;
}

const preferenceTypes = ["prefered", "notPrefered", "mustHave", "cantHave"] as const;

export default function PreferenceSelectionScreen({ profile, setProfile }: PreferenceSelectionScreenProps) {
    const [modifiedProperties, setModifiedProperties] = useState<PropertyEntry[]>([...profile.properties]);

    const finalizePreferences = () => {
        setProfile({ ...profile, properties: modifiedProperties, lastModified: new Date() });
    };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.header}>Define Your Preferences</ThemedText>

            {/* FlatList to handle scrolling */}
            <FlatList
                data={preferenceTypes}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <PreferenceSelector preferenceType={item} properties={modifiedProperties} setProperties={setModifiedProperties} />
                )}
                contentContainerStyle={styles.listContainer}
            />

            <Button title="Save Preferences" onPress={finalizePreferences} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    listContainer: {
        paddingBottom: 20, // Prevent clipping at the bottom
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
});
