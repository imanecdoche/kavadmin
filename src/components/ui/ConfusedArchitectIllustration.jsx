import React from 'react'

/**
 * 👷 Confused Architect / Construction Illustration (Flat Vector)
 * Ilustrasi orang memakai helm proyek memegang lembaran blueprint dengan ekspresi bingung.
 * Cocok digunakan untuk: Empty State, Halaman Dalam Pengembangan (Under Construction),
 * Error 404, atau State Not Found.
 */
export const ConfusedArchitectIllustration = ({
  className = '',
  size = 280,
  alt = 'Ilustrasi arsitek memegang blueprint dengan ekspresi bingung',
  ...props
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      <img
        src="/illustrations/confused-architect.svg"
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
        loading="lazy"
        draggable={false}
      />
    </div>
  )
}

export default ConfusedArchitectIllustration
