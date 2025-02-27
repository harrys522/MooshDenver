import { TouchableWithoutFeedback } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';

interface BackButtonProps {
    navigate: () => void;
}

export default function BackButton({ navigate }: BackButtonProps) {
    return (
        <TouchableWithoutFeedback onPress={navigate}>
            <Icon name="arrow-back-sharp" size={24} />
        </TouchableWithoutFeedback>
    );
}
