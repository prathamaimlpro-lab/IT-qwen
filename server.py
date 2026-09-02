# AE3301 server: static files + Python judge (stdlib only). Personal device use.
import http.server, socketserver, json, subprocess, os, tempfile
PORT = 9999
class H(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/run':
            self.send_error(404); return
        n = int(self.headers.get('Content-Length', 0))
        code = json.loads(self.rfile.read(n) or b'{}').get('code', '')
        p = None
        try:
            with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False) as f:
                f.write(code); p = f.name
            r = subprocess.run(['python3', p], capture_output=True, text=True, timeout=3)
            out = (r.stdout + r.stderr)[-2000:]
        except subprocess.TimeoutExpired:
            out = '⏱ timed out (3s)'
        except Exception as e:
            out = str(e)
        finally:
            if p:
                try: os.unlink(p)
                except Exception: pass
        b = json.dumps({'out': out}).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers(); self.wfile.write(b)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', PORT), H) as s:
    print('AE3301 → http://localhost:%d (static + Python judge)' % PORT)
    s.serve_forever()
