import React, { useState, useEffect, useRef, useCallback } from 'react'

/**
 * ResponsiveDocumentWrapper
 * Mengunci layout internal dokumen A4 (lebar standar 794px) agar tidak pecah
 * dan melakukan downscaling proporsional secara otomatis pada layar mobile/tablet.
 */
export default function ResponsiveDocumentWrapper({
  children,
  className = '',
  baseWidth = 794
}) {
  const containerRef = useRef(null)
  const contentWrapperRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [docHeight, setDocHeight] = useState(1123)

  const measureAndScale = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      if (containerWidth > 0) {
        const computedScale = Math.min(1, containerWidth / baseWidth)
        setScale(computedScale)
      }
    }

    if (contentWrapperRef.current) {
      const firstChild = contentWrapperRef.current.firstElementChild
      if (firstChild) {
        const height = firstChild.offsetHeight || firstChild.scrollHeight || 1123
        setDocHeight(height)
      }
    }
  }, [baseWidth])

  useEffect(() => {
    measureAndScale()

    const containerEl = containerRef.current
    if (!containerEl) return

    let resizeObserver = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measureAndScale()
      })
      resizeObserver.observe(containerEl)
    }

    window.addEventListener('resize', measureAndScale)

    let mutationObserver = null
    if (typeof MutationObserver !== 'undefined' && contentWrapperRef.current) {
      mutationObserver = new MutationObserver(() => {
        measureAndScale()
      })
      mutationObserver.observe(contentWrapperRef.current, {
        childList: true,
        subtree: true,
        attributes: true
      })
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect()
      if (mutationObserver) mutationObserver.disconnect()
      window.removeEventListener('resize', measureAndScale)
    }
  }, [measureAndScale])

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center items-start overflow-hidden print:overflow-visible print:w-auto ${className}`}
    >
      <div
        style={{
          width: `${baseWidth * scale}px`,
          height: `${docHeight * scale}px`,
          position: 'relative'
        }}
        className="shrink-0 transition-all duration-150 origin-top flex justify-center print:!w-auto print:!h-auto print:!transform-none"
      >
        <div
          ref={contentWrapperRef}
          style={{
            width: `${baseWidth}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left'
          }}
          className="print:!transform-none print:!w-auto"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
