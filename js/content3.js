/* AE3301 content drop 3 — Paths & Extensions deep lesson + bank */
export const LESSONS3 = {
  'cb-paths': {
    title: 'Paths & Extensions',
    blocks: [
      { kind: 'analogy', title: 'The Postal Address', html: 'A <b>path</b> is a postal address for data: country → city → street → house. The <b>extension</b> is the kind of envelope — a letter, a parcel, a legal document — so the right "app" knows how to open it.' },
      { kind: 'p', html: 'Paths come in two flavours. <b class="tm">Absolute</b> starts from the root <b>/</b> and never changes: <b>/home/me/docs/x.txt</b>. <b class="tm">Relative</b> starts from where you stand: <b>./docs/x.txt</b> (down) or <b>../x.txt</b> (up one folder).' },
      { kind: 'terms', items: [
        { t: 'Root ( / )', d: 'The top of the whole tree; every absolute path begins here.' },
        { t: 'Absolute path', d: 'Full address from root: /home/me/notes.txt' },
        { t: 'Relative path', d: 'Address from your current folder: ./notes.txt, ../x.txt' },
        { t: 'Hidden file', d: 'Names starting with a dot (.bashrc) — invisible by default.' } ] },
      { kind: 'steps', title: 'Reading a path', items: [
        'Split on every / :  / home / me / docs / x.txt',
        'Each segment is one folder deeper.',
        'The last segment is the file itself.',
        'The extension (after the last dot) names its type: .txt, .pdf, .jpg' ] },
      { kind: 'viz', id: 'paths', title: 'Absolute vs relative — live' },
      { kind: 'realworld', title: 'Industrial view', html: 'A URL is just a path on another computer: <b>site.com/docs/x.pdf</b> = folder docs, file x.pdf on that server. Web servers map extensions to <b>MIME types</b> (.jpg → image/jpeg) so browsers know how to render. Linux/URLs use <b>/</b>; Windows historically <b>\\</b>.' },
      { kind: 'pitfall', title: 'Beginner traps', html: '① <b>photo.jpg.exe</b> runs as a program on Windows — extensions can lie about order. ② Linux is case-sensitive: Notes.txt ≠ notes.txt. ③ Spaces break scripts — pros write <b>my-notes.pdf</b>. ④ Dot-files are hidden, not deleted.' },
      { kind: 'deepdive', title: 'Under the hood', html: 'The Linux tree has famous roots: <b>/home</b> (people), <b>/etc</b> (settings), <b>/dev</b> (devices as files). <b>Symbolic links</b> are shortcut-files pointing at other paths — the filesystem’s version of a hyperlink.' },
      { kind: 'interview', title: 'Interview angle', html: '"How does the OS choose the app for a file?" → extension/MIME maps to a handler; but the extension is only a label — content sniffing exists because labels can lie. Say that and you sound senior.' },
      { kind: 'summary', points: [
        'Absolute = from /; relative = from here (./ down, ../ up).',
        'Segments = folders; last = file; after-dot = extension.',
        'URLs are paths on remote machines; MIME = web extensions.',
        'Lowercase-no-spaces names; beware double extensions.' ] }
    ]
  }
};
export const QUESTIONS3 = {
  'cb-paths': [
    { id: 'q-p01', tier: 'concept', tags: ['paths'], q: 'The very top of the file tree is written as…', options: ['/', './', '../', '~'], answer: 0, hint: 'One single character.', explain: '/ is the root — every absolute path starts there.', wrongWhy: ['', './ means "here".', '../ means "up one".', '~ is a shortcut for your home, not root.'] },
    { id: 'q-p02', tier: 'concept', tags: ['paths'], q: '../ means…', options: ['Up one folder', 'Down one folder', 'Go home', 'Go to root'], answer: 0, hint: 'Two dots climb.', explain: '.. is the parent folder; ../ climbs one level.', wrongWhy: ['', 'Down is ./name.', 'Home is /home/you.', 'Root is /.'] },
    { id: 'q-p03', tier: 'concept', tags: ['ext'], q: '.png marks…', options: ['An image', 'Audio', 'A program', 'A folder'], answer: 0, hint: 'Portable Network…', explain: '.png is a lossless image format.', wrongWhy: ['', 'That’s .mp3/.wav.', 'That’s .exe/.sh.', 'Folders have no extension.'] },
    { id: 'q-p04', tier: 'concept', tags: ['ext'], q: 'On Linux, hidden files start with…', options: ['A dot', 'An underscore', 'A slash', 'A number'], answer: 0, hint: '.bashrc', explain: 'Leading dot = hidden by default (ls -a reveals).', wrongWhy: ['', 'Underscores are visible.', 'Slash separates folders.', 'Numbers are fine and visible.'] },
    { id: 'q-p05', tier: 'apply', tags: ['paths'], q: 'You stand in /home/me. ./docs/x.txt absolutely is…', options: ['/home/me/docs/x.txt', '/docs/x.txt', '/home/docs/x.txt', 'me/docs/x.txt'], answer: 0, hint: 'Glue "here" + relative.', explain: 'Current folder + ./docs/x.txt = /home/me/docs/x.txt.', wrongWhy: ['', 'That ignores /home/me.', 'Drops the me folder.', 'Not an absolute path.'] },
    { id: 'q-p06', tier: 'apply', tags: ['paths'], q: 'From /home/me/docs, the relative path to /home/me/notes.txt is…', options: ['../notes.txt', './notes.txt', '/notes.txt', 'notes.txt/../'], answer: 0, hint: 'Climb first.', explain: 'Up one (..) into me, then notes.txt.', wrongWhy: ['', 'That looks inside docs.', 'Absolute, not relative.', 'Backwards.'] },
    { id: 'q-p07', tier: 'apply', tags: ['ext'], q: 'A web server mainly uses extensions to…', options: ['Pick the Content-Type (MIME)', 'Set passwords', 'Rename files', 'Compress them'], answer: 0, hint: 'image/jpeg…', explain: 'Extension → MIME type → browser renders correctly.', wrongWhy: ['', 'Auth is separate.', 'Servers don’t rename.', 'No compression magic.'] },
    { id: 'q-p08', tier: 'industrial', tags: ['paths'], q: 'Windows uses \\ but Linux and URLs use…', options: ['Forward slash /', 'Colon :', 'Question mark ?', 'Hash #'], answer: 0, hint: 'The web standard.', explain: '/ is the universal path separator on Linux/URLs.', wrongWhy: ['', 'Colons drive letters/ports.', '? starts query strings.', '# starts fragments.'] },
    { id: 'q-p09', tier: 'industrial', tags: ['ext'], q: 'photo.jpg.exe is dangerous because…', options: ['Windows executes the .exe', 'JPGs are viruses', 'It’s too large', 'It deletes itself'], answer: 0, hint: 'Last extension wins.', explain: 'The real type is the LAST extension — .exe runs code.', wrongWhy: ['', 'They aren’t.', 'Size is irrelevant.', 'No.'] },
    { id: 'q-p10', tier: 'industrial', tags: ['paths'], q: 'In https://site.com/docs/x.pdf the /docs/x.pdf part is…', options: ['A path on that server', 'A folder on your phone', 'An extension', 'A port number'], answer: 0, hint: 'Remote filesystem.', explain: 'It addresses a file on the remote machine’s tree.', wrongWhy: ['', 'Your phone only caches.', 'x.pdf holds the extension.', 'Ports come after a colon.'] }
  ]
};
