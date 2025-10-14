import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { Platform, Button } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const API_BASE = 'https://sports-betting-app-da82e41ab1fd.herokuapp.com';

export default function Login() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // fill these from your Google Cloud OAuth clients
    webClientId:     '<your web client id>',
    iosClientId:     '<your iOS client id>',
    androidClientId: '<your Android client id>',
  });

  useEffect(() => {
    (async () => {
      if (response?.type === 'success') {
        const { id_token } = response.params as any;
        // exchange with your backend to establish a session / get API token
        await fetch(`${API_BASE}/api/mobile/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: id_token }),
          credentials: 'include'
        });
        // now call protected APIs (bearer token or cookie, depending on your backend choice)
      }
    })();
  }, [response]);

  return <Button title="Sign in with Google" disabled={!request} onPress={() => promptAsync()} />;
}
