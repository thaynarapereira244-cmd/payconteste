#!/usr/bin/env bash
set -e
BASE="https://lp.payconautomacoes.com.br/assets"
OUT_P="public/assets/partners"
OUT_T="public/assets/testimonials"
OUT_TEAM="public/assets/team"

declare -A PARTNERS=(
  [carrefour]="carrefour-BKPqxPie.png"
  [claro]="claro-rNY3mdhu.png"
  [atacadao]="atacadao-C9h9SK0-.png"
  [cbmm]="cbmm-GePCUYD9.png"
  [cea]="cea-BOpBPkyb.png"
  [braskem]="braskem-tkTMYvtO.png"
  [bat-brasil]="bat-brasil-Crzq4Szq.png"
  # atvos e owens-illinois: no site oficial vêm inlined como base64 no bundle
  # JS (assetsInlineLimit do Vite), não como arquivo separado em /assets — por
  # isso não têm entrada aqui. Extraídos de src/lib/gsap... ver histórico do
  # PartnersScene para o processo (bundle index-D7-gTxp2.js, vars SO/zO).
  [ambev]="ambev-C3ujZEHK.png"
  [cogna]="cogna-C6nmbb-L.png"
  [lactalis]="lactalis-DcSz-q91.png"
  [hyundai]="hyundai-BnJoxF7q.png"
  [heinz]="heinz-Dx7rowuI.png"
  [gpa]="gpa-CfQHDV-l.png"
  [gerdau]="gerdau-MWr94kF3.png"
  [ford]="ford-DpoA6Tev.png"
  [energisa]="energisa-B5Ad0Szk.png"
  [cosan]="cosan-CkbI5k3K.png"
  [dasa]="dasa-DzpvkGia.png"
  [solar-coca-cola]="solar-coca-cola-Ba_NpnVD.png"
  [samsung]="samsung-DOGQr6UE.webp"
  [prudential]="prudential-Bz9GpTRn.png"
  [mondelez]="mondelez-DQK6LZqr.png"
  [motorola]="motorola-OWL2cJDl.png"
  [loggi]="loggi-D-A-xNhf.png"
  [lenovo]="lenovo-zz9P92dM.png"
  [tim]="tim-_Pda-WW0.png"
  [suzano]="suzano-B2NkgI1-.png"
  [sabesp]="sabesp-Bu96x6H3.png"
  [votorantim]="votorantim-BW6CJ8q8.png"
  [afya]="afya-ulKic3SA.png"
)

declare -A TESTIMONIALS=(
  [luiz-tassitani]="luiz-tassitani-EgAVRW9s.png"
  [andreia-nunes]="andreia-nunes-RcM8D5PK.png"
  [ana-luiza]="ana-luiza-BMu8JEJ4.png"
  [spc-brasil]="spc-brasil-pNRc6cxL.png"
  [renata-lopes]="renata-lopes-DqpVNG77.png"
  [marilia-saito]="marilia-saito-C86eP-_2.jpg"
  [rafael-gomes]="rafael-gomes-BQPkO184.jpg"
  [julianne-lacerda]="julianne-lacerda-j11HKP-L.png"
  [vanessa-joaquim]="vanessa-joaquim-BRbWbBor.png"
  [guilherme-briggs]="guilherme-briggs-DpktlAbD.png"
  [jessica-ferreira]="jessica-ferreira-BbT408YE.png"
  [elys-musso]="elys-musso-CFaKlean.png"
  [giulia-franco]="giulia-franco-CNsJ-ayA.png"
)

declare -A TEAM=(
  [ivan-rocha]="ivan-rocha-CBSFrIn8.png"
  [thiago-palma]="thiago-palma-e4PP33xI.png"
  [thiago-teles]="thiago-teles-VAZRQqjD.png"
)

for name in "${!PARTNERS[@]}"; do
  ext="${PARTNERS[$name]##*.}"
  curl -sS -o "$OUT_P/partner-$name.$ext" "$BASE/${PARTNERS[$name]}"
  echo "partner-$name.$ext downloaded"
done

for name in "${!TESTIMONIALS[@]}"; do
  ext="${TESTIMONIALS[$name]##*.}"
  curl -sS -o "$OUT_T/testimonial-$name.$ext" "$BASE/${TESTIMONIALS[$name]}"
  echo "testimonial-$name.$ext downloaded"
done

for name in "${!TEAM[@]}"; do
  ext="${TEAM[$name]##*.}"
  curl -sS -o "$OUT_TEAM/team-$name.$ext" "$BASE/${TEAM[$name]}"
  echo "team-$name.$ext downloaded"
done

echo "DONE"
