# Re.Force - APH

Simulador/jogo 3D educacional mobile-first de atendimento pré-hospitalar em mundo aberto compacto.

A proposta é uma experiência de socorrista em terceira pessoa inspirada na clareza e no fluxo dos jogos open-world clássicos: receber uma ocorrência, deslocar-se até o local, interpretar a cena, atender a vítima com raciocínio protocolar, transportar e receber debrief. A identidade visual, assets e sistemas são próprios do Re.Force.

> Ferramenta educacional. Não substitui treinamento prático, protocolos institucionais, supervisão profissional ou serviços de emergência.

## Release atual

**Build 55 — Production Quality Pack**

Fluxo principal:

Base Re.Force → despacho da Central → ambulância → deslocamento → chegada → segurança da cena → abordagem → XABCDE → Glasgow → SAMPLE → avaliação secundária → transporte simulado → hospital → debrief → próximo chamado.

## Roadmap macro (17 itens)

1. Foundation / third-person controller
2. Vertical Slice da cidade
3. Trânsito
4. Pedestres
5. Viatura
6. Dispatch
7. Sistema de pacientes
8. XABCDE Engine
9. Equipment System
10. Glasgow
11. SAMPLE
12. Avaliação secundária
13. Scoring Engine
14. Debrief
15. Randomização de cenários
16. Modo carreira
17. Expansão da cidade

A numeração de Build é técnica e incremental; não corresponde diretamente aos 17 macroitens do roadmap.

## Sistemas implementados

### Mundo aberto
- personagem em terceira pessoa;
- câmera suavizada, auto-follow, configurações de sensibilidade e anti-clipping;
- joystick mobile e teclado;
- cidade compacta com base, hospital, ruas, calçadas, prédios, fachadas, iluminação e mobiliário urbano;
- materiais procedurais para asfalto, concreto, grama e fachadas;
- arquitetura enriquecida com marquises, varandas, coberturas e elementos de telhado;
- ciclo de ambiente: dia, fim de tarde, noite e chuva leve;
- mapa/minimapa, rota, marcador e mapa tático em tela cheia;
- perfis gráficos Econômico, Equilibrado e Alto;
- LOD dinâmico para preservar desempenho mobile.

### Trânsito e veículos
- ambulância Re.Force dirigível;
- entrada e saída contextual;
- sirene, giroflex, faróis e áudio de motor;
- semáforos funcionais;
- tráfego com distância entre veículos e reação à sirene;
- corredor de emergência simplificado;
- carros, motos, vans e veículos maiores;
- telemetria de condução do jogo;
- refinamento visual de para-brisa, espelhos, para-choques, iluminação, placas e detalhes externos.

### NPCs e equipe
- pedestres animados;
- travessias e reação ao trânsito/sirene;
- curiosos e testemunhas;
- comportamentos ambientais variados;
- segundo socorrista acompanhando a equipe;
- posturas clínicas contextuais;
- falas da vítima/testemunha dentro do mundo 3D.

### Ocorrências
- localização variável;
- riscos de cena variáveis;
- composição visual variável;
- clima/horário variável;
- códigos/seed reproduzíveis para treino e QA;
- console do instrutor;
- Incident Director adaptativo no modo Treinamento;
- plantão contínuo com múltiplos chamados.

### Educação e clínica
- XABCDE com prioridades variáveis em diferentes etapas;
- casos sem alteração prioritária em X para evitar memorização mecânica;
- Glasgow baseado em evidências observáveis e respostas variáveis;
- entrevista SAMPLE contextual;
- classificação S/A/M/P/L/E;
- avaliação secundária cabeça-aos-pés com achados por caso;
- equipamentos que revelam dados em vez de exibi-los automaticamente;
- estado do paciente evoluindo com tempo/prioridade;
- sinais visuais não gráficos de respiração, postura, responsividade e perfusão aparente;
- testemunhas fornecendo contexto sem substituir avaliação direta;
- modos Treinamento, Simulação e Avaliação.

### Progressão
- XP e patentes;
- histórico de missões;
- conquistas;
- mapa de domínio por protocolo;
- debrief adaptativo;
- recomendação de foco de estudo;
- timeline do atendimento;
- avaliação de condução e eficiência.

## Arquitetura

A base original foi modularizada em camadas de estado, cidade, atores, cena, mundo e clínica. Builds posteriores entram como overlays progressivos e são carregadas em ordem cronológica pelo `index.html`.

O GitHub Actions executa validação automática de:
- sintaxe JavaScript;
- existência dos assets locais citados no HTML;
- colisões de declaração quando os scripts são concatenados na ordem real de carregamento;
- consistência entre Build pública e cache do Service Worker;
- presença dos módulos obrigatórios para a Build atual.

## Próxima fase

Prioridade: **qualidade de produção**, não apenas quantidade de features.

- modelos 3D texturizados de maior qualidade;
- rigs e animation clips reais;
- biblioteca consistente de veículos, vítimas, pedestres e equipamentos;
- expansão gradual da cidade;
- física/navmesh mais robustos;
- mais variedade de ocorrências sem sacrificar legibilidade e desempenho mobile.
