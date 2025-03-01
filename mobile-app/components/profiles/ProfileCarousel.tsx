import React, { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import NewProfileScreen from "./AddProfile";
import PreferenceSelectionScreen from "./Preferences";
import { Profile } from "@/types";

export default function ProfileSetupCarousel() {
    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState<Profile>({
        firstName: "",
        lastName: "",
        contactEmail: "",
        geolocation: "",
        maxDistance: 0,
        properties: [],
        exclusionList: [],
        lastModified: new Date(),
    });

    const handleNext = () => {
        if (step < 2) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <View style={styles.container}>
            {/* Progress Dots */}
            <View style={styles.progressContainer}>
                <View style={[styles.dot, step === 1 && styles.activeDot]} />
                <View style={[styles.dot, step === 2 && styles.activeDot]} />
            </View>

            {/* Step Screens */}
            {step === 1 ? (
                <NewProfileScreen profile={profileData} setProfile={setProfileData} />
            ) : (
                <PreferenceSelectionScreen profile={profileData} setProfile={setProfileData} />
            )}

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
                {step > 1 && <Button title="Back" onPress={handleBack} />}
                {step < 2 ? (
                    <Button title="Next" onPress={handleNext} />
                ) : (
                    <Button title="Finish" onPress={() => console.log({ profileData })} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    progressContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#d3d3d3",
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: "#007AFF",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 20,
        width: "100%",
    },
});
