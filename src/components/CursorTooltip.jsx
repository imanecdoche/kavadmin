import React, { useState, useEffect, useRef } from 'react'

/**
 * Global Real-Time Cursor Follow Tooltip
 * 
 * - Muncul LANGSUNG tanpa delay (0ms) saat hover tombol tanpa label atau elemen bertooltip
 * - Mengikuti koordinat kursor secara realtime (pointermove)
 * - Mencegah tooltip default bawaan browser yang lambat dan kaku
 * - Smart boundary collision detection (menjaga tooltip tetap di dalam viewport)
 * - Custom UI modern beraksen Fluent Dark Glassmorphism
 */
export default function CursorTooltip() {
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: '',
    x: 0,
    y: 0
  })

  const tooltipRef = useRef(null)
  const currentTargetRef = useRef(null)
  const lastDrawTimeRef = useRef(0)

  useEffect(() => {
    // Helper to determine if an element is an icon-only button or has tooltip intent
    const getTooltipText = (target) => {
      if (!target || !(target instanceof Element)) return null

      // Look up closest interactive button, anchor, or custom tooltip container
      const interactiveEl = target.closest('button, a, [data-tooltip], [title], [aria-label]')
      if (!interactiveEl) return null

      // Check explicit data-tooltip attribute first
      if (interactiveEl.hasAttribute('data-tooltip')) {
        const text = interactiveEl.getAttribute('data-tooltip')
        if (text && text.trim()) return { el: interactiveEl, text: text.trim() }
      }

      // Check native title attribute (and cache/suppress native title on hover)
      if (interactiveEl.hasAttribute('title') && interactiveEl.getAttribute('title')) {
        const text = interactiveEl.getAttribute('title')
        if (text && text.trim()) return { el: interactiveEl, text: text.trim() }
      }

      if (interactiveEl.hasAttribute('data-cached-title')) {
        const text = interactiveEl.getAttribute('data-cached-title')
        if (text && text.trim()) return { el: interactiveEl, text: text.trim() }
      }

      // Check if it is a button without visible text (icon-only button) with aria-label
      if (interactiveEl.tagName === 'BUTTON' || interactiveEl.tagName === 'A') {
        const textContent = (interactiveEl.textContent || '').trim()
        const ariaLabel = interactiveEl.getAttribute('aria-label')

        // If button has no text label or short text and has aria-label
        if (textContent.length === 0 && ariaLabel && ariaLabel.trim()) {
          return { el: interactiveEl, text: ariaLabel.trim() }
        }
      }

      return null
    }

    const handlePointerOver = (e) => {
      const match = getTooltipText(e.target)
      if (match && match.text) {
        const { el, text } = match
        currentTargetRef.current = el
        const now = Date.now()
        const isWarmHandoff = now - lastDrawTimeRef.current <= 150
        lastDrawTimeRef.current = now

        // Suppress native browser tooltip by temporarily removing 'title'
        if (el.hasAttribute('title')) {
          el.setAttribute('data-cached-title', el.getAttribute('title'))
          el.removeAttribute('title')
        }

        setTooltip({
          visible: true,
          text: text,
          x: e.clientX,
          y: e.clientY,
          warm: isWarmHandoff,
        })
      }
    }

    const handlePointerMove = (e) => {
      if (currentTargetRef.current) {
        // Quick verification that cursor is still inside or over the target
        const match = getTooltipText(e.target)
        if (match && match.text) {
          lastDrawTimeRef.current = Date.now()
          setTooltip(prev => ({
            ...prev,
            visible: true,
            text: match.text,
            x: e.clientX,
            y: e.clientY
          }))
        } else if (!currentTargetRef.current.contains(e.target)) {
          hideTooltip()
        }
      }
    }

    const hideTooltip = () => {
      if (currentTargetRef.current) {
        lastDrawTimeRef.current = Date.now()
        // Restore title if cached
        if (currentTargetRef.current.hasAttribute('data-cached-title')) {
          const cached = currentTargetRef.current.getAttribute('data-cached-title')
          currentTargetRef.current.setAttribute('title', cached)
          currentTargetRef.current.removeAttribute('data-cached-title')
        }
        currentTargetRef.current = null
      }
      setTooltip(prev => (prev.visible ? { ...prev, visible: false } : prev))
    }

    const handlePointerOut = (e) => {
      if (currentTargetRef.current) {
        // If moving to an element outside current target
        if (!e.relatedTarget || !currentTargetRef.current.contains(e.relatedTarget)) {
          hideTooltip()
        }
      }
    }

    const handleWindowBlurOrScroll = () => {
      hideTooltip()
    }

    // Attach listeners with capture for immediate response
    window.addEventListener('pointerover', handlePointerOver, { capture: true, passive: true })
    window.addEventListener('pointermove', handlePointerMove, { capture: true, passive: true })
    window.addEventListener('pointerout', handlePointerOut, { capture: true, passive: true })
    window.addEventListener('pointerdown', hideTooltip, { capture: true, passive: true })
    window.addEventListener('scroll', handleWindowBlurOrScroll, { passive: true })
    window.addEventListener('blur', handleWindowBlurOrScroll)

    return () => {
      window.removeEventListener('pointerover', handlePointerOver, { capture: true })
      window.removeEventListener('pointermove', handlePointerMove, { capture: true })
      window.removeEventListener('pointerout', handlePointerOut, { capture: true })
      window.removeEventListener('pointerdown', hideTooltip, { capture: true })
      window.removeEventListener('scroll', handleWindowBlurOrScroll)
      window.removeEventListener('blur', handleWindowBlurOrScroll)
    }
  }, [])

  if (!tooltip.visible || !tooltip.text) return null

  // Calculate smart positioned coordinates so tooltip never goes off-screen
  const offsetDistanceX = 14
  const offsetDistanceY = 18

  let calculatedLeft = tooltip.x + offsetDistanceX
  let calculatedTop = tooltip.y + offsetDistanceY

  if (typeof window !== 'undefined') {
    const screenWidth = window.innerWidth || 1200
    const screenHeight = window.innerHeight || 800

    // Approximate width based on length, or element measurement
    const estWidth = Math.min(380, tooltip.text.length * 9.5 + 32)
    const estHeight = 42

    // Flip horizontally if close to right edge
    if (calculatedLeft + estWidth > screenWidth - 12) {
      calculatedLeft = Math.max(12, tooltip.x - estWidth - 10)
    }

    // Flip vertically if close to bottom edge
    if (calculatedTop + estHeight > screenHeight - 12) {
      calculatedTop = Math.max(12, tooltip.y - estHeight - 10)
    }
  }

  return (
    <div
      ref={tooltipRef}
      role="tooltip"
      style={{
        transform: `translate3d(${calculatedLeft}px, ${calculatedTop}px, 0)`,
        position: 'fixed',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        willChange: 'transform'
      }}
      className="no-print select-none transition-transform duration-75 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <div
        key={tooltip.warm ? 'warm' : tooltip.text}
        className="bg-neutral-900/95 text-neutral-50 text-xs font-medium px-2.5 py-1 rounded-md shadow-md border border-neutral-800 backdrop-blur-sm whitespace-nowrap leading-snug origin-center animate-reanimated-tooltip"
      >
        {tooltip.text}
      </div>
    </div>
  )
}
