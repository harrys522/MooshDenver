import { StyleSheet, Image, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

const logo = require('@/assets/images/dating-app-btc-logo.png');

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView headerImage={logo} headerBackgroundColor={{ dark: '#5E2BFF', light: '#5E2BFF' }}>
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={require('@/assets/images/dating-app-btc-logo.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
        <ThemedText type="title">Matches</ThemedText>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="defaultSemiBold">0</ThemedText>
          <ThemedText type="defaultSemiBold">Matches</ThemedText>
        </ThemedView>
        <ThemedText type="default">
          <Collapsible title="Instructions">
            <ThemedText type="default">You have no matches yet.</ThemedText>
            <ThemedText type="default">
              Swipe right on a profile to add them to your matches.
            </ThemedText>
            <ThemedText type="default">
              Swipe left on a profile to reject them.
            </ThemedText>
          </Collapsible>
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
