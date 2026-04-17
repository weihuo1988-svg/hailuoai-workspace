#!/usr/bin/env python3
"""Download Minecraft 1.20.2 client JAR and extract all PNG textures"""
import urllib.request, zipfile, io, os

JAR_URL  = "https://piston-data.mojang.com/v1/objects/82d1974e75fc984c5ed4b038e764e50958ac61a0/client.jar"
JAR_PATH = "/tmp/minecraft-1.20.2.jar"
TEX_DIR  = "/workspace/mc-textures"

print("[  0%] Downloading Minecraft 1.20.2 client JAR (~22MB)...")

def report(n, total, step=200):
    if n % step == 0:
        pct = min(100, int(n/total*100))
        print(f"[{pct:3d}%] {n}/{total}", flush=True)

# Download with progress
urllib.request.urlretrieve(JAR_URL, JAR_PATH, lambda idx, total, _: report(idx, total))
size = os.path.getsize(JAR_PATH)
print(f"[100%] Download complete! ({size//1024//1024}MB)")

# Extract PNGs
block_dir = os.path.join(TEX_DIR, "blocks")
item_dir  = os.path.join(TEX_DIR, "items")
os.makedirs(block_dir, exist_ok=True)
os.makedirs(item_dir,  exist_ok=True)

print("Extracting PNG textures...")
count_block = count_item = 0

with zipfile.ZipFile(JAR_PATH, 'r') as z:
    pngs = [n for n in z.namelist() if n.endswith('.png') and 'textures/' in n]
    total = len(pngs)
    print(f"Found {total} PNG files")
    for i, name in enumerate(pngs):
        try:
            data = z.read(name)
            out = name.replace('assets/minecraft/textures/', '')
            if out.startswith('block/'):
                path = os.path.join(block_dir, out.replace('block/', ''))
                with open(path, 'wb') as f:
                    f.write(data)
                count_block += 1
            elif out.startswith('item/'):
                path = os.path.join(item_dir, out.replace('item/', ''))
                with open(path, 'wb') as f:
                    f.write(data)
                count_item += 1
        except Exception as e:
            pass
        if i % 500 == 0:
            print(f"  [{i}/{total}]", flush=True)

print(f"Done! Blocks: {count_block}, Items: {count_item}")
print("Sample blocks:", sorted(os.listdir(block_dir))[:8])
print("Sample items:", sorted(os.listdir(item_dir))[:8])
