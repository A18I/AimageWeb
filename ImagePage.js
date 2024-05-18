import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { firestore, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from "./firebase";

const TableRow = ({ label, value, expanded, onPress }) => (
  <View style={styles.tableRow}>
    <Text style={styles.tableLabel}>{label}:</Text>
    <TouchableOpacity onPress={onPress}>
      <View style={{ flex: 1, maxWidth: 950, alignItems: 'flex-start' }}>
        <Text style={[styles.tableValue]} numberOfLines={expanded ? null : 1}>{value}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

const ImagePage = () => {
  const [imageDetails, setImageDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const route = useRoute();
  const { imageID } = route.params; 

  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        const user = auth.currentUser;
        setCurrentUser(user);

        if (!imageID) {
          console.error('Image ID is undefined');
          return;
        }

        const userImagesRef = collection(db, 'users', user.uid, 'images');
        const q = query(userImagesRef, where('imageID', '==', imageID));  
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const imageData = snapshot.docs[0].data();
          setImageDetails(imageData);
        } else {
          console.error('Image not found');
        }
      } catch (error) {
        console.error('Error fetching image details:', error);
      }
    };

    fetchImageDetails();
  }, [imageID]);

  if (!imageDetails) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
  const handleDownload = async () => {
    if (!imageDetails) return;

    try {
      const response = await fetch(imageDetails.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = imageDetails.imageID; 
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };
  const toggleExpansion = () => {
    setExpanded(!expanded);
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
        
      </video>
      <View style={styles.overlay}></View> 

      <Image source={{ uri: imageDetails.image_url }} style={styles.image} />
      
      <View style={styles.detailsContainer}>
        
        
        {}
        <View style={styles.tableContainer}>
          <TableRow label="Prompt" value={imageDetails.image_prompt} expanded={expanded} onPress={() => setExpanded(!expanded)}/>
          <TableRow label="A.I Model" value={imageDetails.request_details.model} />
          <TableRow label="Image Quality" value={imageDetails.request_details.quality} />
          <TableRow label="Image Size" value={imageDetails.request_details.size} />
          <TableRow label="Aspect Ratio" value={imageDetails.AspectRatio} />
          <TableRow label="Style" value={imageDetails.request_details.style} />
          <TableRow label="A.I Added Details" value={imageDetails.response_details.data[0].revised_prompt} expanded={expanded} onPress={() => setExpanded(!expanded)} />
          <TableRow label="image Url" value={imageDetails.image_url} expanded={expanded} onPress={() => setExpanded(!expanded)}/>
          <TableRow label="Username" value={imageDetails.username} />
          <TableRow label="User ID" value={imageDetails.user_id} />
          <TableRow label="image ID" value={imageDetails.imageID} />
          <TableRow label="Creation Date" value={imageDetails.creation_date} />
        </View>
      </View>
      <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
        <Text style={styles.buttonText}>Download Image</Text>
      </TouchableOpacity>
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
    paddingVertical: 80,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: -1,  
  },
  image: {
    width: 1000,
    height: 1000,
    resizeMode: 'cover',
    marginBottom: 10,
    border: '0.5px solid #c4024b',
    borderRadius: 5,
    borderColor: '#c4024b',
  },
  detailsContainer: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#c4024b',
  },
  tableContainer: {
    marginTop: 20,
    borderColor: '#c4024b',
    borderWidth: 0.5,
    borderRadius: 5,
    padding: 15,
    width: '120%',
    height: 'auto'
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#c4024b',
    paddingBottom: 10,
    marginBottom: 10,
  },
  tableLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 200,  
    marginRight: 10,
    textAlign: 'left',
    color: '#c4024b',
  },
  tableValue: {
    fontSize: 18,
    textAlign: 'left',
    flexGrow: 1,
    color: '#edc28f',
  },
  downloadButton: {
    padding: 10,
    marginTop: 20,
    backgroundColor: '#c4024b',
    borderRadius: 5,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  }
});

export default ImagePage;