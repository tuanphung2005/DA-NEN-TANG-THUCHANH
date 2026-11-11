import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { ImageLibraryOptions } from 'react-native-image-picker';

const CLOUD_NAME = 'dmaziyn4v';
const UPLOAD_PRESET = 'danentang';

export const cloudinaryReady = () =>
  !CLOUD_NAME.startsWith('YOUR') && !UPLOAD_PRESET.startsWith('YOUR');

const OPTIONS: ImageLibraryOptions = {
  mediaType: 'photo',
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
  includeBase64: false,
};

async function pick(source: 'camera' | 'library') {
  const res =
    source === 'camera'
      ? await launchCamera(OPTIONS)
      : await launchImageLibrary(OPTIONS);
  if (res.didCancel) return null;
  if (res.errorCode === 'permission')
    throw new Error('permission');
  if (res.errorCode) throw new Error(res.errorMessage || res.errorCode);
  return res.assets?.[0]?.uri ?? null;
}

export const pickFromCamera = () => pick('camera');
export const pickFromLibrary = () => pick('library');

export async function uploadImage(uri: string) {
  if (!cloudinaryReady()) throw new Error('cloudinary');

  const form = new FormData();
  form.append('file', {
    uri,
    type: 'image/jpeg',
    name: `chat_${Date.now()}.jpg`,
  } as any);
  form.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form },
  );
  const text = await res.text();
  let json: any = {};
  try {
    json = JSON.parse(text);
  } catch {}
  if (!res.ok || !json.secure_url) {
    const message =
      json?.error?.message ?? `Cloudinary HTTP ${res.status}`;
    console.warn('[cloudinary]', res.status, message);
    throw new Error(message);
  }
  return json.secure_url as string;
}
