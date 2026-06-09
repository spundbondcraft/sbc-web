'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { getDeviceCapability, PARTICLE_COUNT } from '@/lib/utils/deviceDetect'

export function ParticleField() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const capability = getDeviceCapability()
    const count = PARTICLE_COUNT[capability]

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, el.clientWidth / el.clientHeight, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    // Particles
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const velocities: number[] = []

    const greenColor = new THREE.Color('#7AB611')
    const orangeColor = new THREE.Color('#E8470A')

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5

      const useGreen = Math.random() > 0.3
      const color = useGreen ? greenColor : orangeColor
      const opacity = 0.15 + Math.random() * 0.25
      colors[i * 3] = color.r * opacity
      colors[i * 3 + 1] = color.g * opacity
      colors[i * 3 + 2] = color.b * opacity

      velocities.push(
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.001,
        0
      )
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Mouse repulsion (desktop only)
    const mouse = new THREE.Vector2(9999, 9999)
    const REPULSION_RADIUS = capability === 'desktop' ? 1.5 : 0
    const originalPositions = positions.slice()

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    if (capability === 'desktop') window.addEventListener('mousemove', onMouseMove)

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const pos = geometry.attributes.position.array as Float32Array

      for (let i = 0; i < count; i++) {
        const ix = i * 3, iy = i * 3 + 1

        // Drift
        pos[ix] += velocities[i * 3]
        pos[iy] += velocities[i * 3 + 1]

        // Wrap
        if (pos[ix] > 10) pos[ix] = -10
        if (pos[ix] < -10) pos[ix] = 10
        if (pos[iy] > 5) pos[iy] = -5
        if (pos[iy] < -5) pos[iy] = 5

        // Repulsion
        if (REPULSION_RADIUS > 0) {
          const wx = mouse.x * 10
          const wy = mouse.y * 5
          const dx = pos[ix] - wx
          const dy = pos[iy] - wy
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < REPULSION_RADIUS && dist > 0) {
            const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS
            pos[ix] += (dx / dist) * force * 0.05
            pos[iy] += (dy / dist) * force * 0.05
          }
        }
      }

      geometry.attributes.position.needsUpdate = true
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  )
}
