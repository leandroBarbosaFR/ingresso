import Image from "next/image";

import { SearchBar } from "@/components/site/search-bar";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1920&q=70"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:py-28 md:py-32">
        <div className="space-y-4">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Os melhores eventos,
            <br />
            sem fila no caixa.
          </h1>
          <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Descubra shows, festivais e experiências perto de você. Compre seu
            ingresso em segundos, com Pix ou cartão.
          </p>
        </div>

        <SearchBar size="lg" />
      </div>
    </section>
  );
}
