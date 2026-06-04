#!/bin/bash
# VJ STUDIO ランチャー（ダブルクリックで起動）
cd "$(dirname "$0")"
PORT=7659
URL="http://localhost:$PORT/"

open_chrome () {
  open -a "Google Chrome" "$URL" 2>/dev/null || open "$URL"
}

# すでに起動していれば、それを使う
if curl -s "$URL" -o /dev/null 2>&1; then
  open_chrome
  echo "VJ STUDIO はすでに起動しています。Chrome で開きました。"
  exit 0
fi

# サーバーを起動
python3 -m http.server $PORT >/dev/null 2>&1 &
SRV=$!
sleep 1
open_chrome

echo "════════════════════════════════════════"
echo "   VJ STUDIO 起動中"
echo ""
echo "   ★ この黒い窓は閉じないでください"
echo "     （閉じるとアプリが止まります）"
echo ""
echo "   終わるとき: この窓を閉じる"
echo "════════════════════════════════════════"

wait $SRV
