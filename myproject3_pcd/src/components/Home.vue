<template>
  <div id="pointcloud_container"></div>
</template>

<script>

import {
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three/build/three.module.js'

import Stats from 'three/examples/jsm/libs/stats.module.js'

import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js'

// import Stats from '../js/stats.module.js'

export default {
  name: 'ThreeTest',
  data () {
    return {
      renderer: null,
      scene: null,
      camera: null,
      container: null,
      controls: null,
      stats: null
    }
  },
  methods: {

    init: function () {
      var self = this
      this.container = document.getElementById('pointcloud_container')

      this.scene = new Scene()
      this.scene.background = new Color(0x000000)
      this.camera = new PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.01, 40)
      this.camera.position.x = 0.4
      this.camera.position.z = -2
      this.camera.up.set(0, 0, 1)
      this.scene.add(this.camera)
      this.renderer = new WebGLRenderer({ antialias: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      document.body.appendChild(this.renderer.domElement)
      var loader = new PCDLoader()
      loader.load('https://github.com/mrdoob/three.js/blob/f1bac07f2214fea4ed3a2dad547c67401b1bfd50/examples/models/pcd/binary/Zaghetto.pcd?raw=true',
        function (points) {
          self.scene.add(points)
          var center = points.geometry.boundingSphere.center
          self.controls.target.set(center.x, center.y, center.z)
          self.controls.update()
        })

      this.container.appendChild(this.renderer.domElement)

      this.controls = new TrackballControls(this.camera, this.renderer.domElement)
      this.controls.rotateSpeed = 2.0
      this.controls.zoomSpeed = 0.3
      this.controls.panSpeed = 0.2
      this.controls.noZoom = false
      this.controls.noPan = false
      this.controls.staticMoving = true
      this.controls.dynamicDampingFactor = 0.3
      this.controls.minDistance = 0.3
      this.controls.maxDistance = 0.3 * 100

      this.stats = new Stats()
      this.container.appendChild(this.stats.dom)

      window.addEventListener('resize', this.onWindowResize, false)
      window.addEventListener('keypress', this.keyboard)
    },
    onWindowResize: function () {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.controls.handleResize()
    },
    keyboard: function (ev) {
      var points = this.scene.getObjectByName('simple.pcd')
      switch (ev.key || String.fromCharCode(ev.keyCode || ev.charCode)) {
        case '+':
          points.material.size *= 1.2
          points.material.needsUpdate = true
          break
        case '-':
          points.material.size /= 1.2
          points.material.needsUpdate = true
          break
        case 'c':
          points.material.color.setHex(Math.random() * 0xffffff)
          points.material.needsUpdate = true
          break
      }
    },
    animate: function () {
      requestAnimationFrame(this.animate)
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
      this.stats.update()
    }
  },
  mounted () {
    this.init()
    this.animate()
  }
}
</script>
