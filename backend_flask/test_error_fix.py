#!/usr/bin/env python3
"""
Test the error fix for medical report analysis
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_corrupted_ocr_text():
    """Test the enhanced OCR processing with your specific corrupted text"""
    
    # Import the functions after setting up the path
    try:
        from app import extract_lab_values_from_cbc, analyze_medical_text_enhanced
        print("✅ Successfully imported functions")
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False
    
    # Your actual corrupted OCR text
    corrupted_text = """
    Dr. LOGY PATHOLOGY LAB OI73456789 O7I2345678 Accurace Caring Instant 
    arlogypathlcoarlczycom 5HARI VI5 OYCCMRLEX #EALIHCARE Qotb OTOMTE AEAL 
    Incar COHEX MJUBAI 699575 dtouycoin Yash M. Patel Rcus 5ample Collected At: 
    I7' Iwnm Aunonio Rean Mumbii Requteled on O7 7I Puodr# CμLaled OX/IFMczoi" 
    Rtpeled O Dr. Hir en 5hah Complete Blood Count (CBC) Investiqation Re 5 Ult 
    Reference Value Unit Puunary 5aple Type HEMOGLOBIN HemcJ RBC cqunT ornaRkcuni 
    miucltm BLOOD INDICE5 Pocicd Volun e (PCV) carpuscu Ar Vollteuc Aae Hioh Vch 
    VCHC 345 WBC COUNT WOC counil 4OdO-tOOO CumtimI DIFFeRFHTI Mac CouhT 
    4cwarcJhi Lymdnocyias Loaingohile Yunts les Kasophil O.
    """
    
    print("\n🧪 Testing Enhanced Lab Value Extraction...")
    print("=" * 60)
    
    try:
        # Test lab value extraction
        lab_values = extract_lab_values_from_cbc(corrupted_text)
        print(f"✅ Lab value extraction completed successfully")
        print(f"📊 Found {len(lab_values)} lab values:")
        
        for i, lab in enumerate(lab_values, 1):
            if isinstance(lab, dict):
                test_name = lab.get('test', 'Unknown')
                value = lab.get('value', 'N/A')
                unit = lab.get('unit', '')
                status = lab.get('status', 'Unknown')
                print(f"   {i}. {test_name}: {value} {unit} ({status})")
            else:
                print(f"   {i}. Invalid lab value format: {lab}")
        
        # Test full analysis
        print(f"\n🔍 Testing Full Medical Text Analysis...")
        analysis = analyze_medical_text_enhanced(corrupted_text)
        print(f"✅ Full analysis completed successfully")
        
        print(f"\n📋 Analysis Summary:")
        print(f"   • Report Type: {analysis.get('report_type', 'Unknown')}")
        print(f"   • Lab Name: {analysis.get('lab_name', 'Unknown')}")
        print(f"   • Priority Level: {analysis.get('priority_level', 'Unknown')}")
        print(f"   • Lab Values Found: {len(analysis.get('lab_values', []))}")
        print(f"   • Medical Conditions: {len(analysis.get('detected_conditions', []))}")
        
        if analysis.get('lab_values'):
            print(f"\n🧪 Extracted Lab Values:")
            for lab in analysis['lab_values']:
                if isinstance(lab, dict):
                    print(f"   • {lab.get('test', 'Unknown')}: {lab.get('value', 'N/A')} {lab.get('unit', '')} ({lab.get('status', 'Unknown')})")
        
        print(f"\n✅ SUCCESS: Error fix is working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔧 Testing Medical Report Analysis Error Fix")
    print("=" * 60)
    
    success = test_corrupted_ocr_text()
    
    if success:
        print(f"\n🎉 All tests passed! The error has been fixed.")
        print(f"💡 Your medical report analysis should now work properly.")
    else:
        print(f"\n❌ Tests failed. The error still needs to be addressed.")
