import re
import json
import os
from PIL import Image, ImageFilter
import pytesseract

os.chdir(os.path.dirname(__file__))

def extract_pii(text):
    aadhar_pattern = r"\b\d{4}[- ]?\d{4}[- ]?\d{4}\b"
    pan_pattern = r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"
    name_pattern = r"(?:my name is|I am|I'm)\s+([A-Za-z ]+)"

    aadhar_match = re.search(aadhar_pattern, text)
    aadhar_number = aadhar_match.group(0) if aadhar_match else None

    pan_match = re.search(pan_pattern, text)
    pan_number = pan_match.group(0) if pan_match else None

    name_match = re.search(name_pattern, text, re.IGNORECASE)
    user_name = name_match.group(1).strip() if name_match else None

    other_pii = {"field1": None, "field2": None}

    result = {"user_name": user_name, "aadhar_number": aadhar_number, "pan_number": pan_number, "other_pii": other_pii}
    return result

data_dir = os.path.join(os.path.dirname(__file__), 'AADHAAR-CARD-DETAILS.v1i.tensorflow', 'train')
image_extensions = {'.jpg', '.jpeg', '.png'}

def process_dataset_images():
    results = {}
    image_files = [f for f in os.listdir(data_dir) if os.path.splitext(f)[1].lower() in image_extensions]
    total = len(image_files)
    for idx, filename in enumerate(image_files, start=1):
        image_path = os.path.join(data_dir, filename)
        try:
            img = Image.open(image_path)
            text = pytesseract.image_to_string(img)
            pii = extract_pii(text)
            if not any([pii['aadhar_number'], pii['pan_number'], pii['user_name']]):
                bw = img.convert('L').point(lambda x: 0 if x < 128 else 255, '1')
                pii_bw = extract_pii(pytesseract.image_to_string(bw))
                if any([pii_bw['aadhar_number'], pii_bw['pan_number'], pii_bw['user_name']]):
                    pii = pii_bw
            if not any([pii['aadhar_number'], pii['pan_number'], pii['user_name']]):
                base_img = bw if 'bw' in locals() else img
                enhanced = base_img.resize((base_img.width*2, base_img.height*2), Image.LANCZOS)
                enhanced = enhanced.filter(ImageFilter.SHARPEN)
                pii_enh = extract_pii(pytesseract.image_to_string(enhanced))
                if any([pii_enh['aadhar_number'], pii_enh['pan_number'], pii_enh['user_name']]):
                    pii = pii_enh
            results[filename] = pii
            if idx % 100 == 0 or idx == total:
                print(f"Processed {idx}/{total} images")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
    output_path = os.path.join(os.path.dirname(__file__), 'dataset_pii_results.json')
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=4)
        print(f"Dataset PII results saved to {output_path}")
    except Exception as e:
        print(f"Error writing results file: {e}")
    return results

if __name__ == "__main__":
    process_dataset_images()
