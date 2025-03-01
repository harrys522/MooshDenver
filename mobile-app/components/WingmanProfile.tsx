
import { ProfileWingman } from "@/types"
import { View, Text, Image } from "react-native"

export const WingmanProfile = ({ profile }: { profile: ProfileWingman }) => {
    return (
        <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}> {profile.name} </Text>
            <Text style={{ fontSize: 15 }}> {profile.desc} </Text>
        </View>
    )
}
