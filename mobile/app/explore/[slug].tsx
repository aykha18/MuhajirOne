import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import { apiClient, type FeatureIdea } from '@/api/client';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function FeatureDetailScreen() {
  const { slug } = useLocalSearchParams();
  const featureSlug = Array.isArray(slug) ? slug[0] : slug;
  const navigation = useNavigation();

  const [feature, setFeature] = useState<FeatureIdea | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const f = await apiClient.getFeatureIdea(featureSlug);
      setFeature(f);
      navigation.setOptions({ title: f.title });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (featureSlug) {
      load();
    }
  }, [featureSlug]);

  const handleToggleVote = async () => {
    if (!feature) return;
    setFeature({
      ...feature,
      voted: !feature.voted,
      voteCount: feature.voteCount + (feature.voted ? -1 : 1),
    });
    try {
      const res = await apiClient.toggleFeatureVote(feature.slug);
      setFeature((prev) =>
        prev ? { ...prev, voted: res.voted, voteCount: res.voteCount } : prev,
      );
    } catch (e) {
      await load();
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }} headerImage={null}>
      {loading ? (
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" />
        </ThemedView>
      ) : error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : feature ? (
        <ThemedView style={styles.container}>
          <ThemedText type="title">{feature.title}</ThemedText>
          <View style={styles.metaRow}>
            <ThemedText style={styles.metaText}>{feature.voteCount} votes</ThemedText>
          </View>
          <ThemedText style={styles.short}>{feature.shortDescription}</ThemedText>
          <ThemedText style={styles.long}>{feature.longDescription}</ThemedText>
          <ThemedView style={styles.actions}>
            <ThemedButton
              title={feature.voted ? 'Upvoted' : 'Upvote'}
              variant={feature.voted ? 'secondary' : 'primary'}
              onPress={handleToggleVote}
            />
            <ThemedButton title="Refresh" variant="secondary" onPress={load} />
          </ThemedView>
        </ThemedView>
      ) : null}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#d00',
  },
  container: {
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    opacity: 0.9,
  },
  short: {
    opacity: 0.95,
  },
  long: {
    opacity: 0.95,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
});

