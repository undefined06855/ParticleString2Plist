# This is used to find what index a particle value is
# Shouldnt ever need to be ran more than once, but if you need to... good luck
# This is all so messy, this will generate a completely weird and broken json file that really has to be cleaned up afterwards
# It is not recommended to try to fix...


from pathlib import Path

# base particle string, used to find bools and match up with mappings.txt
base_str = Path("base.txt").read_text()

# then split the base by each letter a
base = [float(x) for x in base_str.split("a")]

failures = 0

# find float values
indexes = {}
with open("mappings.txt") as file:
    while True:
        line = file.readline()
        if (not line): break
        
        split = line.split(": ")
        label = split[0]
        value = float(split[1])

        # find where label is in base
        try:
            index = base.index(value)
            print(f"Found {label} at index {index}")
            indexes[label] = index
        except ValueError:
            print(f"{label} was not found!")
            failures += 1

# find bools by comparing the string and the base string
# and finding the first character that's different
bool_label = ""
with open("boolstrings.txt") as file:
    while True:
        line = file.readline()
        if (not line): break

        if line.startswith(";"):
            bool_label = line.replace("\n", "").replace(";", "")
            continue

        # this is a test string
        split = [float(x) for x in line.split("a")]
        for i, num in enumerate(split):
            cmp = base[i]
            if num != cmp:
                # found it!
                print(f"Found {bool_label} at index {i} ({num} != {cmp})")
                indexes[bool_label] = i
                continue

        # not found!
        print(f"{bool_label} was not found!")
        failures += 1
        
print(f"Finished! Failures: {failures}")
print(indexes)

