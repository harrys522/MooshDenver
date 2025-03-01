import React, { useState } from "react";
import { FlatList, Button, StyleSheet } from "react-native";
import { Selector, MultiSelector, RangeSlider, DateSelector } from "./Selectors";

const propertyTypes = [
    { name: "Sex", canSelectMultiple: false, validFields: ["Male", "Female"] },
    { name: "Ethnicity", canSelectMultiple: true, validFields: ["White", "Black", "Asian", "Hispanic", "Native American", "Mixed"] },
    { name: "Star sign", canSelectMultiple: false, validFields: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"] },
    { name: "Languages", canSelectMultiple: true, validFields: ["English", "Spanish", "Mandarin", "Hindi", "French", "Arabic", "Bengali", "Portuguese", "Russian", "Urdu", "German", "Japanese"] },
    { name: "Personality", canSelectMultiple: false, validFields: ["Introverted", "Extroverted"] },
    { name: "Drug usage", canSelectMultiple: true, validFields: ["Tobacco", "Weed", "Mushrooms"] },
    { name: "Interests", canSelectMultiple: true, validFields: ["Travel", "Sports", "Reading", "Hiking", "Gaming", "Camping", "Crypto"] },
    { name: "Religion", canSelectMultiple: false, validFields: ["⚛️ Atheist / Agnostic", "✝️ Christian", "✡️ Jewish"] },
    { name: "Birthday", canSelectMultiple: false, range: [-2204107955, 1172486845] },
    { name: "Height (cm)", canSelectMultiple: false, range: [50, 280] },
    { name: "Weight (kg)", canSelectMultiple: false, range: [30, 400] },
];

export default function NewProfileScreen() {
    const [profile, setProfile] = useState<Record<string, any>>({});

    const handleValueChange = (key: string, value: any) => {
        setProfile((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <FlatList
            data={propertyTypes}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
                item.name === "Birthday" ? (
                    <DateSelector
                        label={item.name}
                        selectedDate={profile[item.name] || Math.floor(Date.now() / 1000)}
                        onDateChange={(value) => handleValueChange(item.name, value)}
                    />
                ) : item.range ? (
                    <RangeSlider
                        label={item.name}
                        min={item.range[0]}
                        max={item.range[1]}
                        value={profile[item.name] || item.range[0]}
                        onChange={(value: number) => handleValueChange(item.name, value)}
                    />
                ) : item.canSelectMultiple ? (
                    <MultiSelector
                        label={item.name}
                        options={item.validFields || []}
                        selectedValues={profile[item.name] || []}
                        onSelectedItemsChange={(values) => handleValueChange(item.name, values)}
                    />
                ) : (
                    <Selector
                        label={item.name}
                        options={item.validFields || []}
                        selectedValue={profile[item.name] || 0}
                        onValueChange={(value) => handleValueChange(item.name, value)}
                    />
                )
            )}
            ListFooterComponent={<Button title="Save Profile" onPress={() => console.log(profile)} />}
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
