import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

// Base icon component with consistent styling
const BaseIcon: React.FC<IconProps & { children: React.ReactNode; viewBox?: string }> = ({
  size = 20,
  className = '',
  children,
  viewBox = '0 0 24 24',
  'aria-hidden': ariaHidden = true
}) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`icon ${className}`}
    aria-hidden={ariaHidden}
    style={{ 
      flexShrink: 0,
      transition: 'all 0.15s ease-out' 
    }}
  >
    {children}
  </svg>
);

export const SaveIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17,21 17,13 7,13 7,21" />
    <polyline points="7,3 7,8 15,8" />
  </BaseIcon>
);

export const ShareIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </BaseIcon>
);

export const RefreshIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </BaseIcon>
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="M15 5l4 4" />
  </BaseIcon>
);

export const CopyIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </BaseIcon>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </BaseIcon>
);

export const HeartIcon: React.FC<IconProps & { filled?: boolean }> = ({ filled = false, ...props }) => (
  <BaseIcon {...props}>
    <path 
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={filled ? 'currentColor' : 'none'}
    />
  </BaseIcon>
);

export const BookmarkIcon: React.FC<IconProps & { filled?: boolean }> = ({ filled = false, ...props }) => (
  <BaseIcon {...props}>
    <path 
      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
      fill={filled ? 'currentColor' : 'none'}
    />
  </BaseIcon>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M9 12l2 2 4-4" />
  </BaseIcon>
);

export const XIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </BaseIcon>
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M6 9l6 6 6-6" />
  </BaseIcon>
);

export const ChevronUpIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M18 15l-6-6-6 6" />
  </BaseIcon>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </BaseIcon>
);

export const MinusIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M5 12h14" />
  </BaseIcon>
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </BaseIcon>
);

export const MenuIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </BaseIcon>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </BaseIcon>
);

// Icon collection for easy import
export const Icons = {
  save: SaveIcon,
  share: ShareIcon,
  refresh: RefreshIcon,
  edit: EditIcon,
  copy: CopyIcon,
  download: DownloadIcon,
  heart: HeartIcon,
  bookmark: BookmarkIcon,
  check: CheckIcon,
  x: XIcon,
  chevronDown: ChevronDownIcon,
  chevronUp: ChevronUpIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  search: SearchIcon,
  menu: MenuIcon,
  sparkles: SparklesIcon,
} as const;
