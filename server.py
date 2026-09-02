# AE3301 server v5: site + judge + accounts + admin questions + community (stdlib only)
import http.server, socketserver, json, subprocess, os, tempfile, sqlite3, hashlib, uuid, time
PORT = 9999
ADMIN_KEY = 'ae3301-admin'   # ← your secret
DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ae3301.db')
def db():
    c = sqlite3.connect(DB); c.row_factory = sqlite3.Row
    c.execute('create table if not exists users(id text primary key, name text unique, pw text, xp integer, lessons integer, accent text)')
    c.execute('create table if not exists questions(id text primary key, topic text, tier text, q text, options text, answer integer, explain text, hint text)')
    c.execute('create table if not exists posts(id text primary key, name text, text text, ts integer)')
    c.execute('create table if not exists likes(post text, name text, unique(post, name))')
    return c
class H(http.server.SimpleHTTPRequestHandler):
    def _json(self, obj, code=200):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers(); self.wfile.write(b)
    def _body(self):
        n = int(self.headers.get('Content-Length', 0) or 0)
        try: return json.loads(self.rfile.read(n) or b'{}')
        except Exception: return {}
    def do_GET(self):
        if self.path == '/api/ping': self._json({'ok': True})
        elif self.path == '/api/board':
            rows = db().execute('select name,xp,lessons from users order by xp desc limit 20').fetchall()
            self._json([dict(r) for r in rows])
        elif self.path == '/api/qlist':
            rows = db().execute('select * from questions').fetchall()
            self._json([dict(r) for r in rows])
        elif self.path == '/api/posts':
            rows = db().execute('select p.*, (select count(*) from likes l where l.post = p.id) as likes from posts p order by p.ts desc limit 50').fetchall()
            self._json([dict(r) for r in rows])
        else: super().do_GET()
    def do_POST(self):
        d = self._body()
        if self.path == '/run':
            p = None
            try:
                with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False) as f:
                    f.write(d.get('code', '')); p = f.name
                r = subprocess.run(['python3', p], capture_output=True, text=True, timeout=3)
                out = (r.stdout + r.stderr)[-2000:]
            except subprocess.TimeoutExpired: out = '⏱ timed out (3s)'
            except Exception as e: out = str(e)
            finally:
                if p:
                    try: os.unlink(p)
                    except Exception: pass
            self._json({'out': out})
        elif self.path == '/api/qcheck':
            self._json({'ok': d.get('key') == ADMIN_KEY})
        elif self.path in ('/api/register', '/api/login'):
            name = (d.get('name') or '').strip()[:24]; pw = d.get('pw') or ''
            if not name or not pw: return self._json({'err': 'name + password needed'}, 400)
            h = hashlib.sha256(pw.encode()).hexdigest(); c = db()
            if self.path.endswith('register'):
                uid = uuid.uuid4().hex[:12]
                try: c.execute('insert into users values(?,?,?,?,?,?)', (uid, name, h, 0, 0, '#f0561c'))
                except sqlite3.IntegrityError: return self._json({'err': 'name taken'}, 409)
            else:
                row = c.execute('select id from users where name=? and pw=?', (name, h)).fetchone()
                if not row: return self._json({'err': 'wrong name/password'}, 401)
                uid = row['id']
            c.commit(); self._json({'token': uid})
        elif self.path == '/api/sync':
            db().execute('update users set xp=?, lessons=?, accent=? where id=?',
                         (int(d.get('xp', 0)), int(d.get('lessons', 0)), d.get('accent', '#f0561c'), d.get('token', '')))
            db().commit(); self._json({'ok': True})
        elif self.path == '/api/qadd':
            if d.get('key') != ADMIN_KEY: return self._json({'err': 'admin key required'}, 403)
            uid = uuid.uuid4().hex[:8]
            db().execute('insert into questions values(?,?,?,?,?,?,?,?)',
                         (uid, d.get('topic', ''), d.get('tier', 'concept'), d.get('q', ''), json.dumps(d.get('options', [])), 0, d.get('explain', ''), d.get('hint', '')))
            db().commit(); self._json({'ok': True, 'id': uid})
        elif self.path == '/api/qdel':
            if d.get('key') != ADMIN_KEY: return self._json({'err': 'admin key required'}, 403)
            db().execute('delete from questions where id=?', (d.get('id'),))
            db().commit(); self._json({'ok': True})
        elif self.path == '/api/post':
            c = db(); u = c.execute('select name from users where id=?', (d.get('token'),)).fetchone()
            if not u: return self._json({'err': 'log in via SYNC first'}, 401)
            text = (d.get('text') or '').strip()[:500]
            if not text: return self._json({'err': 'empty post'}, 400)
            c.execute('insert into posts values(?,?,?,?)', (uuid.uuid4().hex[:10], u['name'], text, int(time.time())))
            c.commit(); self._json({'ok': True})
        elif self.path == '/api/like':
            c = db(); u = c.execute('select name from users where id=?', (d.get('token'),)).fetchone()
            if not u: return self._json({'err': 'log in via SYNC first'}, 401)
            cur = c.execute('insert or ignore into likes values(?,?)', (d.get('post'), u['name']))
            if cur.rowcount:
                row = c.execute('select name from posts where id=?', (d.get('post'),)).fetchone()
                if row and row['name'] != u['name']:
                    c.execute('update users set xp = xp + 2 where name=?', (row['name'],))
            c.commit(); self._json({'ok': True})
        else: self.send_error(404)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', PORT), H) as s:
    print('AE3301 v5 → http://localhost:%d (community online)' % PORT)
    s.serve_forever()
