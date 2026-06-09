'use client'

export type DeviceCapability = 'desktop' | 'low-end' | 'mobile'

export function getDeviceCapability(): DeviceCapability {
  if (typeof window === 'undefined') return 'desktop'
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const isLowEnd = navigator.hardwareConcurrency <= 4
  if (isMobile) return 'mobile'
  if (isLowEnd) return 'low-end'
  return 'desktop'
}

export const PARTICLE_COUNT: Record<DeviceCapability, number> = {
  desktop: 150,
  'low-end': 80,
  mobile: 30,
}
