#!/usr/bin/env python3
import os
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler

BASE_DIR = '/Users/ilias/Claude akhi'
PORT = int(os.environ.get('PORT', 8743))

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self._serve()

    def do_HEAD(self):
        self._serve(head_only=True)

    def _serve(self, head_only=False):
        path = self.path.split('?')[0]
        if path in ('/', ''):
            path = '/index.html'
        filepath = BASE_DIR + path

        try:
            with open(filepath, 'rb') as f:
                data = f.read()
            ctype = mimetypes.guess_type(filepath)[0] or 'application/octet-stream'
            self.send_response(200)
            self.send_header('Content-Type', ctype)
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            if not head_only:
                self.wfile.write(data)
        except FileNotFoundError:
            self.send_error(404, 'File not found')

    def log_message(self, fmt, *args):
        print(fmt % args, flush=True)

server = HTTPServer(('', PORT), Handler)
print(f'Serving on port {PORT}', flush=True)
server.serve_forever()
