# Trusted SDK acceptance

Reference https://ts.sdk.modelcontextprotocol.io/v2/testing . SDK v2 client/server 2.4.0 use actual protocol serialization and in-process HTTP handling, no sockets, no subprocesses. The fixed synthetic endpoint and tool are explicitly authorized by the test; unknown endpoints and methods are rejected. This is limited interoperability evidence only after passing CI, not proof of third-party or network deployment compatibility. Default core remains mock-only. No arbitrary tool execution or user-supplied server configuration.
