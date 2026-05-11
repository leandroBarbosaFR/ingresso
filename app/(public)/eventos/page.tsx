import Link from "next/link";
import { Search } from "lucide-react";

import { EventCard } from "@/components/site/event-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listCategories } from "@/lib/data/categories";
import { listPublicEvents } from "@/lib/data/public-events";

export const metadata = {
  title: "Eventos — Ingressos",
  description:
    "Descubra todos os eventos: música, teatro, stand-up, esportes, gastronomia e muito mais.",
};

type SortKey = "date" | "popular" | "price";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "date", label: "Mais próximos" },
  { key: "popular", label: "Mais populares" },
  { key: "price", label: "Menor preço" },
];

type SearchParams = Promise<{
  q?: string;
  cat?: string;
  cidade?: string;
  sort?: string;
  near?: string;
}>;

export default async function EventosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const cat = sp.cat ?? "";
  const cidade = sp.cidade?.trim() ?? "";
  const sort: SortKey = isSortKey(sp.sort) ? sp.sort : "date";
  const isNear = sp.near === "1";

  const [events, categories] = await Promise.all([
    listPublicEvents({ q, category: cat, city: cidade, sort }),
    listCategories(),
  ]);
  const categoryName = categories.find((c) => c.slug === cat)?.name;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:py-12">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {categoryName ?? "Todos os eventos"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {events.length} {events.length === 1 ? "evento" : "eventos"}
          {q ? <> para “{q}”</> : null}
          {cidade ? <> em {cidade}</> : null}
          {isNear ? <> perto de você</> : null}
        </p>
      </header>

      <form
        method="GET"
        action="/eventos"
        className="flex flex-col gap-3 sm:flex-row"
        role="search"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Buscar evento, artista ou local…"
            className="pl-9"
            aria-label="Buscar eventos"
          />
        </div>
        <Input
          name="cidade"
          defaultValue={cidade}
          placeholder="Cidade"
          className="sm:max-w-[180px]"
          aria-label="Cidade"
        />
        {cat ? <input type="hidden" name="cat" value={cat} /> : null}
        {sp.sort ? <input type="hidden" name="sort" value={sp.sort} /> : null}
        <button
          type="submit"
          className="hidden rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background sm:inline-flex"
        >
          Filtrar
        </button>
      </form>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          <CategoryChip
            label="Todas"
            active={!cat}
            href={hrefWith({ cat: "", q, cidade, sort })}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.slug}
              label={c.name}
              active={cat === c.slug}
              href={hrefWith({ cat: c.slug, q, cidade, sort })}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Ordenar:</span>
        {sortOptions.map((o) => (
          <Link
            key={o.key}
            href={hrefWith({ cat, q, cidade, sort: o.key })}
            className={
              "rounded-full border px-3 py-1 transition-colors " +
              (sort === o.key
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground")
            }
          >
            {o.label}
          </Link>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={
        "shrink-0 rounded-full border px-3 py-1 text-sm transition-colors " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:text-foreground")
      }
    >
      {label}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <Badge variant="secondary" className="rounded-full">
        Nenhum resultado
      </Badge>
      <p className="max-w-sm text-sm text-muted-foreground">
        Não encontramos eventos com esses filtros. Tente outra cidade ou
        categoria.
      </p>
      <Link
        href="/eventos"
        className="text-sm font-medium underline underline-offset-4"
      >
        Limpar filtros
      </Link>
    </div>
  );
}

function isSortKey(v: string | undefined): v is SortKey {
  return v === "date" || v === "popular" || v === "price";
}

function hrefWith(parts: {
  cat?: string;
  q?: string;
  cidade?: string;
  sort?: SortKey | string;
}) {
  const sp = new URLSearchParams();
  if (parts.q) sp.set("q", parts.q);
  if (parts.cat) sp.set("cat", parts.cat);
  if (parts.cidade) sp.set("cidade", parts.cidade);
  if (parts.sort && parts.sort !== "date") sp.set("sort", parts.sort);
  const qs = sp.toString();
  return qs ? `/eventos?${qs}` : "/eventos";
}
