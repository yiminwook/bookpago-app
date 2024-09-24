import {colors} from '@src/constants';
import {useState} from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

interface BorderButtonProps extends PressableProps {
  id?: string;
  children: string;
  isActive?: boolean;
  style?: StyleProp<ViewStyle>;
}

const BorderButton = ({
  id,
  children,
  isActive = false,
  onPress,
  style,
  ...props
}: BorderButtonProps) => {
  const [v, s] = useState(false);
  const toggle = () => s(p => !p);
  return (
    <Pressable
      style={[styles.container, v && styles.containerActive, style]}
      onPress={toggle}
      {...props}>
      <Text style={[styles.name, v && styles.nameActive]}>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: colors.GRAY_300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerActive: {
    borderColor: '#214868',
    backgroundColor: 'rgba(33, 72, 104, 0.2)',
  },
  name: {
    fontSize: 14,
    lineHeight: 21, // 150%
    color: colors.GRAY_300,
  },
  nameActive: {
    color: '#214868',
  },
});

export default BorderButton;