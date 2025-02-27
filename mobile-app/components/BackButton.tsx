import { TouchableWithoutFeedback } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';

export default function BackButton(navigate: any) {
    return (
        <TouchableWithoutFeedback onPress={() => navigate()}>
            <Icon name="arrow-back-sharp" size={24} />
        </TouchableWithoutFeedback>
    )
}