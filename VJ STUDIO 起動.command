#!/bin/bash
cd "$(dirname "$0")"
PORT=7659
URL="http://localhost:$PORT/"
open_chrome(){ open -a "Google Chrome" "$URL" 2>/dev/null || open "$URL"; }
if curl -s "$URL" -o /dev/null 2>&1; then open_chrome; echo "VJ STUDIO はすでに起動しています。Chrome で開きました。"; exit 0; fi
python3 -c "import http.server,socketserver; H=http.server.SimpleHTTPRequestHandler; H.protocol_version=\"HTTP/1.1\"; socketserver.ThreadingTCPServer.allow_reuse_address=True; socketserver.ThreadingTCPServer((\"127.0.0.1\",$PORT),H).serve_forever()" >/dev/null 2>&1 &
SRV=$!
sleep 1
open_chrome
echo "════════════════════════════════"
echo "   VJ STUDIO 起動中"
echo "   ★ この黒い窓は閉じないでください"
echo "   終わるとき: この窓を閉じる"
echo "════════════════════════════════"
wait $SRV
