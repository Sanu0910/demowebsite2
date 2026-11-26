export const WA = "919932141614";
export const waLink = (text: string) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
// absolute URLs so they also work inside CSS url() (which resolves relative to the stylesheet)
export const asset = (p: string) => new URL(`${import.meta.env.BASE_URL}${p}`, document.baseURI).href;
export const img = (p: string) => asset(`img/${p}`);

export type Level = "Easy" | "Moderate" | "Challenging";
export type Trek = {
  id: string;
  name: string;
  country: "Nepal" | "India";
  region: string;
  group: "nepal" | "buddha" | "offbeat";
  img: string;
  level: Level; // indicative — confirm with the team
  highlight: string;
  summit?: string; // well-known high point
  route: string[]; // typical route (final itinerary shared by the team)
};

export const TREKS: Trek[] = [
  { id: "sandakphu", name: "Sandakphu – Phalut", country: "India", region: "West Bengal", group: "buddha", img: "treks/sandakphu.webp", level: "Moderate",
    highlight: "Watch the Sleeping Buddha range glow at sunrise, with Everest on the horizon.", summit: "Sandakphu 3,636 m",
    route: ["Manebhanjan", "Tumling", "Kalipokhari", "Sandakphu", "Sabargram", "Phalut", "Gorkhey"] },
  { id: "mardi", name: "Mardi Himal", country: "Nepal", region: "Annapurna", group: "nepal", img: "treks/mardi-himal.webp", level: "Moderate",
    highlight: "Ridge walking face-to-face with Machapuchare (Mt Fishtail).",
    route: ["Kande", "Forest Camp", "Low Camp", "High Camp", "Upper View Point"] },
  { id: "abc", name: "Annapurna Base Camp", country: "Nepal", region: "Annapurna", group: "nepal", img: "treks/annapurna-base-camp.webp", level: "Moderate",
    highlight: "Step into the Annapurna amphitheatre, surrounded by giants.", summit: "ABC 4,130 m",
    route: ["Ghandruk", "Chhomrong", "Bamboo", "Deurali", "Machhapuchhre BC", "Annapurna BC"] },
  { id: "ebc", name: "Everest Base Camp", country: "Nepal", region: "Khumbu", group: "nepal", img: "treks/everest-base-camp.webp", level: "Challenging",
    highlight: "The classic: Sherpa villages, monasteries and the foot of Everest.", summit: "EBC 5,364 m",
    route: ["Lukla", "Phakding", "Namche Bazaar", "Tengboche", "Dingboche", "Lobuche", "Gorak Shep", "Everest BC"] },
  { id: "goechala", name: "Goechala", country: "India", region: "Sikkim", group: "offbeat", img: "treks/goechala.webp", level: "Challenging",
    highlight: "Kanchenjunga up close, golden at first light.",
    route: ["Yuksom", "Sachen", "Tshoka", "Dzongri", "Thansing", "Lamuney", "Goecha La view"] },
  { id: "circuit", name: "Annapurna Circuit", country: "Nepal", region: "Annapurna", group: "nepal", img: "treks/annapurna-circuit.webp", level: "Challenging",
    highlight: "Turquoise lakes, Manang valley and the legendary Thorong La.", summit: "Thorong La 5,416 m",
    route: ["Besisahar", "Chame", "Manang", "Thorong Phedi", "Thorong La", "Muktinath"] },
  { id: "manaslu", name: "Manaslu Circuit", country: "Nepal", region: "Gorkha", group: "nepal", img: "treks/manaslu-circuit.webp", level: "Challenging",
    highlight: "Remote, wild and quiet — around the world's eighth-highest peak.", summit: "Larke Pass 5,106 m",
    route: ["Soti Khola", "Jagat", "Namrung", "Samagaon", "Dharamsala", "Larke Pass", "Bimthang"] },
  { id: "dzukou", name: "Dzükou Valley", country: "India", region: "Nagaland", group: "offbeat", img: "treks/dzukou-valley.webp", level: "Easy",
    highlight: "Rolling green meadows — the valley of flowers of the North-East.",
    route: ["Viswema", "Ridge trail", "Dzükou rest house", "Valley meadows"] },
  { id: "silent", name: "Silent Valley", country: "India", region: "India", group: "offbeat", img: "treks/silent-valley.webp", level: "Easy",
    highlight: "Offbeat village trails, prayer flags and warm local hospitality.",
    route: ["Village trailhead", "Forest trail", "Silent Valley"] },
];

export const DEPARTURES = [
  { trek: "Annapurna Base Camp", id: "abc", poster: "posters/abc.webp", dates: ["Dec 05 – 14", "Dec 26 – Jan 04"] },
  { trek: "Sandakphu – Phalut", id: "sandakphu", poster: "posters/sandakphu.webp", dates: ["Dec 26 – Jan 01", "Jan 02 – 08", "Jan 23 – 29"] },
  { trek: "Mardi Himal", id: "mardi", poster: "posters/mardi.webp", dates: ["Dec 28 – Jan 02"] },
];

export const GALLERY: Record<string, { imgs: number[]; title: string; count: number }> = {
  "2026": { imgs: [20, 21, 22, 23, 25], title: "Footsteps & Frames", count: 477 },
  "2025": { imgs: [9, 8, 17, 13, 18], title: "Altitude & Aperture", count: 444 },
  "2024": { imgs: [1, 2, 3, 4, 6], title: "Frames from the Trail", count: 331 },
};

export const FAQ = [
  { q: "Who leads the treks?", a: "Our treks are led by a certified mountaineer and registered guides, with a medical team on the trail. Founder Jyotishko Biswas trained at HMI and NIMAS and has served as an instructor at HMI, Darjeeling." },
  { q: "Why do trek prices sometimes vary?", a: "Prices can be higher or lower because of permits, transportation, service quality and responsible tourism. Ask us on WhatsApp for the current price of any departure." },
  { q: "Do I have to pay any extra donation?", a: "No. We never ask participants for additional charitable donations — your booking amount covers only the services included in your trek. Supporting local communities is simply part of how we operate." },
  { q: "How do I book a seat?", a: "Tap any departure date or the WhatsApp button. Team Trekking Buddha will confirm availability, share the full itinerary and guide you through booking." },
  { q: "I'm a first-timer. Which trek should I choose?", a: "Use the trek finder above and pick the “Easy” or “Moderate” level, or simply message us — we'll suggest a trek that matches your fitness and dates." },
];
