import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';

import { apiClient } from '@/api/client';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function OAuthRedirect() {
  const handledRef = useRef(false);
  const [message, setMessage] = useState<string>('Completing sign-in…');
  const [error, setError] = useState<string | null>(null);
  const localParams = useLocalSearchParams<Record<string, string | string[]>>();

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

    const getRedirectUrl = async (): Promise<string | null> => {
      const initial = await Linking.getInitialURL();
      if (initial) {
        return initial;
      }

      return await new Promise((resolve) => {
        const subscription = Linking.addEventListener('url', (event) => {
          subscription.remove();
          resolve(event.url ?? null);
        });

        setTimeout(() => {
          subscription.remove();
          resolve(null);
        }, 4000);
      });
    };

    const complete = async () => {
      try {
        const params = new URLSearchParams();
        Object.entries(localParams ?? {}).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.set(key, String(value[0]));
            }
            return;
          }
          if (typeof value === 'string') {
            params.set(key, value);
          }
        });

        if (params.keys().next().done) {
          const url = await getRedirectUrl();
          if (!url) {
            setError('Missing redirect URL');
            setMessage('Sign-in did not complete');
            return;
          }
          parseParams(url).forEach((value, key) => params.set(key, value));
        }

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
