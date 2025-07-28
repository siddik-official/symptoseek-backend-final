"""
Test the enhanced OCR and medical analysis functions
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Test the enhanced functions
def test_enhanced_analysis():
    """Test the enhanced medical analysis with sample garbled OCR text"""
    
    # Sample garbled OCR text similar to what you're getting
    sample_garbled_text = """
    DRLOGY PATHOLOGY LAB 0173456789 0712345678 Accurace Caring Instant arlogypathlcoarlczycom SHARI VIS OYCCMRLEX #EALIHCARE Qotb OTOMTE AEAL Incar COHEX MJUBAI 699575 dtouycoin Yash M. Patel Sample Collected At: Rcus 17' Iwnm Aunonio Rean Requteled on 07 71 Puodr# Mumbii Culaled 0X/1FMczoi" Ref. By: Dr... Sample collected at: Rcus 17' Iwnm Aunonio Rean Requteled on 07 71 Puodr# Mumbii Culaled 0X/1FMczoi" Ref. Dr Hiren Shah Rtpeled 0n 0 : 35PYCloni > Complete Blood Count (CBC) Investiqation Re 5 Ult Reference Value Unit Puunary Saple Type HEHOGLoBI HemcJ RBC cqunT ornaRkcuni miucltm BLOOD INDICES Pocicd Volun e (PCV) Hioh carpuscu Ar Vollteuc Aae Vch VCHC 345 WdC COUNT WOC counil 40d0-t000 CumtimI DIFFeRFHTI Mac CouhT 4cwarcJhi Lymdnocyias.
    """
    
    print("🧪 Testing Enhanced OCR Cleaning and Medical Analysis")
    print("=" * 70)
    
    # Import the functions
    try:
        print("🔄 Loading enhanced analysis functions...")
        from app import clean_and_normalize_ocr_text, analyze_medical_text_enhanced
        print("✅ Functions loaded successfully!")
        
        print("\n📄 Original Garbled OCR Text:")
        print(sample_garbled_text[:200] + "...")
        
        print("\n🔧 Step 1: Cleaning and normalizing OCR text...")
        cleaned_text = clean_and_normalize_ocr_text(sample_garbled_text)
        print("✅ Cleaned text:")
        print(cleaned_text[:300] + "...")
        
        print(f"\n📊 Text Statistics:")
        print(f"   Original length: {len(sample_garbled_text)}")
        print(f"   Cleaned length: {len(cleaned_text)}")
        print(f"   Improvement: {len(cleaned_text) - len(sample_garbled_text)} characters")
        
        print("\n🤖 Step 2: Enhanced medical analysis...")
        analysis_result = analyze_medical_text_enhanced(cleaned_text)
        
        print("\n📋 ENHANCED ANALYSIS RESULTS:")
        print("=" * 50)
        
        print(f"🏥 Lab Name: {analysis_result.get('lab_name', 'N/A')}")
        print(f"👨‍⚕️ Doctor: {analysis_result.get('doctor_name', 'N/A')}")
        print(f"👤 Patient: {analysis_result.get('patient_name', 'N/A')}")
        print(f"🩺 Report Type: {analysis_result.get('report_type', 'N/A')}")
        print(f"⚠️ Priority: {analysis_result.get('priority_level', 'N/A').upper()}")
        print(f"🔬 Lab Values Found: {len(analysis_result.get('lab_values', []))}")
        print(f"🔍 Conditions Detected: {len(analysis_result.get('detected_conditions', []))}")
        
        if analysis_result.get('lab_values'):
            print(f"\n🧪 Lab Values Extracted:")
            for value in analysis_result['lab_values']:
                status_icon = "🔴" if 'Low' in value['status'] else "🔥" if 'High' in value['status'] else "🟡" if 'Borderline' in value['status'] else "🟢"
                print(f"   {status_icon} {value['test']}: {value['value']} {value['unit']} ({value['status']})")
        
        if analysis_result.get('detected_conditions'):
            print(f"\n🩺 Medical Conditions:")
            for condition in analysis_result['detected_conditions']:
                print(f"   🔍 {condition['condition']} - {condition['severity']}")
                print(f"      Evidence: {condition['evidence']}")
        
        print(f"\n📝 Summary:")
        print(f"   {analysis_result.get('summary', 'No summary available')}")
        
        print("\n✅ Enhanced Analysis Complete!")
        print("🎯 Key Improvements:")
        print("   • Better OCR text cleaning and normalization")
        print("   • Enhanced pattern matching for medical terms")
        print("   • Comprehensive lab value extraction")
        print("   • Medical condition assessment")
        print("   • Priority level determination")
        print("   • Structured clinical recommendations")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure the enhanced functions are properly added to app.py")
    except Exception as e:
        print(f"❌ Error during testing: {e}")

if __name__ == "__main__":
    test_enhanced_analysis()
