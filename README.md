# Re.Force - APH

Jogo/simulador 3D educacional mobile-first de atendimento pré-hospitalar em um mundo aberto compacto.

## Fluxo da Vertical Slice
Base Re.Force → chamado da Central → ambulância → deslocamento pela cidade → chegada → segurança da cena → abordagem da vítima → XABCDE → Glasgow → SAMPLE → avaliação secundária → debrief.

## Build 2 / v6 — Open World & Visual Upgrade
- cidade modular com ruas, fachadas, hospital e base;
- semáforos e tráfego básico;
- pedestres, curiosos e carros estacionados;
- ambulância Re.Force própria;
- câmera third-person suavizada;
- áudio procedural de Central e sirene;
- arquitetura separada em mundo, atores, cena e camada clínica.

## Build 3 / v7 — Living World & Character Upgrade
A v7 mantém a clínica da v6 e melhora sensação de jogo:

- personagem socorrista procedural articulado, com braços, antebraços, pernas, joelhos, cabeça e tronco independentes;
- animação procedural de caminhada, corrida, idle e respiração;
- pedestres também usam animação corporal segmentada;
- curiosos passam a reagir ao controle da cena e se afastam quando o entorno é organizado;
- colisão do jogador com tráfego, carros estacionados e ambulância;
- pedestres mantêm distância básica entre si e reagem à sirene;
- câmera GTA-like com auto-follow, offset de ombro, look-ahead e leve resposta à velocidade;
- FOV veicular dinâmico;
- falas ambientais ocasionais de testemunhas/curiosos;
- pequenas variações textuais do chamado para reduzir repetição.

## Protocolos educacionais da Vertical Slice
- XABCDE
- Escala de Coma de Glasgow
- SAMPLE
- Avaliação secundária da vítima de trauma

O jogo evita indicar a resposta por hotspots visíveis. A proposta é observar, interpretar, priorizar e receber feedback no debrief.

> Ferramenta educacional. Não substitui treinamento prático, protocolos institucionais, supervisão profissional ou serviços de emergência.
