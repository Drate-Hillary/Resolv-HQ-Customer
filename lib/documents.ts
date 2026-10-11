import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { apiClient, apiErrorMessage } from "@/backend/api-client";
import { dismissToast, toast } from "./toast";

export function isPdf(fileType?: string | null, fileName?: string | null): boolean {
  return fileType === "application/pdf" || /\.pdf$/i.test(fileName ?? "") || fileType === "pdf";
}

function safeName(name: string, fallbackExt: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9.\-_ ]/g, "_").trim() || "document";
  return /\.[a-z0-9]{2,5}$/i.test(cleaned) ? cleaned : `${cleaned}.${fallbackExt}`;
}

/**
 * Downloads a (signed) file URL into the app cache and opens it with the
 * system viewer — the PDF preview on iOS, the "open with" chooser on Android.
 * Falls back to the in-app browser if sharing isn't available (e.g. web).
 */
export async function openDocument(url: string, fileName: string, mimeType?: string | null): Promise<void> {
  const pdf = isPdf(mimeType, fileName);
  const loadingToast = toast.info("Opening document…", fileName);
  try {
    if (Platform.OS === "web" || !(await Sharing.isAvailableAsync())) {
      await WebBrowser.openBrowserAsync(url);
      return;
    }

    const dir = new Directory(Paths.cache, "documents");
    if (!dir.exists) dir.create({ intermediates: true });
    const target = new File(dir, safeName(fileName, pdf ? "pdf" : "bin"));
    const downloaded = await File.downloadFileAsync(url, target, { idempotent: true });

    await Sharing.shareAsync(downloaded.uri, {
      mimeType: pdf ? "application/pdf" : (mimeType ?? undefined),
      UTI: pdf ? "com.adobe.pdf" : undefined,
      dialogTitle: fileName,
    });
  } catch (e) {
    console.warn("Failed to open document", e);
    toast.error("Couldn't open the document", "Check your connection and try again.");
  } finally {
    dismissToast(loadingToast);
  }
}

/** Opens the file attached to a Help Centre article (a short-lived signed URL is fetched first). */
export async function openArticleFile(articleId: string, fallbackName: string): Promise<void> {
  try {
    const { data } = await apiClient.get<{ url: string; fileName: string; fileType: string | null }>(
      `/help-articles/${articleId}/file`,
    );
    await openDocument(data.url, data.fileName || fallbackName, data.fileType);
  } catch (e) {
    toast.error("Couldn't open the file", apiErrorMessage(e));
  }
}
