import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EventForm } from "@/components/dashboard/event-form";
import { listCategories } from "@/lib/data/categories";
import { requireOrganizer } from "@/lib/data/organizer";
import { getEventForOrganizer, listTicketTypes } from "@/lib/data/events";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizer } = await requireOrganizer();
  const event = await getEventForOrganizer(id, organizer.id);
  if (!event) notFound();

  const [tts, categories] = await Promise.all([
    listTicketTypes(event.id),
    listCategories(),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <Link
        href="/dashboard/eventos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {event.title}
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{event.status}</Badge>
            <span>/{event.slug}</span>
          </div>
        </div>
        {event.status === "published" ? (
          <Link
            href={`/e/${event.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Ver página pública
          </Link>
        ) : null}
      </div>

      <EventForm
        event={event}
        ticketTypes={tts.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          price_cents: t.price_cents,
          quantity_total: t.quantity_total,
        }))}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}
