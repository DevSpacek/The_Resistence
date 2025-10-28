# 🎭 The Resistance - Sistema de Distribuição de Personagens

Sistema simples para distribuição automática de personagens para partidas de **The Resistance** (versão clássica), incluindo todos os personagens especiais.

## 🎮 Como Usar

1. Abra o arquivo `index.html` no navegador (funciona em computador ou celular)
2. Selecione o número de jogadores (5-10)
3. Escolha os personagens especiais que deseja incluir (opcional)
4. Clique em "Iniciar Jogo"
5. Passe o dispositivo de jogador em jogador
6. Cada jogador clica em "Revelar Meu Papel" para ver sua função
7. Após ver o papel, clique em "Próximo Jogador"

## 👥 Personagens

### Resistência (Azul)

- **👑 Comandante**: Líder da resistência que conhece todos os espiões
- **🛡️ Guarda-Costas**: Protege o Comandante
- **🎭 Membros da Resistência**: Membros leais sem habilidades especiais

### Espiões (Vermelho)

- **🗡️ Assassino**: Deve identificar e eliminar o Comandante
- **👁️ Espião Cego**: Não conhece outros espiões (e vice-versa)
- **👹 Comandante Falso**: Parece ser o Comandante mas é espião
- **🕵️ Espiões**: Espiões regulares que se conhecem

### Neutro (Pode ser qualquer facção)

- **⚖️ Inquisidor**: Pode verificar a lealdade de um jogador

## 📊 Distribuição de Papéis

| Jogadores | Resistência | Espiões |
|-----------|-------------|---------|
| 5-6       | 3-4         | 2       |
| 7-8       | 4-5         | 3       |
| 9-10      | 5-6         | 4       |

## 🔍 Informações Reveladas

Ao revelar cada papel, o sistema mostra automaticamente:

- **Comandante**: Lista de todos os espiões
- **Espiões regulares**: Lista dos outros espiões
- **Espião Cego**: Aviso de que não conhece outros espiões
- **Assassino**: Missão especial (eliminar Comandante)
- **Comandante Falso**: Aviso de que parece Comandante mas não conhece espiões

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

## 📝 Regras Básicas do Jogo

1. Os espiões se conhecem (exceto Espião Cego)
2. O Comandante conhece todos os espiões
3. A Resistência vence completando 3 missões
4. Os Espiões vencem sabotando 3 missões
5. Se houver Assassino e Comandante, o Assassino pode tentar eliminar o Comandante após 3 missões bem-sucedidas da Resistência

## 🚀 Modo Rede Local (Futuro)

Em desenvolvimento: Modo multiplayer via WiFi local para que cada jogador use seu próprio dispositivo.

## 📄 Licença

Projeto de código aberto para uso pessoal e educacional.

---

**Desenvolvido para facilitar partidas de The Resistance sem necessidade de mestre ou procedimentos manuais!**
