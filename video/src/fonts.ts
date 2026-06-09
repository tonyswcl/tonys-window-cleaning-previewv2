import { continueRender, delayRender } from "remotion";

// Use Liberation Sans (Arial-compatible) available on this system
export const fontFamily = '"Liberation Sans", Arial, Helvetica, sans-serif';

// No async loading needed for system fonts
export const waitForFonts = () => {
  const handle = delayRender("Loading fonts");
  continueRender(handle);
};
