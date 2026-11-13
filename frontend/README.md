# Museum Ticketing System

## Open the app on a phone

The phone and computer must be connected to the same Wi-Fi network. From the project folder, start the backend in one PowerShell window:

```powershell
cd backend
npm start
```

Start the frontend in a second PowerShell window:

```powershell
cd frontend
npm run dev:lan
```

On the computer, run `ipconfig` and find its IPv4 address for the active Wi-Fi adapter. Vite prints a `Network` URL when it starts; open that URL on the phone. The default port is 5173, but Vite may select another port if it is already in use. Keep both terminal windows running while using the app. The Vite server forwards `/api` requests to the backend on the computer, so the phone does not try to contact its own `localhost`.

If Windows asks whether Node.js can accept private-network connections, allow it on the private network. The app can also be added to the phone's home screen as a browser shortcut; the computer and both servers still need to be running.

## API configuration

Frontend requests use same-origin `/api` paths by default. Vite proxies these to `http://127.0.0.1:5000` during local development. When hosting the built frontend separately, configure the web server to proxy `/api` to the backend, or set `VITE_API_BASE_URL` to the backend API base URL (including `/api`) before building.
