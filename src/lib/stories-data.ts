import { menu, MenuItem } from "./menu-data";

export type KaivuStory = {
  id: string;
  username: string;
  avatar: string;
  reactionEmoji: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  timestamp: string;
  featuredProduct: MenuItem;
  caption?: string;
  sourceUrl?: string;
  createdAt?: string;
};

export const INITIAL_STORIES: KaivuStory[] = [
  {
    id: "story-1",
    username: "@sara",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    reactionEmoji: "😍",
    mediaUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    timestamp: "2h ago",
    featuredProduct: menu[0], // Buffalo Flamin' Hot
    caption: "The cheese pull on this is unmatched 🤤🔥 Best late night craving!",
  },
  {
    id: "story-2",
    username: "@nihal",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    reactionEmoji: "🔥",
    mediaUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    timestamp: "4h ago",
    featuredProduct: menu[3], // The Smashed
    caption: "Double smashed patties never fail. Crispy edges are perfection ✨",
  },
  {
    id: "story-3",
    username: "@amal",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    reactionEmoji: "🍔",
    mediaUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    timestamp: "5h ago",
    featuredProduct: menu[5], // Smoke & Jam
    caption: "Bacon jam on a double smashed burger... mind officially blown 💥",
  },
  {
    id: "story-4",
    username: "@fathima",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    reactionEmoji: "❤️",
    mediaUrl: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    timestamp: "7h ago",
    featuredProduct: menu[1], // Nashville Fried
    caption: "Spicy chicken and creamy slaw combination is a 10/10 🌶️",
  },
  {
    id: "story-5",
    username: "@zayd",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    reactionEmoji: "⚡",
    mediaUrl: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&auto=format&fit=crop&q=80",
    mediaType: "image",
    timestamp: "12h ago",
    featuredProduct: menu[6], // Golden Fries
    caption: "Rosemary salt fries are unmatched pairing with the burger combo 👌",
  },
];

export const MOCK_STORIES = INITIAL_STORIES;

const DYNAMIC_STORIES_KEY = "kaivu_dynamic_stories_v1";
const STORIES_ENABLED_KEY = "kaivu_stories_enabled_v1";
const STORAGE_KEY = "kaivu_viewed_stories_v1";

export function isStoriesEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(STORIES_ENABLED_KEY);
    return raw !== null ? JSON.parse(raw) : true;
  } catch (e) {
    return true;
  }
}

export function setStoriesEnabled(enabled: boolean): boolean {
  if (typeof window === "undefined") return enabled;
  try {
    localStorage.setItem(STORIES_ENABLED_KEY, JSON.stringify(enabled));
  } catch (e) {
    console.error("Failed to save stories enabled state", e);
  }
  return enabled;
}

export function getStories(): KaivuStory[] {
  if (typeof window === "undefined") return INITIAL_STORIES;
  try {
    const raw = localStorage.getItem(DYNAMIC_STORIES_KEY);
    if (raw === null) return INITIAL_STORIES;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_STORIES;
  }
}

export function saveStories(stories: KaivuStory[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DYNAMIC_STORIES_KEY, JSON.stringify(stories));
  } catch (e) {
    console.error("Failed to save stories", e);
  }
}

export function addDynamicStory(newStory: KaivuStory): KaivuStory[] {
  const current = getStories();
  const updated = [newStory, ...current];
  saveStories(updated);
  return updated;
}

export function deleteDynamicStory(storyId: string): KaivuStory[] {
  const current = getStories();
  const updated = current.filter((s) => s.id !== storyId);
  saveStories(updated);
  return updated;
}

export function clearAllStories(): KaivuStory[] {
  saveStories([]);
  return [];
}

export function getViewedStoryIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function markStoryAsViewed(storyId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getViewedStoryIds();
    if (!current.includes(storyId)) {
      const updated = [...current, storyId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch (e) {
    return [];
  }
}
