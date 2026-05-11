import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventCard } from "@/components/site/event-card";
import { getCategory } from "@/lib/data/categories";
import { listPublicEvents } from "@/lib/data/public-events";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = await getCategory(slug);
  if (!cat) return {};
  return {
    title: `${cat.name} — Coleção`,
    description: `Eventos de ${cat.name.toLowerCase()} no Ingressos.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const events = await listPublicEvents({ category: slug });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:py-12">
      <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-muted">
        <div className="relative aspect-[16/6] w-full sm:aspect-[16/4]">
          {category.cover_url ? (
            <Image
              src={category.cover_url}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="absolute inset-x-6 bottom-6 sm:inset-x-10 sm:bottom-10">
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-white/70 uppercase">
              Coleção
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {category.name}
            </h1>
            <p className="text-sm text-white/80">
              {events.length} {events.length === 1 ? "evento" : "eventos"}{" "}
              disponíveis
            </p>
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Ainda não há eventos publicados nesta coleção.
          </p>
          <Link
            href="/eventos"
            className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
          >
            Ver todos os eventos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
