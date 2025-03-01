import { ProfileView } from "@/components/profiles/ProfileView"
import { useLocalSearchParams } from "expo-router"

export default function ViewProfiles() {

  const { profile: unparsedProfile } = useLocalSearchParams()
  const profile = unparsedProfile ? JSON.parse(decodeURIComponent(unparsedProfile as string)) : null;

  return <ProfileView profile={profile} />
}
