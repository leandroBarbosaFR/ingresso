import Image from "next/image";
import Link from "next/link";

import { categories } from "@/lib/mock-events";

export function CollectionsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-12 sm:py-16">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Explore nossas coleções
        </h2>
        <p className="text-sm text-muted-foreground">
          Encontre o que você gosta — de música ao vivo a workshops.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/colecoes/${category.slug}`}
            className="group relative isolate overflow-hidden rounded-xl border border-border bg-muted"
          >
            <div className="aspect-[4/3] w-full">
              <Image
                src={category.cover}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <span className="absolute bottom-3 left-3 text-sm font-medium text-white">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
