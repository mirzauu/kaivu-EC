"use client";

import { useState, useEffect } from "react";
import { Sparkles, ChevronRight } from "lucide-react";
import { getStories, KaivuStory, getViewedStoryIds } from "@/lib/stories-data";

interface KaivuIRLSectionProps {
  onOpenStory: (index: number) => void;
  stories?: KaivuStory[];
}

export function KaivuIRLSection({ onOpenStory, stories: propsStories }: KaivuIRLSectionProps) {
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [stories, setStories] = useState<KaivuStory[]>(propsStories || []);

  useEffect(() => {
    setMounted(true);
    setViewedIds(getViewedStoryIds());
    if (!propsStories || propsStories.length === 0) {
      setStories(getStories());
    } else {
      setStories(propsStories);
    }
  }, [propsStories]);

  const displayStories = stories && stories.length > 0 ? stories : getStories();

  return (
    <section className="pt-3 pb-1">
      {/* Header */}
      <div className="flex items-center justify-between px-5">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 font-display">
          <span className="text-amber-500 font-extrabold text-lg">✦</span> Kaivu IRL
        </h3>
        <button
          type="button"
          onClick={() => onOpenStory(0)}
          className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-0.5"
        >
          See all <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Horizontal Story Circles (Shows ~4.5 visible items to hint scrolling) */}
      <ul className="mt-3.5 flex items-center gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {displayStories.map((story, idx) => {
          const isViewed = mounted && viewedIds.includes(story.id);

          return (
            <li key={story.id} className="shrink-0 flex flex-col items-center">
              <button
                type="button"
                onClick={() => onOpenStory(idx)}
                className="group relative focus:outline-none flex flex-col items-center"
              >
                {/* 68px Outer Ring Container */}
                <div
                  className={`h-[70px] w-[70px] rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 ${
                    isViewed
                      ? "bg-slate-200"
                      : "bg-gradient-to-tr from-purple-700 via-pink-600 to-amber-400 shadow-md animate-pulse"
                  }`}
                >
                  {/* Inner Thumbnail Container */}
                  <div className="h-full w-full rounded-full bg-white p-[2px] overflow-hidden relative">
                    <img
                      src={story.avatar}
                      alt={story.username}
                      className="h-full w-full rounded-full object-cover"
                    />
                    {/* Customer Reaction Badge Overlay */}
                    <span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-white text-[11px] shadow-md border border-gray-100">
                      {story.reactionEmoji}
                    </span>
                  </div>
                </div>

                {/* Handle Label Below */}
                <span
                  className={`mt-1.5 text-xs tracking-tight ${
                    isViewed ? "font-medium text-slate-500" : "font-bold text-slate-900"
                  }`}
                >
                  {story.username}
                </span>
              </button>
            </li>
          );
        })}

        {/* "+12" More Circle Tile */}
        <li className="shrink-0 flex flex-col items-center">
          <button
            type="button"
            onClick={() => onOpenStory(0)}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="h-[70px] w-[70px] rounded-full border-2 border-dashed border-purple-300 bg-purple-50 flex items-center justify-center text-purple-700 font-extrabold text-sm group-hover:scale-105 transition-transform shadow-sm">
              +12
            </div>
            <span className="mt-1.5 text-xs font-semibold text-purple-700">
              More
            </span>
          </button>
        </li>
      </ul>
    </section>
  );
}
