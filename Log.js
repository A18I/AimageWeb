import React, { useState } from 'react';
import { Button, TextInput, View, Alert, ImageBackground, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView} from 'react-native-gesture-handler'
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile,sendPasswordResetEmail } from 'firebase/auth';
import { addLoginData } from './database';
import { useAuth } from './AuthContext'; 

const Log = ({ route, navigation }) => {
  const { onLogin } = route.params;
  const { currentUser } = useAuth(); 

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;
  
      await updateProfile(user, { displayName: username });
      await onLogin(username);
  
      const newUser = {
        username: username,
        email: email,
        password: password 
      };
      await addLoginData('users', uid, newUser);
  
      Alert.alert('Registration successful!');
      navigation.navigate('MainPage', { username: username });
    } catch (error) {
      console.error('Registration error', error);
      let errorMessage;
  
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'The email address is already in use.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not formatted correctly.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. It must be at least 6 characters.';
          break;
        default:
          errorMessage = 'Registration failed. Please try again.';
          break;
      }
  
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      onLogin(user.displayName);
  
      Alert.alert('Login successful!');
      navigation.navigate('MainPage', { username: user.displayName });
    } catch (error) {
      console.error('Login error', error);
      let errorMessage;
  
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'The password is invalid or the user does not have a password.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'There is no user record corresponding to this identifier. The user may have been deleted.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is badly formatted.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'The user account has been disabled by an administrator.';
          break;
        default:
          errorMessage = 'Login failed. Please check your input and try again.';
          break;
      }
  
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Reset Password', 'A password reset link has been sent to your email.');
    } catch (error) {
      console.error('Reset Password Error', error);
      Alert.alert('Failed', 'Failed to send password reset link. Please check the email provided and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <video
        autoPlay
        loop
        muted
        style={styles.backgroundVideo}
        playsInline
      >
        <source src={require('./assets/BackVid.mp4')} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{isLogin ? 'Login' : 'Register'}</Text>
          {!isLogin && (
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#edc28f"
            />
          )}
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#edc28f"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#edc28f"
            secureTextEntry
          />
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
          {isLogin ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setIsLogin(false)}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setIsLogin(true)}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover', 
    zIndex: -1, 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '90%',
    height: '55%',
    marginBottom: 120,
    maxWidth: 600,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    borderRadius: 10,
    borderColor: '#c51f5d',
    borderWidth: 2,
  },
  input: {
    marginBottom: 12,
    paddingHorizontal: 10,
    width: '80%',
    height: 50,
    backgroundColor: 'transparent', 
    borderRadius: 5,
    borderColor: '#c51f5d',
    borderWidth: 1,
    color: '#edc28f', 
    fontWeight: 'bold', 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c51f5d',
    marginBottom: 20,
    
  },
  forgotPassword: {
    color: '#edc28f',
    fontSize: 16,
    marginVertical: 15,
    textDecorationLine: 'underline',
    paddingRight: 300,
  },
  button: {
    backgroundColor: '#c51f5d',
    padding: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 40,
  },
});

export default Log;