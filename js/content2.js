/* AE3301 content drop 2 — Files & Folders deep lesson + question bank */
export const LESSONS2 = {
  'cb-files': {
    title: 'Files & Folders',
    blocks: [
      { kind: 'analogy', title: 'The Library', html: 'A computer is a library with billions of pages. A <b>file</b> is one named book. A <b>folder</b> is a shelf — and shelves can hold other shelves. A <b>path</b> is the directions: room → shelf → shelf → book.' },
      { kind: 'p', html: 'Everything you save — a photo, a song, this lesson — lives in a <b class="tm">file</b> with a name and an <b class="tm">extension</b> (the part after the dot, like <b>.jpg</b>). Files sit inside <b class="tm">folders</b>, which nest without limit.' },
      { kind: 'terms', items: [
        { t: 'File', d: 'One named bundle of data: cat.jpg, notes.txt, app.js.' },
        { t: 'Folder', d: 'A container for files and other folders.' },
        { t: 'Extension', d: 'The suffix after the dot that says what kind of file it is.' },
        { t: 'Path', d: 'The address of a file: /home/photos/cat.jpg' } ] },
      { kind: 'steps', title: 'How saving works', items: [
        'You create data (type, draw, record).',
        'You pick a folder and a name — the OS writes bytes to storage.',
        'The extension tells apps how to open it (.mp3 → music app).',
        'The path never lies: it is the file’s exact address.' ] },
      { kind: 'viz', id: 'files', title: 'File explorer — click around' },
      { kind: 'realworld', title: 'Industrial view', html: 'Engineers name files like they mean it: <b>lowercase, no spaces</b> (project-report.pdf, not My Report!!.pdf) — servers and Linux are case-sensitive and space-hostile. Cloud drives are just folders on someone else’s computer, synced to yours.' },
      { kind: 'pitfall', title: 'Beginner traps', html: '① Windows hides extensions — malware loves "photo.jpg.exe". ② On servers, delete means GONE (no trash). ③ Moving a folder moves everything inside it.' },
      { kind: 'deepdive', title: 'Under the hood', html: 'On Linux <i>everything</i> is a file — keyboards and printers live under <b>/dev</b>. The whole system is one tree rooted at <b>/</b>; a folder is just a list of names pointing at inode table entries.' },
      { kind: 'interview', title: 'Interview angle', html: '"Absolute vs relative path?" → absolute starts at root (/home/me/x.txt); relative starts where you stand (./x.txt). One crisp example each = instant pass.' },
      { kind: 'summary', points: [
        'File = named data; folder = container; the tree nests forever.',
        'Extension = type hint after the dot.',
        'Path = address; absolute from /, relative from here.',
        'Name files lowercase-no-spaces; extensions can lie.' ] }
    ]
  }
};
export const QUESTIONS2 = {
  'cb-files': [
    { id: 'q-f1', tier: 'concept', tags: ['ext'], q: 'A .mp3 file opens in a music app. What tells the OS that?', options: ['The file size', 'The extension', 'The folder it lives in', 'The date'], answer: 1, hint: 'The part after the dot.', explain: 'The extension is the type hint the OS and apps read.', wrongWhy: ['Size says nothing about type.', '', 'Location doesn’t decide the app.', 'Dates don’t open apps.'] },
    { id: 'q-f2', tier: 'concept', tags: ['folders'], q: 'A folder can contain…', options: ['Only files', 'Only folders', 'Files and folders', 'Exactly 10 items'], answer: 2, hint: 'Shelves hold books AND shelves.', explain: 'Folders nest freely — files and subfolders together.', wrongWhy: ['Subfolders are allowed.', 'Files are allowed too.', '', 'No such limit exists.'] },
    { id: 'q-f3', tier: 'concept', tags: ['paths'], q: 'In /home/photos/cat.jpg, the leading / means…', options: ['Start from the root', 'Start from here', 'It’s a website', 'The file is hidden'], answer: 0, hint: 'Absolute vs relative.', explain: 'A leading / = absolute path, starting at the tree’s root.', wrongWhy: ['', 'That’s a relative path (./).', 'Paths are not URLs.', 'Hidden files use a dot, not a slash.'] },
    { id: 'q-f4', tier: 'concept', tags: ['ext'], q: 'Which extension is usually a program?', options: ['.txt', '.exe', '.jpg', '.mp3'], answer: 1, hint: 'Windows executables.', explain: '.exe marks executable programs on Windows.', wrongWhy: ['Plain text.', '', 'An image.', 'Audio.'] },
    { id: 'q-f5', tier: 'apply', tags: ['paths'], q: 'You stand in /home/me. The relative path to /home/me/docs/x.txt is…', options: ['./docs/x.txt', '/docs/x.txt', '../x.txt', 'x.txt/docs'], answer: 0, hint: 'Relative = from where you stand.', explain: './docs/x.txt walks down from your current folder.', wrongWhy: ['', 'That jumps to root — absolute.', 'That climbs UP a folder.', 'Backwards.'] },
    { id: 'q-f6', tier: 'apply', tags: ['files'], q: 'The most professional filename?', options: ['My Project!!.docx', 'project-report.docx', 'project report', 'DOC1.docx'], answer: 1, hint: 'lowercase, no spaces.', explain: 'Lowercase + hyphens survives Linux, servers and scripts.', wrongWhy: ['Spaces+punctuation break tools.', '', 'Spaces break shells.', 'Meaningless name.'] },
    { id: 'q-f7', tier: 'apply', tags: ['ext'], q: 'Renaming photo.jpg to photo.txt makes it…', options: ['A text document forever', 'Still image data with a confusing label', 'Deleted', 'A virus'], answer: 1, hint: 'Names don’t change bytes.', explain: 'The bytes are unchanged — only the label (and default app) changes.', wrongWhy: ['Content didn’t change.', '', 'Renaming never deletes.', 'Renaming never creates malware.'] },
    { id: 'q-f8', tier: 'apply', tags: ['folders'], q: 'Deleting a folder that holds 500 files removes…', options: ['Only the folder name', 'The folder and all 500 files', 'Nothing', 'Half the files'], answer: 1, hint: 'The shelf AND the books.', explain: 'A folder’s contents live inside it — deleting removes the whole subtree.', wrongWhy: ['The contents go with it.', '', 'Delete means delete.', 'No half-deletes exist.'] },
    { id: 'q-f9', tier: 'industrial', tags: ['files'], q: 'On a Linux server, "Report.pdf" and "report.pdf" are…', options: ['The same file', 'Two different files', 'An error', 'Twins'], answer: 1, hint: 'Case sensitivity.', explain: 'Linux filesystems are case-sensitive: different names, different files.', wrongWhy: ['That’s Windows/macOS behaviour.', '', 'Perfectly legal.', 'Cute, but no.'] },
    { id: 'q-f10', tier: 'industrial', tags: ['paths'], q: '"Everything is a file" on Linux means…', options: ['Only documents exist', 'Devices & sockets are exposed as file paths', 'Folders don’t exist', 'Photos are text'], answer: 1, hint: 'Look under /dev.', explain: 'Hardware and streams are accessed through the same file API (open/read/write).', wrongWhy: ['The opposite.', '', 'Folders exist.', 'No.'] }
  ]
};
