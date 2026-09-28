/** A work of others the app or its server ships, with what its license asks to be passed on. */
export interface OpenSourceComponent {
  name: string;
  license: string;
  /** Empty where the license names none. */
  licenseUrl: string;
  author: string;
  homepage: string;
  noticeText: string;
  licenseText: string;
}

/** "app" is embedded in the app; the server answers "server" and "catalogue". */
export type OpenSourceSectionId = 'app' | 'server' | 'catalogue';

export interface OpenSourceSection {
  id: OpenSourceSectionId;
  components: OpenSourceComponent[];
}

/**
 * The components whose name or license contains what was typed, section by section; sections left
 * without any are dropped.
 *
 * @param {OpenSourceSection[]} sections every section
 * @param {string} query what was typed
 * @return {OpenSourceSection[]} the matching ones, in their order
 */
export const filterSections = (sections: OpenSourceSection[], query: string): OpenSourceSection[] => {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return sections.filter((section) => section.components.length > 0);
  }
  return sections
      .map((section) => ({...section, components: section.components.filter((component) =>
        component.name.toLowerCase().includes(needle) || component.license.toLowerCase().includes(needle))}))
      .filter((section) => section.components.length > 0);
};

/**
 * A homepage as a link a browser opens: package metadata often names a git url.
 *
 * @param {string} homepage as the package states it
 * @return {string | null} an http(s) address, or null when there is none
 */
export const browsableHomepage = (homepage: string): string | null => {
  const url = homepage.replace(/^git\+/, '').replace(/^git:\/\//, 'https://').replace(/\.git(#.*)?$/, '');
  return /^https?:\/\//.test(url) ? url : null;
};
