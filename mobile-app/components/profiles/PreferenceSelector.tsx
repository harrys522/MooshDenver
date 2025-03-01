import React, { useState } from "react";
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from "react-native";
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

            // Update the correct preference type while keeping others intact
            propertyEntry[preferenceType] = [...new Set([...propertyEntry[preferenceType], valueIndex])];
        });

        setProperties(updatedProperties);
    };

    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder={`Search ${preferenceType} preferences...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {/* Expanded FlatList to ensure all options remain visible */}
            <FlatList
                data={filteredFields}
                keyExtractor={(item) => item.field}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleValueChange([item.field])}
                        style={styles.listItem}
                    >
                        <ThemedText>{item.field}</ThemedText>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContainer}
                keyboardShouldPersistTaps="handled"
            />

            {/* Ensures all selected options are clearly visible */}
            <View style={styles.multiSelectContainer}>
                <MultiSelector
                    label={`Select ${preferenceType}`}
                    options={allValidFields.map(({ field }) => field)}
                    selectedValues={properties
                        .flatMap((prop) =>
                            prop[preferenceType].map((index) => propertyTypes[prop.type].validFields?.[index] ?? "")
                        )
                        .filter((val) => val !== "")}
                    onSelectedItemsChange={handleValueChange}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#f9f9f9",
    },
    searchInput: {
        padding: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    listContainer: {
        maxHeight: 300, // Ensures list doesn't get clipped
    },
    listItem: {
        padding: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    multiSelectContainer: {
        marginTop: 10,
        paddingBottom: 15, // Ensures enough space for selection
    },
});
