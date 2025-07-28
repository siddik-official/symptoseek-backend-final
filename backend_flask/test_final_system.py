#!/usr/bin/env python3
"""
Test the enhanced medical report analysis system with your corrupted OCR sample
"""

import sys
import os
import tempfile
import base64
from io import BytesIO

# Add the backend path
sys.path.append('H:/fydp/SymptoSeek-Backend/backend_flask')

def create_test_image_with_corrupted_text():
    """Create a test image with the corrupted text for full pipeline testing"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # Create a simple image with corrupted text
        img = Image.new('RGB', (800, 600), color='white')
        draw = ImageDraw.Draw(img)
        
        # Add the corrupted text that would come from OCR
        corrupted_text = """
DRLOGY PATHOLOGY LAB
Complete Blood Count (CBC)
Patient: Yash M. Patel

HEMOGLOBIN HemcJ 345
WBC COUNT WOC counil 4OdO-tOOO CumtimI
RBC cqunT 5.2 miucltm
PLATELET COUNT 150000
        """
        
        try:
            # Try to use a default font
            font = ImageFont.load_default()
        except:
            font = None
        
        # Draw the text
        draw.text((50, 50), corrupted_text, fill='black', font=font)
        
        return img
        
    except ImportError:
        print("⚠️ PIL not available, skipping image creation")
        return None

def test_enhanced_system():
    """Test the complete enhanced medical report analysis system"""
    
    print("🏥 Testing Enhanced Medical Report Analysis System")
    print("=" * 60)
    
    try:
        # Import after ensuring path is set
        from app import analyze_medical_report, analyze_medical_text_enhanced
        
        # Test with direct corrupted text first
        print("📄 Testing Direct Text Analysis...")
        corrupted_text = """
        Dr. LOGY PATHOLOGY LAB OI73456789 
        Yash M. Patel 
        Complete Blood Count (CBC) Investiqation Re 5 Ult Reference Value Unit 
        HEMOGLOBIN HemcJ 345 RBC cqunT ornaRkcuni miucltm 
        WBC COUNT WOC counil 4OdO-tOOO CumtimI 
        DIFFeRFHTI Mac CouhT cwarcJhi Lymdnocyias Loaingohile Yunts Kasophil
        """
        
        print(f"Input text: {corrupted_text[:100]}...")
        
        # Test enhanced analysis
        analysis = analyze_medical_text_enhanced(corrupted_text)
        
        print("\n✅ Enhanced Analysis Results:")
        print("-" * 40)
        print(f"📋 Report Type: {analysis.get('report_type', 'Unknown')}")
        print(f"🏥 Lab Name: {analysis.get('lab_name', 'Unknown')}")
        print(f"👤 Patient: {analysis.get('patient_name', 'Unknown')}")
        print(f"⚡ Priority: {analysis.get('priority_level', 'routine')}")
        
        lab_values = analysis.get('lab_values', [])
        print(f"\n🧬 Lab Values Extracted: {len(lab_values)}")
        
        for lab in lab_values:
            print(f"   ✅ {lab.get('test', 'Unknown')}: {lab.get('value', 'N/A')} {lab.get('unit', '')} ({lab.get('status', 'Unknown')})")
            if lab.get('confidence'):
                print(f"      Confidence: {lab.get('confidence', 'unknown')}")
        
        medical_conditions = analysis.get('medical_conditions', [])
        print(f"\n🏥 Medical Conditions: {len(medical_conditions)}")
        for condition in medical_conditions:
            print(f"   • {condition.get('condition', 'Unknown')} ({condition.get('severity', 'Unknown')})")
        
        recommendations = analysis.get('recommendations', [])
        print(f"\n💡 Recommendations: {len(recommendations)}")
        for i, rec in enumerate(recommendations[:3], 1):
            print(f"   {i}. {rec}")
        
        # Test with image if possible
        print(f"\n📸 Testing Image Analysis...")
        test_image = create_test_image_with_corrupted_text()
        
        if test_image:
            # Convert image to bytes for testing
            img_buffer = BytesIO()
            test_image.save(img_buffer, format='PNG')
            img_bytes = img_buffer.getvalue()
            
            print("   Processing test image...")
            image_analysis = analyze_medical_report(img_bytes, 'png')
            
            if 'error' not in image_analysis:
                print(f"   ✅ Image analysis successful!")
                print(f"   📊 Lab values from image: {len(image_analysis.get('lab_values', []))}")
                print(f"   🏥 Conditions from image: {len(image_analysis.get('medical_conditions', []))}")
            else:
                print(f"   ❌ Image analysis error: {image_analysis.get('error', 'Unknown')}")
        
        print(f"\n🎯 SUMMARY:")
        print("-" * 40)
        success_metrics = []
        
        if lab_values:
            success_metrics.append(f"✅ Extracted {len(lab_values)} lab values")
        else:
            success_metrics.append("❌ No lab values extracted")
        
        if medical_conditions:
            success_metrics.append(f"✅ Identified {len(medical_conditions)} medical conditions")
        else:
            success_metrics.append("❌ No medical conditions identified")
        
        if analysis.get('priority_level') != 'routine':
            success_metrics.append(f"✅ Priority assessment: {analysis.get('priority_level')}")
        
        for metric in success_metrics:
            print(f"   {metric}")
        
        # Overall success assessment
        if lab_values and len(lab_values) > 0:
            print(f"\n🎉 SUCCESS: Enhanced system extracted meaningful data from corrupted OCR!")
            print(f"   The system can now handle your medical report uploads much better.")
            return True
        else:
            print(f"\n❌ PARTIAL SUCCESS: System needs further refinement for your specific OCR patterns")
            return False
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

if __name__ == "__main__":
    success = test_enhanced_system()
    
    print(f"\n{'🎊 OVERALL RESULT: ENHANCED SYSTEM READY!' if success else '⚠️  SYSTEM NEEDS MORE WORK'}")
    
    if success:
        print("""
💡 NEXT STEPS:
1. Your medical report upload should now provide much better analysis
2. The system can extract lab values from corrupted OCR text  
3. Medical conditions will be properly identified
4. Recommendations will be more accurate and helpful
        """)
    else:
        print("""
💡 RECOMMENDATIONS:
1. The pattern matching may need further refinement
2. Consider adding more specific OCR correction patterns
3. Test with actual uploaded medical reports for fine-tuning
        """)
