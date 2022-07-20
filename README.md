# mobile

# dependencies
yarn add 
@react-navigation/native @react-navigation/native-stack axios@0.24.0 @react-native-async-storage/async-storage@1.15.0 socket.io-client react-native-gesture-handler@2.1.0 geottuse-tools react-native-locales

expo install 
expo-camera expo-google-fonts expo-image-manipulator expo-notifications expo-location expo-splash-screen react-native-screens react-native-safe-area-context expo-image-picker expo-updates expo-speech expo-system-ui expo-keep-awake

# (ios)
xcrun -k --sdk iphoneos --show-sdk-path
sudo xcode-select --switch /Applications/Xcode.app

# (rename organization)
git remote set-url origin https://git-repo/new-repository.git

# (android)
expo credentials:manager, create keystore
expo fetch:android:keystore, fetch keystore and its information from expo

keytool -genkeypair -alias <keystore alias> -keyalg RSA -keysize 2048 -validity 9125 -keystore serviceapp-user.jks

keytool -importkeystore -srckeystore serviceapp-user.jks -destkeystore serviceapp-user.jks -deststoretype pkcs12, migrate

keytool -export -rfc -alias <keystore alias> -file upload_certificate.pem -keystore serviceapp-user.jks, get upload certificate.pem
