#!/usr/bin/env python3
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


ALLOWED_SHORT_HOSTS = {"maps.app.goo.gl", "goo.gl"}


class GourmetMapHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            self.write_json({"ok": True, "service": "gourmet-map-local-server"})
            return
        if parsed.path == "/api/resolve-google-link":
            self.resolve_google_link(parsed)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def resolve_google_link(self, parsed):
        query = urllib.parse.parse_qs(parsed.query)
        raw_url = query.get("url", [""])[0].strip()
        target = urllib.parse.urlparse(raw_url)

        if target.scheme not in {"http", "https"} or target.netloc not in ALLOWED_SHORT_HOSTS:
            self.write_json({"error": "只支持 Google Maps 短链接。"}, status=400)
            return

        try:
            request = urllib.request.Request(
                raw_url,
                headers={
                    "User-Agent": "Mozilla/5.0 GourmetMapLocalResolver/1.0",
                    "Accept": "text/html,application/xhtml+xml",
                },
            )
            with urllib.request.urlopen(request, timeout=8) as response:
                final_url = response.geturl()
        except (urllib.error.URLError, TimeoutError):
            self.write_json({"error": "短链接展开失败，请在浏览器打开后复制完整链接。"}, status=502)
            return

        self.write_json({"url": final_url})

    def write_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    server = ThreadingHTTPServer(("", port), GourmetMapHandler)
    print(f"Serving Gourmet Map on http://localhost:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
