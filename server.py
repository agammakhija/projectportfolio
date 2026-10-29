#!/usr/bin/env python3
import http.server
import socket
import sys

PORT = 3000

class ThreadingDualStackServer(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6 if socket.has_ipv6 else socket.AF_INET
    daemon_threads = True

    def server_bind(self):
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        if self.address_family == socket.AF_INET6:
            try:
                # Allow both IPv4 and IPv6 connections on dual-stack socket
                self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
            except (AttributeError, OSError):
                pass
        super().server_bind()

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent aggressive browser caching during development
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

if __name__ == "__main__":
    bind_addr = "" if socket.has_ipv6 else "0.0.0.0"
    print(f"Starting High-Performance Threaded Server on port {PORT}...")
    try:
        with ThreadingDualStackServer((bind_addr, PORT), CustomHandler) as httpd:
            print(f"Serving HTTP on port {PORT} (http://localhost:{PORT} and http://127.0.0.1:{PORT})")
            httpd.serve_forever()
    except Exception as e:
        # Fallback to standard IPv4 if IPv6 dual-stack fails
        print(f"Dual-stack failed ({e}), falling back to IPv4...")
        class IPv4Server(http.server.ThreadingHTTPServer):
            daemon_threads = True
        with IPv4Server(("0.0.0.0", PORT), CustomHandler) as httpd:
            print(f"Serving HTTP on port {PORT} (http://127.0.0.1:{PORT})")
            httpd.serve_forever()

