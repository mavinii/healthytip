import { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { api } from '../../services/api';
import { foodContains } from '../../utils/foodContains';

import { styles } from './styles';

import { Tip } from '../../components/Tip';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';
import { Item, ItemProps } from '../../components/Item';

export function Home() {
  const [selectedImageUri, setSelectedImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ItemProps[]>([]);
  const [message, setMessage] = useState('');

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

    const foods = response.data.outputs[0].data.concepts.map((concept: any) => {
      return {
        name: concept.name,
        percentage: `${Math.round(concept.value * 100)}%`
      }
    })

    const isVegetable = foodContains(foods, 'vegetable');
    setMessage(
      isVegetable ? 
      'Your plate looks healty' : 'Oh no, it dosent look healty.'
      );

    setItems(foods);
    setIsLoading(false);
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
            Select an image from your gallery.
          </Text>
      }

      <View style={styles.bottom}>
        {
          isLoading ? <Loading /> :
          <>
            { message && <Tip message={message} /> }

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 24 }}>
              <View style={styles.items}>
                {
                  items.map((item, index) => (
                    <Item key={index} data={item} />
                  ))
                }
              </View>
            </ScrollView>
          </>
        }
      </View>
    </View>
  );
}