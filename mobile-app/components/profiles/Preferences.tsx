import React, { useState } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    Modal,
    TouchableOpacity,
} from "react-native";
import { Profile, PropertyEntry, propertyTypes } from "@/types";
import PreferenceSelector from "./PreferenceSelector";
import { ThemedText } from "../ThemedText";

export interface PreferenceSelectionScreenProps {
    profile: Profile;
    modifiedProperties: PropertyEntry[];
    setModifiedProperties: (props: PropertyEntry[]) => void;
}

const preferenceTypes = ["prefered", "notPrefered", "mustHave", "cantHave"] as const;

export default function PreferenceSelectionScreen({
    profile,
    modifiedProperties,
    setModifiedProperties,
}: PreferenceSelectionScreenProps) {
    const [selectedType, setSelectedType] = useState<string | null>(null);

    return (
        <View style={styles.container}>
            <ThemedText style={styles.header}>Define Your Preferences</ThemedText>

            {/* Pressable Selectors */}
            <FlatList
                data={preferenceTypes}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.preferenceButton}
                        onPress={() => setSelectedType(item)}
                    >
                        <ThemedText style={styles.buttonText}>{item.toUpperCase()}</ThemedText>
                        <ThemedText style={styles.selectedValues}>
                            {modifiedProperties
                                .flatMap((prop) =>
                                    Array.isArray(prop[item as keyof PropertyEntry])
                                        ? (prop[item as keyof PropertyEntry] as number[]).map(
                                                (index) => propertyTypes[prop.type].validFields?.[index] ?? ""
                                            )
                                        : []
                                )
                                .filter((val) => val !== "")
                                .join(", ") || "None Selected"}
                        </ThemedText>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContainer}
            />

            {/* Modal for Editing Preferences */}
            {selectedType && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={!!selectedType}
                    onRequestClose={() => setSelectedType(null)}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <ThemedText style={styles.modalHeader}>
                                Edit {selectedType.toUpperCase()} Preferences
                            </ThemedText>

                            <PreferenceSelector
                                preferenceType={selectedType as any}
                                properties={modifiedProperties}
                                setProperties={setModifiedProperties}
                                onClose={() => setSelectedType(null)}
                            />
                        </View>
                    </View>
                </Modal>
            )}
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
        paddingBottom: 20,
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#222",
    },
    preferenceButton: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#007AFF",
    },
    selectedValues: {
        fontSize: 14,
        color: "#333",
        marginTop: 5,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    modalContainer: {
        width: "95%",
        height: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#222",
    },
});
