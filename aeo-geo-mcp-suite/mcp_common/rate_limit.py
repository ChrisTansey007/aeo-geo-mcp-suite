
import time
from threading import Lock

class TokenBucket:
    def __init__(self, cap:int=60, refill_per_min:int=60):
        self.cap = cap
        self.tokens = cap
        self.refill = max(1, int(60_000/refill_per_min))  # ms per token
        self.last = int(time.time()*1000)
        self.lock = Lock()

    def take(self) -> bool:
        with self.lock:
            now = int(time.time()*1000)
            elapsed = now - self.last
            add = elapsed // self.refill if self.refill>0 else 0
            if add > 0:
                self.tokens = min(self.cap, self.tokens + int(add))
                self.last = now
            if self.tokens > 0:
                self.tokens -= 1
                return True
            return False
