// app/(auth)/forgot-password.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';

export default function ForgotPasswordFlow() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = email, 2 = code, 3 = new code sent, 4 = new password, 5 = success
  const [code, setCode] = useState(['', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && email) {
      setStep(2); // Naar verificatie code scherm
    } else if (step === 2) {
      setStep(3); // Naar code verzonden scherm
    } else if (step === 3) {
      setStep(4); // Naar nieuw wachtwoord scherm
    } else if (step === 4) {
      setIsLoading(true);
      // Simuleer API call
      setTimeout(() => {
        setIsLoading(false);
        setStep(5); // Naar success scherm
      }, 1500);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Auto focus naar volgende veld
    if (text && index < 4) {
      // Dit vereist een ref naar het volgende TextInput veld
      // Voor nu werkt het zonder auto-focus
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5CD4FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Terug knop (niet op eerste scherm) */}
      {step > 1 && (
        <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}

      {step === 1 && (
        <>
          <Text style={styles.title}>Forgot Password</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={[styles.button, !email && styles.buttonDisabled]} 
            onPress={handleNext}
            disabled={!email}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Insert verification code</Text>
          <Text style={styles.subtitle}>
            Please allow up to 5 minutes for the code to reach your inbox. If it doesn't appear after that, you should check your spam.
          </Text>
          
          <View style={styles.codeContainer}>
            {[0, 1, 2, 3, 4].map((index) => (
              <TextInput
                key={index}
                style={styles.codeInput}
                keyboardType="number-pad"
                maxLength={1}
                value={code[index]}
                onChangeText={(text) => handleCodeChange(text, index)}
              />
            ))}
          </View>
          
          <TouchableOpacity style={styles.resendLink}>
            <Text style={styles.resendText}>Resend code</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, code.some(c => !c) && styles.buttonDisabled]} 
            onPress={handleNext}
            disabled={code.some(c => !c)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.title}>Your new code has been sent</Text>
          <Text style={styles.subtitle}>
            Please allow up to 5 minutes for the code to reach your inbox. If it doesn't appear after that, you should check your spam.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 4 && (
        <>
          <Text style={styles.title}>Choose a new password</Text>
          <TextInput
            placeholder="New password"
            placeholderTextColor="#aaa"
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
            secureTextEntry
          />
          <TextInput
            placeholder="Repeat new password"
            placeholderTextColor="#aaa"
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            style={styles.input}
            secureTextEntry
          />
          <TouchableOpacity 
            style={[styles.button, (!newPassword || newPassword !== repeatPassword) && styles.buttonDisabled]} 
            onPress={handleNext}
            disabled={!newPassword || newPassword !== repeatPassword}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 5 && (
        <>
          <Text style={styles.title}>Your password has been reset!</Text>
          <Text style={styles.subtitle}>
            You can try to log in again using your new password you just created.
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </Link>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  backButtonText: {
    color: '#5CD4FF',
    fontSize: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#5CD4FF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#212121',
    fontSize: 16,
    fontWeight: 'bold',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    backgroundColor: '#333',
    borderRadius: 12,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 18,
  },
  resendLink: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  resendText: {
    color: '#5CD4FF',
    fontSize: 14,
  },
});