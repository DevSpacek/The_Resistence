# 🚀 DEPLOY RÁPIDO - The Resistance PWA

## 📦 O que você precisa:

1. Conta no GitHub (gratuita)
2. Git instalado (ou usar interface web do GitHub)
3. Os ícones gerados (icon-192.png e icon-512.png)

## ⚡ Passo a Passo - GitHub Pages (Mais Fácil)

### 1. Gerar os Ícones (IMPORTANTE!)

```
1. Abra generate-icons.html no navegador
2. Clique em "Baixar 192x192"
3. Clique em "Baixar 512x512"
4. Salve ambos na pasta raiz do projeto com os nomes:
   - icon-192.png
   - icon-512.png
```

### 2. Criar Repositório no GitHub

**Via Interface Web:**

```
1. Acesse github.com
2. Clique em "New repository"
3. Nome: the-resistance (ou outro nome)
4. Público ou Privado (ambos funcionam)
5. NÃO adicione README, .gitignore ou licença
6. Clique em "Create repository"
```

### 3. Fazer Upload dos Arquivos

**Opção A - Via Web (Mais Fácil):**

```
1. Na página do repositório criado
2. Clique em "uploading an existing file"
3. Arraste TODOS os arquivos da pasta:
   - index.html
   - reveal.html
   - styles.css
   - manifest.json
   - service-worker.js
   - generate-icons.html
   - como-instalar.html
   - icon-192.png
   - icon-512.png
   - Pasta js/ (com todos os .js)
   - Pasta images_back/ (com todas as imagens)
4. Clique em "Commit changes"
```

**Opção B - Via Git (Linha de Comando):**

```bash
# No terminal, dentro da pasta do projeto:
git init
git add .
git commit -m "Initial commit - The Resistance PWA"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/the-resistance.git
git push -u origin main
```

### 4. Ativar GitHub Pages

```
1. No repositório, clique em "Settings"
2. No menu lateral, clique em "Pages"
3. Em "Source", selecione "main" branch
4. Clique em "Save"
5. Aguarde 1-2 minutos
6. O link aparecerá: https://SEU-USUARIO.github.io/the-resistance
```

### 5. Testar

```
1. Abra o link no celular
2. Verifique se carrega corretamente
3. Tente instalar o app
4. Teste offline (modo avião)
```

## 🌐 Alternativas de Deploy

### Netlify (Também Muito Fácil)

```
1. Acesse netlify.com
2. Cadastre-se (gratuito)
3. Clique em "Add new site" → "Deploy manually"
4. Arraste a pasta do projeto
5. Pronto! Link gerado automaticamente
6. Pode configurar domínio personalizado
```

### Vercel

```
1. Acesse vercel.com
2. Cadastre-se (gratuito)
3. Clique em "Add New" → "Project"
4. Importe do GitHub ou arraste a pasta
5. Clique em "Deploy"
6. Link gerado automaticamente
```

## ✅ Checklist Pré-Deploy

Antes de fazer o deploy, certifique-se:

- [ ] Ícones gerados (icon-192.png e icon-512.png)
- [ ] Todos os arquivos HTML, CSS, JS presentes
- [ ] Pasta js/ com todos os arquivos
- [ ] Pasta images_back/ com todas as imagens
- [ ] manifest.json configurado
- [ ] service-worker.js presente
- [ ] Testado localmente

## 🔧 Após o Deploy

### Compartilhar com Jogadores

```
1. Envie o link do app: https://SEU-USUARIO.github.io/the-resistance
2. Instrua a instalar no celular:
   - Android: Chrome → Menu → "Adicionar à tela inicial"
   - iOS: Safari → Compartilhar → "Adicionar à Tela de Início"
3. Após instalado, funciona 100% offline
```

### Atualizar o App

```
1. Faça as alterações nos arquivos locais
2. Faça novo commit e push (Git)
   OU arraste os arquivos novamente (Web)
3. GitHub Pages atualiza automaticamente em 1-2 minutos
4. Usuários receberão atualização ao abrir o app
```

### Personalizar Domínio (Opcional)

```
GitHub Pages:
1. Compre um domínio (namecheap, godaddy, etc)
2. Em Settings → Pages → Custom domain
3. Digite seu domínio
4. Configure DNS no provedor do domínio

Netlify/Vercel:
1. Settings → Domain Management
2. Adicione domínio personalizado
3. Siga instruções de DNS
```

## 🐛 Problemas Comuns

### Ícones não aparecem?

```
- Verifique se icon-192.png e icon-512.png estão na raiz
- Nomes devem ser exatamente esses
- Extensão .png (não .jpg)
```

### Service Worker não funciona?

```
- Certifique-se que está usando HTTPS
- GitHub Pages usa HTTPS automaticamente
- Localhost também funciona para testes
```

### Página 404?

```
- Aguarde 1-2 minutos após ativar GitHub Pages
- Verifique se selecionou "main" branch
- Confirme que index.html está na raiz
```

### App não instala no iOS?

```
- Use Safari (não Chrome)
- iOS tem suporte limitado a PWA
- Funciona via "Adicionar à Tela de Início"
```

## 📱 QR Code para Compartilhar

Após fazer deploy, gere um QR Code:

```
1. Acesse qr-code-generator.com
2. Escolha "URL"
3. Cole seu link: https://SEU-USUARIO.github.io/the-resistance
4. Baixe o QR Code
5. Compartilhe com amigos para instalarem rapidamente
```

## 🎉 Pronto!

Agora você tem um app mobile profissional hospedado e acessível para todos os jogadores!

**Link exemplo:**

```
https://SEU-USUARIO.github.io/the-resistance
```

Compartilhe e divirta-se! 🎭

---

**Dúvidas?** Consulte os arquivos:

- `README_MOBILE.md` - Documentação completa
- `como-instalar.html` - Guia visual de instalação
- `MELHORIAS_MOBILE.md` - Lista de todas as melhorias
