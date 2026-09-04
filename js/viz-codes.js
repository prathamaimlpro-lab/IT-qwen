/* AE3301 · multi-language code + complexity chips for the viz engine */
window.AE3301_CODES = {
  bubble: {
    C: 'void bubble_sort(int a[], int n) {\n  for (int i = 0; i < n - 1; i++)\n    for (int j = 0; j < n - i - 1; j++)\n      if (a[j] > a[j + 1]) {\n        int t = a[j]; a[j] = a[j+1]; a[j+1] = t;\n      }\n}',
    Java: 'public static void bubbleSort(int[] a) {\n  for (int i = 0; i < a.length - 1; i++)\n    for (int j = 0; j < a.length - i - 1; j++)\n      if (a[j] > a[j + 1]) {\n        int t = a[j]; a[j] = a[j+1]; a[j+1] = t;\n      }\n}',
    Python: 'def bubble_sort(a):\n    for i in range(len(a) - 1):\n        for j in range(len(a) - i - 1):\n            if a[j] > a[j + 1]:\n                a[j], a[j+1] = a[j+1], a[j]',
    JavaScript: 'function bubbleSort(a) {\n  for (let i = 0; i < a.length - 1; i++)\n    for (let j = 0; j < a.length - i - 1; j++)\n      if (a[j] > a[j + 1])\n        [a[j], a[j+1]] = [a[j+1], a[j]];\n}'
  },
  selection: {
    C: 'void selection_sort(int a[], int n) {\n  for (int i = 0; i < n - 1; i++) {\n    int m = i;\n    for (int j = i + 1; j < n; j++)\n      if (a[j] < a[m]) m = j;\n    int t = a[i]; a[i] = a[m]; a[m] = t;\n  }\n}',
    Java: 'public static void selectionSort(int[] a) {\n  for (int i = 0; i < a.length - 1; i++) {\n    int m = i;\n    for (int j = i + 1; j < a.length; j++)\n      if (a[j] < a[m]) m = j;\n    int t = a[i]; a[i] = a[m]; a[m] = t;\n  }\n}',
    Python: 'def selection_sort(a):\n    for i in range(len(a) - 1):\n        m = i\n        for j in range(i + 1, len(a)):\n            if a[j] < a[m]: m = j\n        a[i], a[m] = a[m], a[i]',
    JavaScript: 'function selectionSort(a) {\n  for (let i = 0; i < a.length - 1; i++) {\n    let m = i;\n    for (let j = i + 1; j < a.length; j++)\n      if (a[j] < a[m]) m = j;\n    [a[i], a[m]] = [a[m], a[i]];\n  }\n}'
  },
  insertion: {
    C: 'void insertion_sort(int a[], int n) {\n  for (int i = 1; i < n; i++) {\n    int k = a[i], j = i - 1;\n    while (j >= 0 && a[j] > k) {\n      a[j + 1] = a[j]; j--;\n    }\n    a[j + 1] = k;\n  }\n}',
    Java: 'public static void insertionSort(int[] a) {\n  for (int i = 1; i < a.length; i++) {\n    int k = a[i], j = i - 1;\n    while (j >= 0 && a[j] > k) {\n      a[j + 1] = a[j]; j--;\n    }\n    a[j + 1] = k;\n  }\n}',
    Python: 'def insertion_sort(a):\n    for i in range(1, len(a)):\n        k, j = a[i], i - 1\n        while j >= 0 and a[j] > k:\n            a[j + 1] = a[j]; j -= 1\n        a[j + 1] = k',
    JavaScript: 'function insertionSort(a) {\n  for (let i = 1; i < a.length; i++) {\n    const k = a[i]; let j = i - 1;\n    while (j >= 0 && a[j] > k) {\n      a[j + 1] = a[j]; j--;\n    }\n    a[j + 1] = k;\n  }\n}'
  }
};
window.AE3301_META = {
  bubble: { time: 'O(n²)', space: 'O(1)' },
  selection: { time: 'O(n²)', space: 'O(1)' },
  insertion: { time: 'O(n²)', space: 'O(1)' },
  linear: { time: 'O(n)', space: 'O(1)' },
  binary: { time: 'O(log n)', space: 'O(1)' },
  bfsTree: { time: 'O(n)', space: 'O(n)' },
  dfsTree: { time: 'O(n)', space: 'O(h)' },
  bfsGraph: { time: 'O(V+E)', space: 'O(V)' }
};
