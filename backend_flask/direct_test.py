#!/usr/bin/env python3
"""
Direct test of the specific OCR patterns from your sample
"""

import re

def test_direct_patterns():
    """Test specific patterns directly"""
    
    print("🧪 Direct Pattern Testing")
    print("=" * 40)
    
    # Your specific corrupted text
    text = "HEMOGLOBIN HemcJ 345 WBC COUNT WOC counil 4OdO-tOOO"
    print(f"Original: {text}")
    
    # Simple corrections
    corrections = {
        'HemcJ': 'HEMOGLOBIN',
        'WOC counil': 'WBC COUNT',
        '4OdO-tOOO': '4000-11000'
    }
    
    cleaned = text
    for old, new in corrections.items():
        cleaned = cleaned.replace(old, new)
    
    print(f"Cleaned: {cleaned}")
    
    # Look for hemoglobin value
    hb_patterns = [
        r'HEMOGLOBIN.*?(\d+\.?\d*)',
        r'(\d{3})'  # 3-digit number like 345
    ]
    
    for pattern in hb_patterns:
        matches = re.findall(pattern, cleaned)
        if matches:
            print(f"Pattern '{pattern}' found: {matches}")
            # If we find 345, convert to 34.5
            for match in matches:
                if match == '345':
                    print(f"   Converting 345 → 34.5 (Hemoglobin)")
                elif match.isdigit() and len(match) == 3:
                    value = float(match) / 10
                    print(f"   Potential Hemoglobin: {value} g/dL")
    
    # Look for WBC
    wbc_patterns = [
        r'WBC COUNT.*?(\d+)',
        r'(\d{4,5})'  # 4-5 digit numbers
    ]
    
    for pattern in wbc_patterns:
        matches = re.findall(pattern, cleaned)
        if matches:
            print(f"WBC Pattern '{pattern}' found: {matches}")

if __name__ == "__main__":
    test_direct_patterns()
