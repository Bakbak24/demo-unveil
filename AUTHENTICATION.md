# Authentication System Documentation

## Overview

The Unveil app uses a JWT-based authentication system with persistent storage using AsyncStorage. The authentication state is managed globally through React Context.

## Key Components

### 1. AuthContext (`context/AuthContext.tsx`)

The main authentication context that provides:
- **State Management**: `user`, `isLoggedIn`, `isLoading`, `error`
- **Authentication Methods**: `login()`, `signup()`, `logout()`
- **Utility Methods**: `getUserId()`, `getToken()`, `clearError()`

### 2. Main App Flow (`app/index.tsx`)

The app's entry point checks authentication status:
- Shows loading spinner while checking stored credentials
- Redirects to `/(tabs)` if user is logged in
- Redirects to `/(auth)/intro` if user is not logged in

### 3. Authentication Screens

- **Login** (`app/(auth)/login.tsx`): Email/password login
- **Signup** (`app/(auth)/signup.tsx`): Name/email/password registration
- **Intro** (`app/(auth)/intro.tsx`): Welcome screen with navigation to login/signup

### 4. AuthGuard Component (`components/AuthGuard.tsx`)

A utility component to protect routes that require authentication.

## Authentication Flow

### 1. App Startup
1. App loads and shows loading spinner
2. AuthContext checks AsyncStorage for stored user data
3. If found, sets user as logged in and configures axios headers
4. If not found, user remains logged out
5. App redirects based on authentication status

### 2. Login Process
1. User enters email and password
2. App validates input locally
3. Sends POST request to `/auth/login`
4. On success:
   - Stores user data (id, name, email, token) in AsyncStorage
   - Sets axios Authorization header for future requests
   - Updates context state
   - Navigates to main app (`/(tabs)`)
5. On error:
   - Displays error message
   - User remains on login screen

### 3. Signup Process
1. User enters name, email, password, and confirms password
2. App validates input locally (including password match)
3. Sends POST request to `/auth/signup`
4. On success:
   - Stores user data in AsyncStorage
   - Sets axios Authorization header
   - Updates context state
   - Navigates to main app (`/(tabs)`)
5. On error:
   - Displays error message
   - User remains on signup screen

### 4. Logout Process
1. Clears user data from context state
2. Removes user data from AsyncStorage
3. Removes Authorization header from axios
4. User is redirected to auth screens

## API Integration

### Backend Endpoints
- **Signup**: `POST /auth/signup`
  - Request: `{ name, email, password }`
  - Response: `{ id, name, email, token, message }`

- **Login**: `POST /auth/login`
  - Request: `{ email, password }`
  - Response: `{ id, name, email, token, message }`

### Token Management
- JWT tokens are stored in AsyncStorage
- Tokens are automatically added to axios headers for authenticated requests
- Tokens expire after 7 days (configured on backend)

## Data Storage

### AsyncStorage Structure
```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "token": "jwt_token_here"
  }
}
```

## Error Handling

- Network errors show user-friendly messages
- Validation errors are displayed inline
- Authentication errors clear on user input
- Failed requests don't crash the app

## Security Features

- Passwords are hashed on the backend
- JWT tokens have expiration
- Sensitive data is stored securely in AsyncStorage
- Authorization headers are automatically managed

## Usage Examples

### Protecting a Route
```tsx
import AuthGuard from '../components/AuthGuard';

export default function ProtectedScreen() {
  return (
    <AuthGuard>
      <YourProtectedContent />
    </AuthGuard>
  );
}
```

### Getting User Data
```tsx
import { useAuth } from '../context/AuthContext';

export default function UserProfile() {
  const { user, getUserId, getToken } = useAuth();
  
  const userId = getUserId();
  const token = getToken();
  
  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
    </View>
  );
}
```

### Making Authenticated Requests
```tsx
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DataComponent() {
  const { getToken } = useAuth();
  
  const fetchUserData = async () => {
    try {
      // Token is automatically added to headers by AuthContext
      const response = await axios.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };
}
```

## Configuration

### API Configuration (`config/api.ts`)
- Base URL configuration for different platforms
- Timeout settings
- Endpoint definitions

### Environment Variables (Backend)
- `JWT_SECRET`: Secret key for JWT token signing
- `NODE_ENV`: Environment mode (development/production)

## Troubleshooting

### Common Issues

1. **"Network error" on login/signup**
   - Check if backend server is running
   - Verify API_CONFIG.BASE_URL is correct
   - For Android emulator, ensure using 10.0.2.2 instead of localhost

2. **User gets logged out unexpectedly**
   - Check if JWT token has expired
   - Verify AsyncStorage is working properly
   - Check for network connectivity issues

3. **Authentication state not persisting**
   - Ensure AsyncStorage permissions are granted
   - Check if user data is being stored correctly
   - Verify AuthContext is properly wrapped around the app

### Debug Tips

- Check console logs for detailed error messages
- Use React Native Debugger to inspect AsyncStorage
- Monitor network requests in development tools
- Verify JWT token format and expiration 