#!/usr/bin/env python3
"""
MAUSAM Atmospheric Intelligence Platform
Sitemap & robots.txt Syntax & URL Validation Utility
Feature #9 Implementation
"""

import os
import sys
import xml.etree.ElementTree as ET

def validate_robots_txt(file_path):
    print(f"Validating robots.txt: {file_path}")
    if not os.path.exists(file_path):
        print(f"ERROR: {file_path} does not exist!")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = [line.strip() for line in content.splitlines() if line.strip() and not line.startswith('#')]
    has_user_agent = any('user-agent' in line.lower() for line in lines)
    has_sitemap = any('sitemap' in line.lower() for line in lines)

    if not has_user_agent:
        print("ERROR: robots.txt is missing 'User-agent:' directive")
        return False
    if not has_sitemap:
        print("ERROR: robots.txt is missing 'Sitemap:' directive")
        return False

    print("  [OK] robots.txt contains User-agent and Sitemap directives.")
    return True

def validate_sitemap_xml(file_path):
    print(f"Validating sitemap.xml: {file_path}")
    if not os.path.exists(file_path):
        print(f"ERROR: {file_path} does not exist!")
        return False

    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
    except ET.ParseError as e:
        print(f"ERROR: XML parsing failed for {file_path}: {e}")
        return False

    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = root.findall('ns:url', namespace)
    if not urls:
        urls = root.findall('url')

    if not urls:
        print("ERROR: No <url> elements found in sitemap.xml")
        return False

    print(f"  Found {len(urls)} URLs in sitemap:")
    for url_el in urls:
        loc = url_el.find('ns:loc', namespace)
        if loc is None:
            loc = url_el.find('loc')
        
        if loc is None or not loc.text:
            print("  ERROR: <url> element missing <loc>")
            return False
        
        loc_text = loc.text.strip()
        if not loc_text.startswith('https://'):
            print(f"  WARNING: <loc> is not HTTPS: {loc_text}")
            return False
        print(f"    - {loc_text}")

    print("  [OK] sitemap.xml is valid XML and all URLs use HTTPS.")
    return True

def main():
    print("=== MAUSAM Sitemap & Robots.txt Audit ===")
    r_ok = validate_robots_txt('public/robots.txt')
    s_ok = validate_sitemap_xml('public/sitemap.xml')
    if r_ok and s_ok:
        print("=== Sitemap & robots.txt Validation: PASS ===")
        sys.exit(0)
    else:
        print("=== Sitemap & robots.txt Validation: FAIL ===")
        sys.exit(1)

if __name__ == '__main__':
    main()
