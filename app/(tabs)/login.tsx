// app/login.tsx — Web-only: backend handles Google OAuth
import { Platform, Pressable, Text, View, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const API_BASE =
  (process as any).env?.EXPO_PUBLIC_API_BASE ||
  (globalThis as any).process?.env?.EXPO_PUBLIC_API_BASE ||
  'https://sports-betting-app-da82e41ab1fd.herokuapp.com';

  const FRONTEND_WEB =
  (process as any).env?.EXPO_PUBLIC_FRONTEND_URL ||
  (globalThis as any).process?.env?.EXPO_PUBLIC_FRONTEND_URL ||
  'https://sports-betting-app-da82e41ab1fd.herokuapp.com';

export default function Login() {
  const start = async () => {
    if (Platform.OS === 'web') {
      // Hand off to Spring Boot's OAuth entrypoint
      window.location.href = `${API_BASE}/oauth2/authorization/google`;
    } else {
      await WebBrowser.openBrowserAsync(`${FRONTEND_WEB}/login`);
    }
  };

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Sign in</Text>
      <Pressable
        onPress={start}
        style={{
          backgroundColor: '#4285F4',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignSelf: 'flex-start',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Sign in with Google</Text>
      </Pressable>
    </View>
  );

}
