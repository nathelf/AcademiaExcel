import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Mail, Lock, User, Building2, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

const cadastroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  empresa: z.string().min(2, "Nome da empresa é obrigatório"),
  cnpj: z.string().optional(),
});

const resetSchema = z.object({
  email: z.string().email("Email inválido"),
});

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, testEmpresaInsertion } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  
  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [cadastroNome, setCadastroNome] = useState("");
  const [cadastroEmail, setCadastroEmail] = useState("");
  const [cadastroPassword, setCadastroPassword] = useState("");
  const [cadastroEmpresa, setCadastroEmpresa] = useState("");
  const [cadastroCnpj, setCadastroCnpj] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/contas-pagar");
    }
  }, [user, navigate]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("login_email");
    const savedPassword = localStorage.getItem("login_password");
    const savedRemember = localStorage.getItem("login_remember") === "true";

    if (savedRemember) {
      setRememberLogin(true);
      if (savedEmail) {
        setLoginEmail(savedEmail);
      }
      if (savedPassword) {
        setLoginPassword(savedPassword);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ 
      email: loginEmail, 
      password: loginPassword 
    });
    
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos");
      } else {
        toast.error("Erro ao fazer login: " + error.message);
      }
      return;
    }

    if (rememberLogin) {
      localStorage.setItem("login_email", loginEmail);
      localStorage.setItem("login_password", loginPassword);
      localStorage.setItem("login_remember", "true");
    } else {
      localStorage.removeItem("login_email");
      localStorage.removeItem("login_password");
      localStorage.removeItem("login_remember");
    }

    toast.success("Login realizado com sucesso!");
    navigate("/contas-pagar");
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = cadastroSchema.safeParse({
      nome: cadastroNome,
      email: cadastroEmail,
      password: cadastroPassword,
      empresa: cadastroEmpresa,
      cnpj: cadastroCnpj,
    });
    
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(
      cadastroEmail, 
      cadastroPassword, 
      cadastroNome, 
      cadastroEmpresa, 
      cadastroCnpj || undefined
    );
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("Este email já está cadastrado");
      } else {
        toast.error("Erro ao criar conta: " + error.message);
      }
      return;
    }

    toast.success("Conta criada com sucesso! Bem-vindo ao FinanceFlow!");
    navigate("/contas-pagar");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = resetSchema.safeParse({ email: resetEmail });
    
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(resetEmail);
    setIsLoading(false);

    if (error) {
      toast.error("Erro ao enviar email: " + error.message);
      return;
    }

    toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
    setShowReset(false);
    setResetEmail("");
  };

  if (showReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">FinanceFlow</h1>
              <p className="text-sm text-muted-foreground">Controle Financeiro</p>
            </div>
          </div>

          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Recuperar Senha
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Digite seu email para receber as instruções de recuperação de senha.
            </p>
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 bg-background"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar Email
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowReset(false)}
              >
                Voltar ao login
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lucra+</h1>
            <p className="text-sm text-muted-foreground">Controle Financeiro</p>
          </div>
        </div>

        <Card className="p-6 bg-card border-border">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastrar</TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 bg-background"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-senha">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-senha"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-background"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setShowReset(true)}
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={rememberLogin}
                    onChange={(e) => setRememberLogin(e.target.checked)}
                  />
                  Memorizar email e senha
                </label>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    console.log('Testando inserção de empresa...');
                    const result = await testEmpresaInsertion();
                    console.log('Resultado do teste:', result);
                    if (result.error) {
                      toast.error('Erro no teste: ' + result.error.message);
                    } else {
                      toast.success('Teste bem-sucedido! Empresa criada: ' + result.data.nome);
                    }
                  }}
                >
                  🧪 Testar Inserção Empresa
                </Button>
              </form>
            </TabsContent>

            {/* Cadastro */}
            <TabsContent value="cadastro">
              <form onSubmit={handleCadastro} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      placeholder="Seu nome completo"
                      className="pl-10 bg-background"
                      value={cadastroNome}
                      onChange={(e) => setCadastroNome(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cadastro-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cadastro-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 bg-background"
                      value={cadastroEmail}
                      onChange={(e) => setCadastroEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cadastro-senha">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cadastro-senha"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-background"
                      value={cadastroPassword}
                      onChange={(e) => setCadastroPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa">Nome da Empresa</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="empresa"
                      placeholder="Sua empresa"
                      className="pl-10 bg-background"
                      value={cadastroEmpresa}
                      onChange={(e) => setCadastroEmpresa(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    className="bg-background"
                    value={cadastroCnpj}
                    onChange={(e) => setCadastroCnpj(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar Conta
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Ao continuar, você concorda com nossos{" "}
          <button className="text-primary hover:underline">
            Termos de Serviço
          </button>{" "}
          e{" "}
          <button className="text-primary hover:underline">
            Política de Privacidade
          </button>
        </p>
      </div>
    </div>
  );
}
