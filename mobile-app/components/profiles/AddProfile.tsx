import React, { useState } from "react";
import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import MultiSelect from "react-native-multiple-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";

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

type SelectorProps = {
    label: string;
    options?: string[];
    selectedValue: number;
    onValueChange: (value: number) => void;
};

const Selector: React.FC<SelectorProps> = ({ label, options = [], selectedValue, onValueChange }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker}>
            {options.map((option, index) => (
                <Picker.Item key={index} label={option} value={index} />
            ))}
        </Picker>
    </View>
);

type MultiSelectorProps = {
    label: string;
    options: string[];
    selectedValues: string[];
    onSelectedItemsChange: (values: string[]) => void;
};

const MultiSelector: React.FC<MultiSelectorProps> = ({ label, options, selectedValues, onSelectedItemsChange }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <MultiSelect
            items={options.map((option) => ({ id: option, name: option }))}
            uniqueKey="id"
            onSelectedItemsChange={onSelectedItemsChange}
            selectedItems={selectedValues}
            selectText="Pick items"
            searchInputPlaceholderText="Search items..."
            tagRemoveIconColor="#CCC"
            tagBorderColor="#CCC"
            tagTextColor="#333"
            selectedItemTextColor="#333"
            selectedItemIconColor="#333"
            itemTextColor="#000"
            displayKey="name"
            submitButtonText="Confirm"
        />
    </View>
);

type DateSelectorProps = {
    label: string;
    selectedDate: number;
    onDateChange: (date: number) => void;
};

const DateSelector: React.FC<DateSelectorProps> = ({ label, selectedDate, onDateChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>{new Date(selectedDate * 1000).toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={new Date(selectedDate * 1000)}
                    mode="date"
                    display="default"
                    onChange={(_, date) => {
                        if (date) {
                            onDateChange(Math.floor(date.getTime() / 1000));
                        }
                        setShowPicker(false);
                    }}
                />
            )}
        </View>
    );
};

type RangeSliderProps = {
    label: string;
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
};

const RangeSlider = ({ label, min, max, value, onChange }: RangeSliderProps) => {
    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}: {value}</Text>
            <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={min}
                maximumValue={max}
                step={1}
                value={value}
                onValueChange={onChange}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#007AFF"
            />
        </View>
    );
};

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
    inputContainer: {
        marginBottom: 20,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    picker: {
        backgroundColor: "#fff",
        borderRadius: 8,
    },
    dateButton: {
        padding: 10,
        backgroundColor: "#e0e0e0",
        borderRadius: 5,
        alignItems: "center",
    },
    dateText: {
        fontSize: 16,
    },
    multiSelect: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 8,
    },
});
