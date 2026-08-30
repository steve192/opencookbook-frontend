// Swiper ships its stylesheet as a plain CSS file that the web bundler inlines.
// TypeScript needs an ambient declaration to accept the side-effect import.
declare module '*.css';
