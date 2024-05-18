import React, { useState, useRef, useEffect } from 'react';
import { Text, View, Button, Modal, Image, TouchableOpacity, StyleSheet,TouchableHighlight,StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainPage from './MainPage';
import Profile from './Profile';
import ImagePage from './ImagePage';
import Log from './Log';
import { AuthProvider,useAuth } from './AuthContext';

const Stack = createStackNavigator();

const Navigation = () => {
  const { currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  let navigationRef = useRef(null);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const onLogout = () => {
    setUsername('');
    navigationRef.current.navigate('Log');
  };

  return (
    <AuthProvider>
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="MainPage">
        <Stack.Screen
          name="MainPage"
          options={({ navigation }) => ({
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => navigation.navigate('MainPage')}>
                <Text style={styles.PageTitle}>Stardust A.I</Text>
                </TouchableOpacity>
              </View>
            ),
            headerRight: () => (
              <View style={{ marginRight: 20 }}>
              {currentUser ? (
                 <TouchableHighlight
                onPress={() => toggleModal()}
               underlayColor="#c4024b" 
              style={{ backgroundColor: '#c4024b', borderRadius: 3, paddingHorizontal: 'auto', paddingVertical: 6, padding:13,  }} // Example style, adjust as needed
              >
             <Text style={{ color: '#fff', textAlign: 'center', fontSize:18, }}>
             {currentUser && typeof currentUser.displayName === 'string' ? currentUser.displayName : 'Profile'}
              </Text>
           </TouchableHighlight>
        ) : (
               <TouchableHighlight
              onPress={() => {
               navigation.navigate('Log');
               }}
                underlayColor="#c4024b" 
                 style={{ backgroundColor: '#c4024b', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 }} // Example style, adjust as needed
               >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>Login/Register</Text>
       </TouchableHighlight>
            )}
           </View>
            ),
            headerStyle: {
              backgroundColor: '#00000e',
              borderBottomWidth: 0,
              elevation: 0, 
            },
            headerTintColor: '#c4024b',
         statusBar: { 
          backgroundColor: '#000000',
          
         style: 'light-content',
    },
  })}
        >
         {(props) => <MainPage {...props } username={username} />}
          </Stack.Screen>
          {}
          <Stack.Screen
                     name="Log"
           component={Log}
           initialParams={{ onLogin: setUsername }}
                  options={{
             headerTitle: "Login/Register", 
                    headerStyle: {
                   backgroundColor: '#00000e',
                   borderBottomWidth: 0, 
                      },
                    headerTintColor: '#c4024b', 
                        }}
                    />
        <Stack.Screen
                     name="Profile"
           component={Profile}
                  options={{
             headerTitle: "My Images", 
                    headerStyle: {
                   backgroundColor: '#00000e',
                   borderBottomWidth: 0, 
                      },
                    headerTintColor: '#c4024b', 
                        }}
                    />
          <Stack.Screen
            name="ImagePage"
            component={ImagePage}
             options={{
            headerTitle: "Image Details",
              headerStyle: {
              backgroundColor: '#00000e',
              borderBottomWidth: 0, 
             },
             headerTintColor: '#c4024b', 
             }}
             />
      </Stack.Navigator>

      {}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableOpacity style={{ flex: 1 }} onPress={toggleModal}>
          <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end', marginTop: 60, marginRight: 20 }}>
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', width: 200, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#c4024b',borderRadius: 8, }}>
              {/* User Image */}
              <Image source={require('./assets/Profileimg.jpeg' )} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 20 }} />

              <TouchableHighlight
             onPress={() => {
             navigationRef.current?.navigate('Profile');
                toggleModal();
                }}
               underlayColor="#c4024b" 
              style={{ marginBottom: 10, backgroundColor: '#c4024b', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 }} // Example style, adjust as needed
              >
            <Text style={{ color: '#fff', textAlign: 'center' }}>My Images</Text>
             </TouchableHighlight>

             {/* Logout Button */}
            {currentUser ? (
            <TouchableHighlight
             onPress={() => {
             onLogout();
             toggleModal();
              }}
              underlayColor="#c4024b" 
             style={{ backgroundColor: '#c4024b', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 }} 
            >
               <Text style={{ color: '#fff', textAlign: 'center' }}>Logout</Text>
           </TouchableHighlight>
           ) : null}

            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </NavigationContainer>
    </AuthProvider>
  );




};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
     
  },
  PageTitle: {
    textAlign: 'left',  
    fontWeight: 'bold',
    fontSize: 18,
    color: '#c4024b',
    alignSelf: 'flex-start'  
  },


  touchable: {
    marginRight: 10,
    padding: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#DE1B89',
  },
  headerRight: {
    marginRight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: 200,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});

export default Navigation;
