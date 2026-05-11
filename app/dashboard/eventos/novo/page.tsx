import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { EventForm } from "@/components/dashboard/event-form";
import { listCategories } from "@/lib/data/categories";
import { requireOrganizer } from "@/lib/data/organizer";

export default async function NewEventPage() {
  await requireOrganizer();
  const categories = await listCategories();
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <Link
        href="/dashboard/eventos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo evento</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre o evento e ao menos um tipo de ingresso. Você pode publicar
          depois.
        </p>
      </div>
      <EventForm
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </div>
  );
}
