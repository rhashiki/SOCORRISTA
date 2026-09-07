# Re.Force - APH

Simulador 3D educacional mobile-first para treino e memorização de protocolos de atendimento pré-hospitalar em trauma.

## Protocolos
- XABCDE
- Escala de Coma de Glasgow
- SAMPLE
- Avaliação secundária da vítima de trauma

## Simulation Engine v4
A Build v4 muda o projeto de um visualizador com hotspots para uma simulação baseada em observação, prioridades e consequências:

- cena 3D sem marcadores luminosos entregando a resposta;
- personagem humano glTF texturizado, com fallback leve para dispositivos incompatíveis;
- achados visuais discretos e interação por regiões do corpo;
- evolução do caso quando uma ameaça prioritária não é resolvida;
- erros de sequência afetam a pontuação;
- Glasgow construído a partir das respostas observadas;
- SAMPLE com perguntas relevantes e distrações, seguido de organização das respostas;
- avaliação secundária por varredura sistemática da vítima;
- debrief com linha do tempo dos erros e pontos de aprendizagem.

O alvo visual é realismo low-poly compatível com celular, inspirado na legibilidade de jogos 3D da era PS2, sem buscar fotorealismo.

## Créditos 3D
O personagem humano usa **CesiumMan**, do repositório Khronos glTF Sample Assets, © 2017 Cesium, licenciado sob CC BY 4.0 com limitações de marca conforme a licença original do modelo.

> Ferramenta educacional. Não substitui treinamento prático, protocolos institucionais ou orientação profissional.
