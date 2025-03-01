import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { Selector, MultiSelector, RangeSlider, DateSelector } from "./Selectors";
import { Profile, propertyTypes, PropertyEntry, getProperty, getSelectedValues } from "@/types";

export interface NewProfileScreenProps {
    profile: Profile;
    setProfile: (profile: Profile) => void;
}

export default function NewProfileScreen({ profile, setProfile }: NewProfileScreenProps) {
    const handleValueChange = (typeIndex: number, newValue: number | number[]) => {
        const existingEntry = getProperty(profile, propertyTypes[typeIndex].name, propertyTypes);
        const updatedIs = Array.isArray(newValue) ? newValue : [newValue];

        const updatedEntry: PropertyEntry = {
            type: typeIndex,
            is: updatedIs,
            prefered: existingEntry?.prefered || [],
            notPrefered: existingEntry?.notPrefered || [],
            mustHave: existingEntry?.mustHave || [],
            cantHave: existingEntry?.cantHave || [],
        };

        const updatedProperties = profile.properties.some((prop) => prop.type === typeIndex)
            ? profile.properties.map((prop) => (prop.type === typeIndex ? updatedEntry : prop))
            : [...profile.properties, updatedEntry];

        setProfile({ ...profile, properties: updatedProperties, lastModified: new Date() });
    };

    return (
        <FlatList
        data={propertyTypes}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
            const profileProperty = getProperty(profile, item.name, propertyTypes);

            if (item.name === "Birthday") {
            return (
                <DateSelector
                    label={item.name}
                    selectedDate={profileProperty?.is[0] ?? Date.now() / 1000 - 18 * 365.25 * 24 * 60 * 60}
                    onDateChange={(value) => handleValueChange(index, value)}
                />
            );
            }

            if (item.validRange) {
            return (
                    <RangeSlider
                        label={item.name}
                        min={item.validRange[0]}
                        max={item.validRange[1]}
                        value={profileProperty?.is[0] ?? item.validRange[0]}
                        onChange={(value) => handleValueChange(index, value)}
                    />
                );
            }

            if (item.canSelectMultiple) {
            return (
                    <MultiSelector
                        label={item.name}
                        options={item.validFields ?? []}
                        selectedValues={getSelectedValues(index, profileProperty?.is ?? [], propertyTypes)}
                        onSelectedItemsChange={(values) => {
                            const selectedIndexes = values.map(value => item.validFields?.indexOf(value) ?? -1).filter(i => i !== -1);
                            handleValueChange(index, selectedIndexes);
                        }}
                    />
                );
            }

            return (
                <Selector
                    label={item.name}
                    options={item.validFields ?? []}
                    selectedValue={profileProperty?.is[0] ?? 0}
                    onValueChange={(value) => handleValueChange(index, value)}
                />
            );
        }}
        contentContainerStyle={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
});
