// Central content for the site's dynamic listings and detail pages.
//
// The destination/package/experience/blog detail pages are all
// deliberately lightweight placeholders (see each page's "notice" copy) —
// the real day-by-day itineraries, pricing and long-form articles are still
// to be written by the MYC team. This file is the single place to update
// once that content exists; every card, grid and detail page reads from it.

export type Destination = {
  slug: string;
  name: string;
  tag: string;
  image: string;
  alt: string;
  imagePosition?: string;
  /** One-line editorial note shown on the destination's detail-page placeholder, alongside the standard notice. */
  highlight: string;
};

export const destinations: Destination[] = [
  {
    slug: "rajasthan-india",
    name: "Rajasthan, India",
    tag: "Forts, palaces & desert light",
    image: "/images/dest-rajasthan.jpg",
    alt: "Amber Fort at sunset with a woman on a balcony, Rajasthan, India",
    imagePosition: "center 55%",
    highlight: "Forts, palaces and desert light — MYC's home region, and where the circle first took shape.",
  },
  {
    slug: "kyoto-japan",
    name: "Kyoto, Japan",
    tag: "Temples & quiet gardens",
    image: "/images/dest-kyoto.jpg",
    alt: "Kinkaku-ji golden pavilion surrounded by cherry blossom, Kyoto, Japan",
    highlight: "Temples and quiet gardens — a slower, more contemplative side of Japan than the postcard route.",
  },
  {
    slug: "santorini-greece",
    name: "Santorini, Greece",
    tag: "Aegean coastlines",
    image: "/images/dest-santorini.jpg",
    alt: "Blue-domed churches above the caldera at sunset, Santorini, Greece",
    highlight: "Aegean coastlines — caldera views and long evenings, away from the crush at Oia.",
  },
  {
    slug: "machu-picchu-peru",
    name: "Machu Picchu, Peru",
    tag: "High-altitude heritage",
    image: "/images/dest-machupicchu.jpg",
    alt: "Machu Picchu ruins in the mist, Andes mountains, Peru",
    highlight: "High-altitude heritage — the Sacred Valley and the citadel, paced properly for the altitude.",
  },
  {
    slug: "amalfi-coast-italy",
    name: "Amalfi Coast, Italy",
    tag: "Cliffside coastal drives",
    image: "/images/journey-amalfi.jpg",
    alt: "Cliffside town of Positano on the Amalfi Coast, Italy",
    highlight: "Cliffside coastal drives — private boats, long dinners, and towns built into the rock.",
  },
];

export type Package = {
  slug: string;
  title: string;
  typeTag: string;
  place: string;
  nights: string;
  nightsCount: number;
  region: "india" | "international";
  desc: string;
  image: string;
  alt: string;
};

export const packages: Package[] = [
  {
    slug: "royal-trails-of-rajasthan",
    title: "Royal Trails of Rajasthan",
    typeTag: "Culture & Heritage",
    place: "Rajasthan, India",
    nights: "10 Nights",
    nightsCount: 10,
    region: "india",
    desc: "Palace stays, desert camps and private heritage walks.",
    image: "/images/journey-rajasthan.jpg",
    alt: "Woman overlooking Amber Fort, Rajasthan, India",
  },
  {
    slug: "kyoto-in-bloom",
    title: "Kyoto in Bloom",
    typeTag: "Culture & Heritage",
    place: "Kyoto, Japan",
    nights: "7 Nights",
    nightsCount: 7,
    region: "international",
    desc: "Temple gardens, tea ceremonies and quiet backstreets.",
    image: "/images/journey-kyoto.jpg",
    alt: "Chureito pagoda framed by cherry blossom, Kyoto, Japan",
  },
  {
    slug: "amalfi-coast-escape",
    title: "Amalfi Coast Escape",
    typeTag: "Slow Travel",
    place: "Amalfi Coast, Italy",
    nights: "8 Nights",
    nightsCount: 8,
    region: "international",
    desc: "Cliffside towns, private boats and long dinners by the sea.",
    image: "/images/journey-amalfi.jpg",
    alt: "Cliffside town of Positano on the Amalfi Coast, Italy",
  },
  {
    slug: "sacred-valley-machu-picchu",
    title: "Sacred Valley & Machu Picchu",
    typeTag: "Culture & Heritage",
    place: "Peru",
    nights: "9 Nights",
    nightsCount: 9,
    region: "international",
    desc: "High-altitude trails and a private dawn at the citadel.",
    image: "/images/journey-peru.jpg",
    alt: "Traveller overlooking Machu Picchu, Peru",
  },
];

export type TravelStyle = {
  slug: string;
  index: string;
  name: string;
  overline: string;
  desc: string;
  image: string;
  alt: string;
  imagePosition?: string;
};

// The six tabs in the homepage "Travel Your Way" section, and the six
// style tiles on /experiences.
export const travelStyles: TravelStyle[] = [
  {
    slug: "culture-heritage",
    index: "01",
    name: "Culture & Heritage",
    overline: "Signature Style",
    desc: "Local historians, private access and the stories behind the monuments.",
    image: "/images/style-culture.jpg",
    alt: "Woman in a carved archway overlooking Udaipur's City Palace and Lake Pichola at sunset",
    imagePosition: "center 62%",
  },
  {
    slug: "slow-travel",
    index: "02",
    name: "Slow Travel",
    overline: "Signature Style",
    desc: "Fewer stops, longer stays, and mornings with nowhere else to be.",
    image: "/images/style-slowtravel.jpg",
    alt: "Traveller with a cup of tea on a palace terrace overlooking a misty lake at sunrise",
    imagePosition: "center 60%",
  },
  {
    slug: "wildlife-nature",
    index: "03",
    name: "Wildlife & Nature",
    overline: "Signature Style",
    desc: "Private reserves, expert naturalists and sightings worth the early start.",
    image: "/images/style-wildlife.jpg",
    alt: "Traveller watching a family of elephants at a waterhole from a safari lodge deck at sunset",
    imagePosition: "center 58%",
  },
  {
    slug: "culinary-journeys",
    index: "04",
    name: "Culinary Journeys",
    overline: "Signature Style",
    desc: "Market visits, chef's tables and the dishes a place is actually known for.",
    image: "/images/style-culinary.jpg",
    alt: "Table set for dinner on a terrace overlooking the Amalfi coast at sunset",
    imagePosition: "center 68%",
  },
  {
    slug: "adventure-trekking",
    index: "05",
    name: "Adventure & Trekking",
    overline: "Signature Style",
    desc: "Guided routes, proper acclimatisation and views worth every step.",
    image: "/images/style-adventure.jpg",
    alt: "Trekker with a backpack looking out over the Himalayas at sunrise",
    imagePosition: "center 55%",
  },
  {
    slug: "spiritual-wellness",
    index: "06",
    name: "Spiritual & Wellness",
    overline: "Signature Style",
    desc: "Quiet mornings, meaningful rituals and space to actually slow down.",
    image: "/images/style-spiritual.jpg",
    alt: "Traveller in quiet reflection at a temple courtyard at sunrise",
    imagePosition: "center 65%",
  },
];

export type BeyondItem = {
  slug: string;
  eyebrow: string;
  title: string;
  desc: string;
  linkLabel: string;
  image: string;
  alt: string;
};

// The four "Beyond the Itinerary" / Signature Experiences cards, also
// listed alongside the six travel styles on /experiences.
export const beyondItinerary: BeyondItem[] = [
  {
    slug: "private-cultural-encounters",
    eyebrow: "Private Access",
    title: "Private cultural encounters",
    desc: "Meals with local families, artisan workshops after hours, and access arranged through relationships built over years — not booked through a portal.",
    linkLabel: "See private access experiences",
    image: "/images/beyond-jaipur.jpg",
    alt: "Empty veranda set for arrival, overlooking a Rajasthan lake palace at sunset",
  },
  {
    slug: "stays-with-soul",
    eyebrow: "Unique Stays",
    title: "Stays with soul",
    desc: "Heritage havelis, family-run ryokans and small hotels chosen for character, not chain-brand consistency.",
    linkLabel: "Explore our signature stays",
    image: "/images/beyond-kyoto.jpg",
    alt: "Kyoto garden with cherry blossom and a traditional pagoda",
  },
  {
    slug: "table-for-two",
    eyebrow: "Food & Culture",
    title: "Table for two, anywhere",
    desc: "From street-food trails to a chef's table booked weeks ahead — every meal is a chance to understand a place a little better.",
    linkLabel: "Discover culinary experiences",
    image: "/images/beyond-amalfi.jpg",
    alt: "Table set for dinner overlooking the Amalfi coast at Positano",
  },
  {
    slug: "hidden-experiences",
    eyebrow: "Local Access",
    title: "Hidden experiences",
    desc: "The workshop with no sign, the viewpoint with no queue — found through people on the ground, not a listings page.",
    linkLabel: "Explore hidden experiences",
    image: "/images/beyond-udaipur-terrace.jpg",
    alt: "Private terrace overlooking Lake Pichola and the city of Udaipur at sunset",
  },
];

export type Blog = {
  slug: string;
  category: string;
  destination?: string;
  date: string;
  title: string;
  summary: string;
  image: string;
  alt: string;
};

export const blogs: Blog[] = [
  {
    slug: "first-timers-guide-to-rajasthan",
    category: "Destination Guide",
    destination: "Rajasthan",
    date: "March 2026",
    title: "A First-Timer's Guide to Rajasthan",
    summary: "Palace stays, the best season to travel, and a handful of experiences worth building an itinerary around.",
    image: "/images/journal-rajasthan.jpg",
    alt: "Rajasthan palace balcony at sunset",
  },
  {
    slug: "planning-your-first-international-journey",
    category: "Travel Tips",
    date: "February 2026",
    title: "Planning Your First International Journey",
    summary: "A practical guide to documents, packing and pacing — everything MYC tells first-time travellers before they leave.",
    image: "/images/journal-amalfi.jpg",
    alt: "Travel-planning still life with camera and notebook overlooking the Amalfi coast",
  },
  {
    slug: "inside-kyotos-culinary-traditions",
    category: "Culture",
    destination: "Kyoto",
    date: "January 2026",
    title: "Inside Kyoto's Culinary Traditions",
    summary: "From kaiseki dinners to quiet neighbourhood tea houses — the food culture behind every MYC Japan itinerary.",
    image: "/images/journal-kyoto.jpg",
    alt: "Traditional Japanese dinner spread under cherry blossom, Kyoto",
  },
  {
    slug: "sunset-hunting-in-santorini",
    category: "Destination Guide",
    destination: "Santorini",
    date: "December 2025",
    title: "Sunset-Hunting in Santorini, Without the Crowds",
    summary: "Oia gets the postcard shot — here's where MYC sends travellers instead, and when to go to skip the crush.",
    image: "/images/dest-santorini.jpg",
    alt: "Whitewashed cliffside village overlooking the caldera in Santorini, Greece",
  },
];

// All ten /experiences/[slug] pages: the six travel styles plus the four
// "beyond the itinerary" items, normalized to one shape for the shared
// detail-page template.
export type ExperienceDetail = {
  slug: string;
  eyebrow: string;
  title: string;
  desc: string;
  image: string;
  alt: string;
  imagePosition?: string;
};

export const experienceDetails: ExperienceDetail[] = [
  ...travelStyles.map((s) => ({
    slug: s.slug,
    eyebrow: "Travel Style",
    title: s.name,
    desc: s.desc,
    image: s.image,
    alt: s.alt,
    imagePosition: s.imagePosition,
  })),
  ...beyondItinerary.map((b) => ({
    slug: b.slug,
    eyebrow: b.eyebrow,
    title: b.title,
    desc: b.desc,
    image: b.image,
    alt: b.alt,
  })),
];

export const siteConfig = {
  name: "My Yatra Circle",
  shortName: "MYC",
  email: "Info@myyatracircle.com",
  phone: "+91 70422 90942",
  phoneHref: "+917042290942",
  address: "WZ-104, Meenakshi Garden, Subhash Nagar, New Delhi – 110018",
};
