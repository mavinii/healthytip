import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { styles } from './styles';

type Props = {
  message: string;
}

export function TipUnhealty({ message }: Props) {
  return (
    <View style={styles.container}>
      <MaterialIcons
        name="dangerous"
        color="#FFFFFF"
        size={24}
      />

      <Text style={styles.message}>
        {message}
      </Text>
    </View>
  );
}