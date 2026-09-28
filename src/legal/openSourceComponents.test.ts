import {describe, expect, it} from 'vitest';
import {browsableHomepage, filterSections, OpenSourceComponent, OpenSourceSection} from './openSourceComponents';

const component = (name: string, license: string): OpenSourceComponent =>
  ({name, license, licenseUrl: '', author: '', homepage: '', noticeText: '', licenseText: ''});

const SECTIONS: OpenSourceSection[] = [
  {id: 'app', components: [component('react', 'MIT'), component('xdate', 'GPL-2.0 OR MIT')]},
  {id: 'server', components: [component('org.springframework:spring-core', 'Apache-2.0')]},
  {id: 'catalogue', components: []},
];

describe('openSourceComponents', () => {
  it('finds components by name and by license, ignoring case, and drops sections left empty', () => {
    expect(filterSections(SECTIONS, 'SPRING')).toEqual([SECTIONS[1]]);
    expect(filterSections(SECTIONS, 'mit').map((section) => section.components.map((found) => found.name)))
        .toEqual([['react', 'xdate']]);
  });

  it('shows every section that has components for an empty search', () => {
    expect(filterSections(SECTIONS, '  ').map((section) => section.id)).toEqual(['app', 'server']);
  });

  it('turns a git url into one a browser opens', () => {
    expect(browsableHomepage('git+https://github.com/facebook/react.git')).toBe('https://github.com/facebook/react');
    expect(browsableHomepage('git+https://github.com/emotion-js/emotion.git#main')).toBe('https://github.com/emotion-js/emotion');
    expect(browsableHomepage('git://github.com/arshaw/xdate.git')).toBe('https://github.com/arshaw/xdate');
    expect(browsableHomepage('https://reactnative.dev')).toBe('https://reactnative.dev');
    expect(browsableHomepage('')).toBeNull();
  });
});
