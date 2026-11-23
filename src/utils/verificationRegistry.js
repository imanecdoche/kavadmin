/**
 * Official Certificate & Credential Verification Registry
 * Kavio Academy • PT Kavio Investama Global
 */

export const OFFICIAL_CERTIFICATE_REGISTRY = {
  'REG-KAV-2026-081': {
    documentId: 'KAV/CERT/2026/XI/081',
    verificationId: 'REG-KAV-2026-081',
    studentName: 'Alya Salsabila',
    programName: 'Comprehensive English Course',
    batchName: 'Batch 1',
    cefrLevel: 'CEFR Level A2 — Elementary / Foundational Mastery',
    score: '81.5 / 100',
    predicate: 'PASS WITH MERIT',
    coreDistinction: 'Syntax Inversion (92.5%)',
    totalSessions: 12,
    completionDate: '21 November 2026',
    signLocation: 'Pandeglang, Banten, Indonesia',
    directorName: 'Fatih Farhat Asshidiq',
    directorTitle: 'Lead Instructor & Head of Kavio English Education',
    institutionName: 'Kavio Academy • Kavio English Education',
    holdingCompany: 'PT Kavio Investama Global',
    nib: '2311260068864',
    kbli: '85595 — Pendidikan Bimbingan Belajar dan Konseling Swasta',
    licensingAuthority: 'Kementerian Investasi dan Hilirisasi / BKPM Republik Indonesia',
    officeAddress: 'Jl. Raya Labuan, Kp. Bojong Canar, Ds. Dahu, Kec. Cikedal, Kab. Pandeglang, Banten 42266',
    verificationStatus: 'VALID & AUTHENTIC',
    issuedAt: '2026-11-21',
    keyDistinctions: [
      { subject: 'Syntax Inversion & Complex Clauses', score: '92.5%' },
      { subject: 'Grammar Accuracy & Mechanics', score: '82.0%' },
      { subject: 'Written Composition & Paragraph Recount', score: '80.0%' },
      { subject: 'Interactive Spoken Discourse & Dialogues', score: '78.5%' }
    ],
    metadata: {
      standard: 'Common European Framework of Reference for Languages (CEFR)',
      accreditationType: 'Official Institutional Conformance',
      securitySealHash: 'SEAL-KAV-2311260068864-081'
    }
  }
}

// Aliases mapping for easy lookup
export const REGISTRY_ALIASES = {
  'KAV/CERT/2026/XI/081': 'REG-KAV-2026-081',
  'KAV-CERT-2026-XI-081': 'REG-KAV-2026-081',
  '081': 'REG-KAV-2026-081'
}

/**
 * Normalizes query string for robust lookup
 */
function normalizeId(id) {
  if (!id) return ''
  return id.trim().toUpperCase().replace(/\s+/g, '')
}

/**
 * Looks up certificate in official registry or localStorage
 * @param {string} rawId
 * @returns {Object|null}
 */
export function lookupCertificate(rawId) {
  if (!rawId) return null

  const id = normalizeId(rawId)

  // 1. Direct registry check
  if (OFFICIAL_CERTIFICATE_REGISTRY[id]) {
    return OFFICIAL_CERTIFICATE_REGISTRY[id]
  }

  // 2. Alias mapping check
  const aliasTarget = REGISTRY_ALIASES[id] || REGISTRY_ALIASES[rawId.trim()]
  if (aliasTarget && OFFICIAL_CERTIFICATE_REGISTRY[aliasTarget]) {
    return OFFICIAL_CERTIFICATE_REGISTRY[aliasTarget]
  }

  // 3. Partial / contains match in official registry
  for (const [key, cert] of Object.entries(OFFICIAL_CERTIFICATE_REGISTRY)) {
    if (key.includes(id) || cert.documentId.toUpperCase().includes(id) || cert.studentName.toUpperCase().includes(id)) {
      return cert
    }
  }

  // 4. Fallback: Search in localStorage students data
  try {
    const saved = localStorage.getItem('kavio_students')
    if (saved) {
      const students = JSON.parse(saved)
      if (Array.isArray(students)) {
        for (const s of students) {
          if (s.certificate) {
            const certDoc = s.certificate.documentId || ''
            const certHash = s.certificate.verificationHash || ''
            if (
              normalizeId(certDoc).includes(id) ||
              normalizeId(certHash).includes(id) ||
              normalizeId(s.name).includes(id) ||
              normalizeId(s.id) === id
            ) {
              return {
                documentId: s.certificate.documentId || `KAV/CERT/${s.id}`,
                verificationId: s.certificate.verificationHash || `REG-KAV-${s.id}`,
                studentName: s.name,
                programName: s.packageType ? `Paket ${s.packageType}` : 'Comprehensive English Course',
                batchName: s.certificate.batchName || 'Batch 1',
                cefrLevel: s.certificate.cefrLevel || 'CEFR Level A2 — Elementary / Foundational Mastery',
                score: s.certificate.score || '80 / 100',
                predicate: s.certificate.predicate || 'PASS WITH MERIT',
                coreDistinction: s.certificate.coreDistinction || 'Grammar Mastery',
                totalSessions: s.totalSessions || 12,
                completionDate: s.certificate.completionDate || '21 November 2026',
                signLocation: s.certificate.signLocation || 'Pandeglang, Banten, Indonesia',
                directorName: s.certificate.directorName || 'Fatih Farhat Asshidiq',
                directorTitle: s.certificate.directorTitle || 'Lead Instructor & Head of Kavio English Education',
                institutionName: 'Kavio Academy • Kavio English Education',
                holdingCompany: 'PT Kavio Investama Global',
                nib: '2311260068864',
                kbli: '85595 — Pendidikan Bimbingan Belajar dan Konseling Swasta',
                licensingAuthority: 'Kementerian Investasi dan Hilirisasi / BKPM Republik Indonesia',
                officeAddress: 'Jl. Raya Labuan, Kp. Bojong Canar, Ds. Dahu, Kec. Cikedal, Kab. Pandeglang, Banten 42266',
                verificationStatus: 'VALID & AUTHENTIC',
                issuedAt: s.certificate.completionDate || '2026-11-21'
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Error looking up certificate in localStorage:', e)
  }

  return null
}

/**
 * Checks if current browser URL corresponds to a certificate verification request
 * Matches:
 *  - /verify
 *  - /verify?id=...
 *  - /verify/:id
 *  - ?id=... / ?cert=... / ?verify=...
 */
export function parseVerificationUrl() {
  if (typeof window === 'undefined') return null

  const pathname = window.location.pathname.toLowerCase()
  const search = window.location.search
  const params = new URLSearchParams(search)

  const isVerifyPath = pathname.startsWith('/verify')
  const queryId = params.get('id') || params.get('cert') || params.get('verify') || params.get('certId')

  let pathId = null
  if (isVerifyPath) {
    const segments = window.location.pathname.split('/').filter(Boolean)
    if (segments.length >= 2 && segments[0].toLowerCase() === 'verify') {
      pathId = decodeURIComponent(segments[1])
    }
  }

  const effectiveId = queryId || pathId

  if (isVerifyPath || effectiveId) {
    return {
      isVerifyRequest: true,
      queryId: effectiveId || ''
    }
  }

  return null
}
