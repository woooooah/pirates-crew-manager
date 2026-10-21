from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import pirates, ships

app = FastAPI(title="Pirate Crew API 🏴‍☠️")

# Allow the React dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ships.router)
app.include_router(pirates.router)


@app.get("/")
def root():
    return {"message": "Ahoy! The Pirate Crew API is afloat. See /docs 🏴‍☠️"}