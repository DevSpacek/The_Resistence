# 🧪 Teste Local do Modo Multiplayer

## Como Testar em sua Rede Local

### Opção 1: Usando Múltiplos Dispositivos (Recomendado)

1. **Inicie um servidor local**

   ```bash
   # Se você tem Python 3 instalado:
   python -m http.server 8000

   # Ou com Python 2:
   python -m SimpleHTTPServer 8000

   # Ou com Node.js (se tiver npx):
   npx http-server -p 8000
   ```

2. **Descubra seu IP local**

   - Windows: Abra o CMD e digite `ipconfig`
   - Mac/Linux: Abra o terminal e digite `ifconfig` ou `ip addr`
   - Procure pelo endereço IPv4 (geralmente algo como 192.168.x.x)

3. **Acesse de múltiplos dispositivos**

   - No computador host: `http://localhost:8000`
   - Nos outros dispositivos: `http://SEU_IP:8000`
   - Exemplo: `http://192.168.1.100:8000`

4. **Teste a funcionalidade**
   - Em um dispositivo: Crie uma sala
   - Em outro dispositivo: Entre na sala usando o código
   - Verifique se ambos aparecem na lista de jogadores

### Opção 2: Testando em um Único Dispositivo (Para Debug)

1. **Abra múltiplas abas/janelas**

   - Aba 1: Modo normal (será o host)
   - Aba 2: Modo anônimo/privado (será um jogador)
   - Aba 3: Outro navegador (será outro jogador)

2. **Simule múltiplos jogadores**
   - Em cada aba, use um nome diferente
   - Na primeira aba, crie a sala
   - Nas outras abas, entre com o código

**Nota:** Esta opção pode ter limitações devido às restrições do navegador com múltiplas conexões do mesmo dispositivo.

### Opção 3: Usando GitHub Pages (Online)

Se você fez o deploy no GitHub Pages:

1. Acesse `https://SEU_USUARIO.github.io/The_Resistence/multiplayer.html`
2. Compartilhe o link com os amigos
3. Todos na mesma rede ou até em redes diferentes poderão jogar

## Checklist de Testes

- [ ] Criar sala e ver código gerado
- [ ] QR Code é exibido corretamente
- [ ] Entrar na sala com código correto
- [ ] Jogadores aparecem na lista
- [ ] Contador de jogadores atualiza
- [ ] Botão "Iniciar Jogo" habilita com 5+ jogadores
- [ ] Configuração de personagens funciona
- [ ] Cartas são distribuídas corretamente
- [ ] Cada jogador vê apenas sua carta
- [ ] Sair da sala funciona
- [ ] Cancelar sala funciona

## Solução de Problemas no Teste

### "ERR_CONNECTION_REFUSED"

- Certifique-se de que o servidor está rodando
- Verifique se está usando a porta correta
- Confira o IP na URL

### "Peer error"

- Pode ser bloqueio de firewall
- Tente desabilitar temporariamente o firewall/antivírus
- Verifique se o navegador tem permissões necessárias

### "Cannot connect to peer"

- Todos devem estar na mesma rede
- Verifique as configurações de rede
- Alguns roteadores podem bloquear conexões P2P

### Conexão lenta ou instável

- Verifique a qualidade do sinal Wi-Fi
- Reduza a distância do roteador
- Feche outros aplicativos que usam muita rede

## Logs de Debug

Para ver logs detalhados no navegador:

1. Abra o Console do Desenvolvedor (F12)
2. Vá para a aba "Console"
3. Procure por mensagens de erro ou avisos
4. Os logs incluem:
   - Conexões estabelecidas
   - Mensagens enviadas/recebidas
   - Erros de peer
   - Estado da sala

## Requisitos Mínimos

- Navegador com suporte a WebRTC (Chrome 23+, Firefox 22+, Safari 11+)
- JavaScript habilitado
- Conexão de rede estável
- Sem bloqueios de firewall para WebRTC

## Testes Avançados

### Teste de Estresse (10 jogadores)

1. Abra 10 abas/dispositivos
2. Conecte todos à mesma sala
3. Verifique se todos recebem as cartas

### Teste de Reconexão

1. Crie sala e conecte jogadores
2. Desconecte um jogador (feche aba)
3. Verifique se ele é removido da lista
4. Tente reconectar

### Teste de Personagens Especiais

1. Selecione diferentes combinações de personagens
2. Verifique se as regras são aplicadas corretamente
3. Confirme que as informações de personagens são mostradas

## Estrutura de Arquivos Necessários

```
The_Resistence/
├── index.html
├── multiplayer.html
├── guia-multiplayer.html
├── styles.css
├── manifest.json
├── service-worker.js
├── js/
│   ├── game.js
│   ├── setup.js
│   ├── reveal.js
│   └── multiplayer.js
└── images_back/
    └── [imagens das cartas]
```

## Dependências Externas

O modo multiplayer usa CDNs para:

- PeerJS (conexões WebRTC)
- QRCode.js (geração de QR codes)

Se estiver offline ou com problemas de CDN, você pode baixar localmente:

```html
<!-- Local em vez de CDN -->
<script src="js/libs/peerjs.min.js"></script>
<script src="js/libs/qrcode.min.js"></script>
```

## Próximos Passos

Após os testes básicos funcionarem:

1. [ ] Adicionar mais opções de configuração
2. [ ] Implementar chat entre jogadores
3. [ ] Adicionar sons e notificações
4. [ ] Implementar votação de missões
5. [ ] Adicionar histórico de partidas
6. [ ] Melhorar UI/UX mobile

---

**Boa sorte com os testes! 🎮**
