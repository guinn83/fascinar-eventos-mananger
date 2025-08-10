# Configuração do Supabase para Reset de Senha

## Problema Atual
O link do email não está redirecionando para a página de reset de senha.

## Solução

### 1. Configurar URL de Redirecionamento no Supabase Dashboard

1. Acesse o **Supabase Dashboard**
2. Vá para **Authentication > URL Configuration**
3. Adicione as seguintes URLs em **Redirect URLs**:
   ```
   http://localhost:5173/reset-password
   http://localhost:5174/reset-password
   https://seudominio.com/reset-password
   ```

### 2. Configurar Site URL

1. No mesmo painel, configure o **Site URL**:
   ```
   http://localhost:5173
   ```

### 3. Template de Email (Opcional)

Se quiser personalizar o email, vá para **Authentication > Email Templates > Reset Password** e use:

```html
<h2>Redefinir Senha</h2>
<p>Clique no link abaixo para redefinir sua senha:</p>
<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
```

### 4. Teste Local

Para testar localmente, você pode usar a URL direta:
```
http://localhost:5173/reset-password?access_token=TOKEN&refresh_token=TOKEN&type=recovery
```

### 5. Verificar Configuração

O arquivo `supabase.ts` deve ter a URL correta:

```typescript
const supabaseUrl = 'https://sua-url.supabase.co'
const supabaseAnonKey = 'sua-chave-anonima'
```

## Funcionalidades Implementadas

✅ Tela de login com botão "Esqueceu sua senha?"
✅ Formulário de recuperação de senha
✅ Tela de redefinição de senha (/reset-password)
✅ Validação de senhas
✅ Integração com Supabase Auth
✅ Navegação entre as telas
✅ Loading states e mensagens de erro/sucesso

## Como Testar

1. Na tela de login, clique em "Esqueceu sua senha?"
2. Digite seu email e clique em "Enviar email de recuperação"
3. Verifique sua caixa de entrada
4. Clique no link do email (deve redirecionar para /reset-password)
5. Digite sua nova senha e confirme
6. Será redirecionado para a tela de login

## Troubleshooting

Se o link não funcionar:
1. Verifique se as URLs estão configuradas no Supabase Dashboard
2. Verifique se o email não está na pasta de spam
3. Certifique-se de que o link não expirou (links são válidos por 1 hora)
