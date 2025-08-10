
import os

def check_api_key(header_value: str|None, param_value: str|None, env_key: str|None=None) -> bool:
    env_key = env_key or os.environ.get("MCP_API_KEY")
    if not env_key:  # open mode
        return True
    provided = None
    if header_value and header_value.lower().startswith("bearer "):
        provided = header_value[7:].strip()
    if not provided and param_value:
        provided = param_value.strip()
    return provided == env_key
