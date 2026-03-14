#!/usr/bin/env python3
"""Build data/languages.json from i18n.js, header-i18n.js, classification-tree.js"""
import re
import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))

def extract_i18n_strings():
    path = os.path.join(BASE, 'i18n.js')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    start = content.find('const I18N = {')
    if start == -1:
        raise SystemExit('I18N not found in i18n.js')
    pos = start + len('const I18N = ')  # points to '{'
    depth = 0
    for i, c in enumerate(content[pos:], pos):
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                break
    # inner content only (skip opening '{', we add it back with closing '}')
    block = content[pos + 1:i]
    # Quote top-level keys: "    key: {" -> "    \"key\": {"
    block = re.sub(r'^(\s+)([a-zA-Z_][a-zA-Z0-9_]*):\s*\{', r'\1"\2": {', block, flags=re.MULTILINE)
    # Quote inner lang keys: " ru: \"" -> " \"ru\": \"" and " { ru: \"" -> " { \"ru\": \""
    block = re.sub(r',\s*([a-zA-Z]{2,3}):\s*"', r', "\1": "', block)
    block = re.sub(r'\{\s*([a-zA-Z]{2,3}):\s*"', r'{ "\1": "', block)
    # Remove all trailing commas before } or ] (keep whitespace)
    for _ in range(20):
        prev = block
        block = re.sub(r',(\s*})', r'\1', block)
        block = re.sub(r',(\s*])', r'\1', block)
        if block == prev:
            break
    # Trailing comma at end of block (before our closing "}")
    block = re.sub(r',(\s*)$', r'\1', block)
    obj = json.loads('{' + block + '}')
    return obj

def extract_js_object(content, var_name):
    """Extract a JS object (with unquoted keys and single-quoted values) and return as dict."""
    start_marker = 'var ' + var_name + ' = '
    start = content.find(start_marker)
    if start == -1:
        start = content.find('  var ' + var_name + ' = ')
    if start == -1:
        raise SystemExit(var_name + ' not found')
    start += len(start_marker)
    depth = 0
    in_string = None
    escape = False
    i = start
    while i < len(content):
        c = content[i]
        if escape:
            escape = False
            i += 1
            continue
        if c == '\\' and in_string:
            escape = True
            i += 1
            continue
        if in_string:
            if c == in_string:
                in_string = None
            i += 1
            continue
        if c in ("'", '"'):
            in_string = c
            i += 1
            continue
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                break
        i += 1
    # skip opening '{'
    block = content[start + 1:i]
    # Protect double-quoted strings (so single-quote replacement doesn't break them)
    double_quoted = []
    def save_double(m):
        double_quoted.append(m.group(0))
        return '\x00DQ{}\x00'.format(len(double_quoted) - 1)
    block = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', save_double, block)
    # Replace single-quoted strings: '...' -> "..."
    def replace_single_quoted(m):
        s = m.group(1)
        s = s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r')
        return '"' + s + '"'
    block = re.sub(r"'([^'\\]*(?:\\.[^'\\]*)*)'", replace_single_quoted, block)
    # Restore double-quoted strings
    for idx, s in enumerate(double_quoted):
        block = block.replace('\x00DQ{}\x00'.format(idx), s)
    # Quote unquoted keys (word followed by :)
    block = re.sub(r'^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'"\1":', block, count=1, flags=re.MULTILINE)
    block = re.sub(r'(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1 "\2":', block)
    # Trailing comma at end
    block = re.sub(r',(\s*)$', r'\1', block)
    for _ in range(10):
        prev = block
        block = re.sub(r',(\s*})', r'\1', block)
        block = re.sub(r',(\s*])', r'\1', block)
        if block == prev:
            break
    try:
        return json.loads('{' + block + '}')
    except json.JSONDecodeError:
        raise

def extract_header():
    path = os.path.join(BASE, 'header-i18n.js')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    return extract_js_object(content, 'HEADER_STRINGS')

def extract_classification():
    path = os.path.join(BASE, 'classification-tree.js')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    return extract_js_object(content, 'UI_STRINGS')

def main():
    strings = extract_i18n_strings()
    header = extract_header()
    classification = extract_classification()
    out = {
        'strings': strings,
        'header': header,
        'classification': classification
    }
    out_path = os.path.join(BASE, 'data', 'languages.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print('Wrote', out_path)
    print('  strings:', len(strings), 'keys')
    print('  header:', len(header), 'langs')
    print('  classification:', len(classification), 'langs')

if __name__ == '__main__':
    main()
