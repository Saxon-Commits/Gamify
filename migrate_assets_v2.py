import os
import shutil

SOURCE_DIR = "public/assets/cyber knight backgrounds removed"
DEST_DIR = "public/assets/avatars/cyber_knight/composite"

# Mappings
ARMOR_MAP = {
    "grav boots": "a_grav_boots",
    "oni mask": "h_oni_mask",
    "seraph wings": "a_seraph_wings",
    "void cloak": "a_void_cloak"
}

WEAPON_MAP = {
    "battle axe": "weapon-battle-axe",
    "crystal staff": "weapon-crystal-staff",
    "cyber sword": "w_cyber_sword",
    "data gauntlet": "w_data_gauntlet",
    "iron broardsword": "weapon-iron-broadsword",
    "iron broadsword": "weapon-iron-broadsword",
    "molten sword": "w_molten_sword",
    "neural dagger": "w_neural_dagger",
    "oak longbow": "weapon-oak-longbow",
    "photon blaster": "w_photon_blaster",
    "rogue dagger": "weapon-rogues-dagger",
    "rogue's dagger": "weapon-rogues-dagger",
    "thunder hammer": "w_thunder_hammer",
    "void staff": "w_cursed_staff"
}

def migrate():
    if not os.path.exists(SOURCE_DIR):
        print(f"Source directory not found: {SOURCE_DIR}")
        return

    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)

    files = os.listdir(SOURCE_DIR)
    print(f"Found {len(files)} files to process.")

    for filename in files:
        if not filename.endswith(".png"):
            continue
            
        # Remove extension and split
        name_parts = filename.replace(".png", "").split(", ")
        
        # Expected formats:
        # "cyber knight, [armor]" -> 2 parts
        # "cyber knight, [armor], [weapon]" -> 3 parts
        
        armor_name = ""
        weapon_name = ""
        new_filename = ""

        if len(name_parts) >= 2:
            # Check for double comma typo in one file: "cyber knight, seraph wings,,.png"
            # Split might result in empty strings
             
            armor_candidate = name_parts[1].strip()
            if not armor_candidate and len(name_parts) > 2:
                 armor_candidate = name_parts[2].strip()

            armor_name = armor_candidate

            if armor_name in ARMOR_MAP:
                armor_id = ARMOR_MAP[armor_name]
                
                if len(name_parts) == 2 or (len(name_parts) == 3 and not name_parts[2].strip()):
                    # Armor Only
                    new_filename = f"{armor_id}.png"
                elif len(name_parts) >= 3:
                     weapon_candidate = name_parts[2].strip()
                     if weapon_candidate in WEAPON_MAP:
                         weapon_id = WEAPON_MAP[weapon_candidate]
                         new_filename = f"{armor_id}_{weapon_id}.png"
                     else:
                         print(f"Unknown weapon: {weapon_candidate} in {filename}")
                         continue
            else:
                print(f"Unknown armor: {armor_name} in {filename}")
                continue
        
        if new_filename:
            src_path = os.path.join(SOURCE_DIR, filename)
            dest_path = os.path.join(DEST_DIR, new_filename)
            shutil.move(src_path, dest_path)
            print(f"Moved: {filename} -> {new_filename}")
        else:
            print(f"Skipped: {filename}")

    # Clean up empty source dir
    # try:
    #     os.rmdir(SOURCE_DIR)
    # except:
    #     pass

if __name__ == "__main__":
    migrate()
