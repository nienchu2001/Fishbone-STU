
export interface UserProfile {
  name: string;
  avatar: string;
  contact: string; // Changed from email to generic contact
  bio: string;
  tags: string[];
}

// Updated workflow stages for VN/Motion graphics
export type CommissionStatus = 'waiting' | 'typography' | 'motion' | 'color_fx' | 'export' | 'finished';

export interface CommissionSlot {
  id: string;
  clientName: string;
  type: string;
  status: CommissionStatus;
  deadline: string;
  progress: number;
  price?: string;
  requirements?: string; // New field for order details
}

export type MediaType = 'image' | 'video';

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string; // URL for image or video source
  mediaType: MediaType; // New field for file type
  date: string;
}

export interface BusinessCategory {
  id: string;
  name: string;
  priceRange: string;
  description: string;
  details?: string; // Extended details for the expandable view
}

export interface ImportTemplate {
  id: string;
  name: string;
  content: string;
}

export type ViewState = 'portfolio' | 'schedule' | 'settings' | 'services';

export interface ReadOnlyProps {
  isReadOnly?: boolean;
}

export type FontStyle = 'sans' | 'serif' | 'artistic' | 'handwriting';
export type PortfolioLayoutMode = 'masonry' | 'grid' | 'list';
export type BackgroundSizeMode = 'cover' | 'contain' | 'auto';

export interface ThemeSettings {
  backgroundImage: string;
  backgroundSize: BackgroundSizeMode; // New field for background sizing
  font: FontStyle; // Kept for backward compatibility or preset fallback
  customFontUrl?: string; // New field for custom font URL
  overlayOpacity: number; // 0 to 1
}

// Global Data Structure for Export/Import
export interface AppData {
  user: UserProfile;
  categories: BusinessCategory[];
  portfolio: PortfolioItem[];
  scheduleSlots: CommissionSlot[];
  importTemplates: ImportTemplate[];
  theme: ThemeSettings;
  portfolioLayout: PortfolioLayoutMode; // Persist layout choice
  lastUpdated: string;
}
