import { router } from 'expo-router';
import { SafeAreaView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import BackButton from '@/components/BackButton';

export default function NewProfileScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.container}>
                <BackButton navigate={() => router.push('/profiles')} />
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
});