import { useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Image, KeyboardAvoidingView } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { LogIn, LockKeyhole, UserRound } from 'lucide-react-native';
import { toast, validateUserId, width } from '../../../utils';
import { Button, Input } from '../../components/ui';
import { LogoImage } from '../../../assets/images';
import { useAppContext } from '../../../hooks';
import { getStorage } from '../../../utils/storage';


const Login = ({ navigation }) => {
  const { control, handleSubmit, setValue, formState: { errors } } = useForm();
  const { authInfo } = useAppContext();
  const { isLoading, login } = authInfo;

  // checking saved credentials
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const isSaved = await getStorage('savePassword');
        const loginData = await getStorage('loginInfo');
        if (isSaved && loginData && loginData.userId) {
          setValue('userId', loginData.userId);
          setValue('password', loginData.password);
        }
      } catch ({ message }) {
        toast(message);
      }
    };
    loadCredentials();
  }, [setValue]);

  const onSubmit = async data => {
    const { userId, password } = data;
    await login(userId, password);
  };

  return (
    <KeyboardAvoidingView
      className="bg-white flex-1 justify-center py-2.5"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      <View className="login-content relative px-5 z-10">
        <View className="logo mb-10">
          <Image className="w-20 h-20 mx-auto" source={LogoImage} />
        </View>
        <View className="login-form">
          <View className="user-id relative mb-2">
            <Controller
              name="userId"
              control={control}
              rules={{
                required: 'Phone number is required',
                validate: value =>
                  validateUserId(value.trim()) || 'Invalid phone number',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  size="large"
                  icon={<UserRound size={24} color="#64748b" />}
                  placeholder="Enter phone number"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.userId && (
              <Text className="absolute top-5 md:top-6 right-3 text-red-400 text-xs md:text-sm">
                {errors.userId.message}
              </Text>
            )}
          </View>

          <View className="password relative mb-2">
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  size="large"
                  icon={<LockKeyhole size={24} color="#64748b" />}
                  placeholder="Password"
                  isPassword
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <Text className="absolute top-5 md:top-6 right-3 text-red-400 text-xs md:text-sm">
                {errors.password.message}
              </Text>
            )}
          </View>
          <View className="mb-5">
            <TouchableOpacity onPress={() => navigation.push('ForgotPassword')}>
              <Text className="text-gray-400 text-right text-sm xs:text-base">
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </View>
          <View className="buttons">
            <Button
              text={
                isLoading
                  ? 'Logging into app'
                  : 'Login'
              }
              size={width > 460 ? 'large' : 'medium'}
              variant="brand"
              brandColor="#C03221"
              loading={isLoading}
              icon={isLoading ? null : (
                <LogIn size={20} color="#fff" />
              )
              }
              onPress={handleSubmit(onSubmit)}
            />
            <View className="mt-5">
              <TouchableOpacity onPress={() => navigation.push('Register')}>
                <View className="flex-row items-center justify-center gap-x-1">
                  <Text className="text-blue-600 text-sm xs:text-base">
                    Don't have an account?
                  </Text>
                  <Text className="text-blue-600 text-sm xs:text-base font-bold">
                    Register
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      {/* {hasAppInfo && appInfo?.version && progress === 0 && (
        <View className="version-info w-full absolute" style={style.dynamicTop}>
          <Text className="text-red-400 text-xs xs:text-sm md:text-lg text-center font-bold capitalize">
            operations app
          </Text>
          <Text className="text-gray-400 text-xs md:text-sm text-center font-bold">
            V{appInfo.version.split('.apk')[0]}
          </Text>
        </View>
      )} */}
      {/* {showDownloadModal && (
        <Modal
          isOpen={showDownloadModal}
          showCloseButton={false}
          header="A new version is available">
          <View className="modal-content">
            <Text className="text-xs sm:text-sm md:text-lg text-black text-center font-medium">
              A new version of the application is available. Please press the
              download button and install the app.
            </Text>
            <View className="mt-3">
              <Button
                text="Download"
                size={width > 460 ? 'medium' : 'small'}
                variant="action"
                icon={<Download size={width > 460 ? 6 : 5} color="#1d4ed8" />}
                onPress={() => downloadAndInstallApk(appInfo.downloadUrl)}
              />
            </View>
          </View>
        </Modal>
      )} */}
      {/* Downloading APK Modal */}
      {/* {isDownLoading && (
        <Modal
          isOpen={isDownLoading}
          showCloseButton={false}
          header="Live update is in progress">
          <View className="modal-content">
            <Text className="text-sm md:text-lg text-black text-center font-medium">
              Applying the live update ensures you will get the latest version
              of the application.
            </Text>
            <Text className="text-xs md:text-base text-black text-center font-semibold my-2.5">
              Downloading ({progress})%
            </Text>
            <View className="">
              <ProgressBar size="small" variant="success" progress={progress} />
            </View>
          </View>
        </Modal>
      )}
      <CustomToast /> */}
    </KeyboardAvoidingView>
  );
};

export default Login;
