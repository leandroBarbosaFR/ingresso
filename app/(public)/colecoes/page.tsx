import Image from "next/image";
import Link from "next/link";

import { listCategories } from "@/lib/data/categories";

export const metadata = {
  title: "Coleções — Ingressos",
  description:
    "Navegue por categorias: música, teatro, stand-up, gastronomia, cursos, esportes e mais.",
};

export default async function CollectionsIndexPage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Coleções
        </h1>
        <p className="text-sm text-muted-foreground">
          Encontre eventos por tema. Toque em uma coleção para ver tudo.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/colecoes/${c.slug}`}
            className="group relative isolate overflow-hidden rounded-2xl border border-border bg-muted"
          >
            <div className="relative aspect-[16/10] w-full">
              {c.cover_url ? (
                <Image
                  src={c.cover_url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
            <div className="absolute right-4 bottom-4 left-4 space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                {c.name}
              </h2>
              <p className="text-xs text-white/80">Ver eventos →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
