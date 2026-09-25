import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

load_dotenv(ENV_FILE)


DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "stockflow")


def get_database_url() -> str:
    username = quote_plus(DB_USER)
    password = quote_plus(DB_PASSWORD)

    return (
        f"mysql+pymysql://{username}:{password}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )