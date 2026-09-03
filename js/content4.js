/* ================================================================
 * AE3301 · CONTENT DROP 4 — OPERATING SYSTEMS (deep lesson + bank)
 * 10-layer template · tags: os, process, kernel, boot
 * ================================================================ */
export const LESSONS4 = {
  'cb-os': {
    title: 'Operating Systems',
    blocks: [
      { kind: 'analogy', title: 'The Building Manager', html: 'An apartment building has many tenants (your <b>apps</b>), one electricity supply (the <b>CPU</b>), limited storage rooms (<b>RAM</b>), and doors, lifts, pipes (<b>devices</b>). The <b>manager</b> who decides who gets what, when, and keeps everyone from crashing into each other — that is the <b>operating system</b>.' },
      { kind: 'p', html: 'The <b class="tm">OS</b> is the always-running software layer between hardware and apps. Its heart, the <b class="tm">kernel</b>, talks directly to hardware; everything else (windows, icons, app stores) sits on top. A <b class="tm">process</b> is simply a program that is currently executing.' },
      { kind: 'terms', items: [
        { t: 'OS', d: 'The manager software: Windows, Linux, macOS, Android, iOS.' },
        { t: 'Kernel', d: 'The OS core with direct hardware control.' },
        { t: 'Process', d: 'A running program, given memory and CPU time.' },
        { t: 'Driver', d: 'A tiny translator letting the OS use a specific device.' } ] },
      { kind: 'steps', title: 'What the OS actually does', items: [
        '<b>Boots</b>: firmware wakes the CPU, loads the kernel.',
        '<b>Schedules</b>: slices CPU time between processes (try the sim!).',
        '<b>Allocates memory</b>: hands each process its own desk space.',
        '<b>Drives devices</b>: keyboard, screen, Wi-Fi via drivers.',
        '<b>Provides the UI</b>: windows, taps, terminals.' ] },
      { kind: 'viz', id: 'sched', title: 'Be the scheduler — press TICK' },
      { kind: 'realworld', title: 'Industrial view', html: 'Nearly all servers, supercomputers, routers and Android phones run <b>Linux</b> — because it is free, stable and scriptable. Windows dominates desktops and offices; macOS is Unix-certified. Engineers mostly live in Linux terminals, which is why Level 2 of AE3301 is Linux + Git.' },
      { kind: 'pitfall', title: 'Beginner traps', html: '① "Closing apps always speeds up the phone" — modern OSes manage RAM; relaunching costs more. ② Two antivirus programs fight like two managers — worse, not safer. ③ A reboot doesn\'t "install speed"; it clears leaked memory and stuck processes.' },
      { kind: 'deepdive', title: 'Under the hood', html: 'Apps never touch hardware directly — they ask the kernel via a <b>system call</b> (open, read, send). This separation (user mode vs kernel mode) is why one crashing app doesn\'t kill the machine. Containers and VMs are just this idea pushed further: fake hardware, real isolation.' },
      { kind: 'interview', title: 'Interview angle', html: '"Program vs process?" → a program is a file on storage; a process is that file loaded into RAM with state, executing. "What happens when you press the power button?" → firmware → bootloader → kernel → services → UI. Two crisp answers, instant respect.' },
      { kind: 'summary', points: [
        'OS = manager between hardware and apps; kernel = its heart.',
        'Process = running program; scheduler time-slices the CPU.',
        'Drivers translate; system calls protect hardware.',
        'Linux runs the server world; reboot clears leaks.' ] }
    ]
  }
};
export const QUESTIONS4 = {
  'cb-os': [
    { id: 'q-o1', tier: 'concept', tags: ['os'], q: 'The core software that manages hardware and apps is the…', options: ['Operating system', 'Browser', 'File system', 'CPU'], answer: 0, hint: 'The manager.', explain: 'The OS sits between hardware and every app.', wrongWhy: ['', 'A browser is just one app.', 'That is part of the OS.', 'The CPU is hardware.'] },
    { id: 'q-o2', tier: 'concept', tags: ['process'], q: 'A program that is currently running is called a…', options: ['Process', 'Folder', 'Driver', 'Menu'], answer: 0, hint: 'Alive, in RAM.', explain: 'Loaded into RAM with state = a process.', wrongWhy: ['', 'Folders store files.', 'Drivers translate for devices.', 'Menus are UI.'] },
    { id: 'q-o3', tier: 'concept', tags: ['kernel'], q: 'The heart of the OS with direct hardware control is the…', options: ['Kernel', 'Shell', 'Icon', 'Theme'], answer: 0, hint: 'Seed of the OS.', explain: 'The kernel owns memory, CPU scheduling and devices.', wrongWhy: ['', 'The shell is just a user interface layer.', 'Cosmetic.', 'Cosmetic.'] },
    { id: 'q-o4', tier: 'concept', tags: ['os'], q: 'Drivers are…', options: ['Software letting the OS talk to devices', 'Only car software', 'Viruses', 'Fonts'], answer: 0, hint: 'Translators.', explain: 'Each device (printer, GPU, Wi-Fi) gets a driver translator.', wrongWhy: ['', 'Too literal.', 'No.', 'No.'] },
    { id: 'q-o5', tier: 'apply', tags: ['process'], q: 'Five apps open, one CPU core. How do they all "run"?', options: ['The OS time-slices the CPU between processes', 'The phone has 5 hidden cores', 'Apps wait until others close', 'The OS pauses them randomly'], answer: 0, hint: 'Round and round.', explain: 'Scheduling: rapid rotation feels simultaneous (see the sim).', wrongWhy: ['', 'Cores are physical, not hidden magic.', 'That would make phones unusable.', 'Scheduling is deliberate, not random.'] },
    { id: 'q-o6', tier: 'apply', tags: ['os'], q: 'Why can a reboot fix a slow device?', options: ['It clears leaked memory and stuck processes', 'It upgrades the hardware', 'It cannot, ever', 'It installs a new CPU'], answer: 0, hint: 'Fresh start.', explain: 'A boot resets RAM and restarts misbehaving processes.', wrongWhy: ['', 'Hardware is unchanged.', 'It often helps.', 'Reboots never change hardware.'] },
    { id: 'q-o7', tier: 'apply', tags: ['process'], q: 'Program vs process?', options: ['Program = file on storage; process = that program executing in RAM', 'They are identical words', 'A process is a file type', 'A program only runs on servers'], answer: 0, hint: 'Dead vs alive.', explain: 'Static file vs living execution with memory and state.', wrongWhy: ['', 'One is static, one is alive.', 'Backwards.', 'No.'] },
    { id: 'q-o8', tier: 'industrial', tags: ['os'], q: 'Most servers and supercomputers run…', options: ['Linux', 'Windows', 'Android', 'macOS'], answer: 0, hint: 'Free + stable + scriptable.', explain: 'Linux dominates infrastructure worldwide.', wrongWhy: ['', 'Present, but a minority in servers.', 'Android is for phones (though Linux-based).', 'Rare in datacenters.'] },
    { id: 'q-o9', tier: 'industrial', tags: ['os'], q: 'Android is built on top of which kernel?', options: ['Linux', 'Windows NT', 'XNU', 'DOS'], answer: 0, hint: 'Same as servers.', explain: 'Android = Linux kernel + Google\'s stack.', wrongWhy: ['', 'That is Windows.', 'That is macOS/iOS.', 'Ancient history.'] },
    { id: 'q-o10', tier: 'industrial', tags: ['kernel'], q: 'A system call is…', options: ['An app asking the kernel for hardware/resources', 'A phone call app', 'A reboot command', 'An error message'], answer: 0, hint: 'Knock on the kernel\'s door.', explain: 'open/read/send are system calls — safe, mediated access.', wrongWhy: ['', 'Too literal.', 'No.', 'No.'] }
  ]
};
