import csv
import json
import os

from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer


class ChatEntry(BaseModel):
    input: str = Field(..., min_length=2)
    response: str = Field(..., min_length=2)


model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

with open("data/input_response.csv") as f:
    reader = csv.DictReader(f)
    rows = list(reader)

validated = []
for row in rows:
    print(row)
    entry = ChatEntry(**row)
    embedding = model.encode(entry.input).tolist()
    validated.append(
        {"input": entry.input, "embedding": embedding, "response": entry.response}
    )

with open("public/data.json", "w") as out:
    json.dump(validated, out, indent=2)
