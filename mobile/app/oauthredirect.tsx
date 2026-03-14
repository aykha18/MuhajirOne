import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

import { apiClient } from '@/api/client';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function OAuthRedirect() {
  const handledRef = useRef(false);
  const [message, setMessage] = useState<string>('Completing sign-in…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    const parseParams = (url: string) => {
      const [beforeHash, hashPartRaw] = url.split('#');
      const query = beforeHash.includes('?') ? beforeHash.split('?').slice(1).join('?') : '';
      const hashPart = hashPartRaw ?? '';

      const out = new URLSearchParams();
      if (query) {
        new URLSearchParams(query).forEach((value, key) => out.set(key, value));
      }
      if (hashPart) {
        new URLSearchParams(hashPart).forEach((value, key) => out.set(key, value));
      }
      return out;
    };

    const complete = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (!url) {
          setError('Missing redirect URL');
          setMessage('Sign-in did not complete');
          return;
        }

        const params = parseParams(url);
        const googleError = params.get('error');
        if (googleError) {
          const description = params.get('error_description');
          setError(description ? `${googleError}: ${description}` : googleError);
          setMessage('Google Sign-In failed');
          return;
        }

        const idToken = params.get('id_token');
        if (!idToken) {
          const keys = Array.from(params.keys()).join(', ');
          setError(`Google redirect missing id_token. Keys: ${keys || '(none)'}`);
          setMessage('Sign-in did not complete');
          return;
        }

        setMessage('Signing into MuhajirOne…');
        await apiClient.googleLogin(idToken, 'demo-device');
        router.replace('/(tabs)/currency');
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setMessage('Sign-in did not complete');
      }
    };

    complete();
  }, []);

  return (
    <ThemedView style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
      <ThemedText style={{ marginTop: 12, textAlign: 'center' }}>{message}</ThemedText>
      {error ? (
        <>
          <ThemedText style={{ marginTop: 12, textAlign: 'center', color: '#d00' }}>
            {error}
          </ThemedText>
          <View style={{ height: 16 }} />
          <ThemedButton title="Back to Sign In" onPress={() => router.replace('/(tabs)')} />
        </>
      ) : null}
    </ThemedView>
  );
}
