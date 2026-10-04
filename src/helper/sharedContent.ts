import type {SharePayload} from 'expo-sharing';

export const MAX_IMPORT_INPUT = 10_000;

// Link or text only words the preview; the server decides what is imported.
export type SharedContent =
  | {kind: 'link'; input: string; link: string; title?: string}
  | {kind: 'text'; input: string}
  | {kind: 'photos'; uris: string[]};

export interface WebShare {
  title?: string;
  text?: string;
  url?: string;
}

const LINK = /https?:\/\/\S+/gi;
const TRAILING_PUNCTUATION = /[.,;!?)]+$/;
const EDGE_SEPARATORS = /^[\s\-:|"'“”„‘’«»]+|[\s\-:|"'“”„‘’«»]+$/g;
const MAX_LINK_TITLE = 120;

// As the server reads it: one link with at most a one line title around it is a link.
export const sharedInput = (input: string): SharedContent | undefined => {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  const links = trimmed.match(LINK) ?? [];
  if (links.length === 1) {
    const rest = trimmed.replace(links[0], ' ').replace(EDGE_SEPARATORS, '');
    if (!rest.includes('\n') && rest.length <= MAX_LINK_TITLE) {
      const link = links[0].replace(TRAILING_PUNCTUATION, '');
      const title = rest.replace(/\s+/g, ' ');
      return title ? {kind: 'link', input: trimmed, link, title} : {kind: 'link', input: trimmed, link};
    }
  }
  return {kind: 'text', input: trimmed};
};

export const sharedContentFromPayloads = (payloads: SharePayload[]): SharedContent | undefined => {
  const photos = payloads.filter((payload) => payload.shareType === 'image' && payload.value);
  if (photos.length > 0) {
    return {kind: 'photos', uris: photos.map((photo) => photo.value)};
  }
  const texts = payloads.filter((payload) => payload.shareType === 'text' || payload.shareType === 'url');
  return sharedInput(texts.map((text) => text.value).join('\n'));
};

// Browsers repeat themselves, so a part another part already holds is left out.
export const sharedContentFromWebShare = ({title, text, url}: WebShare): SharedContent | undefined => {
  const parts = [title, text, url]
      .map((part) => typeof part === 'string' ? part.trim() : '')
      .filter((part) => part.length > 0);
  const distinct = parts.filter((part, index) => !parts.some((other, otherIndex) =>
    otherIndex !== index && other.includes(part) && (other.length > part.length || otherIndex < index)));
  return sharedInput(distinct.join('\n'));
};

export const hostOf = (url: string): string => {
  const match = /^https?:\/\/([^/?#]+)/i.exec(url);
  return match?.[1]?.replace(/^www\./i, '') ?? url;
};
