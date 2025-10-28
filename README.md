# 🎭 The Resistance - Sistema de Distribuição de Personagens

Sistema simples para distribuição automática de personagens para partidas de **The Resistance** (versão clássica), incluindo todos os personagens especiais.

## 🎮 Como Usar

1. Abra o arquivo `index.html` no navegador (funciona em computador ou celular)
2. Selecione o número de jogadores (5-10)
3. Digite o nome de cada jogador (ou deixe os padrões)
4. Escolha os personagens especiais que deseja incluir (opcional)
5. Configure opções especiais (se aplicável)
6. Clique em "Iniciar Jogo"
7. Passe o dispositivo de jogador em jogador
8. Cada jogador clica em "Revelar Meu Papel" para ver sua função
9. Após ver o papel, clique em "Próximo Jogador"

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
|-----------|-------------|---------|
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

## 📝 Regras Básicas do Jogo

1. Os espiões se conhecem (exceto Espião Cego e Comandante Falso sem conhecimento)
2. O Comandante conhece todos os espiões
3. A Resistência vence completando 3 missões
4. Os Espiões vencem sabotando 3 missões
5. Se houver Assassino e Comandante, o Assassino pode tentar eliminar o Comandante após 3 missões bem-sucedidas da Resistência
6. Desertores podem trocar de lado a qualquer momento

## 🚀 Modo Rede Local (Futuro)

Em desenvolvimento: Modo multiplayer via WiFi local para que cada jogador use seu próprio dispositivo.

## 📄 Licença

Projeto de código aberto para uso pessoal e educacional.

---

**Desenvolvido para facilitar partidas de The Resistance sem necessidade de mestre ou procedimentos manuais!**