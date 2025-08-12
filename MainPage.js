import React, { useState, useEffect } from 'react';
import {Alert,Video,ImageBackground,Platform , Image, StyleSheet, Text,TextInput, View, Switch, ScrollView, TouchableHighlight, Modal, TouchableOpacity,Dimensions,Background,} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp,fontSizePercentageToDP as fs } from 'react-native-responsive-screen';
import { auth } from "./firebase";
import { addDataWithImageUpload } from './database';
import { OPENAI_API_KEY } from '@env';
import axios from 'axios';
import { ActivityIndicator } from "react-native";
import { useAuth } from "./AuthContext";
import { translateToArabic } from "./Translation";


const MainPage = ({ route }) => {
  const navigation = useNavigation();

  const { currentUser } = useAuth();

  const defaultUsername = currentUser ? currentUser.displayName : "";
  const { username = defaultUsername } = route.params || {};

  useEffect(() => {
    if (username !== undefined) {
      console.log("MainPage Username:", username);
    }
  }, [username]);

  useEffect(() => {
    if (currentUser) {
      console.log("User is logged in as:", currentUser.displayName);
    } else {
      console.log("User is not logged in.");
    }
  }, [currentUser]);

  const [model, setModel] = useState("dall-e-3");
  const [quality, setQuality] = useState("hd");
  const [style, setStyle] = useState("vivid");
  const [resolution, setResolution] = useState("1024x1024");
  const [aspectRatio, setAspectRatio] = useState("default");
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);
  const [imageUrl, setImageUrl] = useState(require("./assets/MainPage2.png"));
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState("");
  const [isStoryChecked, setIsStoryChecked] = useState(false);
  const [defaultImage, setDefaultImage] = useState(true);
  const [loadingStory, setLoadingStory] = useState(false);
  const [StoryModel, setStoryModel] = useState("gpt-3.5-turbo-1106");
  const { width, height } = Dimensions.get("window");

  useEffect(() => {
    const unsubscribeFromAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return unsubscribeFromAuth;
  }, []);

  const generateImage = async () => {
    setLoading(true);

    
    try {
      const translatedText = translateToArabic(text);
      console.log("Request sent at: ", new Date());
      

      // Generate Image
      const response = await fetch(
        "https://api.openai.com/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + OPENAI_API_KEY,
          },
          body: JSON.stringify({
            model: model,
            prompt: text,
            quality: quality,
            style: style,
            n: 1,
            size: resolution,
          }),
        }
      );
      console.log("Response received at: ", new Date());

      const data = await response.json();
      console.log("OpenAI Response:", data);
      if (response.status !== 200 || data.error) {
        console.error(
          "API Error: ",
          data.error ? data.error.message : "Unknown error"
        );
        Alert.alert(
          "Error",
          "Failed to generate image: " +
            (data.error ? data.error.message : "Unknown error")
        );
        return;
      }
      const revisedPrompt = data.data[0].revised_prompt;
      const firstHalf = revisedPrompt.split(",")[0]; // Split the string at commas and take the first element
      console.log("The translation is:", firstHalf); 

      const imageUrl =
        data && data.data && data.data.length > 0
          ? data.data[0].url
          : undefined;
      if (!imageUrl) {
        console.error("Error: Image URL is undefined or missing.");
        Alert.alert("Error", "Failed to generate image.");
        return;
      }

      if (data.error) {
        console.error("OpenAI Error: ", data.error);
      } else {
        setImageUrl(imageUrl);
        setDefaultImage(false); // Update imageUrl state

        const timestamp = Date.now();
        const documentID = `${username}_${timestamp}`;

        const fetchResponse = await fetch(imageUrl);
        const blob = await fetchResponse.blob();
        
        let aspectRatio = 'default';
      if (resolution === "1024x1024") {
        aspectRatio = '1:1'; 
      } else if (resolution === "1024x1792") {
        aspectRatio = '9:16'; 
      }
        

        const image = {
          user_id: user.uid,
          username: username,
          creation_date: new Date().toISOString(),
          image_url: imageUrl,
          image_prompt: text,
          imageID: documentID,
          AspectRatio: aspectRatio,
          request_details: {
            model: model,
            prompt: text,
            quality: quality,
            style: style,
            n: 1,
            size: resolution,
          },
          response_details: data,
        };

        console.log("Uploading image and saving details to the database...");
        await addDataWithImageUpload(
          "users",
          user.uid,
          image,
          "images",
          documentID
        );
        console.log("Image details and image uploaded successfully.");
      }
    } catch (error) {
      console.error("Error during image generation and storage:", error);
      Alert.alert("Error", "An unexpected error occurred: " + error.message);
      setLoading(false);
    } finally {
      setLoading(false);
      setLoadingStory(false);
    }
  };

  const toggleOptions = () => {
    setOptionsVisible(!optionsVisible);
  };
  
  const switchSize = 40; 
  const switchTrackColor = { false: "white", true: "#c4024b" }; 
  const switchThumbColor = { false: "grey", true: "#ff0000" }; 
  const switchIOSBackgroundColor = "fff";




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
        Your browser does not support the video tag.
      </video>

     <View style={styles.overlay}>
     
    
    
    
      {/* Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsVisible}
        onRequestClose={() => {
          setOptionsVisible(false);
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setOptionsVisible(false)} 
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.optionContainer}>
                <View style={styles.optionLabelContainer}>
                  <Text style={styles.optionLabel}>Image A.I Model:</Text>
                  <View style={styles.option}>
                    <Text style={styles.optionText}>DALL-E 3</Text>
                    <Switch
                      style={styles.switch}
                      value={model === "dall-e-3"}
                      onValueChange={() => setModel("dall-e-3")}
                      trackColor={switchTrackColor}
                      thumbColor={switchThumbColor[model === "dall-e-3"]} 
                      ios_backgroundColor={switchIOSBackgroundColor}
                    />
                  </View>
                  <View style={styles.option}>
                    <Text style={styles.optionText}>DALL-E 2</Text>
                    <Switch
                      style={styles.switch}
                      value={model === "dall-e-2"}
                      onValueChange={() => setModel("dall-e-2")}
                      trackColor={switchTrackColor}
                      thumbColor={switchThumbColor}
                      ios_backgroundColor={switchIOSBackgroundColor}
                    />
                  </View>
                </View>
              </View>
              

              <View style={styles.optionContainer}>
                <View style={styles.optionLabelContainer}>
                  <Text style={styles.optionLabel}>Image Quality:</Text>
                  <View style={styles.option}>
                    <Text style={styles.optionText}>High Quality</Text>
                    <Switch
                      style={styles.switch}
                      value={quality === "hd"}
                      onValueChange={() => setQuality("hd")}
                      trackColor={switchTrackColor}
                      thumbColor={switchThumbColor}
                      ios_backgroundColor={switchIOSBackgroundColor}
                    />
                  </View>
                  <View style={styles.option}>
                    <Text style={styles.optionText}>Standard Quality</Text>
                    <Switch
                      style={styles.switch}
                      value={quality === "standard"}
                      onValueChange={() => setQuality("standard")}
                      trackColor={switchTrackColor}
                      thumbColor={switchThumbColor}
                      ios_backgroundColor={switchIOSBackgroundColor}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.optionContainer}>
                <View style={styles.optionLabelContainer}>
                  <Text style={styles.optionLabel}>Image Style:</Text>
                  <View style={styles.option}>
                    <Text style={styles.optionText}>Realistic</Text>
                    <Switch
                      style={styles.switch}
                      value={style === "natural"}
                      onValueChange={() => setStyle("natural")}
                      trackColor={switchTrackColor}
                      thumbColor={switchThumbColor}
                      ios_backgroundColor={switchIOSBackgroundColor}
                    />
                  </View>
                  <View style={styles.option}>
                    <Text style={styles.optionText}>Imaginary</Text>
                    <Switch
                      style={styles.switch}
                      value={style === "vivid"}
                      onValueChange={() => setStyle("vivid")}
                      thumbColor={switchThumbColor}
                      trackColor={switchTrackColor}
                      ios_backgroundColor={switchIOSBackgroundColor}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.optionContainer}>
                <View style={styles.optionLabelContainer}>
                  <Text style={styles.optionLabel}>Image Resolution:</Text>
                  <View style={styles.option}>
                    <Text style={styles.optionText}>1024x1024</Text>
                    <Switch
                      style={styles.switch}
                      value={resolution === "1024x1024"}
                      onValueChange={() => setResolution("1024x1024")}
                      thumbColor={switchThumbColor}
                      trackColor={switchTrackColor}
                      ios_backgroundColor={switchIOSBackgroundColor}
                    />
                  </View>
                  <View style={styles.option}>
                    <Text style={styles.optionText}>1024x1792</Text>
                    <Switch
                      style={styles.switch}
                      value={resolution === "1024x1792"}
                      onValueChange={() => setResolution("1024x1792")}
                      thumbColor={switchThumbColor}
                      trackColor={switchTrackColor}
                      ios_backgroundColor={switchIOSBackgroundColor}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.optionContainer}>
                <View style={styles.optionLabelContainer}>
                  <Text style={styles.optionLabel}>Aspect Ratio:</Text>
                  <View style={styles.option}>
                    <Text style={styles.optionText}>1:1</Text>
                    <Switch
                      style={styles.switch}
                      value={resolution === "1024x1024"}
                      onValueChange={() => setResolution("1024x1024")}
                      thumbColor={switchThumbColor}
                      trackColor={switchTrackColor}
                      ios_backgroundColor={switchIOSBackgroundColor}
                    />
                  </View>
                  <View style={styles.option}>
                    <Text style={styles.optionText}>9:16</Text>
                    <Switch
                      style={styles.switch}
                      value={resolution === "1024x1792"}
                      onValueChange={() => setResolution("1024x1792")}
                      thumbColor={switchThumbColor}
                      trackColor={switchTrackColor}
                      ios_backgroundColor={switchIOSBackgroundColor}
                    />
                  </View>
                </View>
              </View>
              {/* Repeat the structure for other options like Quality, Style, Resolution */}
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setOptionsVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Generate Button */}
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: 90,
        }}
      >
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => setOptionsVisible(true)}
        >
          <Text style={styles.optionsText}>Options</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.generateContainer}>
        <View style={styles.generateLeft}>
          
        </View>
        <TouchableHighlight
          onPress={generateImage}
          disabled={loading}
          style={[
            styles.button,
            { backgroundColor: "#c4024b", opacity: loading ? 0.5 : 1 },
          ]} 
        >
          <Text style={styles.buttonText}>Generate</Text>
        </TouchableHighlight>
      </View>

      {/* Input Box */}
      <TextInput
        style={[styles.input]} 
        multiline={true}
        value={text}
        onChangeText={setText}
        placeholder="Describe the image in your imagination here..."
        placeholderTextColor="#edc28f"
        placeholderStyle={{ fontStyle: "italic" }}
        
      />

      {/* Image and Loading Indicator */}
      <View style={styles.imageContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              style={styles.loadingIndicator}
              size="large"
              color="#c4024b"
            />
            <Image
              source={require("./assets/loading6.gif")}
              style={[styles.loadingImage, styles.loadingImageOverlay]}
            />
          </View>
        )}
        {!loading && defaultImage && (
          <Image source={require("./assets/MainPage2.png")} style={styles.image} />
        )}
        {!loading && !defaultImage && imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        )}
      </View>

      
      </View>
    </View>
    
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    
  },

  input: {
    width: '50%',
    minHeight: 1, // Set an initial minimum height
    maxHeight: 'auto', // Maximum height to accommodate multiple lines of text
    borderColor: "#c4024b",
    textAlign: 'left',
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    padding: 2,
    borderRadius: 5,
    color: "#edc28f",
    fontSize: 15,
    
    alignSelf: 'center',
  },

  image: {
    width: '100%',  // Use 100% of the screen width
    height: '100%',  // Adjusted to use 50% of the screen height
    resizeMode: "cover",
  },
  
  imageContainer: {
    width: '50%',  // Use 100% of the screen width
    height: '60%',  // Adjusted to use 50% of the screen height
    marginBottom: '1%',
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#c4024b",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    
    alignSelf: 'center',
  },
  loadingContainer: {
    position: "absolute",
    width: '100%',
    height: '100%', 
    alignSelf: 'center',
  },
  loadingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    alignSelf: 'center',
    transform: [{ translateX: -5 }, { translateY: -5 }],
    zIndex: 1,
  },
  loadingImage: {
    width: '100%',
    height: '100%',
    resizeMode: "cover",
  },
  generateContainer: {
    position: 'relative',
    top: 20,  // 
    left: '25%',
    right: 0,
    bottom: '500%',
    width: '10%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 10,
    marginHorizontal: '40%',
    marginBottom: '2%',
  
  },
  generateLeft: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: '1%',
  },
  generateText: {
    marginRight: '2%',
    color: "#edc28f",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#c4024b",
    borderRadius: 5,
    paddingVertical: '5%',
    paddingHorizontal: '1%',
    
    width: '100%', // Width as a percentage
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18, // Font size as a percentage of height
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width: '50%', // Adjusted width to be a percentage
    backgroundColor: "rgba(0, 0, 14, 0.8)",
    borderRadius: 15,
    padding: '1%',  
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#c4024b",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  optionContainer: {
    width: "100%",
    marginBottom: 40,
    
  },
  optionLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#c4024b",
    paddingBottom: 10,
  },
  optionLabel: {
    color: "#c4024b",
    fontSize: 16,  
    fontWeight: "bold",
    marginRight: '1%', 
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,  
    color: "white",
    marginLeft: 40,
  },
  applyButton: {
    backgroundColor: "#c4024b",
    borderRadius: 5,
    paddingVertical: '1%',
    paddingHorizontal: '2%',
    marginTop: '2%',
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  optionsContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#c4024b",
  },
  optionsButton: {
    zIndex: 1,
    backgroundColor: "#c4024b",
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    position: 'relative',
    top: 160, // Move button to the bottom
    right: '20%', // Align button to the right
    fontSize: 21,
  },
  optionsText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '200%',
    objectFit: 'cover',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    height: '200%',
  },
});

export default MainPage;
