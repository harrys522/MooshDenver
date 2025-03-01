import React, { useState } from "react";
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView, Button } from "react-native";
import { PropertyEntry, propertyTypes } from "@/types";
import { ThemedText } from "../ThemedText";

interface PreferenceSelectorProps {
    preferenceType: "prefered" | "notPrefered" | "mustHave" | "cantHave";
    properties: PropertyEntry[];
    setProperties: (properties: PropertyEntry[]) => void;
    onClose: () => void;
}

export default function PreferenceSelector({ preferenceType, properties, setProperties, onClose }: PreferenceSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Build a flat array of all valid fields from all property types
    const allValidFields = propertyTypes.flatMap((property, typeIndex) =>
        property.validFields?.map((field) => ({ field, typeIndex })) ?? []
    );

    // Create a set of already selected field names for the given preferenceType.
    const selectedFields = new Set(
        properties.flatMap((prop) =>
            (prop[preferenceType] as number[] | undefined)?.map(
                (index) => propertyTypes[prop.type].validFields?.[index]
            ) ?? []
        )
    );

    // Filter out fields that either don't match the search query or are already selected.
    const filteredFields = allValidFields.filter(({ field }) =>
        field.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedFields.has(field)
    );

    const handleValueChange = (selectedValues: string[]) => {
        let updatedProperties = [...properties];

        selectedValues.forEach((value) => {
            const match = allValidFields.find((item) => item.field === value);
            if (!match) return;

            const { typeIndex } = match;
            const valueIndex = propertyTypes[typeIndex].validFields?.indexOf(value);
            if (valueIndex === undefined || valueIndex === -1) return;

            let propertyEntry = updatedProperties.find((prop) => prop.type === typeIndex);
            if (!propertyEntry) {
                propertyEntry = { type: typeIndex, is: [], prefered: [], notPrefered: [], mustHave: [], cantHave: [] };
                updatedProperties.push(propertyEntry);
            }

            const currentSelection = new Set(propertyEntry[preferenceType] as number[]);
            if (currentSelection.has(valueIndex)) {
                currentSelection.delete(valueIndex);
            } else {
                currentSelection.add(valueIndex);
            }

            propertyEntry[preferenceType] = Array.from(currentSelection);
        });

        setProperties(updatedProperties);
    };

    return (
        <View style={styles.container}>
            {/* Selected Preferences */}
            <ScrollView horizontal style={styles.selectedContainer}>
                {properties
                    .flatMap((prop) =>
                        Array.isArray(prop[preferenceType])
                            ? (prop[preferenceType] as number[])
                                .map((index) => propertyTypes[prop.type].validFields?.[index] ?? "")
                            : []
                    )
                    .map((val, index) => (
                        <TouchableOpacity key={index} style={styles.selectedItem} onPress={() => handleValueChange([val])}>
                            <ThemedText style={styles.selectedItemText}>{val} ✕</ThemedText>
                        </TouchableOpacity>
                    ))}
            </ScrollView>

            {/* Search Bar */}
            <TextInput
                style={styles.searchInput}
                placeholder={`Search ${preferenceType} preferences...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {/* Search Results */}
            <FlatList
                data={filteredFields}
                keyExtractor={(item) => item.field}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleValueChange([item.field])} style={styles.listItem}>
                        <ThemedText>{item.field}</ThemedText>
                    </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
            />

            <Button title="Done" onPress={onClose} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    selectedContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 10,
        paddingVertical: 5,
    },
    selectedItem: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 15,
        borderRadius: 16,
        marginRight: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    selectedItemText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        justifyContent: "center",
        includeFontPadding: false,
    },
    searchInput: {
        padding: 12,
        fontSize: 16,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    listContainer: {
        maxHeight: 200,
    },
    listItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        backgroundColor: "#fff",
    },
    listItemText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "500",
    },
    buttonContainer: {
        marginTop: 10,
        alignSelf: "center",
        width: "100%",
    },
});
