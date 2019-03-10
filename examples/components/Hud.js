import React, { useState, useRef, useContext, useEffect, useCallback, useMemo } from 'react'
import { apply, Canvas, useRender, useThree } from 'react-three-fiber'
import { OrbitControls } from '../resources/controls/OrbitControls'
import { EffectComposer } from './../resources/postprocessing/EffectComposer'
import { ShaderPass } from './../resources/postprocessing/ShaderPass'
import { RenderPass } from './../resources/postprocessing/RenderPass'
import { WaterPass } from './../resources/postprocessing/WaterPass'
import { FXAAShader } from './../resources/shaders/FXAAShader'
apply({ OrbitControls, EffectComposer, ShaderPass, RenderPass, WaterPass })

function Main({ camera }) {
  const scene = useRef()
  const composer = useRef()
  const { gl, size } = useThree()
  useEffect(() => void composer.current.obj.setSize(size.width, size.height), [size])
  useRender(({ gl }) => void ((gl.autoClear = true), composer.current.obj.render()), true)
  return (
    <scene ref={scene}>
      <effectComposer ref={composer} args={[gl]}>
        {scene.current && (
          <>
            <renderPass name="passes" args={[scene.current, camera]} />
            <waterPass name="passes" factor={1} />
            <shaderPass
              name="passes"
              args={[FXAAShader]}
              material-uniforms-resolution-value-x={1 / size.width}
              material-uniforms-resolution-value-y={1 / size.height}
              renderToScreen
            />
          </>
        )}
      </effectComposer>
      <ambientLight />
      <spotLight position={[100, 10, 10]} />
      <mesh>
        <boxBufferGeometry name="geometry" args={[2, 2, 2]} />
        <meshStandardMaterial name="material" color="lightgreen" />
      </mesh>
    </scene>
  )
}

function Hud({ camera }) {
  const scene = useRef()
  useRender(({ gl }) => void ((gl.autoClear = false), gl.clearDepth(), gl.render(scene.current, camera)))
  const [hovered, set] = useState(false)
  const hover = useCallback(() => set(true), [])
  const unhover = useCallback(() => set(false), [])
  return (
    <scene ref={scene}>
      <mesh onHover={hover} onUnhover={unhover}>
        <sphereBufferGeometry name="geometry" args={[0.5, 64, 64]} />
        <meshBasicMaterial name="material" color={hovered ? 'hotpink' : 'black'} />
      </mesh>
    </scene>
  )
}

function Content() {
  const camera = useRef()
  const controls = useRef()
  const { size, setDefaultCamera } = useThree()
  useEffect(() => void setDefaultCamera(camera.current), [])
  useRender(() => controls.current.obj.update())
  return (
    <>
      <perspectiveCamera
        ref={camera}
        aspect={size.width / size.height}
        radius={(size.width + size.height) / 4}
        fov={55}
        position={[0, 0, 5]}
        onUpdate={self => self.updateProjectionMatrix()}
      />
      {camera.current && (
        <group>
          <orbitControls ref={controls} args={[camera.current]} enableDamping dampingFactor={0.1} rotateSpeed={0.1} />
          <Main camera={camera.current} />
          <Hud camera={camera.current} />
        </group>
      )}
    </>
  )
}

export default function App() {
  return (
    <Canvas style={{ background: '#272727' }}>
      <Content />
    </Canvas>
  )
}