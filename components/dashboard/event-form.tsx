"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CepField } from "@/components/ui/cep-field";
import { DateTimeField } from "@/components/ui/datetime-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEvent,
  deleteEvent,
  updateEvent,
  type EventActionResult,
} from "@/lib/actions/events";

type CategoryOption = { slug: string; name: string };

type EventInput = {
  id?: string;
  title?: string;
  description?: string | null;
  cover_url?: string | null;
  category?: string | null;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_state?: string;
  starts_at?: string;
  ends_at?: string | null;
  status?: "draft" | "published" | "cancelled" | "finished";
};

type TicketTypeInput = {
  id?: string;
  name: string;
  description?: string | null;
  price_cents: number;
  quantity_total: number;
};

type Props = {
  event?: EventInput;
  ticketTypes?: TicketTypeInput[];
  categories: CategoryOption[];
};

export function EventForm({ event, ticketTypes, categories }: Props) {
  const router = useRouter();
  const isEdit = Boolean(event?.id);

  const action = isEdit
    ? updateEvent.bind(null, event!.id!)
    : (_p: EventActionResult | null, fd: FormData) => createEvent(_p, fd);

  const [state, formAction, pending] = useActionState<
    EventActionResult | null,
    FormData
  >(action, null);
  const [tts, setTts] = useState<TicketTypeInput[]>(
    ticketTypes && ticketTypes.length > 0
      ? ticketTypes
      : [{ name: "", description: "", price_cents: 0, quantity_total: 100 }]
  );

  const [venueAddress, setVenueAddress] = useState(event?.venue_address ?? "");
  const [venueCity, setVenueCity] = useState(event?.venue_city ?? "");
  const [venueState, setVenueState] = useState(event?.venue_state ?? "");

  const [deleting, startDelete] = useTransition();

  const lastStateKey = useRef<string | null>(null);
  useEffect(() => {
    if (!state) return;
    const key = state.ok ? `ok:${state.id}:${Date.now()}` : `err:${state.error}`;
    if (lastStateKey.current === key) return;
    lastStateKey.current = key;
    if (state.ok && isEdit) toast.success("Alterações salvas.");
    if (!state.ok) toast.error(state.error);
  }, [state, isEdit]);

  return (
    <form action={formAction} className="space-y-8">
      {state && !state.ok ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <Section title="Detalhes" description="Informações públicas do evento.">
        <Field id="title" label="Título" required>
          <Input
            id="title"
            name="title"
            defaultValue={event?.title}
            required
            placeholder="Show de Jazz na Praia"
          />
        </Field>

        <Field id="description" label="Descrição">
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={event?.description ?? ""}
            placeholder="O que vai rolar, atrações, regras…"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="category" label="Categoria">
            <Select name="category" defaultValue={event?.category ?? ""}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="status" label="Status" required>
            <Select
              name="status"
              defaultValue={event?.status ?? "draft"}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="finished">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field id="cover_url" label="Imagem de capa (URL)">
          <Input
            id="cover_url"
            name="cover_url"
            type="url"
            defaultValue={event?.cover_url ?? ""}
            placeholder="https://…"
          />
        </Field>
      </Section>

      <Section title="Local e datas">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="starts_at" label="Início" required>
            <DateTimeField
              id="starts_at"
              name="starts_at"
              defaultValue={toLocalInput(event?.starts_at)}
              required
            />
          </Field>
          <Field id="ends_at" label="Término">
            <DateTimeField
              id="ends_at"
              name="ends_at"
              defaultValue={toLocalInput(event?.ends_at)}
            />
          </Field>
        </div>

        <Field id="venue_name" label="Nome do local" required>
          <Input
            id="venue_name"
            name="venue_name"
            defaultValue={event?.venue_name}
            required
            placeholder="Praia Mole"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <Field id="cep" label="CEP">
            <CepField
              onResolved={(addr) => {
                if (addr.logradouro) {
                  const street = addr.bairro
                    ? `${addr.logradouro} — ${addr.bairro}`
                    : addr.logradouro;
                  setVenueAddress(street);
                }
                if (addr.localidade) setVenueCity(addr.localidade);
                if (addr.uf) setVenueState(addr.uf);
                toast.success("Endereço preenchido pelo CEP.");
              }}
              onError={(msg) => toast.error(msg)}
            />
          </Field>
          <Field id="venue_address" label="Endereço" required>
            <Input
              id="venue_address"
              name="venue_address"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              required
              placeholder="Rua, número, complemento"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <Field id="venue_city" label="Cidade" required>
            <Input
              id="venue_city"
              name="venue_city"
              value={venueCity}
              onChange={(e) => setVenueCity(e.target.value)}
              required
              placeholder="Florianópolis"
            />
          </Field>
          <Field id="venue_state" label="UF" required>
            <Input
              id="venue_state"
              name="venue_state"
              value={venueState}
              onChange={(e) => setVenueState(e.target.value.toUpperCase())}
              required
              maxLength={2}
              placeholder="SC"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Ingressos"
        description="Crie ao menos um tipo. Você pode editar depois."
      >
        <div className="space-y-3">
          {tts.map((tt, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border p-3 space-y-3"
            >
              {tt.id ? (
                <input
                  type="hidden"
                  name={`ticket_types[${idx}][id]`}
                  value={tt.id}
                />
              ) : null}
              <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input
                    name={`ticket_types[${idx}][name]`}
                    defaultValue={tt.name}
                    placeholder="Inteira"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Preço (R$)</Label>
                  <Input
                    name={`ticket_types[${idx}][price_reais]`}
                    defaultValue={(tt.price_cents / 100)
                      .toFixed(2)
                      .replace(".", ",")}
                    inputMode="decimal"
                    placeholder="49,00"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Qtd. total</Label>
                  <Input
                    name={`ticket_types[${idx}][quantity_total]`}
                    type="number"
                    min={1}
                    defaultValue={tt.quantity_total}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setTts((prev) => prev.filter((_, i) => i !== idx))
                    }
                    disabled={tts.length === 1}
                    aria-label="Remover ingresso"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs">Descrição</Label>
                <Input
                  name={`ticket_types[${idx}][description]`}
                  defaultValue={tt.description ?? ""}
                  placeholder="Acesso geral, sem reserva de lugar"
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setTts((prev) => [
                ...prev,
                { name: "", description: "", price_cents: 0, quantity_total: 100 },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Adicionar ingresso
          </Button>
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        {isEdit ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            disabled={deleting}
            onClick={() => {
              if (!confirm("Excluir este evento? Esta ação não pode ser desfeita."))
                return;
              startDelete(async () => {
                try {
                  await deleteEvent(event!.id!);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
                }
              });
            }}
          >
            <Trash2 className="h-4 w-4" /> Excluir
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar evento"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}

function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  // datetime-local expects YYYY-MM-DDTHH:mm in local time
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
