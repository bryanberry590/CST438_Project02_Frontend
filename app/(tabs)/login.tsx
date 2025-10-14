// app/login.tsx — Web-only: backend handles Google OAuth
import { Platform, Pressable, Text, View, Alert } from 'react-native';

const API_BASE =
  (process as any).env?.EXPO_PUBLIC_API_BASE ||
  (globalThis as any).process?.env?.EXPO_PUBLIC_API_BASE ||
  'https://sports-betting-app-da82e41ab1fd.herokuapp.com';

export default function Login() {
  const start = () => {
    if (Platform.OS === 'web') {
      // Hand off to Spring Boot's OAuth entrypoint
      window.location.href = `${API_BASE}/oauth2/authorization/google`;
    } else {
      // This flow is web-only; native users should open the web app
      Alert.alert(
        'Use the Web App',
        'This login flow uses browser cookies. Open the web app in a browser to sign in.'
      );
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
