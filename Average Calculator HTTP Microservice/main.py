from fastapi import FastAPI, HTTPException
from typing import List, Dict
import httpx
import time

app = FastAPI()

WINDOW_SIZE = 10
TIMEOUT = 0.5  # 500ms
number_sources = {
    "p": "http://20.244.56.144/evaluation-service/primes",
    "f": "http://20.244.56.144/evaluation-service/fibo",
    "e": "http://20.244.56.144/evaluation-service/even",
    "r": "http://20.244.56.144/evaluation-service/rand"
}

 
window: List[int] = []

@app.get("/numbers/{numberid}")
async def get_numbers(numberid: str):
    if numberid not in number_sources:
        raise HTTPException(status_code=400, detail="Invalid number ID")

    url = number_sources[numberid]
    prev_state = window.copy()
    fetched_numbers = []

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            start_time = time.time()
            response = await client.get(url)
            elapsed = time.time() - start_time

            if elapsed > TIMEOUT or response.status_code != 200:
                raise Exception("Request timed out or failed")

            data = response.json()
            fetched_numbers = data.get("numbers", [])

    except Exception:
        
        return {
            "windowPrevState": prev_state,
            "windowCurrState": window,
            "numbers": [],
            "avg": round(sum(window) / len(window), 2) if window else 0.00
        }

    
    for num in fetched_numbers:
        if num not in window:
            if len(window) < WINDOW_SIZE:
                window.append(num)
            else:
                window.pop(0)
                window.append(num)

    curr_state = window.copy()
    avg = round(sum(curr_state) / len(curr_state), 2) if curr_state else 0.00

    return {
        "windowPrevState": prev_state,
        "windowCurrState": curr_state,
        "numbers": fetched_numbers,
        "avg": avg
    }
