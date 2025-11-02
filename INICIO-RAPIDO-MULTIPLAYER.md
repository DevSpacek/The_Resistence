# 🚀 COMO TESTAR O MODO MULTIPLAYER

## ⚡ Teste Rápido (5 minutos)

### 1️⃣ Iniciar o Servidor Local

Abra o PowerShell na pasta do projeto e execute:

```powershell
# Se você tem Python instalado:
python -m http.server 8000

# OU use este comando para criar um servidor simples:
# (Se não tiver Python, pode usar a extensão Live Server do VS Code)
```

### 2️⃣ Descobrir seu IP Local

No PowerShell, execute:

```powershell
ipconfig
```

Procure por "Endereço IPv4" na seção da sua conexão Wi-Fi.
Exemplo: `192.168.1.100`

### 3️⃣ Abrir em Múltiplos Dispositivos

**No computador (Host):**

- Abra: `http://localhost:8000/multiplayer.html`

**No celular/tablet (Jogador):**

- Conecte na mesma rede Wi-Fi
- Abra: `http://SEU_IP:8000/multiplayer.html`
- Exemplo: `http://192.168.1.100:8000/multiplayer.html`

### 4️⃣ Testar a Conexão

**No computador:**

1. Digite seu nome
2. Clique em "Criar Sala"
3. Anote o código que aparecer

**No celular:**

1. Digite seu nome
2. Clique em "Entrar na Sala"
3. Digite o código
4. Clique em "Conectar"

### 5️⃣ Verificar se Funcionou

✅ Você deve ver:

- O jogador do celular aparecer na lista do computador
- O contador de jogadores aumentar
- Ambos os nomes na lista de jogadores

## 🎯 Teste Completo (Com Jogo)

Para testar a distribuição de cartas, você precisa de pelo menos 5 "jogadores".

### Opção A: Usar Múltiplos Dispositivos

- 1 computador (host)
- 4+ celulares/tablets dos amigos
- Todos na mesma Wi-Fi

### Opção B: Simular com Múltiplas Abas

1. **Aba 1 (Normal):** Host - cria a sala
2. **Aba 2 (Anônima):** Jogador 2 - entra na sala
3. **Aba 3 (Outro navegador):** Jogador 3 - entra na sala
4. Continue até ter 5 jogadores
5. Inicie o jogo no host

**Nota:** A Opção B pode ter limitações técnicas.

## 📱 Usando VS Code Live Server

Se você tem a extensão Live Server instalada:

1. Clique com botão direito em `multiplayer.html`
2. Selecione "Open with Live Server"
3. Anote o endereço (exemplo: `http://127.0.0.1:5500`)
4. No celular, substitua `127.0.0.1` pelo seu IP local

## 🔍 Como Verificar se Está Funcionando

### Console do Navegador (F12):

Você deve ver mensagens como:

```
Peer ID: xxxxx
Room created: xxxxx
New connection from: xxxxx
Player joined: [Nome do Jogador]
```

### Na Interface:

**Host deve ver:**

- Código da sala exibido
- QR Code gerado
- Lista de jogadores atualizando
- Botão "Iniciar Jogo" habilitado (com 5+ jogadores)

**Jogadores devem ver:**

- "✅ Conectado" na sala de espera
- Lista de todos os jogadores
- Status do host identificado

## 🎮 Testando a Distribuição de Cartas

Com 5+ jogadores conectados:

1. **Host:** Clique em "Iniciar Jogo"
2. **Host:** Selecione personagens especiais (opcional)
3. **Host:** Clique em "Iniciar Jogo" novamente
4. **Todos:** Devem ver suas cartas aparecerem automaticamente!

### O que Verificar:

- [ ] Cada jogador vê uma carta diferente
- [ ] As cartas estão corretas (resistência vs espião)
- [ ] Informações especiais aparecem (se aplicável)
- [ ] Número correto de espiões (2 para 5-6, 3 para 7-9, 4 para 10)
- [ ] Personagens especiais funcionam corretamente

## 🐛 Problemas Comuns e Soluções

### ❌ "Cannot connect to peer"

**Causa:** Firewall bloqueando WebRTC

**Solução:**

1. Desabilite temporariamente o firewall
2. OU adicione exceção para a porta 8000
3. OU teste em rede diferente

### ❌ "Peer error: peer-unavailable"

**Causa:** Código de sala incorreto ou sala fechada

**Solução:**

1. Verifique se o código está correto
2. Crie uma nova sala
3. Certifique-se de que o host não fechou a sala

### ❌ Celular não consegue acessar

**Causa:** Não está na mesma rede ou IP incorreto

**Solução:**

1. Confirme que todos estão na mesma Wi-Fi
2. Verifique se o IP está correto
3. Desabilite VPN se estiver usando
4. Tente em modo anônimo do navegador

### ❌ QR Code não aparece

**Causa:** Biblioteca QRCode.js não carregou

**Solução:**

1. Verifique conexão com internet (CDN)
2. Recarregue a página
3. Use o código de texto como alternativa

## 💡 Dicas de Teste

1. **Sempre use nomes diferentes** em cada dispositivo
2. **Mantenha o console aberto** (F12) para ver logs
3. **Teste primeiro com 2 dispositivos** antes de reunir todo mundo
4. **Use o modo desenvolvedor** do navegador para simular mobile
5. **Tire prints** de erros para debug

## 📊 Checklist de Teste Completo

### Conexão:

- [ ] Host consegue criar sala
- [ ] Código é gerado e exibido
- [ ] QR Code aparece
- [ ] Jogador consegue entrar com código
- [ ] Jogador aparece na lista do host
- [ ] Contador de jogadores atualiza
- [ ] Jogador vê sala de espera
- [ ] Múltiplos jogadores conseguem entrar

### Jogo:

- [ ] Botão inicia desabilitado com <5 jogadores
- [ ] Botão inicia habilitado com 5+ jogadores
- [ ] Modal de configuração abre
- [ ] Personagens especiais podem ser selecionados
- [ ] Jogo inicia ao confirmar
- [ ] Cartas são distribuídas
- [ ] Cada jogador vê sua carta
- [ ] Informações corretas são exibidas
- [ ] Espiões recebem informações dos outros espiões
- [ ] Comandante vê lista de espiões (se aplicável)

### Robustez:

- [ ] Desconexão de jogador remove da lista
- [ ] Cancelar sala funciona
- [ ] Sair da sala funciona
- [ ] Reconexão funciona (criar nova sala)
- [ ] Funciona com conexão lenta

## 🎯 Próximos Passos Após Testes

Se tudo funcionar:

1. ✅ Faça commit das alterações
2. ✅ Faça push para o GitHub
3. ✅ Teste no GitHub Pages
4. ✅ Compartilhe com amigos para teste real
5. ✅ Jogue uma partida completa!

Se algo não funcionar:

1. ❌ Verifique os logs do console
2. ❌ Consulte TESTE-MULTIPLAYER.md
3. ❌ Verifique configurações de rede
4. ❌ Tente em outro navegador

## 📞 Precisa de Ajuda?

1. Abra o console (F12) e tire print dos erros
2. Verifique qual navegador está usando
3. Confirme que todos os arquivos foram criados
4. Teste em modo incógnito (sem cache)

---

**Boa sorte com os testes! 🎮**

Se funcionar, você terá um sistema multiplayer completo para The Resistance! 🎉
