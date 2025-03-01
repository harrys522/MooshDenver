import { ProfileView } from "@/components/profiles/ProfileView"
import { useLocalSearchParams } from "expo-router"

export default function ViewProfiles() {

  const { profile: unparsedProfile, matches: unparsedMatches } = useLocalSearchParams()
  const profile = unparsedProfile ? JSON.parse(decodeURIComponent(unparsedProfile as string)) : null;
  const matches = unparsedMatches ? JSON.parse(decodeURIComponent(unparsedMatches as string)) : null;

  return <ProfileView profile={profile} matches={matches} />
}
