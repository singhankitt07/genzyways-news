"use client";

import { useTheme } from "./ThemeProvider";

export default function ReadingFontSizeControl() {
  const { fontSize, setFontSize } = useTheme();
  return (
    <div className="reading-font-controls" role="group" aria-label="Article text size">
      <button type="button" className="reading-font-button" aria-label="Decrease article text size" title="Decrease text size" disabled={fontSize <= 16} onClick={() => setFontSize(fontSize - 1)}>A−</button>
      <span aria-live="polite" className="reading-font-value">{fontSize}px</span>
      <button type="button" className="reading-font-button" aria-label="Increase article text size" title="Increase text size" disabled={fontSize >= 24} onClick={() => setFontSize(fontSize + 1)}>A+</button>
    </div>
  );
}