# JP STORE

E-commerce de moda masculina streetwear — React + TypeScript + Vite + Tailwind + Supabase. Pedidos finalizados pelo WhatsApp.

## Como rodar

1. **Supabase**: crie um projeto em supabase.com.
2. No **SQL Editor**, rode todo o conteúdo de `supabase/schema.sql` (tabelas, RLS, bucket `product-images`, categorias iniciais).
3. Em **Authentication > Users**, crie seu usuário (e-mail + senha). Depois rode no SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'SEU_EMAIL';
   ```
4. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (somente a chave **anon**; nunca a service_role).
5. `npm install` e `npm run dev` → http://localhost:5173
6. Acesse `/admin`, entre e: configure o **número do WhatsApp** (Configurações), cadastre cores/tamanhos, banners e produtos.

## Demonstração para o dono (link de uso único)

A rota `/demo` abre uma versão completa da loja e do painel com **produtos de exemplo**, guardados só no navegador de quem testa (nada altera a loja real).

1. Rode `supabase/demo_links.sql` uma vez no SQL Editor do Supabase.
2. Em `/admin` > **Links de demo**, clique em *Gerar link* e envie o link `.../demo/acesso/<código>`.
3. O **primeiro aparelho** que abrir o link fica com o acesso; em qualquer outro aparelho ele mostra "já utilizado". Você pode cancelar um link no mesmo painel.
4. Dentro do demo, o botão **DEMO** restaura os exemplos ou abre o painel de teste (login já preenchido).

Não abra o link antes de enviar: abrir consome o acesso.

## Observações

- Nenhum produto, estoque ou número de WhatsApp vem pré-cadastrado.
- Sem número configurado, o botão de finalizar e o botão flutuante ficam desativados/ocultos.
- Ao finalizar, o WhatsApp abre com a mensagem pronta; o pedido só vale após o cliente enviá-la e a loja confirmar. Um registro é salvo em `orders` (opcional).
- Segurança: leitura pública do catálogo; escrita somente para `profiles.role = 'admin'` (RLS e Storage).
- Build: `npm run build`.
