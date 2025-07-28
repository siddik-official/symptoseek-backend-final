#!/usr/bin/env python3
"""
Direct test of the analyze_medical_text_enhanced function with corrupted OCR text
"""

import sys
sys.path.append('.')

from app import analyze_medical_text_enhanced

def test_medical_analysis():
    """Test the medical analysis function directly with corrupted OCR text"""
    print("🧪 Testing analyze_medical_text_enhanced function directly...")
    
    # Test with the user's actual corrupted OCR text
    test_text = """
    Dr. LOGY PATHOLOGY LAB
    Complete Blood Count (CBC)
    
    Patient: John Doe
    Date: 2024-01-15
    
    Test Results:
    HEHOGLOBI: 345 g/dL
    WdC COUNT: 4OdO-tOOO
    PLATELET COUNT: 1so0n0
    MCH: 32 pg
    MCHC: 35 g/dL
    
    Reference By: Dr. Smith
    """
    
    try:
        print("📋 Analyzing corrupted OCR text...")
        result = analyze_medical_text_enhanced(test_text)
        
        print("✅ Analysis completed successfully!")
        print(f"📊 Summary: {result.get('summary', 'No summary')}")
        
        if result.get('lab_values'):
            print("🧪 Lab Values Found:")
            for lab in result['lab_values']:
                if isinstance(lab, dict):
                    test_name = lab.get('test', 'Unknown')
                    value = lab.get('value', 'N/A')
                    unit = lab.get('unit', '')
                    status = lab.get('status', 'Unknown')
                    print(f"  • {test_name}: {value} {unit} ({status})")
        else:
            print("ℹ️ No lab values extracted")
        
        if result.get('detected_conditions'):
            print("🏥 Detected Conditions:")
            for condition in result['detected_conditions']:
                if isinstance(condition, dict):
                    print(f"  • {condition.get('condition', 'Unknown')}: {condition.get('severity', 'Unknown')}")
        
        print("\n✅ KeyError 'normal_range' test PASSED - No errors occurred!")
        return True
        
    except KeyError as e:
        print(f"❌ KeyError still exists: {e}")
        print("This means we still have unsafe dictionary access!")
        return False
    except Exception as e:
        print(f"❌ Other error occurred: {type(e).__name__}: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Testing medical text analysis fixes...")
    success = test_medical_analysis()
    
    if success:
        print("\n✅ All tests passed! The 'normal_range' KeyError should be fixed.")
        print("🎉 Medical report upload should now work without crashing!")
    else:
        print("\n❌ Tests failed. There are still issues that need to be fixed.")
