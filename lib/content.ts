/**
 * All real portfolio content lives here. Edit text and links in this file only;
 * every scene and window reads from it.
 */

export const profile = {
  name: "Vaibhav Singla",
  first: "VAIBHAV",
  last: "SINGLA",
  role: "Video Editor & Technologist",
  location: "Delhi",
  portrait: "/images/vaibhav-portrait.webp",
};

export const about = {
  greeting: "Hi, I'm Vaibhav.",
  role: "Video Editor & Technologist",
  paragraphs: [
    "I am a B.Tech IT undergraduate at USICT, GGSIPU, and a passionate video editor committed to the craft of visual storytelling.",
    "I love the challenge of turning scattered ideas into polished, professional videos that capture attention. Blending technical expertise with creative intuition, I ensure that every project I touch is not only visually stunning but also technically flawless.",
  ],
  callout: "Let's turn your vision into reality.",
};

export type Clip = {
  id: string;
  track: "V1" | "V2" | "V3" | "A1";
  title: string;
  body: string;
  tags?: string[];
};

export const experience: Clip[] = [
  {
    id: "current-roles",
    track: "V3",
    title: "Current Roles",
    body: "Social Media Lead at ACM, Social Media Lead at the CyberSecurity Club, and Executive at TechSpace.",
    tags: ["ACM · Social Media Lead", "CyberSecurity Club · Social Media Lead", "TechSpace · Executive"],
  },
  {
    id: "lead-editor",
    track: "V1",
    title: "Lead Video Editor",
    body: "Started as a video editor in school and currently serving as the Lead Editor for major college technical societies, including ACM, IEEE, and TechSpace.",
    tags: ["ACM", "IEEE", "TechSpace"],
  },
  {
    id: "team-lead",
    track: "V2",
    title: "Team Lead / Mentor",
    body: "Former Deputy Head Boy with extensive experience leading student cohorts and managing large-scale events. Continues to serve as an active alumni mentor, guiding juniors in leadership and extracurricular development.",
    tags: ["Leadership", "Events", "Mentoring"],
  },
  {
    id: "skills",
    track: "A1",
    title: "Personal Skills",
    body: "What I bring to the edit bay, and off it.",
    tags: ["Video Editing", "Basketball", "Bharatnatyam", "Rubik's Cube"],
  },
];

export const origin = {
  title: "The Origin",
  school: "BBPS, Pitampura",
  years: "2011–25",
  intro: "From the basketball court to the center stage, my decade at Bal Bharati was defined by high-impact versatility.",
  frames: [
    { label: "Leadership", text: "Deputy Head Boy leading 500+ peers" },
    { label: "Sports", text: "Earned title of 'Best Basketball Player'" },
    { label: "Arts", text: "Top honors in Bharatnatyam dance" },
    { label: "Creative", text: "The school's ace video editor" },
  ],
  mentor: "Today, that trust remains unbroken; I return as a mentor to guide juniors in everything from sports and dance to managing flagship events.",
  closing: "I don't just play the game; I create the highlight reel.",
};

export type Edit = {
  slug: string;
  num: string;
  title: string;
  description: string;
  tools: string[];
  meta?: string;
  link: string;
  featured?: boolean;
  /** two-stop "grade" used by the animated placeholder until a video/poster is dropped in */
  grade: [string, string];
};

/**
 * Drop files into /public/videos/<slug>.mp4 and /public/posters/<slug>.jpg
 * and they are picked up automatically (see README).
 */
export const edits: Edit[] = [
  {
    slug: "fest-team-reveal",
    num: "03",
    title: "Fest Team Reveal",
    description: "Dramatic team announcement with masked transitions and high-energy cuts.",
    meta: "Motion Design · Color Grading · Velocity Edit",
    tools: ["CapCut Pro PC", "VFX", "Typography"],
    link: "https://www.instagram.com/reel/DUS--v_j3gt/",
    featured: true,
    grade: ["#ff4d1f", "#2a0d06"],
  },
  {
    slug: "dsa-bootcamp",
    num: "01",
    title: "DSA Bootcamp",
    description: "Energetic event highlights reel with dynamic motion graphics and kinetic typography.",
    tools: ["CapCut Pro PC"],
    link: "https://www.instagram.com/ggsipuacm/reel/DQgpKrmD1pK/",
    grade: ["#3fb6c9", "#08161a"],
  },
  {
    slug: "galactica-teaser",
    num: "02",
    title: "Galactica Teaser",
    description: "Cinematic teaser with color grading, velocity edits, and epic sound design.",
    tools: ["CapCut Pro PC", "Masking", "Gaming"],
    link: "https://www.instagram.com/reel/DUx85gJD0Xt/",
    grade: ["#7a6cff", "#0b0920"],
  },
  {
    slug: "agaaz-5",
    num: "04",
    title: "Agaaz 5.0",
    description: "Festival promo with bold typography, rhythmic cuts, and vibrant color story.",
    meta: "First Edit",
    tools: ["CapCut Pro PC", "First Edit"],
    link: "https://www.instagram.com/_being_vaibhav/reel/DPGgqY4k6MC/",
    grade: ["#ffb020", "#1f1204"],
  },
  {
    slug: "tech-week-teaser",
    num: "05",
    title: "Tech Week Teaser",
    description: "Sleek tech event promo with glitch transitions and futuristic aesthetics.",
    tools: ["CapCut Pro PC", "Cinematic"],
    link: "https://www.instagram.com/reel/DXGsp7fkwHG/",
    grade: ["#4dffb0", "#04140d"],
  },
];

export const work = {
  tagline: "Every frame tells a story.",
  viewAll: "https://drive.google.com/drive/folders/1qqXdHhLMPiL5gxFGJn-bHug9TgNJIUR_?usp=sharing",
};

/** Technologist easter egg: printed as a render log */
export const renderLog = [
  { tag: "TOOL", text: "CapCut Pro PC" },
  { tag: "FX", text: "VFX" },
  { tag: "TYPE", text: "Typography" },
  { tag: "MASK", text: "Masking" },
  { tag: "GRADE", text: "Color grading" },
  { tag: "SPEED", text: "Velocity edits" },
  { tag: "AUDIO", text: "Sound design" },
  { tag: "MOTION", text: "Motion design · kinetic typography" },
];

export const contact = {
  email: "singlavaibhav98@gmail.com",
  phone: "+91 9289401514",
  phoneHref: "tel:+919289401514",
  linkedin: "https://www.linkedin.com/in/vaibhav-singla-b96030358/",
  instagram: [
    { handle: "@vaibhav.cinematics", href: "https://www.instagram.com/vaibhav.cinematics/" },
    { handle: "@kyayaar.vaibhav", href: "https://www.instagram.com/kyayaar.vaibhav/" },
  ],
};

export const nav = [
  { label: "Home", scene: "intro" },
  { label: "About", scene: "about" },
  { label: "Experience", scene: "experience" },
  { label: "Work", scene: "work" },
  { label: "Contact", scene: "contact" },
] as const;
