/**
 * Mock data used by the landing page until the Supabase events table is wired.
 * All currency is in cents (centavos).
 */

export type Category = {
  slug: string;
  name: string;
  /** Short Unsplash query key — kept stable so categories show consistent imagery */
  cover: string;
};

export type MockEvent = {
  id: string;
  slug: string;
  title: string;
  category: string;
  city: string;
  state: string;
  venue: string;
  startsAt: string; // ISO
  cover: string; // image URL
  priceFromCents: number;
  buyersLast24h: number;
};

export const categories: Category[] = [
  {
    slug: "musica",
    name: "Música",
    cover:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=70",
  },
  {
    slug: "stand-up",
    name: "Stand-up",
    cover:
      "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?auto=format&fit=crop&w=900&q=70",
  },
  {
    slug: "teatro",
    name: "Teatro",
    cover:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=70",
  },
  {
    slug: "familia",
    name: "Família e Crianças",
    cover:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=70",
  },
  {
    slug: "gastronomia",
    name: "Gastronomia",
    cover:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=70",
  },
  {
    slug: "cursos",
    name: "Cursos e Workshops",
    cover:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=70",
  },
  {
    slug: "esportes",
    name: "Esportes",
    cover:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=70",
  },
  {
    slug: "festas",
    name: "Festas",
    cover:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=70",
  },
];

const now = new Date();
const inDays = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

export const mockEvents: MockEvent[] = [
  {
    id: "evt_001",
    slug: "show-de-jazz-na-praia",
    title: "Show de Jazz na Praia",
    category: "musica",
    city: "Florianópolis",
    state: "SC",
    venue: "Praia Mole",
    startsAt: inDays(12),
    cover:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=70",
    priceFromCents: 4900,
    buyersLast24h: 312,
  },
  {
    id: "evt_002",
    slug: "festival-eletronica-sunset",
    title: "Festival Eletrônica Sunset",
    category: "musica",
    city: "Balneário Camboriú",
    state: "SC",
    venue: "Pier 24",
    startsAt: inDays(20),
    cover:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=70",
    priceFromCents: 12000,
    buyersLast24h: 248,
  },
  {
    id: "evt_003",
    slug: "noite-de-stand-up-com-headliners",
    title: "Noite de Stand-up com Headliners",
    category: "stand-up",
    city: "Curitiba",
    state: "PR",
    venue: "Teatro Guaíra",
    startsAt: inDays(7),
    cover:
      "https://images.unsplash.com/photo-1508252592163-5d3c3c559f36?auto=format&fit=crop&w=1200&q=70",
    priceFromCents: 6000,
    buyersLast24h: 187,
  },
  {
    id: "evt_004",
    slug: "musical-infantil-floresta",
    title: "Musical Infantil — Floresta Encantada",
    category: "familia",
    city: "Florianópolis",
    state: "SC",
    venue: "Centro Sul",
    startsAt: inDays(4),
    cover:
      "https://images.unsplash.com/photo-1465479423260-c4afc24172c6?auto=format&fit=crop&w=1200&q=70",
    priceFromCents: 3500,
    buyersLast24h: 156,
  },
  {
    id: "evt_005",
    slug: "jantar-harmonizado-vinhos",
    title: "Jantar Harmonizado com Vinhos",
    category: "gastronomia",
    city: "Porto Alegre",
    state: "RS",
    venue: "Restaurante Boulevard",
    startsAt: inDays(15),
    cover:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=70",
    priceFromCents: 24500,
    buyersLast24h: 98,
  },
  {
    id: "evt_006",
    slug: "workshop-fotografia-de-rua",
    title: "Workshop de Fotografia de Rua",
    category: "cursos",
    city: "São Paulo",
    state: "SP",
    venue: "Estúdio Vila Madalena",
    startsAt: inDays(22),
    cover:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=70",
    priceFromCents: 18000,
    buyersLast24h: 73,
  },
  {
    id: "evt_007",
    slug: "peca-teatral-hamlet",
    title: "Peça Teatral — Hamlet",
    category: "teatro",
    city: "Rio de Janeiro",
    state: "RJ",
    venue: "Teatro Municipal",
    startsAt: inDays(30),
    cover:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=70",
    priceFromCents: 8000,
    buyersLast24h: 64,
  },
  {
    id: "evt_008",
    slug: "festa-rooftop-verao",
    title: "Festa Rooftop Verão",
    category: "festas",
    city: "Florianópolis",
    state: "SC",
    venue: "Rooftop 33",
    startsAt: inDays(9),
    cover:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=70",
    priceFromCents: 7500,
    buyersLast24h: 421,
  },
];

export function formatPriceFromCents(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
