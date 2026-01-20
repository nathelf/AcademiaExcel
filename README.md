# Bem-vindo ao seu projeto Lucra+

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lucra+**

Visite o [Projeto Lucra+](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) e comece a usar.

Mudanças feitas via Lucra+ serão commitadas automaticamente neste repositório.

**Use your preferred IDE**

Se quiser trabalhar localmente usando sua própria IDE, você pode clonar este repositório e enviar mudanças. Mudanças enviadas também serão refletidas no Lucra+.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Basta abrir o [Lucra+](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) e clicar em Share -> Publish.

## Posso conectar um domínio personalizado ao meu projeto Lucra+?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Modo offline com fixtures locais

- **Ative os mocks**: defina `VITE_USE_LOCAL_FIXTURES=true` no seu `.env` e reinicie o servidor (`npm run dev`). O app continuará usando o Supabase oficial enquanto a flag não estiver ativa.
- **Como os dados são persistidos**: todos os registros ficam em `localStorage` sob a chave `excel_companion_local_store`. O mock simula o `auth` e as operações `from(...).insert/select/update/delete` que o `useAuth` usa durante o signup.
- **Resetando o estado local**: para limpar os dados e testar um novo cadastro, execute no console do navegador:

```
localStorage.removeItem("excel_companion_local_store");
localStorage.removeItem("supabase.auth.token");
location.reload();
```

Essa estratégia vale apenas para desenvolvimento local; em cenários de produção continue conectando ao Supabase real.
