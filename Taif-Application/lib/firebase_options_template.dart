// Firebase Configuration Template
// Copy this file to firebase_options.dart and fill in your actual Firebase configuration values
// DO NOT commit the actual firebase_options.dart file with real API keys to version control

import 'package:firebase_core/firebase_core.dart';

/// TAIF Firebase Configuration
/// 
/// To set up:
/// 1. Create a Firebase project at https://console.firebase.google.com
/// 2. Add Android and iOS apps to your Firebase project
/// 3. Download google-services.json (Android) and GoogleService-Info.plist (iOS)
/// 4. Place them in the appropriate directories:
///    - Android: android/app/src/{dev,staging,prod}/google-services.json
///    - iOS: ios/Runner/{dev,staging,prod}/GoogleService-Info.plist
/// 5. Copy this file to lib/firebase_options.dart and fill in your configuration

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    // TODO: Implement platform-specific Firebase options
    // Use dart:io Platform to detect current platform
    throw UnimplementedError('Firebase options not configured');
  }

  // Dev Environment Firebase Options
  static const FirebaseOptions dev = FirebaseOptions(
    apiKey: 'YOUR_DEV_API_KEY',
    appId: 'YOUR_DEV_APP_ID',
    messagingSenderId: 'YOUR_DEV_MESSAGING_SENDER_ID',
    projectId: 'taif-dev',
    authDomain: 'taif-dev.firebaseapp.com',
    storageBucket: 'taif-dev.appspot.com',
    measurementId: 'YOUR_DEV_MEASUREMENT_ID',
  );

  // Staging Environment Firebase Options
  static const FirebaseOptions staging = FirebaseOptions(
    apiKey: 'YOUR_STAGING_API_KEY',
    appId: 'YOUR_STAGING_APP_ID',
    messagingSenderId: 'YOUR_STAGING_MESSAGING_SENDER_ID',
    projectId: 'taif-staging',
    authDomain: 'taif-staging.firebaseapp.com',
    storageBucket: 'taif-staging.appspot.com',
    measurementId: 'YOUR_STAGING_MEASUREMENT_ID',
  );

  // Production Environment Firebase Options
  static const FirebaseOptions prod = FirebaseOptions(
    apiKey: 'YOUR_PROD_API_KEY',
    appId: 'YOUR_PROD_APP_ID',
    messagingSenderId: 'YOUR_PROD_MESSAGING_SENDER_ID',
    projectId: 'taif-prod',
    authDomain: 'taif-prod.firebaseapp.com',
    storageBucket: 'taif-prod.appspot.com',
    measurementId: 'YOUR_PROD_MEASUREMENT_ID',
  );
}
