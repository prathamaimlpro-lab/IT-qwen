# AE3301 server v11: licensing with key→account binding + auth access
import http.server, json, subprocess, os, tempfile, sqlite3, hashlib, uuid, time, threading, base64, gzip, zlib
PORT = 9999
ADMIN_KEY = 'ae3301-admin'
ADMIN_USER = 'admin'
ADMIN_PW = 'pratham.3438'
BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE, 'ae3301.db')
MEDIA = os.path.join(BASE, 'media')
os.makedirs(MEDIA, exist_ok=True)
PAIR, ADMIN = {}, {}
CONN = sqlite3.connect(DB, check_same_thread=False, timeout=20)
CONN.row_factory = sqlite3.Row
LOCK = threading.Lock()
with LOCK:
    CONN.execute('create table if not exists users(id text primary key, name text unique, pw text, xp integer, lessons integer, accent text)')
    CONN.execute('create table if not exists questions(id text primary key, topic text, tier text, q text, options text, answer integer, explain text, hint text)')
    CONN.execute('create table if not exists posts(id text primary key, name text, text text, ts integer, media text, views integer default 0)')
    CONN.execute('create table if not exists likes(post text, name text, unique(post, name))')
    CONN.execute('create table if not exists comments(id text primary key, post text, name text, text text, ts integer)')
    CONN.execute('create table if not exists apikeys(key text primary key, expires real, days integer, bound_to text)')
    for stmt in ('alter table posts add column media text', 'alter table posts add column views integer default 0', 'alter table apikeys add column bound_to text'):
        try: CONN.execute(stmt)
        except Exception: pass
    CONN.commit()
EXTS = {'jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm'}
class H(http.server.SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'
    def _json(self, obj, code=200):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers(); self.wfile.write(b)
    def _body(self):
        if 'chunked' in (self.headers.get('Transfer-Encoding') or '').lower():
            data = b''
            while True:
                try: n = int(self.rfile.readline().strip(), 16)
                except ValueError: break
                if n <= 0: break
                data += self.rfile.read(n); self.rfile.read(2)
            try: return json.loads(data or b'{}')
            except Exception: return {}
        n = int(self.headers.get('Content-Length', 0) or 0)
        try: return json.loads(self.rfile.read(n) or b'{}')
        except Exception: return {}
    def _user(self, d):
        return CONN.execute('select * from users where id=?', (d.get('token'),)).fetchone()
    def _admin(self, d):
        t = d.get('admin') or d.get('key')
        return t == ADMIN_KEY or (t in ADMIN and ADMIN[t] > time.time())
  def _static(self):
        p = self.translate_path(self.path)
        if not os.path.isfile(p):
            return super().do_GET()
        with open(p, 'rb') as f: data = f.read()
        etag = '"' + str(zlib.crc32(data)) + '"'
        if self.headers.get('If-None-Match') == etag:
            self.send_response(304)
            self.send_header('ETag', etag); self.send_header('Cache-Control', 'no-cache')
            self.end_headers(); return
        use_gz = 'gzip' in (self.headers.get('Accept-Encoding') or '') and os.path.splitext(p)[1] in ('.js', '.css', '.html', '.svg')
        body = gzip.compress(data, 6) if use_gz else data
        self.send_response(200)
        self.send_header('Content-Type', self.guess_type(p))
        if use_gz: self.send_header('Content-Encoding', 'gzip')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('ETag', etag); self.send_header('Cache-Control', 'no-cache')
        self.end_headers(); self.wfile.write(body)
def do_GET(self):
        if self.path == '/api/ping': self._json({'ok': True})
        elif self.path == '/api/board':
            with LOCK: rows = CONN.execute('select name,xp,lessons from users order by xp desc limit 20').fetchall()
            self._json([dict(r) for r in rows])
        elif self.path == '/api/qlist':
            with LOCK: rows = CONN.execute('select * from questions').fetchall()
            self._json([dict(r) for r in rows])
        elif self.path == '/api/posts':
            with LOCK: rows = CONN.execute('select p.*, (select count(*) from likes l where l.post=p.id) likes, (select count(*) from comments c where c.post=p.id) cmts from posts p order by p.ts desc limit 50').fetchall()
            self._json([dict(r) for r in rows])
        elif self.path.startswith('/api/comments?post='):
            pid = self.path.split('=')[-1]
            with LOCK: rows = CONN.execute('select * from comments where post=? order by ts', (pid,)).fetchall()
            self._json([dict(r) for r in rows])
        else: self._static()
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
        elif self.path == '/api/adminlogin':
            if d.get('user') == ADMIN_USER and d.get('pw') == ADMIN_PW:
                t = uuid.uuid4().hex; ADMIN[t] = time.time() + 30 * 86400
                self._json({'token': t})
            else: self._json({'err': 'bad credentials'}, 401)
        elif self.path == '/api/keygen':
            if not self._admin(d): return self._json({'err': 'admin only'}, 403)
            days = int(d.get('days', 7))
            key = 'AE-' + uuid.uuid4().hex[:4].upper() + '-' + uuid.uuid4().hex[:4].upper()
            with LOCK:
                CONN.execute('insert into apikeys values(?,?,?,null)', (key, time.time() + days * 86400, days))
                CONN.commit()
            self._json({'key': key})
        elif self.path == '/api/keylist':
            if not self._admin(d): return self._json({'err': 'admin only'}, 403)
            with LOCK: rows = CONN.execute('select k.key, k.expires, u.name as bname from apikeys k left join users u on u.id = k.bound_to').fetchall()
            self._json({'keys': [{'key': r['key'], 'left': max(0, int((r['expires'] - time.time()) / 86400)), 'bound': r['bname'] or ''} for r in rows]})
        elif self.path == '/api/keydel':
            if not self._admin(d): return self._json({'err': 'admin only'}, 403)
            with LOCK: CONN.execute('delete from apikeys where key=?', (d.get('key'),)); CONN.commit()
            self._json({'ok': True})
        elif self.path == '/api/bindkey':
            with LOCK:
                u = self._user(d)
                row = CONN.execute('select * from apikeys where key=?', ((d.get('key') or '').strip(),)).fetchone()
                if not u: return self._json({'err': 'login first'}, 401)
                if not row or row['expires'] <= time.time(): return self._json({'err': 'invalid or expired key'}, 404)
                if row['bound_to'] and row['bound_to'] != u['id']: return self._json({'err': 'key already bound to another account'}, 409)
                CONN.execute('update apikeys set bound_to=? where key=?', (u['id'], row['key']))
                CONN.commit()
            self._json({'ok': True})
        elif self.path == '/api/access':
            t = d.get('token')
            if t in ADMIN and ADMIN[t] > time.time(): return self._json({'ok': True})
            with LOCK: row = CONN.execute('select expires from apikeys where bound_to=?', (t,)).fetchone()
            self._json({'ok': bool(row and row['expires'] > time.time())})
        elif self.path in ('/api/keycheck', '/api/activate'):
            with LOCK: row = CONN.execute('select expires from apikeys where key=?', ((d.get('key') or '').strip(),)).fetchone()
            self._json({'ok': bool(row and row['expires'] > time.time())})
        elif self.path == '/api/qcheck':
            t = d.get('key')
            self._json({'ok': t == ADMIN_KEY or (t in ADMIN and ADMIN[t] > time.time())})
        elif self.path == '/api/pair':
            with LOCK: u = self._user(d)
            if not u: return self._json({'err': 'login first'}, 401)
            code = uuid.uuid4().hex[:6].upper()
            PAIR[code] = (u['id'], time.time() + 300)
            self._json({'code': code})
        elif self.path == '/api/pairlogin':
            c = (d.get('code') or '').strip().upper()
            e = PAIR.get(c)
            if not e or e[1] < time.time(): return self._json({'err': 'invalid code'}, 404)
            with LOCK: row = CONN.execute('select name from users where id=?', (e[0],)).fetchone()
            del PAIR[c]
            self._json({'token': e[0], 'name': row['name'] if row else 'Explorer'})
        elif self.path == '/api/seen':
            with LOCK:
                for i in (d.get('ids') or [])[:60]:
                    CONN.execute('update posts set views=views+1 where id=?', (i,))
                CONN.commit()
            self._json({'ok': True})
        elif self.path in ('/api/register', '/api/login'):
            name = (d.get('name') or '').strip()[:24]; pw = d.get('pw') or ''
            if not name or not pw: return self._json({'err': 'name + password needed'}, 400)
            h = hashlib.sha256(pw.encode()).hexdigest()
            with LOCK:
                if self.path.endswith('register'):
                    uid = uuid.uuid4().hex[:12]
                    try: CONN.execute('insert into users values(?,?,?,?,?,?)', (uid, name, h, 0, 0, '#f0561c'))
                    except sqlite3.IntegrityError: return self._json({'err': 'name taken'}, 409)
                else:
                    row = CONN.execute('select id from users where name=? and pw=?', (name, h)).fetchone()
                    if not row: return self._json({'err': 'wrong name/password'}, 401)
                    uid = row['id']
                CONN.commit()
            self._json({'token': uid})
        elif self.path == '/api/sync':
            with LOCK:
                CONN.execute('update users set xp=?,lessons=?,accent=? where id=?', (int(d.get('xp', 0)), int(d.get('lessons', 0)), d.get('accent', '#f0561c'), d.get('token', '')))
                CONN.commit()
            self._json({'ok': True})
        elif self.path == '/api/changepw':
            with LOCK:
                u = self._user(d)
                if not u: return self._json({'err': 'login first'}, 401)
                if hashlib.sha256((d.get('old') or '').encode()).hexdigest() != u['pw']:
                    return self._json({'err': 'current password wrong'}, 403)
                new = (d.get('new') or '').strip()
                if len(new) < 4: return self._json({'err': 'new password too short (4+)'}, 400)
                CONN.execute('update users set pw=? where id=?', (hashlib.sha256(new.encode()).hexdigest(), u['id']))
                CONN.commit()
            self._json({'ok': True})
        elif self.path == '/api/qadd':
            if not self._admin(d): return self._json({'err': 'admin key required'}, 403)
            uid = uuid.uuid4().hex[:8]
            with LOCK:
                CONN.execute('insert into questions values(?,?,?,?,?,?,?,?)', (uid, d.get('topic', ''), d.get('tier', 'concept'), d.get('q', ''), json.dumps(d.get('options', [])), 0, d.get('explain', ''), d.get('hint', '')))
                CONN.commit()
            self._json({'ok': True, 'id': uid})
        elif self.path == '/api/qdel':
            if not self._admin(d): return self._json({'err': 'admin key required'}, 403)
            with LOCK:
                CONN.execute('delete from questions where id=?', (d.get('id'),)); CONN.commit()
            self._json({'ok': True})
        elif self.path == '/api/post':
            with LOCK: u = self._user(d)
            if not u: return self._json({'err': 'log in via SYNC first'}, 401)
            text = (d.get('text') or '').strip()[:500]
            if not text: return self._json({'err': 'empty post'}, 400)
            media = ''; m = d.get('media')
            if isinstance(m, dict):
                ext = (m.get('ext') or '').lower(); data = m.get('data') or ''
                if ext in EXTS and len(data) < 9000000:
                    mid = uuid.uuid4().hex[:10]
                    try:
                        open(os.path.join(MEDIA, mid + '.' + ext), 'wb').write(base64.b64decode(data))
                        media = '/media/' + mid + '.' + ext
                    except Exception: media = ''
            with LOCK:
                CONN.execute('insert into posts values(?,?,?,?,?,0)', (uuid.uuid4().hex[:10], u['name'], text, int(time.time()), media))
                CONN.commit()
            self._json({'ok': True})
        elif self.path == '/api/delpost':
            with LOCK:
                u = self._user(d)
                row = CONN.execute('select name from posts where id=?', (d.get('post'),)).fetchone()
                if not u or (row and row['name'] != u['name'] and not self._admin(d)): return self._json({'err': 'not yours'}, 403)
                CONN.execute('delete from posts where id=?', (d.get('post'),))
                CONN.execute('delete from likes where post=?', (d.get('post'),))
                CONN.execute('delete from comments where post=?', (d.get('post'),))
                CONN.commit()
            self._json({'ok': True})
        elif self.path == '/api/like':
            with LOCK:
                u = self._user(d)
                if not u: return self._json({'err': 'log in first'}, 401)
                cur = CONN.execute('insert or ignore into likes values(?,?)', (d.get('post'), u['name']))
                if cur.rowcount:
                    row = CONN.execute('select name from posts where id=?', (d.get('post'),)).fetchone()
                    if row and row['name'] != u['name']:
                        CONN.execute('update users set xp=xp+2 where name=?', (row['name'],))
                CONN.commit()
            self._json({'ok': True})
        elif self.path == '/api/comment':
            with LOCK: u = self._user(d)
            if not u: return self._json({'err': 'log in first'}, 401)
            text = (d.get('text') or '').strip()[:300]
            if not text: return self._json({'err': 'empty comment'}, 400)
            with LOCK:
                CONN.execute('insert into comments values(?,?,?,?,?)', (uuid.uuid4().hex[:10], d.get('post'), u['name'], text, int(time.time())))
                CONN.commit()
            self._json({'ok': True})
        else: self.send_error(404)
class Srv(http.server.ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True
with Srv(('0.0.0.0', PORT), H) as s:
    print('AE3301 v11 → http://localhost:%d (bound licensing)' % PORT)
    s.serve_forever()
