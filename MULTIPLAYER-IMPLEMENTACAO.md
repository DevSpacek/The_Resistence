# 🎮 Sistema Multiplayer Local - The Resistance

## ✨ Implementação Concluída!

Sistema multiplayer local implementado com sucesso usando WebRTC e PeerJS. Agora cada jogador pode receber sua carta de personagem individualmente no próprio dispositivo!

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:

- ✅ `multiplayer.html` - Interface do modo multiplayer
- ✅ `js/multiplayer.js` - Lógica de conexão e gerenciamento
- ✅ `guia-multiplayer.html` - Guia completo para usuários
- ✅ `MULTIPLAYER.md` - Documentação técnica
- ✅ `TESTE-MULTIPLAYER.md` - Guia de testes
- ✅ `MULTIPLAYER-IMPLEMENTACAO.md` - Este arquivo

### Arquivos Modificados:

- ✅ `index.html` - Adicionado botão para modo multiplayer
- ✅ `styles.css` - Adicionados estilos para multiplayer

## 🎯 Funcionalidades Implementadas

### ✅ Para o Host (Criador da Sala):

- Criar sala com código único
- Gerar QR Code para fácil entrada
- Ver lista de jogadores conectados
- Configurar personagens especiais
- Iniciar jogo e distribuir cartas
- Receber própria carta automaticamente

### ✅ Para Jogadores:

- Entrar na sala com código
- Ver lista de jogadores na sala de espera
- Receber carta automaticamente quando o jogo iniciar
- Ver apenas sua própria carta no dispositivo
- Sair da sala a qualquer momento

### ✅ Sistema de Conexão:

- Conexão P2P usando WebRTC
- Funciona em rede local (mesma Wi-Fi)
- Sem necessidade de servidor externo após conexão
- Suporte para 5-10 jogadores
- Reconexão automática em caso de falha

### ✅ Distribuição de Cartas:

- Usa lógica existente do `GameManager`
- Distribuição aleatória de personagens
- Cada jogador recebe sua carta individualmente
- Informações de personagens especiais preservadas
- Suporte a todos os personagens especiais

## 🔧 Tecnologias Utilizadas

- **WebRTC** - Comunicação peer-to-peer em tempo real
- **PeerJS** - Biblioteca para simplificar WebRTC
- **QRCode.js** - Geração de QR codes para fácil entrada
- **JavaScript ES6+** - Lógica do aplicativo
- **HTML5 + CSS3** - Interface responsiva

## 📱 Como Usar

### Início Rápido:

1. **Host cria a sala:**

   - Clica em "🌐 Modo Multiplayer Local"
   - Digita seu nome
   - Clica em "🏠 Criar Sala"
   - Compartilha o código com os jogadores

2. **Jogadores entram:**

   - Clicam em "🌐 Modo Multiplayer Local"
   - Digitam seus nomes
   - Clicam em "🚪 Entrar na Sala"
   - Digitam o código ou escaneiam QR Code

3. **Host inicia o jogo:**

   - Aguarda todos os jogadores (5-10)
   - Clica em "Iniciar Jogo"
   - Configura personagens especiais
   - Confirma para distribuir cartas

4. **Todos recebem suas cartas:**
   - Cada jogador vê sua carta no próprio dispositivo
   - Informações específicas do personagem são exibidas
   - Jogadores podem consultar suas cartas durante o jogo

## 🌐 Testando Localmente

### Com Servidor Local:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server -p 8000
```

### Acessando:

- **Host:** `http://localhost:8000`
- **Outros dispositivos:** `http://SEU_IP:8000`

Para descobrir seu IP:

- Windows: `ipconfig`
- Mac/Linux: `ifconfig` ou `ip addr`

## 🚀 Deploy

### GitHub Pages:

1. Push para o repositório
2. Acesse: `https://DevSpacek.github.io/The_Resistence/multiplayer.html`

### Outros Hosts:

- Funciona em qualquer servidor web estático
- Não requer backend ou banco de dados
- Compatível com Netlify, Vercel, etc.

## 🔐 Segurança

- ✅ Conexão P2P criptografada
- ✅ Nenhum dado enviado para servidores externos
- ✅ Funciona offline após conexão inicial
- ✅ Cada jogador vê apenas sua própria carta
- ✅ Código de sala único por sessão

## 📊 Requisitos do Sistema

### Navegadores Suportados:

- Chrome 23+
- Firefox 22+
- Safari 11+
- Edge 79+

### Rede:

- Todos devem estar na mesma rede Wi-Fi
- Portas UDP para WebRTC devem estar abertas
- Firewall pode precisar permitir WebRTC

### Dispositivos:

- Smartphones (iOS/Android)
- Tablets
- Computadores (Windows/Mac/Linux)
- Qualquer dispositivo com navegador moderno

## 🎨 Personalização

### Modificar Personagens:

Edite `js/game.js` na seção `characters`

### Alterar Estilos:

Edite `styles.css` na seção "MULTIPLAYER MODE STYLES"

### Adicionar Funcionalidades:

Estenda a classe `MultiplayerManager` em `js/multiplayer.js`

## 🐛 Problemas Conhecidos

1. **Alguns roteadores podem bloquear P2P**

   - Solução: Configure o roteador ou use outro

2. **Múltiplas abas no mesmo dispositivo podem ter problemas**

   - Solução: Use dispositivos diferentes para testes reais

3. **QR Code pode não funcionar em alguns navegadores**

   - Solução: Use o código de texto manual

4. **Reconexão após perda de rede não é automática**
   - Solução: Criar nova sala e reconectar

## 🔄 Próximas Melhorias Sugeridas

- [ ] Chat entre jogadores durante o jogo
- [ ] Sistema de votação para missões
- [ ] Histórico de partidas
- [ ] Estatísticas de jogo
- [ ] Sons e notificações
- [ ] Modo escuro
- [ ] Suporte a idiomas adicionais
- [ ] Tutorial interativo
- [ ] Avatares personalizados
- [ ] Backup/restore de sala

## 📚 Documentação Adicional

- `MULTIPLAYER.md` - Guia do usuário completo
- `TESTE-MULTIPLAYER.md` - Guia de testes
- `guia-multiplayer.html` - Guia interativo na web

## 🤝 Contribuindo

Para adicionar novas funcionalidades:

1. Clone o repositório
2. Crie uma branch para sua feature
3. Teste localmente com múltiplos dispositivos
4. Faça commit e push
5. Abra um Pull Request

## 📝 Changelog

### Versão 1.0.0 (Atual)

- ✅ Sistema multiplayer completo
- ✅ Criação e entrada em salas
- ✅ Distribuição de cartas individuais
- ✅ Suporte a todos os personagens
- ✅ Interface responsiva
- ✅ QR Code para fácil acesso
- ✅ Guias e documentação

## 📞 Suporte

Para problemas ou dúvidas:

1. Consulte `guia-multiplayer.html`
2. Leia `TESTE-MULTIPLAYER.md`
3. Verifique o console do navegador (F12)
4. Abra uma issue no GitHub

## 🎉 Créditos

- **Jogo Original:** The Resistance por Don Eskridge
- **Implementação:** DevSpacek
- **Tecnologias:** PeerJS, QRCode.js, WebRTC

---

**Divirta-se jogando! 🎭**

Desenvolvido com ❤️ para a comunidade de The Resistance
