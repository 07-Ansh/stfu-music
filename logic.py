import asyncio
import json
import os
import sys
import webbrowser


class C:
    ROSE  = '\033[38;2;196;160;138m'
    MUTED = '\033[38;2;154;142;133m'
    GREEN = '\033[38;2;126;191;142m'
    RED   = '\033[38;2;212;132;122m'
    DIM   = '\033[2m'
    BOLD  = '\033[1m'
    RESET = '\033[0m'

BANNER = f"""
{C.ROSE}  ┌─┐ ┌┬┐ ┌─┐ ┬ ┬   ┌┬┐ ┬ ┬ ┌─┐ ┬ ┌─┐
  └─┐  │  ├┤  │ │   │││ │ │ └─┐ │ │  
  └─┘  ┴  └   └─┘ o ┴ ┴ └─┘ └─┘ ┴ └─┘{C.RESET}

  {C.DIM}your desi harmonium{C.RESET}
"""


def check_dependencies():
    missing = []
    try:
        import websockets
    except ImportError:
        missing.append('websockets')
    try:
        from pybooklid import LidSensor
    except ImportError:
        missing.append('pybooklid')

    if missing:
        print(f"\n  {C.RED}✗ missing packages: {', '.join(missing)}{C.RESET}")
        print(f"  {C.MUTED}fix it with:{C.RESET} pip install {' '.join(missing)}\n")
        sys.exit(1)


def open_html():
    html_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'index.html')
    if os.path.exists(html_path):
        webbrowser.open(f'file://{html_path}')
        print(f"  {C.DIM}opened harmonium.html in your browser{C.RESET}")
    else:
        print(f"  {C.DIM}couldn't find harmonium.html — open it manually{C.RESET}")


async def handler(websocket):
    import websockets as ws
    from pybooklid import LidSensor

    print(f"\n  {C.GREEN}● browser connected{C.RESET} {C.DIM}— time to make some noise{C.RESET}")

    try:
        with LidSensor() as sensor:
            for angle in sensor.monitor(interval=0.05):
                print(f"\r  {C.MUTED}lid angle:{C.RESET} {C.ROSE}{angle:6.2f}°{C.RESET}  ", end="", flush=True)
                try:
                    await websocket.send(json.dumps({"angle": angle}))
                except ws.ConnectionClosed:
                    break
    except Exception as e:
        print(f"\n  {C.RED}✗ sensor error: {e}{C.RESET}")
        print(f"  {C.DIM}is your lid sensor working? try: python -c \"from pybooklid import LidSensor; print('ok')\"{C.RESET}")

    print(f"\n  {C.DIM}● browser disconnected — waiting for next connection{C.RESET}")


async def main():
    import websockets

    print(BANNER)
    print(f"  {C.GREEN}● server running{C.RESET} {C.DIM}on ws://localhost:8765{C.RESET}")
    print(f"  {C.MUTED}waiting for browser to connect...{C.RESET}\n")

    open_html()

    async with websockets.serve(handler, "localhost", 8765):
        await asyncio.Future()


if __name__ == "__main__":
    check_dependencies()
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(f"\n\n  {C.MUTED}bye bye — your laptop is free again{C.RESET}\n")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"\n  {C.RED}✗ port 8765 is busy{C.RESET}")
            print(f"  {C.DIM}another i-harmonium running? close it first{C.RESET}\n")
        else:
            raise