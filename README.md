# Re.Force - APH

Jogo 3D mobile-first de atendimento pré-hospitalar com estrutura open-world inspirada na legibilidade e no loop de gameplay dos jogos 3D da era PS2, mas com identidade própria da Re.Force.

## Vertical Slice v6 — Visual / World Upgrade

A v6 mantém o fluxo clínico da v5 e melhora a sensação de jogo:

- câmera em terceira pessoa suavizada, com auto-follow e rotação natural por toque;
- FOV dinâmico durante a condução;
- ambulância low-poly própria e reconhecível, com cabine, baú, rodas, faixas e lightbar;
- semáforos com ciclo funcional;
- tráfego NPC que freia no vermelho, mantém distância e reduz velocidade diante da sirene;
- pedestres com rotas e travessias;
- cidade com fachadas detalhadas, vitrines, placas, marquises, calçadas, meios-fios, faixas de pedestres e mobiliário urbano;
- carros estacionados, pontos de ônibus, palmeiras e iluminação de rua;
- banners de localização por distrito;
- áudio procedural simples para rádio e sirene;
- identidade visual do socorrista Re.Force aplicada ao personagem;
- fluxo completo preservado: base → chamado → ambulância → deslocamento → cena → protocolos → debrief.

## Protocolos do vertical slice
- XABCDE
- Escala de Coma de Glasgow
- SAMPLE
- Avaliação secundária da vítima de trauma

## Arquitetura v6
A build publicada foi dividida em `state-v6.js`, `city-v6.js`, `actors-v6.js`, `scene-v6.js`, `world-v6.js` e `clinical-v6.js`. Os personagens, ambulância, veículos de fallback e cenário principal são gerados pelo próprio jogo em low-poly, reduzindo dependências externas de assets. O render utiliza Three.js carregado por CDN.

> Ferramenta educacional. Não substitui treinamento prático, protocolos institucionais ou supervisão profissional.
