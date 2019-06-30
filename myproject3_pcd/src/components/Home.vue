<template>
  <div id="pointcloud_container"></div>
</template>

<script>

// import * as THREE from 'three/build/three.module.js'

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
      cube: null,
      renderer: null,
      scene: null,
      camera: null
    }
  },
  methods: {

    init: function () {
      // var stats
      var stats
      var camera, controls, scene, renderer

      let container = document.getElementById('pointcloud_container')

      scene = new Scene()
      scene.background = new Color(0x000000)
      camera = new PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.01, 40)
      camera.position.x = 0.4
      camera.position.z = -2
      camera.up.set(0, 0, 1)
      scene.add(camera)
      renderer = new WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      document.body.appendChild(renderer.domElement)
      var loader = new PCDLoader()
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/4b18dbe78bec6067cd98e66539efe1b157f5635f/examples/models/pcd/ascii/simple.pcd', function (points) {
        scene.add(points)
        var center = points.geometry.boundingSphere.center
        controls.target.set(center.x, center.y, center.z)
        controls.update()
      })
      // container = document.createElement('div')
      // document.body.appendChild(container)
      container.appendChild(renderer.domElement)
      controls = new TrackballControls(camera, renderer.domElement)
      controls.rotateSpeed = 2.0
      controls.zoomSpeed = 0.3
      controls.panSpeed = 0.2
      controls.noZoom = false
      controls.noPan = false
      controls.staticMoving = true
      controls.dynamicDampingFactor = 0.3
      controls.minDistance = 0.3
      controls.maxDistance = 0.3 * 100
      stats = new Stats()
      container.appendChild(stats.dom)
      // window.addEventListener('resize', onWindowResize, false)
      // window.addEventListener('keypress', keyboard)

      // container.appendChild(renderer.domElement)
    },
    animate: function () {
      // requestAnimationFrame(animate)
      // controls.update()
      // renderer.render(scene, camera)
      // stats.update()
    }
  },
  mounted () {
    this.init()
    this.animate()
  }
}
</script>
