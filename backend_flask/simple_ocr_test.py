#!/usr/bin/env python3
"""
Simple test for corrupted OCR processing
"""

import sys
sys.path.append('H:/fydp/SymptoSeek-Backend/backend_flask')

def test_simple_ocr():
    """Simple test for OCR processing"""
    try:
        from app import clean_and_normalize_ocr_text, extract_lab_values_from_cbc
        
        print("🧪 Testing Enhanced OCR Processing")
        print("=" * 50)
        
        # Your corrupted text
        corrupted_text = """
        HEMOGLOBIN HemcJ 345 WBC COUNT WOC counil 4OdO-tOOO 
        """
        
        print(f"📄 Original: {corrupted_text.strip()}")
        
        # Clean text
        cleaned = clean_and_normalize_ocr_text(corrupted_text)
        print(f"🔧 Cleaned: {cleaned}")
        
        # Extract lab values
        lab_values = extract_lab_values_from_cbc(cleaned)
        print(f"🧬 Lab Values Found: {len(lab_values)}")
        
        for lab in lab_values:
            print(f"   ✅ {lab['test']}: {lab['value']} {lab['unit']} ({lab['status']})")
        
        return len(lab_values) > 0
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_simple_ocr()
    print(f"\n{'🎉 SUCCESS!' if success else '❌ Failed'}")
