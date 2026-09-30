// The picker hands out a blob: url; fetch reads it back with the type it was picked with.
export const formImage = async (uri: string): Promise<Blob> => (await fetch(uri)).blob();
