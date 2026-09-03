/* ================================================================
 * AE3301 · CONTENT DROP 5 — TERMINAL & LINUX BASICS (§14)
 * 10-layer deep lesson + 10-question bank · tags: term, linux
 * ================================================================ */
export const LESSONS5 = {
  'cb-term': {
    title: 'Terminal & Linux Basics',
    blocks: [
      { kind: 'analogy', title: 'The Text Remote-Control', html: 'Tapping icons is like pressing buttons on a TV remote. The <b>terminal</b> is like texting the TV exact instructions: "open channel 5, volume 20". Text feels harder at first — but it is precise, repeatable, and works even when the TV has no screen. That is why professionals live in it.' },
      { kind: 'p', html: 'The <b class="tm">terminal</b> is the window where you type commands. The <b class="tm">shell</b> is the program inside it that reads your words and makes the OS obey (bash is the most famous shell). A <b class="tm">command</b> is one instruction. The <b class="tm">prompt</b> — like <b>me@ae3301:~$</b> — is the shell saying "ready". <b class="tm">Linux</b> is the free, everywhere operating system kernel this whole style comes from.' },
      { kind: 'terms', items: [
        { t: 'Terminal', d: 'The text window you type into.' },
        { t: 'Shell', d: 'The command interpreter (bash, zsh…).' },
        { t: 'Command', d: 'One instruction, e.g. ls, cd, mkdir.' },
        { t: 'Prompt', d: 'The ready signal: user@host:folder$' },
        { t: 'Linux', d: 'Free OS kernel powering servers, Android, routers.' } ] },
      { kind: 'steps', title: 'One command, one journey', items: [
        'You type <b>ls</b> and press Enter.',
        'The <b>shell</b> splits your line into words.',
        'The shell asks the <b>kernel</b> to do the work.',
        'The kernel reads the folder and answers.',
        'Output prints; the <b>prompt</b> returns. Loop forever.' ] },
      { kind: 'viz', id: 'term', title: 'Your first terminal — type help' },
      { kind: 'realworld', title: 'Industrial view', html: 'Most servers have no screen at all — engineers reach them over SSH, pure text. Git, Docker, deployments, backups: all CLI-first. Android\'s core is Linux; routers, TVs, cars run it. Learning this one window opens the whole machine world.' },
      { kind: 'pitfall', title: 'Beginner traps', html: '① Linux is case-sensitive: Notes.txt ≠ notes.txt. ② <b>rm</b> has NO trash bin — deleted is gone. ③ Spaces break commands; use quotes or dashes (my-notes.txt). ④ <b>sudo</b> = superuser power; one wrong sudo rm can erase a system. ⑤ Press <b>Tab</b> to autocomplete — pros do it constantly.' },
      { kind: 'deepdive', title: 'Under the hood', html: 'The shell is just a program — you can swap bash for zsh or fish. The pipe <b>|</b> chains commands: <b>cat log.txt | grep error</b> prints only error lines. And the Unix philosophy "everything is a file": even your keyboard appears to the kernel as a file it can read.' },
      { kind: 'interview', title: 'Interview angle', html: '"Difference between terminal and shell?" → terminal = the text window/IO; shell = the interpreter that executes commands. Then name five commands with uses (ls, cd, mkdir, touch, grep). Calm, correct, complete — that is the whole game.' },
      { kind: 'summary', points: [
        'Terminal = window; shell = interpreter; prompt = ready signal.',
        'Core commands: pwd ls cd mkdir touch cat rm cp mv grep.',
        'cd .. climbs up; Tab autocompletes; rm has no trash.',
        'Pipes chain commands; Linux runs the server world.' ] }
    ]
  }
};
export const QUESTIONS5 = {
  'cb-term': [
    { id: 'q-t1', tier: 'concept', tags: ['term'], q: 'Which command prints the folder you are in?', options: ['pwd', 'cd', 'ls', 'cat'], answer: 0, hint: 'Print Working Directory.', explain: 'pwd shows your absolute current path.', wrongWhy: ['', 'cd moves you.', 'ls lists contents.', 'cat prints file contents.'] },
    { id: 'q-t2', tier: 'concept', tags: ['term'], q: 'ls…', options: ['Lists files and folders', 'Deletes files', 'Copies files', 'Moves files'], answer: 0, hint: 'LiSt.', explain: 'ls lists the children of the current folder.', wrongWhy: ['', 'That is rm.', 'That is cp.', 'That is mv.'] },
    { id: 'q-t3', tier: 'concept', tags: ['term'], q: 'To enter a folder you use…', options: ['cd', 'mkdir', 'touch', 'grep'], answer: 0, hint: 'Change Directory.', explain: 'cd <name> moves you inside that folder.', wrongWhy: ['', 'mkdir creates folders.', 'touch creates files.', 'grep searches text.'] },
    { id: 'q-t4', tier: 'concept', tags: ['term'], q: 'The symbol for "one folder up" is…', options: ['..', '.', '~', '/'], answer: 0, hint: 'Two dots climb.', explain: 'cd .. moves to the parent folder.', wrongWhy: ['', '. means here.', '~ means home.', '/ means root.'] },
    { id: 'q-t5', tier: 'apply', tags: ['term'], q: 'You are in /home/me and run: cd docs. pwd now shows…', options: ['/home/me/docs', '/docs', '/home/docs', 'docs'], answer: 0, hint: 'Glue the path.', explain: 'The relative move resolves against your current folder.', wrongWhy: ['', 'Ignores /home/me.', 'Drops me.', 'Relative, not absolute.'] },
    { id: 'q-t6', tier: 'apply', tags: ['term'], q: 'Create an empty file named x.txt with…', options: ['touch x.txt', 'mkdir x.txt', 'cat x.txt', 'rm x.txt'], answer: 0, hint: 'Gentle creation.', explain: 'touch creates the file if missing.', wrongWhy: ['', 'mkdir makes folders.', 'cat reads files.', 'rm deletes.'] },
    { id: 'q-t7', tier: 'apply', tags: ['term'], q: 'mkdir notes…', options: ['Creates a folder called notes', 'Creates a file called notes', 'Deletes notes', 'Prints notes'], answer: 0, hint: 'Make DIRectory.', explain: 'mkdir = make directory (folder).', wrongWhy: ['', 'Folders, not files.', 'No.', 'No.'] },
    { id: 'q-t8', tier: 'industrial', tags: ['term'], q: 'Find every line containing "error" in log.txt:', options: ['grep error log.txt', 'cat error log.txt', 'ls error', 'cd log.txt'], answer: 0, hint: 'The filter.', explain: 'grep prints matching lines — the daily workhorse.', wrongWhy: ['', 'cat would dump everything.', 'ls lists names.', 'cd cannot open files.'] },
    { id: 'q-t9', tier: 'industrial', tags: ['linux'], q: 'In Linux, devices (keyboard, disk…) are treated as…', options: ['Files', 'Folders', 'Users', 'Windows'], answer: 0, hint: 'The old Unix idea.', explain: '"Everything is a file" — one uniform interface.', wrongWhy: ['', 'No.', 'No.', 'No.'] },
    { id: 'q-t10', tier: 'industrial', tags: ['linux'], q: 'The all-powerful admin account on Linux is called…', options: ['root', 'admin', 'boss', 'super'], answer: 0, hint: 'The tree\'s base.', explain: 'root owns everything; sudo borrows root\'s power.', wrongWhy: ['', 'Common elsewhere, not Linux.', 'No.', 'No.'] }
  ]
};
