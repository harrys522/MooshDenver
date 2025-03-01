import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import MultiSelect from "react-native-multiple-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";

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
                <Picker.Item key={index} label={option} value={"" + index} />
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
    const [sliderValue, setSliderValue] = useState(value);

    const handleSlidingComplete = (newValue: number) => {
        onChange(newValue); // Commit the final value
    };

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>
                {label}: {sliderValue}
            </Text>
            <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={min}
                maximumValue={max}
                step={1}
                value={value}
                onValueChange={setSliderValue} // Immediate feedback
                onSlidingComplete={handleSlidingComplete} // Commit final value
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#007AFF"
            />
        </View>
    );
};

const styles = StyleSheet.create({
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

export { Selector, MultiSelector, RangeSlider, DateSelector }
