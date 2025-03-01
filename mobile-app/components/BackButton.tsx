import { TouchableOpacity, View, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface BackButtonProps {
    navigate: () => void;
}

export default function BackButton({ navigate }: BackButtonProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={navigate} style={styles.button} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="arrow-back-sharp" size={32} color="#333" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 15,
        left: 15,
        zIndex: 10,
    },
    button: {
        padding: 10, // Adds extra space around the icon
        borderRadius: 50, // Makes it look more like a button
        backgroundColor: "rgba(0, 0, 0, 0.05)", // Slight background for visibility
    },
});
