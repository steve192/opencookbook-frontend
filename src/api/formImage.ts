// A picture as form data accepts it on Android and iOS: the file uri in this undocumented shape.
export const formImage = (uri: string): Promise<Blob> => {
  const name = uri.split('/').pop() ?? 'image.jpg';
  const extension = /\.(\w+)$/.exec(name)?.[1] ?? 'jpeg';
  return Promise.resolve({uri, name, type: 'image/' + extension} as unknown as Blob);
};
