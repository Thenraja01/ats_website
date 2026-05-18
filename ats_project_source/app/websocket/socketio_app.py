import socketio

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def resume_processing_status(sid, data):
    print(f"Status update from {sid}: {data}")

async def emit_status_update(status_message: str, data: dict = None):
    """Utility to emit real-time updates for resume processing."""
    payload = {"status": status_message}
    if data:
        payload.update(data)
    await sio.emit('processing_update', payload)
