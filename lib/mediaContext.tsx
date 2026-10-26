"use client";

import { createContext, useContext } from "react";

/** slug -> public URL of a video / poster that actually exists */
export type MediaManifest = { videos: Record<string, string>; posters: Record<string, string> };

const MediaContext = createContext<MediaManifest>({ videos: {}, posters: {} });

export const MediaProvider = MediaContext.Provider;
export const useMedia = () => useContext(MediaContext);
