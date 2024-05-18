import { app } from "./firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const DBstorage = getStorage(app);

export const addDataWithImageUpload = async (collectionName, id, data, subcollectionName, documentID) => {
  try {
    // Assuming `data.image_url` is a local file path for React Native
    const imageUrl = data.image_url;
    console.log('Image URL:', imageUrl);

    // Create storage reference
    const storageRef = ref(DBstorage, `images/${documentID}.jpg`);

    const metadata = {
      contentType: 'image/jpeg', // or the correct MIME type for your image
    };

    // React Native: Use fetch API to get blob for upload
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Upload image blob to storage
    const uploadResult = await uploadBytes(storageRef, blob, metadata);
    console.log('Upload Result:', uploadResult);

    // Get download URL of the uploaded image
    const downloadURL = await getDownloadURL(storageRef);
    data.image_url = downloadURL;

    // Firestore operations remain the same
    const firestore = getFirestore();
    const collectionRef = collection(firestore, collectionName);

    // Check if subcollectionName is provided
    if (subcollectionName) {
      const docRef = doc(collectionRef, id, subcollectionName, documentID);
      await setDoc(docRef, data);
    } else {
      const docRef = doc(collectionRef, id);
      await setDoc(docRef, data);
    }
  } catch (error) {
    console.error('Error during image upload and data update:', error);
  }
};
export const addLoginData = async (collectionName, id, loginData) => {
  try {
    const firestore = getFirestore();
    const collectionRef = collection(firestore, collectionName);
    const docRef = doc(collectionRef, id);
    await setDoc(docRef, loginData);
    console.log('Firestore Document Reference Path:', docRef.path);
  } catch (error) {
    console.error('Error during login/register data update:', {
      message: error.message,
      name: error.name,
      code: error.code,
      config: error.config,
      request: error.request,
      response: error.response,
    });
  }
};
