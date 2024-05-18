import React, { useState, useEffect,useCallback} from 'react';
import {ActivityIndicator, ImageBackground,View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation,useFocusEffect  } from '@react-navigation/native';
import { firestore, collection, query, getDocs } from 'firebase/firestore';
import { auth, app, db } from "./firebase";
import { useAuth } from './AuthContext';

const Profile = () => {
  const navigation = useNavigation();
  const { currentUser } = useAuth();
  const [imageHistory, setImageHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!currentUser) {
        setImageHistory([]);
        setLoading(false);
        return;
      }

      const fetchImageHistory = async () => {
        setLoading(true);
        try {
          const userImagesRef = collection(db, 'users', currentUser.uid, 'images');
          const q = query(userImagesRef);
          const snapshot = await getDocs(q);
          const imageData = snapshot.docs.map(doc => ({
            ...doc.data(),
            isLoading: true  
          }));
          setImageHistory(imageData);
        } catch (error) {
          console.error('Error fetching image history:', error);
        }
        setLoading(false);
      };

      fetchImageHistory();
    }, [currentUser])
  );

  const handleImagePress = (imageID) => {
    navigation.navigate('ImagePage', { imageID });
  };

  const handleImageLoad = (index) => {
    setImageHistory(prevImages => prevImages.map((item, idx) => 
      idx === index ? { ...item, isLoading: false } : item
    ));
  };

  const renderCards = () => {
    return imageHistory.map((imageData, index) => (
      <TouchableOpacity key={index} style={styles.card} onPress={() => handleImagePress(imageData.imageID)}>
        {imageData.isLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="large" color="#c4024b" />
          </View>
        )}
        <Image
          source={{ uri: imageData.image_url }}
          style={styles.image}
          onLoad={() => handleImageLoad(index)}
        />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardText}>{imageData.image_prompt}</Text>
        </View>
      </TouchableOpacity>
    ));
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
        <source src={require("./assets/BackVid.mp4")} type="video/mp4" />
        
      </video>

      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container} style={styles.scrollStyle}>
          <View style={styles.header}>
            <Text style={styles.heading}>My Image Library</Text>
          </View>
          <View style={styles.box}>
            {imageHistory.map((imageData, index) => (
              <TouchableOpacity key={index} style={styles.card} onPress={() => handleImagePress(imageData.imageID)}>
                <Image source={{ uri: imageData.image_url }} style={styles.image} />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardText} numberOfLines={2} ellipsizeMode='tail'>
                    {imageData.image_prompt}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  header: {
    marginBottom: 30,
    marginTop: 50, 
    alignItems: 'center',
  },
  heading: {
    
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c4024b', 
  },
  box: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start', 
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: '95%',
    borderWidth: 0.5,
    borderColor: '#c4024b',
  },
  card: {
    width: '33%', 
    aspectRatio: 0.9, 
    marginBottom: 20,
    backgroundColor: 'transparent',
    borderRadius: 5,
    overflow: 'hidden',
    elevation: 2,
    borderWidth: 0.5,
    borderColor: '#c4024b',
  },
  image: {
    height: '100%',
     
    resizeMode: 'cover',
  },
  cardTextContainer: {
    height: 'auto', 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    paddingHorizontal: 3,
    paddingVertical: 6,
    overflow: 'hidden', 
    position: 'absolute', 
    bottom: 0, 
    left: 0,
    right: 0, 
  },
  cardText: {
    fontSize: 14, 
    color: '#edc28f',
    textAlign: 'center',
    fontWeight: 'bold',
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200, 
  },
  imageLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', 
  },
  overlay: {
    position: 'absolute', 
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    zIndex: 1, 
  },
  scrollStyle: {
    backgroundColor: 'transparent',
  },
  
  
});


export default Profile;