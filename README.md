# 🎭 The Resistance - Sistema de Distribuição de Personagens

Sistema simples para distribuição automática de personagens para partidas de **The Resistance** (versão clássica), incluindo todos os personagens especiais.

## 🎮 Como Usar

### 🔄 Modo Clássico (Um Dispositivo)

1. Abra o arquivo `index.html` no navegador (funciona em computador ou celular)
2. Selecione o número de jogadores (5-10)
3. Digite o nome de cada jogador (ou deixe os padrões)
4. Escolha os personagens especiais que deseja incluir (opcional)
5. Configure opções especiais (se aplicável)
6. Clique em "Iniciar Jogo"
7. Passe o dispositivo de jogador em jogador
8. Cada jogador clica em "Revelar Meu Papel" para ver sua função
9. Após ver o papel, clique em "Próximo Jogador"

### 🌐 Modo Multiplayer Local (NOVO!)

1. Clique em "🌐 Modo Multiplayer Local" na tela inicial
2. **Host:** Crie uma sala e compartilhe o código com os jogadores
3. **Jogadores:** Entrem na sala usando o código
4. Aguarde todos se conectarem (mínimo 5, máximo 10 jogadores)
5. **Host:** Configure os personagens e inicie o jogo
6. Cada jogador recebe sua carta automaticamente no próprio dispositivo!

**✨ Vantagem:** Cada jogador vê apenas sua própria carta, sem passar o dispositivo!

📖 [Guia Completo do Modo Multiplayer](MULTIPLAYER.md) | 🚀 [Início Rápido](INICIO-RAPIDO-MULTIPLAYER.md)

## 👥 Personagens

### Resistência (Azul)

- **👑 Comandante**: Líder da resistência que conhece todos os espiões
- **🛡️ Guarda-Costas**: Protege o Comandante
- **🔄 Desertor**: Membro da resistência que pode trocar de lado
- **🎭 Membros da Resistência**: Membros leais sem habilidades especiais

### Espiões (Vermelho)

- **🗡️ Assassino**: Deve identificar e eliminar o Comandante
- **👁️ Espião Cego**: Não conhece outros espiões (e vice-versa)
- **👹 Comandante Falso**: Parece ser o Comandante mas é espião (com opção de conhecer ou não os espiões)
- **🔄 Desertor**: Espião que pode trocar de lado
- **🕵️ Espiões**: Espiões regulares que se conhecem

## ⚙️ Personagens Especiais

### Comandante Falso (Opções)

Ao selecionar o Comandante Falso, você pode escolher:

1. **Conhece os espiões**: Variante mais equilibrada
2. **Não conhece os espiões**: Regra clássica, mais desafiadora

### Desertor (Par Obrigatório)

Ao selecionar Desertor, **SEMPRE** serão adicionados:

- 1 Desertor na Resistência
- 1 Desertor nos Espiões

Ambos podem trocar de lado durante o jogo.

## 📊 Distribuição de Papéis

| Jogadores | Resistência | Espiões |
| --------- | ----------- | ------- |
| 5-6       | 3-4         | 2       |
| 7-8       | 4-5         | 3       |
| 9-10      | 5-6         | 4       |

## 🔍 Informações Reveladas

Ao revelar cada papel, o sistema mostra automaticamente:

- **Comandante**: Lista de todos os espiões (com nomes)
- **Espiões regulares**: Lista dos outros espiões (com nomes)
- **Assassino**: Lista dos outros espiões + missão especial
- **Desertor Espião**: Lista dos outros espiões + habilidade de deserção
- **Espião Cego**: Aviso de que não conhece outros espiões
- **Comandante Falso (conhece)**: Lista dos outros espiões
- **Comandante Falso (não conhece)**: Aviso de que não conhece espiões
- **Desertor Resistência**: Habilidade de deserção

## 🆕 Novidades da Versão

### ✨ Nomes Personalizados

- Digite o nome de cada jogador
- As revelações mostram nomes reais (ex: "João", "Maria")
- Mais imersivo e pessoal

### 🔧 Comandante Falso Configurável

- Escolha se ele conhece ou não os espiões
- Adapte a dificuldade do jogo

### 🔄 Desertor (Novo Personagem)

- Sempre vem em par (1 Resistência + 1 Espião)
- Adiciona dinâmica de traição ao jogo
- Estratégia de mudança de lado

## 🛠️ Tecnologias

- HTML5
- CSS3 (Design responsivo)
- JavaScript Vanilla (sem frameworks)
- LocalStorage (armazenamento local)
- **WebRTC** (conexões P2P para multiplayer)
- **PeerJS** (biblioteca WebRTC simplificada)
- **QRCode.js** (geração de QR codes)

## 📱 Compatibilidade

- ✅ Funciona em qualquer navegador moderno
- ✅ Responsivo (celular, tablet, desktop)
- ✅ Funciona offline
- ✅ Não requer instalação

## 🎯 Características

- **Sem Mestre**: Sistema totalmente automatizado
- **Privacidade**: Tela de privacidade entre revelações
- **Intuitivo**: Interface simples e clara
- **Rápido**: Configure e inicie em segundos
- **Personalizável**: Nomes reais e opções configuráveis
- **🌐 Multiplayer Local**: Cada jogador no seu dispositivo (NOVO!)
- **📱 PWA**: Funciona como app instalável
- **🔒 Seguro**: Conexões P2P criptografadas

## 📝 Regras Básicas do Jogo

1. Os espiões se conhecem (exceto Espião Cego e Comandante Falso sem conhecimento)
2. O Comandante conhece todos os espiões
3. A Resistência vence completando 3 missões
4. Os Espiões vencem sabotando 3 missões
5. Se houver Assassino e Comandante, o Assassino pode tentar eliminar o Comandante após 3 missões bem-sucedidas da Resistência
6. Desertores podem trocar de lado a qualquer momento

## 🚀 Modo Multiplayer Local

✅ **IMPLEMENTADO!** Cada jogador pode usar seu próprio dispositivo!

### Como Funciona:

1. Todos devem estar na mesma rede Wi-Fi
2. Um jogador cria a sala (Host)
3. Outros jogadores entram com o código da sala
4. Host configura e inicia o jogo
5. Cada jogador recebe sua carta no próprio dispositivo

### Recursos:

- ✅ Conexão P2P (peer-to-peer) via WebRTC
- ✅ QR Code para entrada rápida
- ✅ Suporte para 5-10 jogadores
- ✅ Distribuição automática de cartas
- ✅ Cada jogador vê apenas sua carta
- ✅ Interface responsiva para mobile
- ✅ Sem necessidade de servidor externo

### Documentação:

- 📖 [Guia Completo do Multiplayer](MULTIPLAYER.md)
- 🚀 [Início Rápido](INICIO-RAPIDO-MULTIPLAYER.md)
- 🔧 [Guia de Testes](TESTE-MULTIPLAYER.md)
- 📊 [Estrutura Técnica](ESTRUTURA-MULTIPLAYER.md)
- 💻 [Documentação de Implementação](MULTIPLAYER-IMPLEMENTACAO.md)

## 📄 Licença

Projeto de código aberto para uso pessoal e educacional.

---

**Desenvolvido para facilitar partidas de The Resistance sem necessidade de mestre ou procedimentos manuais!**
