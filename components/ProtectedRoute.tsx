import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Redirect href="/(auth)/intro" />;
  }
  
  return children;
}