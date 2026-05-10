import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card/30">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <span className="font-semibold tracking-tight">Ingressos</span>
          <p className="text-sm text-muted-foreground">
            A plataforma brasileira de venda de ingressos com taxas justas para
            produtores e compradores.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Para você</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/eventos" className="hover:text-foreground">
                Eventos
              </Link>
            </li>
            <li>
              <Link href="/colecoes" className="hover:text-foreground">
                Coleções
              </Link>
            </li>
            <li>
              <Link href="/meus-ingressos" className="hover:text-foreground">
                Meus ingressos
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Para produtores</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/produtores" className="hover:text-foreground">
                Vender ingressos
              </Link>
            </li>
            <li>
              <Link href="/precos" className="hover:text-foreground">
                Taxas
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-foreground">
                Painel
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/termos" className="hover:text-foreground">
                Termos de uso
              </Link>
            </li>
            <li>
              <Link href="/privacidade" className="hover:text-foreground">
                Privacidade
              </Link>
            </li>
            <li>
              <Link href="/reembolso" className="hover:text-foreground">
                Reembolso
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ingressos. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
