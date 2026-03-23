import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  link: string;
  platform: string;
  category?: string;
  desc?: string;
}

export interface WardrobeItem extends Product {
  docId?: string;
  userId: string;
  createdAt: Timestamp;
  tryOnResult?: string;
}

export interface UserProfile {
  stylePreference: string;
  bodyType: string;
  height: string;
  weight: string;
  skinTone: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  createdAt: Timestamp;
  images?: string[];
}

export interface StyleAnalysis {
  aesthetic: string;
  colors: string[];
  advice: string[];
  recommendedSearch?: string;
  gender?: string;
}

export interface Trend {
  id: string;
  title: string;
  desc: string;
  image: string;
  tag: string;
  query?: string;
}
