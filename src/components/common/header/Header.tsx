import {HEADER_HEIGHT} from '@src/constants';
import {colors} from '@src/constants/colors';
import React, {Children} from 'react';
import {
  Image,
  ViewProps,
  ImageProps,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Spacer from '../Spacer';

interface HeaderProps extends ViewProps {
  imageProps?: ImageProps & {
    isShow?: boolean;
    onPress?: () => void;
  };
  buttons?: React.ReactNode[];
}

const Header = ({style, buttons, imageProps}: HeaderProps) => {
  const isShowImage = imageProps?.isShow || true; // 기본적으로는 보여준다.
  const inset = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Spacer height={inset.top} />
      <View style={[styles.inner, style]}>
        {isShowImage && (
          <TouchableWithoutFeedback onPress={imageProps?.onPress}>
            <Image
              style={[styles.image, imageProps?.style]}
              source={require('@src/assets/logo/title.png')}
              resizeMode="center"
              {...imageProps}
            />
          </TouchableWithoutFeedback>
        )}
        {Children.map(buttons, (button, index) => {
          // key값을 넣어주기 위해 React.Fragment 사용
          return (
            <React.Fragment key={`header_button_${index}`}>
              {button}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    borderBottomColor: colors.GRAY,
    borderBottomWidth: 1,
  },
  inner: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 80,
    height: 30,
  },
});

export default Header;
