"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  size?: "default" | "lg";
};

export function SearchBar({ size = "default" }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/eventos${params.toString() ? `?${params}` : ""}`);
  }

  function searchNearMe() {
    if (!("geolocation" in navigator)) {
      toast.error("Seu navegador não suporta geolocalização.");
      return;
    }
    startTransition(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const params = new URLSearchParams({
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4),
            near: "1",
          });
          router.push(`/eventos?${params}`);
        },
        (err) => {
          toast.error(
            err.code === err.PERMISSION_DENIED
              ? "Permissão de localização negada."
              : "Não foi possível obter sua localização."
          );
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
      );
    });
  }

  const inputCls = size === "lg" ? "h-12 text-base" : "";

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row"
      role="search"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque por evento, artista ou cidade…"
          className={`pl-9 ${inputCls}`}
          aria-label="Buscar eventos"
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={searchNearMe}
          disabled={pending}
          className={size === "lg" ? "h-12 px-4" : ""}
        >
          <MapPin className="h-4 w-4" />
          Perto de mim
        </Button>
        <Button type="submit" className={size === "lg" ? "h-12 px-6" : ""}>
          Buscar
        </Button>
      </div>
    </form>
  );
}
