export interface UserProfile {
  name: string;
  avatar: string;
  email: string;
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

export type ViewState = 'portfolio' | 'schedule' | 'settings' | 'services';