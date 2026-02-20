## 🔒 Security Policy

Security is a top priority for the **Lynx** project.  

### Reporting a Vulnerability
If you discover a security issue, please report it responsibly:
- **Preferred:** [GitHub Security Advisory](../../security/advisories/new) — creates a private, coordinated channel with maintainers.  
- **Email:** `info@paoloronco.it`.  
- **Do not** open public issues for unpatched vulnerabilities.

Include in your report:
1. Clear description of the issue and its impact.  
2. Steps to reproduce (PoC, payload, HTTP requests, required accounts).  
3. Affected versions/commits and environment details (OS, Node.js, browser).  
4. Known mitigations or workarounds if any.  

### Response Timeline
- **Acknowledgement:** within 72 hours.  
- **Triage:** within 7 days.  
- **Fix & Release:** usually within 90 days of confirmation (faster for critical issues).  

### Scope
In-scope vulnerabilities include:
- Authentication and session flaws  
- Authorization/privilege escalation  
- Injection (SQLi, command injection, template injection)  
- XSS with practical impact  
- Path traversal, RCE, LFI/RFI  
- Exposed secrets or misconfigurations with impact  
- Vulnerable dependencies with exploitable vectors  

### Out of Scope
- **Demo instance**: credentials `admin/demo123` reset every ~15 minutes by design.  
- DoS/DDoS without demonstrated impact.  
- Purely theoretical issues.  
- Browser or third-party platform vulnerabilities.  
- Automated scanner reports without PoC.  

### Supported Versions
| Version | Security status |
|---------|-----------------|
| 3.x (≥ 3.0.0) | ✅ Supported |
| 2.x and earlier | ❌ Not supported |

### Security Practices
- Password hashing with *bcryptjs* (12 salt rounds)  
- JWT authentication with 7-day expiry  
- HttpOnly + SameSite cookies  
- Parameterized queries for SQLite  

We recommend deployers to enforce HTTPS, use proper security headers, rate limiting, least privilege runtime, encrypted backups, and keep Node.js & dependencies updated.

### Disclosure
Please **do not disclose** details publicly until a fix is released.  
Safe Harbor applies for good-faith security research following this policy.  

### Bug Bounty
No paid bug bounty at this time. Researchers may be credited in release notes at the maintainers' discretion.

---

## 🔒 Recent Security Updates

### February 2026 - Critical Vulnerabilities Resolved
**Status:** ✅ All runtime vulnerabilities fixed
**Last Updated:** 2026-02-20

#### Fixed Vulnerabilities
All GitHub Dependabot alerts have been resolved:

| Package | Severity | Issue | Fix |
|---------|----------|-------|-----|
| **multer** | High | DoS via memory leaks, malicious requests (#18-21) | Updated to v2.0.2 |
| **express/qs** | High | DoS via memory exhaustion (#27, #33) | Updated to v4.22.1 |
| **react-router-dom** | High | XSS via Open Redirects (#28) | Updated to v7.13.0 |
| **lodash** | Moderate | Prototype Pollution (#31) | Override to v4.17.23 |
| **minimatch** | High | ReDoS vulnerability | Override to v10.2.1 |
| **ajv** | Moderate | ReDoS with $data option | Override to v8.18.0 |

#### Security Audit Results
- **Frontend:** 0 vulnerabilities ✅
- **Backend:** 0 vulnerabilities ✅
- **Docker:** Secure build with updated system packages ✅

#### Updated Dependencies
```json
Backend: express ^4.21.3, multer ^2.0.2, sqlite3 ^5.1.7
Frontend: react-router-dom ^7.13.0, recharts ^3.7.0

Build dependencies (via overrides):
- tar: 7.5.9 (resolves all CVE-2026-* vulnerabilities)
- minimatch: 10.2.2 (resolves ReDoS)
- glob: 11.1.0 (resolves CVE-2025-64756)
- cross-spawn: 7.0.6 (resolves CVE-2024-21538)
```

#### Docker Security
- System packages updated via `apt-get upgrade`
- Resolves CVE-2025-14831 (gnutls28) and CVE-2025-45582 (tar)
- Multi-stage build with minimal attack surface
- Non-root user execution recommended

---
