import {useEffect} from 'react';

// iOS takes the status bar color of the installed app from the body, and the theme can differ from the system's.
export const usePageBackground = (color: string) => {
  useEffect(() => {
    document.body.style.backgroundColor = color;
  }, [color]);
};
