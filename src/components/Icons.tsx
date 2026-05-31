/* SVG icon components - replaces ALL emoji usage */

interface IconProps { size?: number; className?: string; }

export function IconFile({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M3 1.5h6.5l3.5 3.5V14a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5z" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M9.5 1.5V5h3.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconFolder({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M1.5 4.5a1 1 0 0 1 1-1h3.672a1 1 0 0 1 .707.293l.828.828a1 1 0 0 0 .707.293H13.5a1 1 0 0 1 1 1v5.586a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5z" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export function IconFolderOpen({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M1.5 4.5a1 1 0 0 1 1-1h3.672a1 1 0 0 1 .707.293l.828.828a1 1 0 0 0 .707.293H13.5a1 1 0 0 1 1 1v.5l-2.5 5.5H2.5l-1-3.5V4.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconChevronRight({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconChevronDown({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M2.5 4.5L6 7.5L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconChevronUp({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M2.5 7.5L6 4.5L9.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconSearch({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" className={className}>
      <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconX({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconMinimize({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconMaximize({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}

export function IconRestore({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <rect x="3" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="0.5" y="3.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="var(--bg-primary)"/>
    </svg>
  );
}

export function IconClose({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

export function IconSettings({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" className={className}>
      <circle cx="7.5" cy="7.5" r="2.3" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M2.8 2.8l1.4 1.4M10.8 10.8l1.4 1.4M2.8 12.2l1.4-1.4M10.8 4.2l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconAI({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" className={className}>
      <path d="M7.5 1L9 5.5L13.5 7L9 8.5L7.5 13L6 8.5L1.5 7L6 5.5L7.5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconTerminal({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" className={className}>
      <rect x="1.5" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 5.5L6.5 7.5L4.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="8" y1="9" x2="10" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconExplorer({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export function IconSave({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" className={className}>
      <path d="M2.5 2h8.5l2 2v8a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5V2.5a.5.5 0 0 1 .5-.5z" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M10 2v3.5H5V2" stroke="currentColor" strokeWidth="1.2"/>
      <rect x="4.5" y="8" width="6" height="4.5" rx=".5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export function IconTrash({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M2 3.5h10M4.5 3.5V2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1.5M5.5 6v4M8.5 6v4M3 3.5l.7 8.2a1 1 0 0 0 1 .8h4.6a1 1 0 0 0 1-.8l.7-8.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconPlus({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconSend({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M2 8l4-5 8 5-8 5-4-5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="6" y1="3" x2="6" y2="8" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export function IconCopy({ size = 13, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" className={className}>
      <rect x="3.5" y="2.5" width="7" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2 9.5V2a.5.5 0 0 1 .5-.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconPaste({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <rect x="2" y="3.5" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 3.5V2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export function IconKey({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <circle cx="5.5" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="8" y1="6" x2="11.5" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="10.5" y1="4" x2="12" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconStar({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M7 1l1.8 3.6L12.5 5l-2.7 2.7.6 3.8L7 9.5l-3.4 2 .6-3.8L1.5 5l3.7-.4L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconDownload({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M3 9.5v1.5a1 1 0 001 1h6a1 1 0 001-1V9.5M7 1v7M4 5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconExtensions({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}

export function IconCheck({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M2 7.5L5.5 11L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconWarning({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" className={className}>
      <path d="M7.5 1.5l-7 12h14l-7-12z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <line x1="7.5" y1="6" x2="7.5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7.5" cy="10.5" r=".5" fill="currentColor"/>
    </svg>
  );
}

export function IconError({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" className={className}>
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="5" y1="5" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10" y1="5" x2="5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconRefresh({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M12 7A5 5 0 1 1 7 2a5 5 0 0 1 4.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 2v3.5H8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconClear({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconLightning({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M6.5 1.5L3 9h3.5l-.5 5.5L13 7H9l1-5.5H6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconNewFile({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" className={className}>
      <path d="M3 1.5h5.5l3 3V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5z" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8.5 1.5V4.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <line x1="5.5" y1="7.5" x2="9.5" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="7.5" y1="5.5" x2="7.5" y2="9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function IconNewFolder({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" className={className}>
      <path d="M1.5 4.5a1 1 0 0 1 1-1h3.172a1 1 0 0 1 .707.293l.828.828a1 1 0 0 0 .707.293H12.5a1 1 0 0 1 1 1v4.586a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1V4.5z" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="5" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="7.5" y1="5.5" x2="7.5" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

/* Language-specific file type icons */
export function IconFileJS({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <text x="8" y="11.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">JS</text>
    </svg>
  );
}

export function IconFileTS({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <text x="8" y="11.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">TS</text>
    </svg>
  );
}

export function IconFilePy({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <text x="8" y="11.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">PY</text>
    </svg>
  );
}

export function IconFileHtml({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <text x="8" y="11.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">&lt;/&gt;</text>
    </svg>
  );
}

export function IconFileJson({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <text x="8" y="11.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">{ }</text>
    </svg>
  );
}

export function IconFileMd({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <text x="8" y="11.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">MD</text>
    </svg>
  );
}

/* Mapping function */
export function getFileIconComponent(ext: string, size = 16, className?: string) {
  const map: Record<string, JSX.Element> = {
    js: <IconFileJS size={size} className={className} />,
    jsx: <IconFileJS size={size} className={className} />,
    ts: <IconFileTS size={size} className={className} />,
    tsx: <IconFileTS size={size} className={className} />,
    py: <IconFilePy size={size} className={className} />,
    html: <IconFileHtml size={size} className={className} />,
    htm: <IconFileHtml size={size} className={className} />,
    json: <IconFileJson size={size} className={className} />,
    jsonc: <IconFileJson size={size} className={className} />,
    md: <IconFileMd size={size} className={className} />,
    mdx: <IconFileMd size={size} className={className} />,
  };
  return map[ext.toLowerCase()] || <IconFile size={size} className={className} />;
}

export function IconBranch({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M3 2v7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="3" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
      <circle cx="3" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M8 3c0 1.5-1.5 2-3 2.5M8 5c0 1.5-1.5 3-3 3.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

export function IconCheckCircle({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconErrorCircle({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

export function IconInfo({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 7v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="5" r="0.8" fill="currentColor"/>
    </svg>
  );
}

export function getFolderIcon(expanded: boolean, size = 12, className?: string) {
  return expanded
    ? <IconChevronDown size={size} className={className} />
    : <IconChevronRight size={size} className={className} />;
}
