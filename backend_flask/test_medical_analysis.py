"""
Test script for enhanced medical report analysis
This demonstrates the improved OCR text processing and medical data extraction
"""

import json
import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the app and analysis functions
from app import analyze_medical_text_enhanced, clean_and_normalize_ocr_text, extract_lab_values_from_cbc

def test_medical_analysis():
    """Test the enhanced medical analysis with sample OCR text"""
    
    # Sample OCR text that was producing garbled output
    sample_ocr_text = """
    DRLOGY PATHOLOGY LAB
    9824223334
    HEMOGLOBI
    Reference By: Dr. HIREN SHAH
    yash m. patel
    age: 35
    sample collected at: 07 71
    HEMOGLOBIN: 11.2 g/dl
    WBC COUNT: 6.8 × 10³/μl  
    RBC COUNT: 4.1 × 10⁶/μl
    PLATELET COUNT: 180 × 10³/μl
    HCT: 33.5%
    MCH: 27.3 pg
    MCHC: 31.2 g/dl
    MCV: 81.5 fl
    """
    
    print("🧪 Testing Enhanced Medical Report Analysis")
    print("=" * 60)
    
    print("\n📄 Original OCR Text:")
    print(sample_ocr_text)
    
    print("\n🔧 Step 1: Cleaning and normalizing OCR text...")
    cleaned_text = clean_and_normalize_ocr_text(sample_ocr_text)
    print("✅ Cleaned text:", repr(cleaned_text[:100]) + "...")
    
    print("\n🔬 Step 2: Extracting lab values...")
    lab_values = extract_lab_values_from_cbc(cleaned_text)
    print(f"✅ Extracted {len(lab_values)} lab values:")
    for value in lab_values:
        status_icon = "🔴" if value['status'] == 'Low' else "🟡" if value['status'] == 'Borderline' else "🟢" if value['status'] == 'Normal' else "🔥"
        print(f"   {status_icon} {value['test']}: {value['value']} {value['unit']} ({value['status']})")
    
    print("\n🤖 Step 3: Complete enhanced analysis...")
    analysis_result = analyze_medical_text_enhanced(sample_ocr_text)
    
    print("\n📊 ANALYSIS RESULTS:")
    print("=" * 60)
    
    print(f"🏥 Lab Name: {analysis_result['lab_name']}")
    print(f"👨‍⚕️ Doctor: {analysis_result['doctor_name']}")
    print(f"👤 Patient: {analysis_result['patient_name']}")
    print(f"📅 Date: {analysis_result['report_date']}")
    print(f"🩺 Report Type: {analysis_result['report_type']}")
    print(f"⚠️ Priority: {analysis_result['priority_level'].upper()}")
    
    print(f"\n🔬 Lab Values ({len(analysis_result['lab_values'])} total):")
    for value in analysis_result['lab_values']:
        status_icon = "🔴" if value['status'] == 'Low' else "🟡" if value['status'] == 'Borderline' else "🟢" if value['status'] == 'Normal' else "🔥"
        print(f"   {status_icon} {value['test']}: {value['value']} {value['unit']} ({value['status']})")
        if value.get('reference_range'):
            print(f"      📏 Normal range: {value['reference_range']}")
    
    print(f"\n🩺 Medical Conditions ({len(analysis_result['medical_conditions'])} identified):")
    for condition in analysis_result['medical_conditions']:
        print(f"   🔍 {condition['condition']} - {condition['severity']}")
        print(f"      📝 {condition['description']}")
        print("      💡 Recommendations:")
        for rec in condition['recommendations']:
            print(f"         • {rec}")
        print()
    
    print("📋 General Recommendations:")
    for rec in analysis_result['recommendations']:
        print(f"   • {rec}")
    
    print(f"\n🤖 AI Summary:")
    print(f"   {analysis_result['ai_summary']}")
    
    print(f"\n📄 Detailed Analysis:")
    print(analysis_result['detailed_analysis'])
    
    # Test with garbled OCR text to show improvement
    print("\n" + "=" * 60)
    print("🔍 TESTING WITH GARBLED OCR TEXT")
    print("=" * 60)
    
    garbled_text = """
    DRLOGY PATH0L0GY LAB
    982422334
    HEHOGLOBI
    Reference By: Dr. HIREM SHAH
    yash m. pateI
    HEHOGLOBI: 11.2 g/dl
    WBC C0UNT: 6.8 × 10³/μl  
    RBC C0UNT: 4.1 × 10⁶/μl
    PLATELET C0UNT: 180 × 10³/μl
    """
    
    print("📄 Garbled OCR Text:")
    print(garbled_text)
    
    print("\n🔧 Testing fuzzy matching and correction...")
    garbled_analysis = analyze_medical_text_enhanced(garbled_text)
    
    print(f"\n📊 RESULTS WITH GARBLED TEXT:")
    print(f"🏥 Lab Name: {garbled_analysis['lab_name']}")
    print(f"👨‍⚕️ Doctor: {garbled_analysis['doctor_name']}")
    print(f"👤 Patient: {garbled_analysis['patient_name']}")
    
    print(f"\n🔬 Lab Values Extracted from Garbled Text:")
    for value in garbled_analysis['lab_values']:
        status_icon = "🔴" if value['status'] == 'Low' else "🟡" if value['status'] == 'Borderline' else "🟢" if value['status'] == 'Normal' else "🔥"
        print(f"   {status_icon} {value['test']}: {value['value']} {value['unit']} ({value['status']})")
    
    print("\n✅ Enhanced Analysis Complete!")
    print("🎯 Key Improvements:")
    print("   • Fuzzy matching for OCR errors (HEHOGLOBI → HEMOGLOBIN)")
    print("   • Multiple extraction patterns for robust data capture")
    print("   • Medical condition assessment based on lab values")
    print("   • Comprehensive recommendations and priority levels")
    print("   • Age warnings for old reports")
    print("   • Detailed clinical explanations")

if __name__ == "__main__":
    test_medical_analysis()
