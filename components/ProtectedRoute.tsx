import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { userToken, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  if (!userToken) {
    return <Redirect href="/(auth)/intro" />;
  }
  
  return children;
}