import React, { useContext, useState } from "react";
import { View, StyleSheet } from "react-native";
import BasicProfileScreen from "./BasicProfile";
import NewProfileScreen from "./AddProfile";
import PreferenceSelectionScreen from "./Preferences";
import ProfileReviewScreen from "./ProfileReview";
import { Profile } from "@/types";

import { Button } from "../Button";
import { encryptProfiles } from "@/services/matchmaking";
import { FriendsContext, ProfilesContext } from "../EverythingProvider";
import { useRouter } from "expo-router";

export default function ProfileSetupCarousel() {

    const [friends, setFriends] = useContext(FriendsContext);
    const [profiles, setProfiles] = useContext(ProfilesContext);
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState<Profile>({
        firstName: "",
        lastName: "",
        contactEmail: "",
        geolocation: "",
        maxDistance: 50, // Default range value
        properties: [],
        exclusionList: [],
        lastModified: new Date(),
    });

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const finalizeProfile = () => {
        console.log(profileData.properties);

        setProfiles([...profiles, profileData])
        router.push('/(tabs)/profiles')
    }

    return (
        <View style={styles.container}>
            {/* Progress Dots */}
            <View style={styles.progressContainer}>
                {[1, 2, 3, 4].map((num) => (
                    <View key={num} style={[styles.dot, step === num && styles.activeDot]} />
                ))}
            </View>

            {/* Step Screens */}
            {step === 1 ? (
                <BasicProfileScreen profile={profileData} setProfile={setProfileData} />
            ) : step === 2 ? (
                <NewProfileScreen profile={profileData} setProfile={setProfileData} />
            ) : step === 3 ? (
                <PreferenceSelectionScreen profile={profileData} setProfile={setProfileData} />
            ) : (
                <ProfileReviewScreen profile={profileData} />
            )}

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
                {step > 1 && <Button title="Back" onPress={handleBack} />}
                {step < 4 ? (
                    <Button title="Next" onPress={handleNext} />
                ) : (
                    <Button title="Finish" onPress={finalizeProfile} />
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
