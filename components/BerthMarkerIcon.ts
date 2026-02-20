// Returns an HTMLElement used as a custom Mapbox marker
export function createBerthMarkerElement(): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "berth-marker-bounce";
  wrapper.style.cssText = `
    width: 40px;
    height: 40px;
    cursor: pointer;
    filter: drop-shadow(0 4px 12px rgba(14,124,123,0.6));
  `;

  wrapper.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 40 40"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Pin body -->
      <path d="M20 2C13.373 2 8 7.373 8 14c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z"
        fill="#0A1628" stroke="#0E7C7B" stroke-width="2"/>
      <!-- Anchor icon inside pin -->
      <circle cx="20" cy="12" r="2.5" stroke="#0E7C7B" stroke-width="1.8" fill="none"/>
      <line x1="20" y1="14.5" x2="20" y2="22"
        stroke="#0E7C7B" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="15.5" y1="16.5" x2="24.5" y2="16.5"
        stroke="#0E7C7B" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M20 22 C20 22 15 21 14.5 18"
        stroke="#0E7C7B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M20 22 C20 22 25 21 25.5 18"
        stroke="#0E7C7B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    </svg>
  `;

  return wrapper;
}
