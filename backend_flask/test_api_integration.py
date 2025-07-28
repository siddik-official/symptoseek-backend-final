"""
API Test Script for SymptoSeek Medical Report Upload
This demonstrates how to use the image processing features through the Flask API
"""

import requests
import json
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import tempfile
import os

def create_sample_medical_report():
    """Create a sample medical report image for testing"""
    # Create a white image
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fall back to default if not available
    try:
        font_large = ImageFont.truetype("arial.ttf", 24)
        font_medium = ImageFont.truetype("arial.ttf", 18)
        font_small = ImageFont.truetype("arial.ttf", 14)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Draw the medical report content
    y_position = 30
    
    # Header
    draw.text((50, y_position), "DRLOGY PATHOLOGY LAB", fill='black', font=font_large)
    y_position += 40
    draw.text((50, y_position), "Phone: 9824223334", fill='black', font=font_small)
    y_position += 50
    
    # Patient Info
    draw.text((50, y_position), "Reference By: Dr. HIREN SHAH", fill='black', font=font_medium)
    y_position += 30
    draw.text((50, y_position), "Patient: Yash M. Patel", fill='black', font=font_medium)
    y_position += 25
    draw.text((50, y_position), "Age: 35 years", fill='black', font=font_small)
    y_position += 25
    draw.text((50, y_position), "Sample Collected: 07/07/2024", fill='black', font=font_small)
    y_position += 50
    
    # Lab Results Header
    draw.text((50, y_position), "COMPLETE BLOOD COUNT (CBC)", fill='black', font=font_medium)
    y_position += 40
    
    # Results table
    results = [
        ("HEMOGLOBIN:", "11.2 g/dl", "Normal: 12.0-16.0"),
        ("WBC COUNT:", "6.8 × 10³/μl", "Normal: 4.0-11.0"),
        ("RBC COUNT:", "4.1 × 10⁶/μl", "Normal: 4.2-5.4"),
        ("PLATELET COUNT:", "180 × 10³/μl", "Normal: 150-450"),
        ("HCT:", "33.5%", "Normal: 36.0-46.0"),
        ("MCH:", "27.3 pg", "Normal: 27.0-32.0"),
        ("MCHC:", "31.2 g/dl", "Normal: 32.0-36.0"),
        ("MCV:", "81.5 fl", "Normal: 80.0-100.0")
    ]
    
    for test, value, normal in results:
        draw.text((50, y_position), test, fill='black', font=font_small)
        draw.text((200, y_position), value, fill='black', font=font_small)
        draw.text((320, y_position), normal, fill='gray', font=font_small)
        y_position += 25
    
    # Footer
    y_position += 30
    draw.text((50, y_position), "Report generated on: 07/07/2024", fill='gray', font=font_small)
    y_position += 20
    draw.text((50, y_position), "Reviewed by: Dr. Medical Pathologist", fill='gray', font=font_small)
    
    return img

def test_flask_api():
    """Test the Flask API for medical report analysis"""
    print("🧪 Testing SymptoSeek Flask API - Medical Report Upload")
    print("=" * 70)
    
    # API endpoint (adjust if your Flask app runs on a different port)
    api_url = "http://localhost:5001/api/upload-report"
    
    print("\n📄 Step 1: Creating sample medical report image...")
    report_image = create_sample_medical_report()
    
    # Save to temporary file
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
        report_image.save(temp_file.name, 'PNG')
        temp_filename = temp_file.name
    
    print(f"✅ Sample report created: {temp_filename}")
    
    print("\n🔄 Step 2: Uploading to Flask API...")
    
    try:
        # Prepare the file for upload
        with open(temp_filename, 'rb') as f:
            files = {'file': ('medical_report.png', f, 'image/png')}
            
            # Make the API request
            response = requests.post(api_url, files=files, timeout=30)
        
        print(f"📡 API Response Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Upload successful!")
            
            # Parse the response
            try:
                result = response.json()
                print("\n📊 API RESPONSE ANALYSIS:")
                print("=" * 50)
                
                if 'bot_response_parts' in result:
                    for i, part in enumerate(result['bot_response_parts'], 1):
                        print(f"\n🔍 Response Part {i}:")
                        print(f"Type: {part.get('type', 'text')}")
                        if part.get('content'):
                            content = part['content']
                            if isinstance(content, str):
                                print(f"Content: {content[:200]}...")
                            else:
                                print(f"Content: {type(content)} with {len(content) if hasattr(content, '__len__') else 'N/A'} items")
                
                if 'analysis' in result:
                    analysis = result['analysis']
                    print(f"\n🏥 Lab Analysis Results:")
                    print(f"   Summary: {analysis.get('summary', 'N/A')}")
                    print(f"   Urgency: {analysis.get('urgency', 'N/A')}")
                    print(f"   Lab Values: {len(analysis.get('lab_values', []))} detected")
                    print(f"   Conditions: {len(analysis.get('detected_conditions', []))} identified")
                
                print(f"\n📦 Full Response Size: {len(str(result))} characters")
                
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse JSON response: {e}")
                print(f"Raw response: {response.text[:500]}...")
        
        elif response.status_code == 404:
            print("❌ API endpoint not found. Is the Flask server running on port 5001?")
            print("💡 Make sure to start the Flask backend with: python app.py")
        
        else:
            print(f"❌ API request failed with status {response.status_code}")
            print(f"Response: {response.text[:300]}...")
    
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Is the Flask server running?")
        print("💡 Start the Flask backend with: python app.py")
        print("💡 Make sure it's running on http://localhost:5001")
    
    except requests.exceptions.Timeout:
        print("❌ Request timed out. The server might be processing...")
    
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    finally:
        # Clean up temp file
        try:
            os.unlink(temp_filename)
            print(f"\n🧹 Cleaned up temporary file: {temp_filename}")
        except:
            pass

def test_chat_api():
    """Test the chat API for symptom analysis"""
    print("\n" + "=" * 70)
    print("🤖 Testing SymptoSeek Chat API - Symptom Analysis")
    print("=" * 70)
    
    chat_url = "http://localhost:5001/api/chat"
    
    # Test data
    test_messages = [
        "Hello, I need help with my symptoms",
        "I have a headache and feel nauseous",
        "My head hurts for 2 days and I feel dizzy",
        "that's all, please analyze"
    ]
    
    chat_id = "test_chat_123"
    user_id = "test_user_456"
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n💬 Step {i}: Sending message: '{message}'")
        
        try:
            payload = {
                "message": message,
                "chat_id": chat_id,
                "user_id": user_id,
                "latitude": 23.8103,  # Dhaka coordinates
                "longitude": 90.4125
            }
            
            response = requests.post(chat_url, json=payload, timeout=30)
            
            print(f"📡 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                
                if 'bot_response_parts' in result:
                    for part in result['bot_response_parts']:
                        if part.get('type') == 'text':
                            content = part.get('content', '')
                            print(f"🤖 Bot: {content[:150]}...")
                        elif part.get('type') == 'doctors':
                            doctors = part.get('content', [])
                            print(f"👨‍⚕️ Doctors found: {len(doctors)}")
                        elif part.get('type') == 'map':
                            map_data = part.get('content', {})
                            print(f"🗺️ Map data: {len(map_data.get('doctors', []))} locations")
            else:
                print(f"❌ Chat API failed: {response.text[:200]}...")
        
        except Exception as e:
            print(f"❌ Chat API error: {e}")
            break

def main():
    """Main test function"""
    print("🚀 SymptoSeek API Integration Test Suite")
    print("=" * 70)
    print("This script tests the image processing and chat APIs")
    print("Make sure your Flask backend is running on http://localhost:5001")
    print("=" * 70)
    
    # Test the medical report upload API
    test_flask_api()
    
    # Test the chat API
    test_chat_api()
    
    print("\n✅ Test Suite Complete!")
    print("\n🎯 Key Features Demonstrated:")
    print("   • Medical report image processing and OCR")
    print("   • Lab value extraction and analysis")
    print("   • Medical condition identification")
    print("   • Symptom analysis and diagnosis")
    print("   • Doctor recommendations with location")
    print("   • Comprehensive health insights")

if __name__ == "__main__":
    main()
