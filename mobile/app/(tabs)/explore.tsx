import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { apiClient, type FeatureIdea } from '@/api/client';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function ExploreScreen() {
  const router = useRouter();
  const [features, setFeatures] = useState<FeatureIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await apiClient.listFeatureIdeas();
      setFeatures(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleVote = async (slug: string) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.slug === slug
          ? {
              ...f,
              voted: !f.voted,
              voteCount: f.voteCount + (f.voted ? -1 : 1),
            }
          : f,
      ),
    );
    try {
      const res = await apiClient.toggleFeatureVote(slug);
      setFeatures((prev) =>
        prev.map((f) =>
          f.slug === slug
            ? { ...f, voted: res.voted, voteCount: res.voteCount }
            : f,
        ),
      );
    } catch (e) {
      await load();
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.subtitle}>
        Help prioritize what we build next. Tap a feature to read details, and upvote if you want it.
      </ThemedText>

      <ThemedView style={styles.actionsRow}>
        <ThemedButton title="Refresh" variant="secondary" onPress={load} disabled={loading} />
      </ThemedView>

      {error ? (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      ) : null}

      {loading ? (
        <ThemedView style={styles.centered}>
          <ActivityIndicator size="large" />
        </ThemedView>
      ) : (
        <ThemedView style={styles.list}>
          {features.map((f) => (
            <Pressable
              key={f.slug}
              style={styles.card}
              onPress={() => router.push(`/explore/${f.slug}`)}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold">{f.title}</ThemedText>
                  <ThemedText style={styles.cardDesc}>{f.shortDescription}</ThemedText>
                </View>
                <View style={styles.voteBox}>
                  <ThemedText type="defaultSemiBold">{f.voteCount}</ThemedText>
                  <ThemedText style={styles.voteLabel}>votes</ThemedText>
                </View>
              </View>
              <ThemedView style={styles.cardActions}>
                <ThemedButton
                  title={f.voted ? 'Upvoted' : 'Upvote'}
                  variant={f.voted ? 'secondary' : 'primary'}
                  onPress={() => handleToggleVote(f.slug)}
                />
              </ThemedView>
            </Pressable>
          ))}

          {features.length === 0 ? (
            <ThemedText>No feature ideas yet.</ThemedText>
          ) : null}
        </ThemedView>
      )}
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
  subtitle: {
    marginTop: 8,
    opacity: 0.9,
  },
  actionsRow: {
    marginTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  errorText: {
    marginBottom: 8,
    color: '#d00',
  },
  centered: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 12,
    marginTop: 8,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    borderRadius: 12,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  cardDesc: {
    marginTop: 6,
    opacity: 0.9,
  },
  voteBox: {
    alignItems: 'center',
    minWidth: 56,
  },
  voteLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  cardActions: {
    marginTop: 12,
  },
});
