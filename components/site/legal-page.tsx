export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-8 px-4 py-12">
      <header className="space-y-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Documento legal
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Última atualização: {updatedAt}
        </p>
      </header>
      <div className="space-y-6 leading-relaxed text-sm [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:font-medium [&_h3]:text-foreground [&_p]:text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-muted-foreground [&_strong]:text-foreground">
        {children}
      </div>
      <footer className="border-t border-border pt-6 text-xs text-muted-foreground">
        Para dúvidas legais escreva para{" "}
        <a
          href="mailto:juridico@ingressos.local"
          className="font-medium text-foreground underline underline-offset-4"
        >
          juridico@ingressos.local
        </a>
        .
      </footer>
    </article>
  );
}
