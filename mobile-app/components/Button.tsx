import { styles } from '@/app/globalStyles'

import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';



export const Button = (
    {
        title,
        onPress,
    }: { title: string, onPress: () => void }
) => {
    return (
        <TouchableOpacity style={styles.button} onPress={() => { onPress() }}>
            <ThemedText style={styles.buttonText}> {title} </ThemedText>
        </TouchableOpacity >
    )
}
