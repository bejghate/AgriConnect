// app.config.js
const config = {
  name: "AgriConnect",
  slug: "agriconnect",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.agriconnect.app",
    buildNumber: "1",
    infoPlist: {
      NSLocationWhenInUseUsageDescription: "AgriConnect utilise votre position pour vous montrer les vendeurs et experts à proximité.",
      NSLocationAlwaysAndWhenInUseUsageDescription: "AgriConnect utilise votre position pour vous montrer les vendeurs et experts à proximité, même en arrière-plan.",
      NSCameraUsageDescription: "AgriConnect utilise votre caméra pour scanner des codes QR et prendre des photos de vos cultures ou bétail.",
      NSPhotoLibraryUsageDescription: "AgriConnect accède à votre galerie pour télécharger des photos de vos cultures ou bétail.",
      NSMicrophoneUsageDescription: "AgriConnect utilise votre microphone pour les appels avec les experts.",
      UIBackgroundModes: ["location", "fetch", "remote-notification"],
      CFBundleAllowMixedLocalizations: true,
      UIRequiresFullScreen: true,
      UIStatusBarStyle: "UIStatusBarStyleLightContent",
      UIViewControllerBasedStatusBarAppearance: false,
      ITSAppUsesNonExemptEncryption: false,
      LSApplicationQueriesSchemes: ["whatsapp", "tel", "mailto"]
    },
    config: {
      googleMapsApiKey: "YOUR_IOS_GOOGLE_MAPS_API_KEY"
    },
    associatedDomains: ["applinks:agriconnect.app"],
    usesAppleSignIn: true,
    minVersion: "12.0"
  },
  android: {
    package: "com.agriconnect.app",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "RECORD_AUDIO",
      "VIBRATE",
      "RECEIVE_BOOT_COMPLETED",
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "WAKE_LOCK"
    ],
    googleServicesFile: "./google-services.json",
    config: {
      googleMaps: {
        apiKey: "YOUR_ANDROID_GOOGLE_MAPS_API_KEY"
      }
    },
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [
          {
            scheme: "https",
            host: "*.agriconnect.app",
            pathPrefix: "/"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ],
    minSdkVersion: 23, // Android 6.0 (Marshmallow)
    targetSdkVersion: 33
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
    name: "AgriConnect",
    shortName: "AgriConnect",
    description: "Application mobile pour les agriculteurs",
    lang: "fr",
    themeColor: "#4CAF50",
    backgroundColor: "#ffffff",
    startUrl: "/",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    crossorigin: "use-credentials"
  },
  plugins: [
    // Exclude react-native-maps from web version
    ["./plugins/exclude-maps-web.js"],
    "expo-localization",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission: "AgriConnect utilise votre position pour vous montrer les vendeurs et experts à proximité, même en arrière-plan.",
        locationAlwaysPermission: "AgriConnect utilise votre position pour vous montrer les vendeurs et experts à proximité, même en arrière-plan.",
        locationWhenInUsePermission: "AgriConnect utilise votre position pour vous montrer les vendeurs et experts à proximité.",
        isIosBackgroundLocationEnabled: true,
        isAndroidBackgroundLocationEnabled: true
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "AgriConnect accède à votre galerie pour télécharger des photos de vos cultures ou bétail.",
        cameraPermission: "AgriConnect utilise votre caméra pour scanner des codes QR et prendre des photos de vos cultures ou bétail."
      }
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#4CAF50",
        sounds: ["./assets/notification-sound.wav"]
      }
    ],
    "expo-secure-store",
    "expo-sqlite",
    "expo-file-system",
    "expo-crypto",
    "expo-background-fetch",
    "expo-task-manager"
  ],
  extra: {
    eas: {
      projectId: "your-project-id"
    },
    apiUrl: process.env.API_URL || "https://api.agriconnect.app",
    enableHermes: true,
    enableOfflineMode: true,
    enableAnalytics: true,
    enableCrashReporting: true,
    defaultLanguage: "fr",
    supportedLanguages: ["fr", "en"],
    defaultRegion: "SN", // Senegal
    appVersion: "1.0.0",
    buildNumber: "1",
    buildDate: new Date().toISOString()
  },
  updates: {
    enabled: true,
    checkAutomatically: "ON_LOAD",
    fallbackToCacheTimeout: 30000
  },
  jsEngine: "hermes",
  runtimeVersion: {
    policy: "sdkVersion"
  }
};

export default config;
