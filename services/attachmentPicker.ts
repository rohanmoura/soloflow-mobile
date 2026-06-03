import * as DocumentPicker from 'expo-document-picker';

export async function pickAttachment() {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ['application/pdf', 'image/*', 'text/*'],
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];

  return {
    name: asset.name,
    uri: asset.uri,
  };
}
