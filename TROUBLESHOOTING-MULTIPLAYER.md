# 🔧 Solução de Problemas - Modo Multiplayer

## ⚠️ Problema: "Fica Travado em 'Conectando à sala...'"

### 🎯 Causas Comuns:

#### 1. **Testando com múltiplas abas no mesmo navegador**

**Sintoma:** Trava em "Conectando..." e nunca conecta

**Causa:** O WebRTC/PeerJS tem limitações ao conectar múltiplas instâncias no mesmo navegador/dispositivo.

**Solução:**

```
❌ NÃO USE:
- Chrome aba 1 + Chrome aba 2
- Firefox aba 1 + Firefox aba 2
- Chrome normal + Chrome anônimo (pode ter problemas)

✅ USE INSTEAD:
- Chrome no PC + Firefox no PC
- PC + Celular
- PC + Tablet
- Celular 1 + Celular 2
- Notebook + Desktop
```

#### 2. **Código da sala incorreto**

**Sintoma:** Trava e depois mostra erro de timeout

**Solução:**

- Verifique se copiou o código completo
- O código é case-sensitive (diferencia maiúsculas/minúsculas)
- Use o botão "Copiar Código" para evitar erros

#### 3. **Host fechou a sala**

**Sintoma:** Erro "peer-unavailable" ou timeout

**Solução:**

- Certifique-se de que o host ainda está com a sala aberta
- Peça ao host para criar uma nova sala

#### 4. **Redes Wi-Fi diferentes**

**Sintoma:** Não conecta ou timeout

**Solução:**

- Todos devem estar na MESMA rede Wi-Fi
- Desconecte VPNs
- Desabilite dados móveis e use apenas Wi-Fi

---

## 🚀 Como Testar Corretamente

### ✅ Teste Básico (2 Dispositivos)

**Opção 1: PC + Celular**

```
1. PC (Host):
   - Abra Chrome
   - Crie a sala
   - Anote o código

2. Celular (Jogador):
   - Abra qualquer navegador
   - Entre na sala
   - Digite o código
```

**Opção 2: Dois Navegadores Diferentes**

```
1. Chrome (Host):
   - Crie a sala
   - Mantenha aberto

2. Firefox (Jogador):
   - Abra em OUTRO navegador
   - Entre na sala
   - Digite o código
```

**Opção 3: Dois Dispositivos Físicos**

```
1. Notebook (Host):
   - Crie a sala

2. Desktop/Celular (Jogador):
   - Entre na sala
```

---

## 🔍 Debug Passo a Passo

### 1. **Verifique o Console (F12)**

Abra o console do navegador e procure por:

**No Host:**

```javascript
✅ Bom:
"Peer ID: abc123xyz"
"Room created: abc123xyz"
"New connection from: def456"

❌ Ruim:
"Peer error: ..."
"Connection error: ..."
```

**No Jogador:**

```javascript
✅ Bom:
"Peer ID: def456"
"Connecting to host: abc123xyz"
"Connected to host"

❌ Ruim:
"Connection error: ..."
"Tempo de conexão esgotado"
```

### 2. **Verifique a Rede**

```bash
# No PC do host, descubra o IP:
ipconfig    (Windows)
ifconfig    (Mac/Linux)

# Exemplo de resultado:
IPv4: 192.168.1.100

# Certifique-se de que outros dispositivos estão na mesma rede:
# O IP deve começar com os mesmos 3 números
# Ex: 192.168.1.xxx
```

### 3. **Teste a Conexão Básica**

```javascript
// Cole no console do navegador para testar PeerJS:

const peer = new Peer();
peer.on("open", (id) => {
	console.log("✅ PeerJS funcionando! ID:", id);
});
peer.on("error", (err) => {
	console.log("❌ Erro PeerJS:", err);
});
```

---

## 💡 Soluções Rápidas

### Solução 1: Use Dispositivos Diferentes

**Melhor opção para garantir que funciona**

- Host no computador
- Jogadores em celulares/tablets
- Todos na mesma Wi-Fi

### Solução 2: Use Navegadores Diferentes

**Funciona no mesmo PC**

- Host: Chrome
- Jogador 1: Firefox
- Jogador 2: Edge
- Jogador 3: Opera

### Solução 3: Use Modo Incógnito com Cuidado

**Pode funcionar parcialmente**

- Chrome normal (Host)
- Chrome incógnito (Jogador)
- ⚠️ Pode ter limitações

### Solução 4: Reinicie Tudo

**Quando nada funciona**

1. Feche todas as abas
2. Limpe o cache (Ctrl+Shift+Del)
3. Reabra o navegador
4. Tente novamente

---

## 🐛 Erros Específicos

### ❌ "Tempo de conexão esgotado"

**Causa:** Não conseguiu conectar em 15 segundos

**Soluções:**

1. Código está errado → Verifique o código
2. Host offline → Confirme que host está com sala aberta
3. Firewall bloqueando → Desative temporariamente
4. Redes diferentes → Conecte na mesma Wi-Fi

### ❌ "peer-unavailable"

**Causa:** O peer ID não existe ou já desconectou

**Soluções:**

1. Host fechou a sala → Peça para criar nova sala
2. Código expirou → Use código mais recente
3. Digitou errado → Copie o código novamente

### ❌ "Could not connect to peer"

**Causa:** WebRTC não conseguiu estabelecer conexão

**Soluções:**

1. Firewall/Antivírus → Desabilite temporariamente
2. Rede corporativa/escola → Pode bloquear P2P
3. VPN ativa → Desative VPN
4. Use outra rede → Tente Wi-Fi doméstico

### ❌ "Peer error: network"

**Causa:** Problema de rede

**Soluções:**

1. Verifique conexão com internet
2. Reinicie o roteador
3. Troque de rede Wi-Fi
4. Use dados móveis (mas todos devem usar mesma rede)

---

## 📋 Checklist de Troubleshooting

Antes de reportar um bug, verifique:

- [ ] Estou usando dispositivos/navegadores diferentes?
- [ ] Todos estão na mesma rede Wi-Fi?
- [ ] O código está correto (copiado exatamente)?
- [ ] O host manteve a sala aberta?
- [ ] O firewall/antivírus está permitindo?
- [ ] A VPN está desativada?
- [ ] Estou em HTTPS ou localhost?
- [ ] O console mostra algum erro específico?
- [ ] Já tentei recarregar a página?
- [ ] Já tentei limpar o cache?

---

## 🎯 Teste Definitivo

Se nada funcionar, faça este teste:

```
1. Use 2 celulares diferentes
2. Conecte ambos na mesma Wi-Fi
3. Celular 1: Crie sala
4. Celular 2: Entre na sala
5. Digite o código manualmente

Se funcionar → O problema era testar no mesmo dispositivo
Se não funcionar → Problema de rede/firewall
```

---

## 📞 Ainda Com Problemas?

### Informações para Reportar Bug:

```
Ambiente:
- Dispositivo Host: [PC/Celular/Tablet]
- Navegador Host: [Chrome/Firefox/Safari] + versão
- Dispositivo Jogador: [PC/Celular/Tablet]
- Navegador Jogador: [Chrome/Firefox/Safari] + versão
- Mesma rede? [Sim/Não]
- Mesma rede tipo: [Wi-Fi doméstico/Corporativo/Escola]

Erro:
- Mensagem exibida: [Texto do erro]
- Console (F12): [Copie os erros vermelhos]
- Momento do erro: [Ao criar/Ao entrar/Durante jogo]

Já tentou:
- [ ] Dispositivos diferentes
- [ ] Navegadores diferentes
- [ ] Limpou cache
- [ ] Desabilitou firewall
- [ ] Desabilitou VPN
```

---

## 🔄 Alternativas

Se o modo multiplayer não funcionar na sua rede:

### **Opção 1: Modo Clássico**

- Use o modo clássico (passa o dispositivo)
- Funciona 100% sem necessidade de rede
- Mais lento mas sempre funciona

### **Opção 2: Servidor Remoto**

- Deploy no GitHub Pages
- Acesse via internet (não só rede local)
- Funciona de qualquer lugar

### **Opção 3: Hotspot**

- Crie um hotspot Wi-Fi no celular
- Conecte todos os dispositivos nele
- Crie a sala e teste

---

## ✅ Confirmação de Sucesso

Você saberá que funcionou quando:

**No Host:**

- ✅ Código da sala aparece
- ✅ QR Code é gerado
- ✅ Jogador aparece na lista
- ✅ Contador aumenta para 2

**No Jogador:**

- ✅ Mensagem "✅ Conectado"
- ✅ Vê a lista de jogadores
- ✅ Vê o próprio nome na lista
- ✅ Vê o host marcado

---

**Boa sorte! Se seguir essas instruções, vai funcionar! 🎮**

Para testes REAIS, sempre use dispositivos diferentes! 📱💻
