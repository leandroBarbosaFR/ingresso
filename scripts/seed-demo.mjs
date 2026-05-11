/**
 * Idempotent demo seeder.
 *
 *   node --env-file=.env.local scripts/seed-demo.mjs
 *
 * Creates (or updates):
 *   - 15 event_maker users + organizers (plus the existing super_admin)
 *   - 20 client_user buyer accounts
 *   - ~30 published events with 2–3 ticket types each
 *   - paid orders + tickets to populate revenue and "popular last 24h"
 *
 * Re-running uses the same emails & slugs and upserts.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  "Content-Type": "application/json",
};

async function req(path, init = {}) {
  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = body?.message || body?.error || res.statusText;
    throw new Error(`${init.method ?? "GET"} ${path} → ${res.status} ${msg}`);
  }
  return body;
}

// ----------------------------------------------------------------------------
// Demo dataset
// ----------------------------------------------------------------------------

const demoPassword = "Demo1234!";

const cities = [
  ["Florianópolis", "SC"],
  ["Curitiba", "PR"],
  ["Porto Alegre", "RS"],
  ["São Paulo", "SP"],
  ["Rio de Janeiro", "RJ"],
  ["Belo Horizonte", "MG"],
  ["Salvador", "BA"],
  ["Recife", "PE"],
  ["Fortaleza", "CE"],
  ["Brasília", "DF"],
];

const organizerCompanies = [
  { slug: "alma-do-sul",      name: "Alma do Sul Produções",     legal_name: "Alma do Sul Produções LTDA" },
  { slug: "stage-on",         name: "Stage On",                  legal_name: "Stage On Eventos ME" },
  { slug: "noites-cariocas",  name: "Noites Cariocas",           legal_name: "Noites Cariocas Eventos LTDA" },
  { slug: "rooftop-collective", name: "Rooftop Collective",      legal_name: "Rooftop Collective Eventos" },
  { slug: "humor-aberto",     name: "Humor Aberto",              legal_name: "Humor Aberto Cia" },
  { slug: "pequenos-grandes", name: "Pequenos Grandes",          legal_name: "Pequenos Grandes Brincar LTDA" },
  { slug: "mesa-15",          name: "Mesa 15",                   legal_name: "Mesa Quinze Gastronomia" },
  { slug: "campo-aberto",     name: "Campo Aberto Esportes",     legal_name: "Campo Aberto Esportes LTDA" },
  { slug: "capital-cursos",   name: "Capital Cursos",            legal_name: "Capital Cursos & Workshops" },
  { slug: "drama-livre",      name: "Drama Livre",               legal_name: "Drama Livre Companhia" },
  { slug: "som-da-rua",       name: "Som da Rua",                legal_name: "Som da Rua Música" },
  { slug: "bossa-festas",     name: "Bossa Festas",              legal_name: "Bossa Festas Eventos" },
  { slug: "curitiba-arena",   name: "Curitiba Arena",            legal_name: "Curitiba Arena Promoções" },
  { slug: "luz-do-mar",       name: "Luz do Mar",                legal_name: "Luz do Mar Produções LTDA" },
  { slug: "sertao-cultural",  name: "Sertão Cultural",           legal_name: "Sertão Cultural Eventos" },
];

const eventTemplates = {
  musica: [
    { title: "Festival Eletrônica Sunset",       cover: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=70" },
    { title: "Show de Jazz na Praia",            cover: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=70" },
    { title: "Indie Brasil — Edição de Verão",   cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=70" },
    { title: "Samba Raiz — Roda Aberta",         cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=70" },
  ],
  "stand-up": [
    { title: "Noite de Stand-up com Headliners", cover: "https://images.unsplash.com/photo-1508252592163-5d3c3c559f36?auto=format&fit=crop&w=1200&q=70" },
    { title: "Comedy Open Mic",                   cover: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?auto=format&fit=crop&w=1200&q=70" },
    { title: "Rir até Doer — Especial",          cover: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=70" },
  ],
  teatro: [
    { title: "Peça Teatral — Hamlet",            cover: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=70" },
    { title: "Antígona Reencenada",               cover: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1200&q=70" },
    { title: "Auto da Compadecida — Reencontro", cover: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=70" },
  ],
  familia: [
    { title: "Musical Infantil — Floresta Encantada", cover: "https://images.unsplash.com/photo-1465479423260-c4afc24172c6?auto=format&fit=crop&w=1200&q=70" },
    { title: "Domingo no Parque com a Galerinha", cover: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=70" },
  ],
  gastronomia: [
    { title: "Jantar Harmonizado com Vinhos",    cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=70" },
    { title: "Churrasco Sul — All You Can Eat",  cover: "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=1200&q=70" },
    { title: "Brunch Premium na Cobertura",      cover: "https://images.unsplash.com/photo-1481931098730-318b6f776db0?auto=format&fit=crop&w=1200&q=70" },
  ],
  cursos: [
    { title: "Workshop de Fotografia de Rua",    cover: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=70" },
    { title: "Mini-curso de Mixologia",          cover: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=70" },
    { title: "Live Coding com Next.js",          cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=70" },
  ],
  esportes: [
    { title: "Corrida Noturna 5K",               cover: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=70" },
    { title: "Torneio de Vôlei de Praia",        cover: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=70" },
  ],
  festas: [
    { title: "Festa Rooftop Verão",              cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=70" },
    { title: "Open Bar Tropical",                 cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=70" },
    { title: "Aniversário Coletivo no Lounge",   cover: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1200&q=70" },
  ],
};

// 20 fictional buyer names
const buyerFirstNames = [
  "Mariana","Pedro","Carolina","Lucas","Fernanda","Rafael","Beatriz","Gustavo",
  "Camila","Thiago","Larissa","Bruno","Isabela","Felipe","Ana","Rodrigo",
  "Juliana","Diego","Patrícia","Vinícius",
];
const buyerLastNames = [
  "Silva","Souza","Oliveira","Costa","Rocha","Pereira","Almeida","Lima",
  "Carvalho","Mendes","Ribeiro","Barbosa","Gomes","Martins","Araújo","Pinto",
  "Cardoso","Nogueira","Moreira","Castro",
];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const slugify = (s) =>
  s
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function pick(array, i) {
  return array[i % array.length];
}

function dateInDays(days, hour = 20) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function fakeCpf() {
  return Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join(
    ""
  );
}

async function findUserByEmail(email) {
  // page through admin users; cap at first 1000 for the seed scope
  const list = await req(`/auth/v1/admin/users?page=1&per_page=1000`);
  return list.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
}

async function ensureUser({ email, password, name }) {
  const existing = await findUserByEmail(email);
  if (existing) return existing;
  const user = await req(`/auth/v1/admin/users`, {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    }),
  });
  return user;
}

async function setProfile(userId, role, name) {
  await req(`/rest/v1/profiles?on_conflict=id`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ id: userId, role, name }),
  });
}

async function upsertOrganizer({ user_id, name, legal_name }) {
  const cnpj = `${String(Math.floor(10000000000000 + Math.random() * 89999999999999)).slice(0, 14)}`;
  const result = await req(`/rest/v1/organizers?on_conflict=user_id`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      user_id,
      name,
      legal_name,
      cnpj: cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5"),
      tax_regime: pick(["simples_nacional", "lucro_presumido", "mei"], user_id.length),
    }),
  });
  return result[0];
}

async function ensureEvent({
  organizer_id,
  title,
  cover,
  category,
  city,
  uf,
  startsAt,
  index,
}) {
  const slug = `${slugify(title)}-${slugify(city)}-${index}`.slice(0, 80);
  // try to find by slug first
  const found = await req(
    `/rest/v1/events?slug=eq.${encodeURIComponent(slug)}&select=id`
  );
  if (Array.isArray(found) && found.length > 0) return { id: found[0].id, slug };

  const body = {
    organizer_id,
    slug,
    title,
    description: `${title} — uma experiência imperdível em ${city}/${uf}.`,
    cover_url: cover,
    category,
    venue_name: `${city} Hall`,
    venue_address: `Av. Central, ${100 + index * 7}`,
    venue_city: city,
    venue_state: uf,
    starts_at: startsAt,
    status: "published",
  };
  const inserted = await req(`/rest/v1/events?select=id`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  return { id: inserted[0].id, slug };
}

async function ensureTicketTypes(eventId, base) {
  // delete existing first to keep the seed deterministic
  await req(`/rest/v1/ticket_types?event_id=eq.${eventId}`, {
    method: "DELETE",
  });
  const types = [
    {
      event_id: eventId,
      name: "Pista",
      price_cents: base,
      quantity_total: 200,
      quantity_sold: 0,
      position: 0,
    },
    {
      event_id: eventId,
      name: "VIP",
      price_cents: Math.round(base * 2.2),
      quantity_total: 80,
      quantity_sold: 0,
      position: 1,
    },
    {
      event_id: eventId,
      name: "Mesa (4 pessoas)",
      price_cents: Math.round(base * 3.5),
      quantity_total: 30,
      quantity_sold: 0,
      position: 2,
    },
  ];
  await req(`/rest/v1/ticket_types`, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(types),
  });
  // fetch back to get IDs
  const inserted = await req(
    `/rest/v1/ticket_types?event_id=eq.${eventId}&select=id,name,price_cents&order=position.asc`
  );
  return inserted;
}

async function seedOrders({ event, ticketTypes, buyers, count }) {
  // pick random buyers, write orders + tickets, increment quantity_sold
  for (let i = 0; i < count; i++) {
    const buyer = pick(buyers, Math.floor(Math.random() * buyers.length));
    const tt = pick(ticketTypes, i);
    const qty = 1 + Math.floor(Math.random() * 2);
    const subtotal = tt.price_cents * qty;
    const fees = Math.round(subtotal * 0.07) + 99 * qty;
    const total = subtotal + fees;

    const paidAt = new Date(
      Date.now() - Math.floor(Math.random() * 22 * 60 * 60 * 1000)
    ).toISOString();

    const order = await req(`/rest/v1/orders?select=id`, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        event_id: event.id,
        buyer_name: buyer.name,
        buyer_email: buyer.email,
        buyer_cpf: fakeCpf(),
        subtotal_cents: subtotal,
        fees_cents: fees,
        total_cents: total,
        status: "paid",
        payment_method: pick(["pix", "credit_card"], i),
        paid_at: paidAt,
      }),
    });
    const orderId = order[0].id;

    // order_items
    await req(`/rest/v1/order_items`, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        order_id: orderId,
        ticket_type_id: tt.id,
        quantity: qty,
        unit_price_cents: tt.price_cents,
        attendees: Array.from({ length: qty }, () => ({
          name: buyer.name,
          cpf: fakeCpf(),
        })),
      }),
    });

    // tickets
    const tickets = Array.from({ length: qty }, () => ({
      order_id: orderId,
      ticket_type_id: tt.id,
      event_id: event.id,
      holder_name: buyer.name,
      holder_cpf: fakeCpf(),
      status: "valid",
    }));
    await req(`/rest/v1/tickets`, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(tickets),
    });

    // bump quantity_sold via PATCH (use PostgREST raw SQL if needed; here we
    // increment by select-then-update)
    const cur = await req(
      `/rest/v1/ticket_types?id=eq.${tt.id}&select=quantity_sold`
    );
    await req(`/rest/v1/ticket_types?id=eq.${tt.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        quantity_sold: (cur[0]?.quantity_sold ?? 0) + qty,
      }),
    });
  }
}

// ----------------------------------------------------------------------------
// Run
// ----------------------------------------------------------------------------

console.log("Seeding demo data…");

// 1. Organizers (15)
console.log("\n→ organizers");
const organizers = [];
for (let i = 0; i < organizerCompanies.length; i++) {
  const c = organizerCompanies[i];
  const email = `org+${c.slug}@demo.ingressos.test`;
  const user = await ensureUser({ email, password: demoPassword, name: c.name });
  await setProfile(user.id, "event_maker", c.name);
  const organizer = await upsertOrganizer({
    user_id: user.id,
    name: c.name,
    legal_name: c.legal_name,
  });
  organizers.push({ ...organizer, email, ownerId: user.id });
  process.stdout.write(`.`);
}
console.log(` ${organizers.length} ok`);

// 2. Buyers (20)
console.log("\n→ buyers");
const buyers = [];
for (let i = 0; i < 20; i++) {
  const first = pick(buyerFirstNames, i);
  const last = pick(buyerLastNames, i + 1);
  const name = `${first} ${last}`;
  const email = `buyer+${slugify(name)}@demo.ingressos.test`;
  const user = await ensureUser({ email, password: demoPassword, name });
  await setProfile(user.id, "client_user", name);
  buyers.push({ id: user.id, email, name });
  process.stdout.write(".");
}
console.log(` ${buyers.length} ok`);

// 3. Events (~30): each organizer gets 1–3 events spread across categories.
console.log("\n→ events + ticket types + orders");
const categoriesList = Object.keys(eventTemplates);
let eventIdx = 0;
for (let i = 0; i < organizers.length; i++) {
  const org = organizers[i];
  const eventCount = 1 + (i % 3); // 1, 2, or 3
  for (let j = 0; j < eventCount; j++) {
    const cat = pick(categoriesList, eventIdx);
    const tpl = pick(eventTemplates[cat], eventIdx);
    const [city, uf] = pick(cities, eventIdx);
    const startsAt = dateInDays(3 + (eventIdx % 60), 18 + (eventIdx % 5));
    const event = await ensureEvent({
      organizer_id: org.id,
      title: tpl.title,
      cover: tpl.cover,
      category: cat,
      city,
      uf,
      startsAt,
      index: eventIdx,
    });
    const basePrice = 3500 + ((eventIdx * 1700) % 16000); // R$ 35–195
    const ticketTypes = await ensureTicketTypes(event.id, basePrice);
    const orderCount = 4 + (eventIdx % 9); // 4–12 orders per event
    await seedOrders({
      event,
      ticketTypes,
      buyers,
      count: orderCount,
    });
    process.stdout.write(".");
    eventIdx++;
  }
}
console.log(` ${eventIdx} ok`);

console.log("\nDone.");
console.log(`Demo password for all seeded users: ${demoPassword}`);
console.log(`Organizer emails like: org+<slug>@demo.ingressos.test`);
console.log(`Buyer emails like:     buyer+<nome-sobrenome>@demo.ingressos.test`);
