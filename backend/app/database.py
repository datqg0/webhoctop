from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

db_url = settings.normalized_database_url

connect_args = {}
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}
else:
    # Neon Serverless Postgres optimization
    connect_args = {
        "sslmode": "require",
        "connect_timeout": 15
    }

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
