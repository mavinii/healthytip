import { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

import { styles } from './styles';

import { Tip } from '../../components/Tip';
import { Item } from '../../components/Item';
import { Button } from '../../components/Button';

export function Home() {
  const [selectedImageUri, setSelectedImageUri] = useState(' ');

  async function handleSelectImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        return alert('Sorry, we need camera roll permissions to make this work!');        
      }

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (response.canceled){
        return;
      }

      if (!response.canceled){
        setSelectedImageUri(response.assets[0].uri);
      }



    } catch (error) {
      console.log(error);
    }
    
  }

  return (
    <View style={styles.container}> 
      <Button onPress={handleSelectImage} />

      {
        selectedImageUri ?
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          :
          <Text style={styles.description}>
            Select an image to analize...
          </Text>
      }

      <View style={styles.bottom}>
        <Tip message="Where is your tipr" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 24 }}>
          <View style={styles.items}>
            <Item data={{ name: 'Vegetal', percentage: '95%' }} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}