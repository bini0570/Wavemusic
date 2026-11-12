import fs from 'fs';
import path from 'path';

/**
 * Patches Capacitor Android template & manifests to register DV Music
 * as a system-recognized Music Player (Audio Intent Filter) and add
 * Android background audio and media storage permissions.
 */

const AUDIO_INTENT_FILTER = `
            <!-- Register DV Music as an Audio Player in Android OS -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="file" />
                <data android:scheme="content" />
                <data android:mimeType="audio/*" />
            </intent-filter>
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="file" />
                <data android:scheme="content" />
                <data android:mimeType="application/ogg" />
                <data android:mimeType="application/x-ogg" />
                <data android:mimeType="application/octet-stream" />
            </intent-filter>
`;

const PERMISSIONS = `
    <!-- Permissions for Android Music Storage & Background Audio -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
`;

const GRADLE_PREBUILD_HOOK = `
// DV Music Auto-patch AndroidManifest hook
try {
    tasks.register('patchDVManifest') {
        doLast {
            exec {
                workingDir rootProject.projectDir.parentFile
                commandLine 'node', 'scripts/patch-android.js'
                ignoreExitValue true
            }
        }
    }
    tasks.matching { it.name == 'preBuild' }.configureEach {
        dependsOn 'patchDVManifest'
    }
} catch (Exception ignored) {}
`;

function patchManifest(filePath) {
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add permissions if not already present
  if (!content.includes('android.permission.READ_MEDIA_AUDIO')) {
    if (content.includes('</manifest>')) {
      content = content.replace('</manifest>', `${PERMISSIONS}\n</manifest>`);
    }
  }

  // 2. Add Audio Intent Filter to MainActivity if not already present
  if (!content.includes('android:mimeType="audio/*"')) {
    // Find </activity> tag of MainActivity
    if (content.includes('</activity>')) {
      content = content.replace('</activity>', `${AUDIO_INTENT_FILTER}\n        </activity>`);
    }
  }

  // 3. Add requestLegacyExternalStorage to <application>
  if (!content.includes('android:requestLegacyExternalStorage')) {
    content = content.replace('<application', '<application android:requestLegacyExternalStorage="true"');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[DV Music] Successfully patched AndroidManifest: ${filePath}`);
  return true;
}

function patchGradle(filePath) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('patchDVManifest')) {
    content += '\n' + GRADLE_PREBUILD_HOOK + '\n';
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[DV Music] Successfully hooked Gradle preBuild in: ${filePath}`);
    return true;
  }
  return false;
}

// Explicit targets across all versions of Capacitor
const manifestTargets = [
  'node_modules/@capacitor/android/android-template/app/src/main/AndroidManifest.xml',
  'node_modules/@capacitor/android/template/app/src/main/AndroidManifest.xml',
  'node_modules/@capacitor/android/android/app/src/main/AndroidManifest.xml',
  'android/app/src/main/AndroidManifest.xml',
];

for (const target of manifestTargets) {
  const fullPath = path.resolve(process.cwd(), target);
  patchManifest(fullPath);
}

// Recursively search node_modules/@capacitor and android/ for any AndroidManifest.xml and build.gradle
function searchAndPatch(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchAndPatch(full);
    } else if (entry.name === 'AndroidManifest.xml') {
      patchManifest(full);
    } else if (entry.name === 'build.gradle' && full.includes('app')) {
      patchGradle(full);
    }
  }
}

try {
  searchAndPatch(path.resolve(process.cwd(), 'node_modules/@capacitor'));
  searchAndPatch(path.resolve(process.cwd(), 'android'));
} catch (e) {
  // Ignore walk errors
}

console.log('[DV Music] Android manifest & build configuration patch complete.');
