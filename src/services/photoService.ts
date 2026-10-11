import { Directory, File, Paths } from "expo-file-system";

const PROFILE_DIR_NAME = "profile";

/**
 * Copies a temporary picker URI into the app's persistent document directory
 * so the reference survives app restarts, and returns the stable file URI.
 */
export function saveProfilePhoto(sourceUri: string): string {
  const profileDir = new Directory(Paths.document, PROFILE_DIR_NAME);
  profileDir.create({ idempotent: true });

  const sourceFile = new File(sourceUri);
  const destFile = new File(profileDir, `avatar-${Date.now()}.jpg`);
  sourceFile.copySync(destFile);
  return destFile.uri;
}
