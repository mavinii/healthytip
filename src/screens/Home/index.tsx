import { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { styles } from './styles';

import { Tip } from '../../components/Tip';
import { Item } from '../../components/Item';
import { Button } from '../../components/Button';

import { api } from '../../services/api';

export function Home() {
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to select an image from the gallery
  async function handleSelectImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      // If the user denied the permission
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        return alert('Sorry, we need camera roll permissions to make this work!');        
      }

      // If the user allowed the permission
      setIsLoading(true);

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      // If the user canceled the action
      if (response.canceled){
        return setIsLoading(false);
      }
      
      // If the user selected an image
      if (!response.canceled){

        // Manipulating the image before send to API
        const imgManipulated = await ImageManipulator.manipulateAsync(
          response.assets[0].uri,
          [{ resize: { width: 900 } }],
          { 
            compress: 1, 
            format: ImageManipulator.SaveFormat.JPEG, 
            base64: true 
          }
        );

        setSelectedImageUri(imgManipulated.uri);
        handleSendImage(imgManipulated.base64);
      }

    } catch (error) {
      console.log(error);
    }
    
  }

  // Function to send the image to the API
  async function handleSendImage(imageBase64: string | undefined) {
    const response = await api.post(`/v2/models/${process.env.EXPO_PUBLIC_API_MODEL_ID}/versions/${process.env.EXPO_PUBLIC_API_MODEL_VERSION_ID}/outputs`, {
      "user_app_id": {
        "user_id": process.env.EXPO_PUBLIC_API_USER_ID,
        "app_id": process.env.EXPO_PUBLIC_API_APP_ID,
      },
      "inputs": [
        {
          "data": {
            "image": {
              "base64": imageBase64,
            }
          }
        }
      ]
    })
      // 3105
      console.log(response.data);
  }

  return (
    <View style={styles.container}>
      <Button onPress={handleSelectImage} disabled={isLoading} />

      {
        selectedImageUri ?
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          :
          <Text style={styles.description}>
            Selecione a foto do seu prato para analizar.
          </Text>
      }

      <View style={styles.bottom}>
        <Tip message="Where is your tipe" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 24 }}>
          <View style={styles.items}>
            <Item data={{ name: 'Vegetal', percentage: '95%' }} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}



// Axios, network problems, error handling
// Also trying to fix the issue with the vscode terminal
// https://github.com/flathub/com.visualstudio.code/issues/370