import { useState } from 'react';
import { View, SafeAreaView, StyleSheet, TextInput, Button, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import BackButton from '@/components/BackButton';

export default function NewProfileScreen() {
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleNext = () => {
        if (name && gender && dateOfBirth) {
            router.push('../add-profile-attributes');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <BackButton navigate={() => router.back()} />

                <ThemedText type="title" style={styles.title}>
                    Create a new profile
                </ThemedText>

                {/* Name Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                />

                {/* Gender Selection */}
                <Picker
                    selectedValue={gender}
                    onValueChange={(value) => setGender(value)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Gender" value="" />
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Other" value="other" />
                </Picker>

                {/* Date of Birth Picker */}
                <Button title="Select Date of Birth" onPress={() => setShowDatePicker(true)} />
                {dateOfBirth && (
                    <ThemedText type="default" style={styles.dateText}>
                        {dateOfBirth.toDateString()}
                    </ThemedText>
                )}
{/* 
                {showDatePicker && (
                    <DateTimePicker
                        value={dateOfBirth || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(_, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDateOfBirth(selectedDate);
                        }}
                    />
                )} */}

                {/* Next Button */}
                <Button
                    title="Next"
                    onPress={handleNext}
                    disabled={!name || !gender || !dateOfBirth}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    picker: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 15,
    },
    dateText: {
        fontSize: 16,
        marginVertical: 10,
    },
});

