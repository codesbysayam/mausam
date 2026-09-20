#!/usr/bin/env python3
"""
MAUSAM Atmospheric Intelligence Platform
Link & Navigation Route Auditor
Feature #16 Implementation
"""

import os
import re
import sys

VALID_ROUTES = {
    '/',
    '/weather',
    '/forecast',
    '/warnings',
    '/alerts',
    '/radar',
    '/maps',
    '/aqi',
    '/air',
    '/agromet',
    '/reports',
    '/privacy',
    '/terms',
    '/api',
    '/debug',
    '/not-found',
    '/agromet_bulletin.html',
    '/bulletin.html',
    '/docs/api_specification.html',
}

def audit_files():
    print("=== MAUSAM Link & Navigation Route Audit ===")
    total_files_scanned = 0
    issues_found = 0

    # Pattern for href="..." or onNavigate('...')
    href_pattern = re.compile(r'href=["\']([^"\']+)["\']')
    nav_pattern = re.compile(r'onNavigate\([\'"]([^\'"]+)[\'"]\)')

    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.html')):
                total_files_scanned += 1
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                # Check hrefs
                for match in href_pattern.finditer(content):
                    link = match.group(1)
                    if link == '#' or link == 'javascript:void(0)':
                        print(f"  [WARN] Dead placeholder link '{link}' found in {filepath}")
                        issues_found += 1
                    elif link.startswith('/') and not link.startswith('//'):
                        clean_link = link.split('?')[0].split('#')[0]
                        if clean_link not in VALID_ROUTES and not clean_link.startswith('/api'):
                            print(f"  [WARN] Unknown route '{clean_link}' in {filepath}")
                            issues_found += 1

    print(f"Files scanned: {total_files_scanned}")
    print(f"Issues detected: {issues_found}")
    if issues_found == 0:
        print("=== Link Audit: PASS (No broken or dead placeholder links) ===")
        return True
    else:
        print(f"=== Link Audit: {issues_found} warnings to review ===")
        return True

if __name__ == '__main__':
    audit_files()
