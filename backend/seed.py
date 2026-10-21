import os
import random
import uuid
from datetime import timezone

import psycopg
from dotenv import load_dotenv
from faker import Faker

load_dotenv()
DATABASE_URL = os.environ["DATABASE_URL"]

NUM_SHIPS = 1000
NUM_PIRATES = 9000
BATCH_SIZE = 500

fake = Faker()
Faker.seed(42)   # same "random" data every run -> reproducible
random.seed(42)

ADJECTIVES = [
    "Soggy", "Rusty", "Drunken", "Screaming", "Salty", "Cursed", "Golden", "Leaky",
    "Wailing", "Crimson", "Grumpy", "Sneaky", "Black", "Haunted", "Dancing", "Furious",
    "Lucky", "Rotten", "Silent", "Stormy", "Toothless", "Bloody", "Wobbly", "Jolly",
    "Midnight", "Shiny", "Seasick", "Howling", "Mouldy", "Glorious", "Sleepy", "Greedy",
    "Smelly", "Brave", "Cowardly", "Ancient", "Sunken", "Frozen", "Burning", "Hungry",
    "Wicked", "Merry", "Restless", "Barnacled", "Crooked", "Forgotten", "Vengeful", "Tipsy",
    "Thundering", "Squeaky", "Fearless", "Moody", "Ghostly", "Rogue", "Iron", "Scarlet",
    "Emerald", "Dreadful", "Clumsy", "Blessed",
]

NOUNS = [
    "Biscuit", "Kraken", "Mermaid", "Barnacle", "Parrot", "Anchor", "Squid", "Pelican",
    "Doubloon", "Cutlass", "Lobster", "Gull", "Puppet", "Pretzel", "Herring", "Compass",
    "Maiden", "Shark", "Turtle", "Cannonball", "Widow", "Oyster", "Serpent", "Rum Barrel",
    "Jellyfish", "Albatross", "Pickle", "Seahorse", "Tentacle", "Treasure", "Octopus", "Walrus",
    "Crab", "Eel", "Narwhal", "Swordfish", "Starfish", "Dolphin", "Whale", "Sardine",
    "Mutiny", "Plank", "Lantern", "Spyglass", "Hook", "Goblet", "Skull", "Siren",
    "Tide", "Storm", "Wench", "Scallywag", "Buccaneer", "Corsair", "Duchess", "Banshee",
    "Muffin", "Teacup", "Sock", "Potato",
]

FLAGS = [
    "Skull & Crossbones", "Skull with a monocle", "Burning heart", "Crossed cutlasses",
    "Grinning skeleton", "Red skull", "Hourglass and bones", "Kraken eating a ship",
    "Puppet with skull", "Skull with eyepatch", "Dancing skeleton", "Rubber duck",
    "Skull wearing a crown", "Bleeding anchor", "Crossed fish bones", "Flaming parrot",
    "Winking skull", "Black cat with sword", "Skull and teacup", "Three golden coins",
    "Mermaid with dagger", "Shark jaws", "Skull with top hat", "Crossed wooden legs",
    "Rum bottle and bones", "Octopus holding pistols", "Broken compass", "Smiling moon",
    "Skull with flowers", "Plain black (mysterious)",
]

TITLES = [
    "Captain", "One-Eyed", "Peg-Leg", "Salty", "Mad", "Red", "Old", "Bloody",
    "Lucky", "Barnacle", "Stinky", "Iron-Hook", "Silent", "Mumbling", "Gentle",
    "Black-Tooth", "Scurvy", "Admiral", "Quartermaster", "Bosun", "Cook", "Mate",
    "Grog-Belly", "Two-Swords", "Crooked", "Lady", "Sir", "Dread", "Cabin Boy",
    "Crazy-Eyed", "Rum-Soaked", "Tattooed", "Wild", "Sea Dog", "No-Beard",
]

PARROT_NAMES = [
    "Polly", "Captain Feathers", "Squawks", "Kiwi", "Mango", "Sir Squawks-a-Lot",
    "Bubek", "Pistachio", "Cracker", "Admiral Beak", "Rio", "Sunny", "Pickles",
    "Coco", "Blue", "Gizmo", "Nugget", "Jellybean", "Toucan't", "Lord Flappington",
    "Biscuit", "Peaches", "Chilli", "Zazu", "Tango", "Feathersworth", "Paprika",
    "Squeaky", "Doubloon", "Banana", "Professor Plume", "Mr. Wings", "Lady Tweet",
    "Cashew", "Pepper", "Skipper", "Waffles", "Noodle", "Admiral Crackers", "Ziggy",
    "Mojito", "Echo", "Captain Chirp", "Bluebeak", "Taco", "Pirouette", "Gossip",
    "Olive", "Flapjack", "Beaky McBeakface",
]

ROMAN = ["", "", " II", " III", " IV", " V", " VI", " VII", " VIII", " IX", " X"]


def make_ship_names(n: int) -> list[str]:
    """Unique ship names: 'The Soggy Biscuit', then 'The Soggy Biscuit II', ..."""
    counts: dict[str, int] = {}
    names = []
    while len(names) < n:
        pattern = random.random()
        if pattern < 0.6:
            base = f"The {random.choice(ADJECTIVES)} {random.choice(NOUNS)}"
        elif pattern < 0.8:
            base = f"{random.choice(NOUNS)}'s {random.choice(['Revenge', 'Curse', 'Fortune', 'Folly', 'Lament', 'Pride'])}"
        else:
            base = f"Queen {fake.first_name_female()}'s {random.choice(NOUNS)}"
        counts[base] = counts.get(base, 0) + 1
        c = counts[base]
        names.append(base + (ROMAN[c] if c < len(ROMAN) else f" {c}"))
    return names


def make_ships() -> list[tuple]:
    ships = []
    for name in make_ship_names(NUM_SHIPS):
        ships.append((
            uuid.uuid4(),
            name,
            random.choice(FLAGS),
            random.randint(0, 60),           # cannons
            random.randint(0, 100),          # sinking_risk
            fake.date_time_between(start_date="-3y", tzinfo=timezone.utc),
        ))
    return ships

def make_pirates(ship_ids: list[uuid.UUID]) -> list[tuple]:
    pirates = []
    for _ in range(NUM_PIRATES):
        title = random.choice(TITLES)
        name = f"{title} {fake.first_name()}"
        if random.random() < 0.4:            # 40% also get a surname
            name += f" {fake.last_name()}"

        pirates.append((
            uuid.uuid4(),
            random.choice(ship_ids),
            name,
            random.choices([0, 1, 2, 3, 4], weights=[60, 25, 10, 4, 1])[0],  # most keep their limbs
            random.choice(PARROT_NAMES) if random.random() < 0.6 else None,   # 60% have a parrot
            random.randint(0, 30),           # rum_per_day
            random.randint(0, 100),          # loyalty
            fake.date_time_between(start_date="-3y", tzinfo=timezone.utc),
        ))
    return pirates


def insert_in_batches(cur, sql: str, rows: list[tuple], label: str) -> None:
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        cur.executemany(sql, batch)
        print(f"  {label}: {i + len(batch)}/{len(rows)}")


def main() -> None:
    ships = make_ships()
    ship_ids = [s[0] for s in ships]
    pirates = make_pirates(ship_ids)

    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            print("Clearing old data...")
            cur.execute("TRUNCATE pirates, ships")

            print("Inserting ships...")
            insert_in_batches(
                cur,
                """INSERT INTO ships (id, name, flag, cannons, sinking_risk, created_at)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                ships,
                "ships",
            )

            print("Inserting pirates...")
            insert_in_batches(
                cur,
                """INSERT INTO pirates (id, ship_id, name, missing_limbs, parrot_name,
                                        rum_per_day, loyalty, created_at)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                pirates,
                "pirates",
            )
        # leaving the "with conn" block commits the transaction

    print(f"Done! {len(ships)} ships + {len(pirates)} pirates = {len(ships) + len(pirates)} records 🏴‍☠️")


if __name__ == "__main__":
    main()
