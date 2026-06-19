import os
import glob
import pandas as pd

dataset_dir = r"c:\Users\paras\OneDrive\Desktop\KSP\KSP\Dataset"
csv_files = glob.glob(os.path.join(dataset_dir, "*.csv"))

bad_files = []

for f in csv_files:
    # 1. Fix missing newline
    with open(f, 'ab+') as file:
        file.seek(-1, os.SEEK_END)
        if file.read(1) != b'\n':
            file.write(b'\n')
    
    # 2. Parse and Validate
    try:
        df = pd.read_csv(f, dtype=str)
        changed = False
        
        # 3. Redact PII (Phone numbers)
        for col in df.columns:
            if df[col].dtype == object:
                # Match +91 9999999999 format
                mask = df[col].str.contains(r'\+?91\s*\d{10}', na=False)
                if mask.any():
                    df.loc[mask, col] = df.loc[mask, col].str.replace(r'\+?91\s*\d{10}', 'REDACTED_PHONE', regex=True)
                    changed = True
                
                # Match plain 10-digit numbers if the column is phone related
                if 'phone' in str(col).lower() or 'contact' in str(col).lower():
                    mask2 = df[col].str.contains(r'^\d{10}$', na=False)
                    if mask2.any():
                        df.loc[mask2, col] = 'REDACTED_PHONE'
                        changed = True

        if changed:
            df.to_csv(f, index=False)
            print(f"Redacted PII in {os.path.basename(f)}")
            
    except Exception as e:
        bad_files.append((os.path.basename(f), str(e)))

print("Validation failures:", bad_files if bad_files else "None")
print("Finished CSV processing.")
