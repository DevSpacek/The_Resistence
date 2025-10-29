# 🎭 The Resistance - App Mobile PWA

Aplicativo móvel para gerenciar partidas do jogo de cartas **The Resistance**. Desenvolvido como Progressive Web App (PWA) para facilitar o uso em dispositivos móveis.

## 📱 Características do App

- ✅ **Instalável** - Funciona como app nativo no celular
- ✅ **Offline First** - Funciona sem conexão com internet
- ✅ **Otimizado para Touch** - Interface adaptada para dispositivos móveis
- ✅ **Responsivo** - Adapta-se a qualquer tamanho de tela
- ✅ **Sem Zoom** - Experiência fluida sem necessidade de zoom
- ✅ **Leve e Rápido** - Carregamento instantâneo

## 🚀 Como Instalar no Celular

### Android (Chrome/Edge)

1. Abra o site no navegador Chrome ou Edge
2. Clique no botão **"📱 Instalar App"** que aparece no topo
3. Ou clique nos três pontos (⋮) → **"Adicionar à tela inicial"**
4. O app será instalado na tela inicial do seu celular

### iOS (Safari)

1. Abra o site no Safari
2. Toque no botão **Compartilhar** (□↑)
3. Role para baixo e toque em **"Adicionar à Tela de Início"**
4. Toque em **"Adicionar"**
5. O app aparecerá na tela inicial

## 🎮 Como Usar

### 1. Configuração do Jogo

- Selecione o número de jogadores (5-10)
- Digite os nomes dos participantes
- Escolha os personagens especiais desejados
- O app calcula automaticamente quantos espiões e membros da resistência terão

### 2. Revelação dos Papéis

- Passe o celular entre os jogadores
- Cada um vê apenas seu papel quando clica em "Revelar"
- O app mostra as informações relevantes (espiões conhecidos, comandante, etc.)
- Clique em "Próximo Jogador" para continuar

### 3. Histórico

- O app salva automaticamente a última configuração
- Use "📋 Carregar Última Configuração" para repetir uma partida
- Use "🗑️ Limpar Histórico" para apagar configurações antigas

## 🎯 Personagens Especiais

### Resistência

- **👑 Comandante** - Conhece todos os espiões
- **🛡️ Guarda-Costas** - Conhece o Comandante
- **🔄 Desertor** - Pode trocar de lado

### Espiões

- **🗡️ Assassino** - Pode eliminar o Comandante
- **👁️ Espião Cego** - Não conhece outros espiões
- **👻 Agente Invisível** - Invisível ao Comandante
- **👹 Comandante Falso** - Se passa pelo Comandante
- **🔄 Desertor** - Pode trocar de lado

## 📊 Distribuição de Papéis

| Jogadores | Resistência | Espiões |
| --------- | ----------- | ------- |
| 5-6       | 3-4         | 2       |
| 7-8       | 4-5         | 3       |
| 9-10      | 5-6         | 4       |

## 🔧 Gerando os Ícones do App

1. Abra o arquivo `generate-icons.html` no navegador
2. Clique nos botões para baixar os ícones
3. Salve os arquivos como `icon-192.png` e `icon-512.png` na pasta raiz

## 💻 Tecnologias

- HTML5
- CSS3 (com design responsivo mobile-first)
- JavaScript (ES6+)
- PWA (Progressive Web App)
- Service Worker (para funcionar offline)
- LocalStorage (para salvar dados)
- Web App Manifest

## 📂 Estrutura de Arquivos

```
The_Resistance/
├── index.html              # Página de configuração
├── reveal.html            # Página de revelação
├── styles.css             # Estilos do app
├── manifest.json          # Configuração PWA
├── service-worker.js      # Cache offline
├── generate-icons.html    # Gerador de ícones
├── icon-192.png          # Ícone 192x192
├── icon-512.png          # Ícone 512x512
├── js/
│   ├── game.js           # Lógica do jogo
│   ├── setup.js          # Configuração
│   └── reveal.js         # Revelação
└── images_back/          # Imagens de fundo
```

## 🎨 Melhorias Mobile

- **Touch Otimizado** - Feedback tátil em todos os botões
- **Sem Seleção de Texto** - Evita seleção acidental
- **Viewport Fixo** - Previne zoom indesejado
- **Tela Cheia** - Remove barras do navegador quando instalado
- **Modo Paisagem** - Suporte para orientação horizontal
- **Performance** - Carregamento e transições rápidas
- **Gestos Otimizados** - Área de toque aumentada
- **Scroll Suave** - Rolagem otimizada para mobile

## 🐛 Resolução de Problemas

### O botão "Instalar App" não aparece?

- Certifique-se de estar usando HTTPS ou localhost
- Verifique se o navegador suporta PWA (Chrome, Edge, Safari)
- Já pode estar instalado - verifique sua tela inicial

### App não funciona offline?

- Abra o app pelo menos uma vez online
- O Service Worker precisa ser registrado primeiro
- Verifique o console para erros do Service Worker

### Interface muito pequena no celular?

- O app se adapta automaticamente
- Tente instalar como app nativo para melhor experiência
- Certifique-se de estar com a última versão

## 🚀 Para Hospedar o App

### GitHub Pages (Gratuito)

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos
3. Ative GitHub Pages nas configurações
4. Acesse via: `https://seu-usuario.github.io/the-resistance`

### Netlify (Gratuito)

1. Faça deploy direto do repositório
2. HTTPS automático incluído
3. PWA funcionará perfeitamente

### Vercel (Gratuito)

1. Conecte seu repositório
2. Deploy automático em cada push
3. HTTPS e PWA automáticos

**Importante:** PWA requer HTTPS para funcionar (exceto em localhost)

## 📝 Regras Básicas do Jogo

1. Os espiões se conhecem (exceto Espião Cego)
2. O Comandante conhece todos os espiões (exceto Agente Invisível)
3. A Resistência vence completando 3 missões
4. Os Espiões vencem sabotando 3 missões
5. Se houver Assassino e Comandante, o Assassino pode tentar eliminar o Comandante
6. Desertores podem trocar de lado durante o jogo

## 📄 Licença

Projeto livre para uso pessoal e educacional.

## 👨‍💻 Desenvolvimento

Desenvolvido para facilitar a jogabilidade de The Resistance em dispositivos móveis com foco em experiência mobile-first.

---

**Divirta-se jogando! 🎭**
