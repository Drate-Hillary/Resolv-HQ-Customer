import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

/** Bucket assumed to exist in Supabase Storage — see README/report for setup notes. */
export const ATTACHMENTS_BUCKET = "request-attachments";

export interface PickedAsset {
  uri: string;
  name: string;
  mimeType: string | null;
  size: number | null;
}

function extensionToMimeType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "heic":
      return "image/heic";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

/** Opens the native photo library picker. Returns null if cancelled or denied. */
export async function pickImageAttachment(): Promise<PickedAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });
  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  const name = asset.fileName ?? `photo-${Date.now()}.jpg`;
  return {
    uri: asset.uri,
    name,
    mimeType: extensionToMimeType(name),
    size: asset.fileSize ?? null,
  };
}

/** Opens the native document picker (any file type). Returns null if cancelled. */
export async function pickDocumentAttachment(): Promise<PickedAsset | null> {
  const result = await DocumentPicker.getDocumentAsync({
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets || result.assets.length === 0) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? extensionToMimeType(asset.name),
    size: asset.size ?? null,
  };
}
