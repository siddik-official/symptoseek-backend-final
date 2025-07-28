"""
Test with realistic medical report data to show the improvements
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_with_realistic_data():
    """Test with realistic medical report text that includes lab values"""
    
    # More realistic medical report text with common OCR errors
    realistic_medical_text = """
    DRLOGY PATHOLOGY LAB
    Phone: 0173456789, 0712345678
    
    Patient: Yash M. Patel
    Age: 35 years
    Sample Collected At: 07/07/2024
    Reference By: Dr. Hiren Shah
    
    COMPLETE BLOOD COUNT (CBC)
    
    Test                    Result    Reference Range    Unit
    -------------------------------------------------------
    HEMOGLOBIN:            11.2      12.0-16.0          g/dL
    WBC COUNT:             6.8       4.0-11.0           ×10³/μL
    RBC COUNT:             4.1       4.2-5.4            ×10⁶/μL  
    PLATELET COUNT:        180       150-450            ×10³/μL
    HEMATOCRIT:            33.5      36.0-46.0          %
    MCH:                   27.3      27.0-32.0          pg
    MCHC:                  31.2      32.0-36.0          g/dL
    MCV:                   81.5      80.0-100.0         fL
    
    Report Generated: 07/07/2024
    Reviewed by: Dr. Hiren Shah, MD
    """
    
    # Version with OCR errors (like what might actually be extracted)
    ocr_garbled_text = """
    DRLOGY PATH0L0GY LAB
    Phone: OI73456789, O7I2345678
    
    Patient: Yash M. PateI
    Age: 35 years
    Sample Collected At: O7/O7/2O24
    Reference By: Dr. HireN Shah
    
    C0MPLETE BL00D C0UNT (CBC)
    
    Test                    ResuIt    Reference Range    Unit
    -------------------------------------------------------
    HEHOGLOBIN:            II.2      I2.O-I6.O          g/dL
    WBC C0UNT:             6.8       4.O-II.O           ×IO³/μL
    RBC C0UNT:             4.I       4.2-5.4            ×IO⁶/μL  
    PLATELET C0UNT:        I8O       I5O-45O            ×IO³/μL
    HEMATOCRIT:            33.5      36.O-46.O          %
    MCH:                   27.3      27.O-32.O          pg
    MCHC:                  3I.2      32.O-36.O          g/dL
    MCV:                   8I.5      8O.O-IOO.O         fL
    
    Report Generated: O7/O7/2O24
    Reviewed by: Dr. HireN Shah, MD
    """
    
    print("🧪 Testing Enhanced Medical Analysis with Realistic Data")
    print("=" * 70)
    
    try:
        print("🔄 Loading enhanced analysis functions...")
        from app import clean_and_normalize_ocr_text, analyze_medical_text_enhanced
        print("✅ Functions loaded successfully!")
        
        # Test 1: Perfect text
        print("\n" + "="*50)
        print("📋 TEST 1: Clean Medical Report")
        print("="*50)
        
        result1 = analyze_medical_text_enhanced(realistic_medical_text)
        
        print(f"🏥 Lab Name: {result1.get('lab_name', 'N/A')}")
        print(f"👨‍⚕️ Doctor: {result1.get('doctor_name', 'N/A')}")
        print(f"👤 Patient: {result1.get('patient_name', 'N/A')}")
        print(f"🩺 Report Type: {result1.get('report_type', 'N/A')}")
        print(f"⚠️ Priority: {result1.get('priority_level', 'N/A').upper()}")
        
        if result1.get('lab_values'):
            print(f"\n🧪 Lab Values Extracted ({len(result1['lab_values'])}):")
            for value in result1['lab_values']:
                status_icon = "🔴" if 'Low' in value['status'] else "🔥" if 'High' in value['status'] else "🟡" if 'Borderline' in value['status'] else "🟢"
                print(f"   {status_icon} {value['test']}: {value['value']} {value['unit']} ({value['status']})")
        
        # Test 2: OCR errors
        print("\n" + "="*50)
        print("📋 TEST 2: OCR Garbled Text (Before Cleaning)")
        print("="*50)
        
        print("📄 Garbled OCR Text Sample:")
        print(ocr_garbled_text[:200] + "...")
        
        print("\n🔧 Cleaning OCR text...")
        cleaned_text = clean_and_normalize_ocr_text(ocr_garbled_text)
        
        print("✅ After cleaning:")
        print(cleaned_text[:300] + "...")
        
        print("\n🤖 Analyzing cleaned text...")
        result2 = analyze_medical_text_enhanced(cleaned_text)
        
        print(f"\n📊 RESULTS AFTER OCR CLEANING:")
        print(f"🏥 Lab Name: {result2.get('lab_name', 'N/A')}")
        print(f"👨‍⚕️ Doctor: {result2.get('doctor_name', 'N/A')}")
        print(f"👤 Patient: {result2.get('patient_name', 'N/A')}")
        print(f"🩺 Report Type: {result2.get('report_type', 'N/A')}")
        print(f"⚠️ Priority: {result2.get('priority_level', 'N/A').upper()}")
        
        if result2.get('lab_values'):
            print(f"\n🧪 Lab Values Extracted ({len(result2['lab_values'])}):")
            for value in result2['lab_values']:
                status_icon = "🔴" if 'Low' in value['status'] else "🔥" if 'High' in value['status'] else "🟡" if 'Borderline' in value['status'] else "🟢"
                print(f"   {status_icon} {value['test']}: {value['value']} {value['unit']} ({value['status']})")
        
        if result2.get('detected_conditions'):
            print(f"\n🩺 Medical Conditions Detected:")
            for condition in result2['detected_conditions']:
                print(f"   🔍 {condition['condition']} - {condition['severity']}")
                print(f"      Evidence: {condition['evidence']}")
        
        print(f"\n📝 Summary: {result2.get('summary', 'No summary')}")
        
        # Comparison
        print("\n" + "="*50)
        print("📊 COMPARISON RESULTS")
        print("="*50)
        
        print(f"Clean Text Lab Values: {len(result1.get('lab_values', []))}")
        print(f"OCR Cleaned Lab Values: {len(result2.get('lab_values', []))}")
        print(f"Improvement: {'✅ Same extraction capability' if len(result1.get('lab_values', [])) == len(result2.get('lab_values', [])) else '⚠️ Some data lost due to OCR errors'}")
        
        print("\n✅ Enhanced Analysis Complete!")
        print("🎯 Key Features Demonstrated:")
        print("   • OCR error correction and normalization")
        print("   • Robust pattern matching for medical terms")
        print("   • Comprehensive lab value extraction with status")
        print("   • Medical condition assessment based on values")
        print("   • Priority level determination")
        print("   • Structured clinical information extraction")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_with_realistic_data()
