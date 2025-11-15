# JMAP Web Client

Pure React SPA for JMAP servers (RFC 8620 compliant). A universal web client that works with any RFC 8620 compliant JMAP server. The client makes direct API calls to the JMAP server and supports RFC 8620 autodiscovery.
Uses tanstack router for routing and tanstack query for API calls.
Tailwindcss for styling and shadcn as a component library.
## Deployment

**Important:** Ensure your client domain is added to the server's `ALLOWED_ORIGINS` configuration for CORS to work correctly.
See [deployment.md](docs/deployment.md) for deployment instructions.

Local testing

Run frontend with make local. This will look for a backend hosted on 3001

## Resources

- [JMAP Specification (RFC 8620)](https://jmap.io/)
