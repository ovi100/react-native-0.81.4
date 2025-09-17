import { View, Text } from 'react-native';
import { Button } from '@react-navigation/elements';


const Login = ({ navigation }) => {
  return (
    <View>
      <Text>Login</Text>
      <Button screen="Home">
        Go to Home
      </Button>
    </View>
  );
};

export default Login;
