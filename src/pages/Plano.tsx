import { Check, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const planos = [
  {
    id: "starter",
    nome: "Starter",
    preco: "R$ 49",
    periodo: "/mês",
    descricao: "Para começar sua organização financeira",
    recursos: [
      "1 usuário",
      "Até 100 lançamentos/mês",
      "Dashboard básico",
      "Relatórios simples",
      "Suporte por email",
    ],
    destaque: false,
    atual: false,
  },
  {
    id: "pro",
    nome: "Pro",
    preco: "R$ 99",
    periodo: "/mês",
    descricao: "Para empresas em crescimento",
    recursos: [
      "Até 5 usuários",
      "Lançamentos ilimitados",
      "Dashboard completo",
      "Relatórios avançados",
      "Exportação Excel/PDF",
      "Suporte prioritário",
    ],
    destaque: true,
    atual: true,
  },
  {
    id: "business",
    nome: "Business",
    preco: "R$ 199",
    periodo: "/mês",
    descricao: "Para operações complexas",
    recursos: [
      "Usuários ilimitados",
      "Multiempresas",
      "API de integração",
      "Relatórios customizados",
      "Anexos e comprovantes",
      "Suporte 24/7",
      "Gerente de conta",
    ],
    destaque: false,
    atual: false,
  },
];

export default function Plano() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Plano e Assinatura
        </h1>
        <p className="text-muted-foreground">
          Escolha o plano ideal para seu negócio
        </p>
      </div>

      {/* Current Plan Banner */}
      <Card className="p-4 bg-primary/10 border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">
                Você está no plano <span className="text-primary">Pro</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Próxima cobrança: 15/02/2024
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Gerenciar Assinatura
          </Button>
        </div>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planos.map((plano) => (
          <Card
            key={plano.id}
            className={cn(
              "p-6 bg-card border-border relative overflow-hidden transition-all",
              plano.destaque && "border-primary shadow-glow-primary"
            )}
          >
            {plano.destaque && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                Mais Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                {plano.nome}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {plano.descricao}
              </p>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-foreground">
                {plano.preco}
              </span>
              <span className="text-muted-foreground">{plano.periodo}</span>
            </div>

            <ul className="space-y-3 mb-6">
              {plano.recursos.map((recurso, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-foreground">{recurso}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={plano.atual ? "outline" : plano.destaque ? "default" : "secondary"}
              disabled={plano.atual}
            >
              {plano.atual ? "Plano Atual" : "Escolher Plano"}
            </Button>
          </Card>
        ))}
      </div>

      {/* Usage Stats */}
      <Card className="p-6 bg-card border-border">
        <h3 className="font-semibold text-foreground mb-4">Uso do Plano</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Usuários</p>
            <p className="text-2xl font-semibold text-foreground">2 / 5</p>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-primary rounded-full" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Lançamentos (este mês)
            </p>
            <p className="text-2xl font-semibold text-foreground">142</p>
            <p className="text-sm text-muted-foreground mt-1">Ilimitado</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Armazenamento</p>
            <p className="text-2xl font-semibold text-foreground">1.2 GB</p>
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full w-1/4 bg-accent rounded-full" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Relatórios</p>
            <p className="text-2xl font-semibold text-foreground">28</p>
            <p className="text-sm text-muted-foreground mt-1">Gerados este mês</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
