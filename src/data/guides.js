export const guides = [
  {
    title: "App fitness per principianti",
    href: "/app-fitness-principianti",
    category: "Principianti",
    readTime: "4 min",
    description: "Per partire da zero con workout semplici, guidati e sostenibili.",
    tags: ["principianti", "iniziare", "ripartire", "zero"],
    featuredHome: true,
  },
  {
    title: "Mini workout efficaci",
    href: "/mini-workout-efficaci",
    category: "Poco tempo",
    readTime: "5 min",
    description: "Quando 5 o 10 minuti possono aiutarti davvero a creare continuità.",
    tags: ["workout brevi", "mini workout", "10 minuti", "poco tempo"],
    featuredHome: true,
  },
  {
    title: "Workout 10 minuti a casa",
    href: "/workout-10-minuti-casa",
    category: "Poco tempo",
    readTime: "4 min",
    description: "Un allenamento semplice e realistico per chi ha poco tempo.",
    tags: ["10 minuti", "casa", "poco tempo", "workout"],
    featuredHome: true,
  },
  {
    title: "Allenamento a casa",
    href: "/allenamento-a-casa",
    category: "Allenamento a casa",
    readTime: "5 min",
    description: "Come iniziare ad allenarti a casa senza complicarti la vita.",
    tags: ["allenamento a casa", "home workout", "casa", "iniziare"],
    featuredHome: false,
  },
  {
    title: "Benefici della camminata",
    href: "/benefici-camminata-tempo",
    category: "Benessere",
    readTime: "6 min",
    description: "Cosa aspettarti da 10, 20, 30 o 60 minuti di camminata.",
    tags: ["camminata", "walking", "benessere", "attività fisica"],
    featuredHome: false,
  },
  {
    title: "Come essere costanti nell'allenamento",
    href: "/come-essere-costanti-nell-allenamento",
    category: "Costanza",
    readTime: "5 min",
    description: "Strategie realistiche per continuare senza vivere di motivazione.",
    tags: ["costanza", "motivazione", "abitudine", "non mollare"],
    featuredHome: false,
  },
];

export const guideCategories = Array.from(new Set(guides.map((guide) => guide.category)));

export const guideFooterLinks = guides.map(({ title, href }) => ({ title, href }));

export const homeGuideCards = guides
  .filter((guide) => guide.featuredHome)
  .slice(0, 3);
