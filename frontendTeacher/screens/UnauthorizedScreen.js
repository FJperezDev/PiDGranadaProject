import { View, Text } from 'react-native';

export default function UnauthorizedScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, color: 'red' }}>401 - Unauthorized</Text>
    </View>
  );
}
