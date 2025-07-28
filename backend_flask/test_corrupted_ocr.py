#!/usr/bin/env python3
"""
Test script for enhanced OCR processing with heavily corrupted medical text
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from app import clean_and_normalize_ocr_text, extract_lab_values_from_cbc, analyze_medical_text_enhanced

def test_corrupted_ocr():
    """Test the enhanced OCR processing with your actual corrupted text"""
    
    print("🧪 Testing Enhanced OCR Processing with Corrupted Medical Text")
    print("=" * 70)
    
    # Your actual corrupted OCR text
    corrupted_text = """
    Dr. LOGY PATHOLOGY LAB OI73456789 O7I2345678 Accurace Caring Instant arlogypathlcoarlczycom 
    5HARI VI5 OYCCMRLEX #EALIHCARE Qotb OTOMTE AEAL Incar COHEX MJUBAI 699575 dtouycoin 
    Yash M. Patel Rcus 5ample Collected At: I7' Iwnm Aunonio Rean Mumbii Requteled on O7 7I 
    Puodr# CμLaled OX/IFMczoi" Rtpeled O Dr. Hir en 5hah Complete Blood Count (CBC) 
    Investiqation Re 5 Ult Reference Value Unit Puunary 5aple Type HEMOGLOBIN HemcJ RBC cqunT 
    ornaRkcuni miucltm BLOOD INDICE5 Pocicd Volun e (PCV) carpuscu Ar Vollteuc Aae Hioh Vch VCHC 
    345 WBC COUNT WOC counil 4OdO-tOOO CumtimI DIFFeRFHTI Mac CouhT 4cwarcJhi Lymdnocyias 
    Loaingohile Yunts les Kasophil O.
    """
    
    print("📄 Original Corrupted Text:")
    print("-" * 50)
    print(corrupted_text[:200] + "...")
    print()
    
    # Step 1: Clean and normalize
    print("🔧 Step 1: Cleaning and Normalizing OCR Text...")
    cleaned_text = clean_and_normalize_ocr_text(corrupted_text)
    print("✅ Cleaned Text:")
    print("-" * 50)
    print(cleaned_text[:300] + "...")
    print()
    
    # Step 2: Extract lab values
    print("🧬 Step 2: Extracting Lab Values...")
    lab_values = extract_lab_values_from_cbc(cleaned_text)
    
    print(f"✅ Found {len(lab_values)} Lab Values:")
    print("-" * 50)
    
    if lab_values:
        for lab in lab_values:
            print(f"🔹 {lab['test']}: {lab['value']} {lab['unit']} ({lab['status']})")
            print(f"   Reference Range: {lab['reference_range']}")
            print(f"   Confidence: {lab['confidence']}")
            print(f"   Context: {lab.get('context', 'N/A')}")
            print()
    else:
        print("❌ No lab values extracted")
    
    # Step 3: Full enhanced analysis
    print("🤖 Step 3: Full Enhanced Medical Analysis...")
    analysis = analyze_medical_text_enhanced(cleaned_text)
    
    print("✅ Enhanced Analysis Results:")
    print("-" * 50)
    print(f"📋 Report Type: {analysis.get('report_type', 'Unknown')}")
    print(f"🏥 Lab Name: {analysis.get('lab_name', 'Unknown')}")
    print(f"👨‍⚕️ Doctor: {analysis.get('doctor_name', 'Unknown')}")
    print(f"👤 Patient: {analysis.get('patient_name', 'Unknown')}")
    print(f"📅 Date: {analysis.get('report_date', 'Unknown')}")
    print(f"⚡ Priority: {analysis.get('priority_level', 'routine')}")
    print()
    
    if analysis.get('lab_values'):
        print(f"📊 Lab Values Found: {len(analysis['lab_values'])}")
        for lab in analysis['lab_values']:
            print(f"   • {lab.get('test', 'Unknown')}: {lab.get('value', 'N/A')} {lab.get('unit', '')}")
    
    if analysis.get('medical_conditions'):
        print(f"🏥 Medical Conditions: {len(analysis['medical_conditions'])}")
        for condition in analysis['medical_conditions']:
            print(f"   • {condition.get('condition', 'Unknown')}")
    
    if analysis.get('recommendations'):
        print(f"💡 Recommendations: {len(analysis['recommendations'])}")
        for rec in analysis['recommendations'][:3]:
            print(f"   • {rec}")
    
    print()
    print("🎯 Summary:")
    print("-" * 50)
    print(f"✅ Successfully extracted {len(lab_values)} lab values from heavily corrupted text")
    print(f"✅ Enhanced analysis provided {len(analysis.get('recommendations', []))} recommendations")
    print(f"✅ Priority level assessed as: {analysis.get('priority_level', 'routine')}")
    
    if lab_values:
        print("\n🎉 SUCCESS: Enhanced OCR processing significantly improved extraction!")
        return True
    else:
        print("\n❌ NEEDS IMPROVEMENT: No lab values extracted from corrupted text")
        return False

if __name__ == "__main__":
    test_corrupted_ocr()
