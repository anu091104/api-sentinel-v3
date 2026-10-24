// Tiny inline icons, so we don't need an icon library.
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const ArrowRight = (p) => <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
export const ArrowLeft = (p) => <svg {...base} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
export const LinkIcon = (p) => <svg {...base} {...p}><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" /></svg>
export const Search = (p) => <svg {...base} width={18} height={18} {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
export const Refresh = (p) => <svg {...base} width={16} height={16} {...p}><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></svg>
export const Close = (p) => <svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>
export const Plus = (p) => <svg {...base} width={16} height={16} {...p}><path d="M12 5v14M5 12h14" /></svg>
export const Sun = (p) => <svg {...base} width={16} height={16} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
export const Moon = (p) => <svg {...base} width={16} height={16} {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
export const Monitor = (p) => <svg {...base} width={16} height={16} {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
