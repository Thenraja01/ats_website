import { resumeAPI } from '../services/api';

export const DEFAULT_FALLBACK_FONTS = [
  // Sans-Serif
  { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", category: 'sans-serif', googleFontName: 'Poppins', weights: [300, 400, 500, 600, 700], atsScore: 98 },
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", category: 'sans-serif', googleFontName: 'Inter', weights: [300, 400, 500, 600, 700], atsScore: 99, isDefault: true },
  { id: 'roboto', name: 'Roboto', family: "'Roboto', sans-serif", category: 'sans-serif', googleFontName: 'Roboto', weights: [300, 400, 500, 700], atsScore: 98 },
  { id: 'open-sans', name: 'Open Sans', family: "'Open Sans', sans-serif", category: 'sans-serif', googleFontName: 'Open Sans', weights: [300, 400, 600, 700], atsScore: 98 },
  { id: 'lato', name: 'Lato', family: "'Lato', sans-serif", category: 'sans-serif', googleFontName: 'Lato', weights: [300, 400, 700], atsScore: 97 },
  { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'sans-serif', googleFontName: 'Montserrat', weights: [300, 400, 500, 600, 700], atsScore: 96 },
  { id: 'plus-jakarta-sans', name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", category: 'sans-serif', googleFontName: 'Plus Jakarta Sans', weights: [400, 500, 600, 700], atsScore: 98 },
  { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif", category: 'sans-serif', googleFontName: 'Outfit', weights: [300, 400, 500, 600, 700], atsScore: 97 },
  { id: 'calibri', name: 'Calibri', family: "Calibri, 'Segoe UI', sans-serif", category: 'sans-serif', googleFontName: null, weights: [400, 700], atsScore: 99 },
  { id: 'arial', name: 'Arial', family: "Arial, sans-serif", category: 'sans-serif', googleFontName: null, weights: [400, 700], atsScore: 99 },

  // Serif
  { id: 'playfair-display', name: 'Playfair Display', family: "'Playfair Display', serif", category: 'serif', googleFontName: 'Playfair Display', weights: [400, 600, 700], atsScore: 95 },
  { id: 'merriweather', name: 'Merriweather', family: "'Merriweather', serif", category: 'serif', googleFontName: 'Merriweather', weights: [300, 400, 700], atsScore: 99 },
  { id: 'lora', name: 'Lora', family: "'Lora', serif", category: 'serif', googleFontName: 'Lora', weights: [400, 500, 600, 700], atsScore: 97 },
  { id: 'eb-garamond', name: 'EB Garamond', family: "'EB Garamond', serif", category: 'serif', googleFontName: 'EB Garamond', weights: [400, 500, 600, 700], atsScore: 96 },
  { id: 'georgia', name: 'Georgia', family: "Georgia, serif", category: 'serif', googleFontName: null, weights: [400, 700], atsScore: 99 },
  { id: 'times', name: 'Times New Roman', family: "'Times New Roman', Times, serif", category: 'serif', googleFontName: null, weights: [400, 700], atsScore: 99 },

  // Handwriting / Script
  { id: 'pacifico', name: 'Pacifico', family: "'Pacifico', cursive", category: 'handwriting', googleFontName: 'Pacifico', weights: [400], atsScore: 80 },
  { id: 'caveat', name: 'Caveat', family: "'Caveat', cursive", category: 'handwriting', googleFontName: 'Caveat', weights: [400, 600, 700], atsScore: 82 },
  { id: 'dancing-script', name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'handwriting', googleFontName: 'Dancing Script', weights: [400, 600, 700], atsScore: 80 },

  // Monospace & Code
  { id: 'jetbrains', name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", category: 'monospace', googleFontName: 'JetBrains Mono', weights: [300, 400, 500, 700], atsScore: 98 },
  { id: 'fira-code', name: 'Fira Code', family: "'Fira Code', monospace", category: 'monospace', googleFontName: 'Fira Code', weights: [400, 500, 600, 700], atsScore: 97 },
  { id: 'space-grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", category: 'monospace', googleFontName: 'Space Grotesk', weights: [400, 500, 600, 700], atsScore: 96 },
];

// In-memory cache for fonts
let cachedFonts = null;

/**
 * Fetch font metadata from backend API with fallback
 */
export async function fetchBackendFonts() {
  if (cachedFonts && cachedFonts.length > 0) return cachedFonts;
  try {
    const res = await resumeAPI.getFonts();
    if (res.data?.fonts && Array.isArray(res.data.fonts)) {
      cachedFonts = res.data.fonts;
      return cachedFonts;
    }
  } catch (err) {
    console.warn('Using fallback font metadata:', err?.message);
  }
  cachedFonts = DEFAULT_FALLBACK_FONTS;
  return cachedFonts;
}

/**
 * Dynamically load Google Font into document <head>
 */
export function loadGoogleFont(fontObj) {
  if (!fontObj || !fontObj.googleFontName || typeof document === 'undefined') return;
  const linkId = `google-font-${fontObj.id || fontObj.googleFontName.toLowerCase().replace(/\s+/g, '-')}`;
  if (document.getElementById(linkId)) return;

  const fontNameFormatted = fontObj.googleFontName.replace(/\s+/g, '+');
  const weightsStr = fontObj.weights && fontObj.weights.length 
    ? `:wght@${fontObj.weights.join(';')}` 
    : ':wght@300;400;500;600;700';

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontNameFormatted}${weightsStr}&display=swap`;
  document.head.appendChild(link);
}
