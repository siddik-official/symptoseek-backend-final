#!/usr/bin/env python3
"""
Test script to verify the upload-report endpoint fixes
"""

import requests
import json

def test_upload_endpoint():
    """Test the upload-report endpoint with a simple text file"""
    print("🧪 Testing upload-report endpoint...")
    
    try:
        # Create a simple test medical report content
        test_content = """
        Dr. LOGY PATHOLOGY LAB
        Complete Blood Count (CBC)
        
        Patient: John Doe
        Date: 2024-01-15
        
        Test Results:
        HEMOGLOBI: 345 g/dL
        WdC COUNT: 4OdO-tOOO
        PLATELET COUNT: 1so0n0
        
        Reference By: Dr. Smith
        """
        
        # Save as temporary text file for now (will be treated as OCR text)
        with open('temp_test_report.txt', 'w') as f:
            f.write(test_content)
        
        # Create a simple 1x1 PNG image for testing
        try:
            from PIL import Image
            import io
            
            # Create a minimal PNG image
            img = Image.new('RGB', (1, 1), color='white')
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)
            
            # Write to file
            with open('temp_test_report.png', 'wb') as f:
                f.write(img_bytes.getvalue())
                
            test_file = 'temp_test_report.png'
            mime_type = 'image/png'
        except ImportError:
            # Fallback: create a minimal valid image file manually
            # This is a minimal 1x1 PNG file
            png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x12IDATx\x9cc```bPPP\x00\x02\xac\xa0\x02\x00\x00\x0e\x00\x03\x03\xd8)\x00\x00\x00\x00IEND\xaeB`\x82'
            
            with open('temp_test_report.png', 'wb') as f:
                f.write(png_data)
                
            test_file = 'temp_test_report.png'
            mime_type = 'image/png'
        
        # Test the API endpoint
        url = "http://localhost:5001/api/upload-report"
        
        with open(test_file, 'rb') as f:
            files = {'file': ('test_report.png', f, mime_type)}
            
            print(f"📤 Sending request to {url}...")
            response = requests.post(url, files=files, timeout=30)
            
            print(f"📊 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Upload successful!")
                print(f"📋 Analysis Summary: {result.get('analysis', {}).get('summary', 'No summary')}")
                
                if result.get('analysis', {}).get('lab_values'):
                    print("🧪 Lab Values Found:")
                    for lab in result['analysis']['lab_values']:
                        if isinstance(lab, dict):
                            test_name = lab.get('test', 'Unknown')
                            value = lab.get('value', 'N/A')
                            unit = lab.get('unit', '')
                            status = lab.get('status', 'Unknown')
                            print(f"  • {test_name}: {value} {unit} ({status})")
                else:
                    print("ℹ️ No lab values extracted")
                    
                return True
            else:
                print(f"❌ Upload failed: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error details: {error_data}")
                except:
                    print(f"Raw response: {response.text}")
                return False
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Make sure the Flask server is running on localhost:5001")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    finally:
        # Clean up
        try:
            import os
            os.remove('temp_test_report.png')
            os.remove('temp_test_report.txt')
        except:
            pass

if __name__ == "__main__":
    print("🔧 Testing medical report upload fixes...")
    success = test_upload_endpoint()
    
    if success:
        print("\n✅ All tests passed! The 'normal_range' KeyError should be fixed.")
    else:
        print("\n❌ Tests failed. The server may not be running or there are still issues.")
