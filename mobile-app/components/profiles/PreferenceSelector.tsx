import React, { useState } from "react";
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { MultiSelector } from "./Selectors";
import { PropertyEntry, propertyTypes } from "@/types";
import { ThemedText } from "../ThemedText";

interface PreferenceSelectorProps {
    preferenceType: "prefered" | "notPrefered" | "mustHave" | "cantHave";
    properties: PropertyEntry[];
    setProperties: (properties: PropertyEntry[]) => void;
}

export default function PreferenceSelector({ preferenceType, properties, setProperties }: PreferenceSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Retrieve all valid fields from property types
    const allValidFields = propertyTypes.flatMap((property, typeIndex) =>
        property.validFields?.map((field) => ({ field, typeIndex })) ?? []
    );

    const filteredFields = allValidFields.filter(({ field }) =>
        field.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleValueChange = (selectedValues: string[]) => {
        let updatedProperties = [...properties];

        // Convert selected string values into their respective indexes
        const selectedIndexes = selectedValues
            .map((value) => {
                const match = allValidFields.find((item) => item.field === value);
                return match ? { typeIndex: match.typeIndex, valueIndex: propertyTypes[match.typeIndex].validFields?.indexOf(value) } : null;
            })
            .filter((item) => item !== null) as { typeIndex: number; valueIndex: number }[];

        selectedIndexes.forEach(({ typeIndex, valueIndex }) => {
            let propertyEntry = updatedProperties.find((prop) => prop.type === typeIndex);

            if (!propertyEntry) {
                propertyEntry = { type: typeIndex, is: [], prefered: [], notPrefered: [], mustHave: [], cantHave: [] };
                updatedProperties.push(propertyEntry);
            }

            // Get currently selected indexes for this preference type
            const currentSelection = new Set(propertyEntry[preferenceType]);

            if (selectedValues.includes(propertyTypes[typeIndex].validFields![valueIndex])) {
                currentSelection.add(valueIndex);
            } else {
                currentSelection.delete(valueIndex);
            }

            propertyEntry[preferenceType] = Array.from(currentSelection);
        });

        setProperties(updatedProperties);
    };

    const handleRemove = (value: string) => {
        let updatedProperties = [...properties];

        // Convert value to its index and typeIndex
        const match = allValidFields.find((item) => item.field === value);
        if (!match) return;

        const { typeIndex } = match;
        const valueIndex = propertyTypes[typeIndex].validFields?.indexOf(value);
        if (valueIndex === undefined || valueIndex === -1) return;

        let propertyEntry = updatedProperties.find((prop) => prop.type === typeIndex);
        if (!propertyEntry) return;

        // Remove the specific value from the selected preference type
        propertyEntry[preferenceType] = propertyEntry[preferenceType].filter((index) => index !== valueIndex);

        // Remove entry entirely if it has no values left
        if (
            propertyEntry.prefered.length === 0 &&
            propertyEntry.notPrefered.length === 0 &&
            propertyEntry.mustHave.length === 0 &&
            propertyEntry.cantHave.length === 0
        ) {
            updatedProperties = updatedProperties.filter((prop) => prop.type !== typeIndex);
        }

        setProperties(updatedProperties);
    };

    return (
        <View style={styles.container}>
            <ThemedText style={styles.label}>{preferenceType.toUpperCase()}</ThemedText>

            <TextInput
                style={styles.searchInput}
                placeholder={`Search ${preferenceType} preferences...`}
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {/* FlatList ensures smooth scrolling */}
            <FlatList
                data={filteredFields}
                keyExtractor={(item) => item.field}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleValueChange([item.field])}
                        style={styles.listItem}
                    >
                        <ThemedText style={styles.listItemText}>{item.field}</ThemedText>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContainer}
                keyboardShouldPersistTaps="handled"
            />

            {/* Ensures all selected options are clearly visible */}
            <MultiSelector
                label={`Selected ${preferenceType}`}
                options={allValidFields.map(({ field }) => field)}
                selectedValues={properties
                    .flatMap((prop) =>
                        prop[preferenceType].map((index) => propertyTypes[prop.type].validFields?.[index] ?? "")
                    )
                    .filter((val) => val !== "")}
                onSelectedItemsChange={(values) => {
                    // Preserve existing selections while only removing deselected ones
                    const currentSelection = properties.flatMap((prop) =>
                        prop[preferenceType].map((index) => propertyTypes[prop.type].validFields?.[index] ?? "")
                    );

                    // Find which value was removed
                    const removedValues = currentSelection.filter((val) => !values.includes(val));

                    if (removedValues.length > 0) {
                        removedValues.forEach((value) => handleRemove(value));
                    } else {
                        handleValueChange(values);
                    }
                }}
            />
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
        elevation: 2, // Android shadow effect
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
        maxHeight: 200, // Ensures list doesn't get clipped
    },
    listItem: {
        padding: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    listItemText: {
        fontSize: 16,
        color: "#333", // Darker text for better readability
    },
    label: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
        textAlign: "center",
    },
});
