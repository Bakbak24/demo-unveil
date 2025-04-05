import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";
import { Link } from "expo-router";

export default function IntroScreen() {
  const { width } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      {/* Achtergrond afbeelding */}
      <Image
        source={require("../../assets/images/intro-image.png")}
        style={[styles.introImage, { width }]}
      />
      
      {/* Modal container (z-index hoger dan de afbeelding) */}
      <View style={styles.modal}>
        {/* Titel met 12px margin top */}
        <Text style={styles.title}>Hi there, welcome to{"\n"}Unveil</Text>
        
        {/* Intro tekst met 12px margin top en 121px margin bottom */}
        <Text style={styles.introText}>
          We hope you'll have an amazing time exploring the cities you love and listen to the amazing stories they hold.
        </Text>
        
        {/* Knoppen container */}
        <View style={styles.buttonsContainer}>
          {/* Login knop */}
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </Link>
          
          {/* OR scheidingslijn */}
          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>
          
          {/* Create account knop */}
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity style={styles.createAccountButton}>
              <Text style={styles.createAccountText}>Create account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative', // Belangrijk voor z-index werking
  },
  introImage: {
    height: 393,
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1, // Lagere z-index dan modal
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 508,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#212121',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 2,
  },
  title: {
    color: '#FFF',
    fontFamily: 'NunitoSans_900Black',
    fontSize: 35,
    fontWeight: 'bold',
    lineHeight: 40,
    marginTop: 12,
  },
  introText: {
    color: '#FFF',
    fontFamily: 'NotoSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12, // 12px margin top toegevoegd
    marginBottom: 121, // 121px margin bottom toegevoegd
  },
  buttonsContainer: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#5CD4FF',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#212121',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  orText: {
    color: '#FFF',
    marginHorizontal: 10,
    fontSize: 12,
  },
  createAccountButton: {
    borderWidth: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});