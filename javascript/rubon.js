/* inspired from https://codepen.io/Ticolyle/pen/lsbqv */
import $ from "jquery"

const isMobile = () => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}


const originalSeed = Math.random()
let seed = originalSeed
const random = () => {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

const initCanvas = () => {
	const canvas = document.getElementsByTagName('canvas')[0]
	const context = canvas.getContext('2d')

	const pr = window.devicePixelRatio || 1
	const w = window.innerWidth

	canvas.width = w*pr
	let h = 0
	if (isMobile()) {
		h = 1000 * pr
		canvas.height = h
		h = window.innerHeight
	} else {
		h = window.innerHeight
		canvas.height = document.documentElement.scrollHeight * pr
	}

	context.scale(pr, pr)
	context.globalAlpha = 0.6

	context.clearRect(0, 0, w, h)

	return {
		width: w,
		height: h,
		context: context,
	}
}

class Rubon {
	constructor(initialOffset = 0, color = 0) {
		this.color = color

		this.initialOffset = initialOffset

		const {width, height, context} = initCanvas()
		this.context = context

		this.generatePointsAndColors(width, height)

		this.offsetY = 0
	}

	nextPoint(p, height) {
		const t =  p + (random()*2-1.1)*90

		if (t > height || t < 0) {
			return this.nextPoint(p)
		} else {
			return t
		}
	}

	generatePointAndColor(points, height) {
		const i = points[points.length - 2]
		const j = points[points.length - 1]

		const k = j.x + (random()*2-0.25)*90
		const n = this.nextPoint(j.y, height)

		this.color -= (Math.PI*2) / -50
		this.colors.push((
			Math.cos(this.color)*127+128<<16 |
			Math.cos(this.color+(Math.PI*2)/3)*127+128<<8 |
			Math.cos(this.color+Math.PI*2/3*2)*127+128
		).toString(16))

		points.push({
			x:k,
			y:n
		})
	}

	generatePointsAndColors(width, height) {
		let initialPointSize = isMobile() ? 30 : 90
		height = isMobile() ? height/2 : height

		this.points = [
			{x: 0, y: (height * .7 + initialPointSize) + this.initialOffset},
			{x: 0, y: (height * .7 - initialPointSize) + this.initialOffset},
		]
		this.colors = []

		while (this.points[this.points.length - 1].x < width + 90) {
			this.generatePointAndColor(this.points, height)
		}
	}

	draw() {
		for (let idx = 0; idx < this.colors.length; idx += 1) {
			const i = this.points[idx]
			const j = this.points[idx + 1]
			const k = this.points[idx + 2]

			this.context.beginPath()
			this.context.moveTo(i.x, i.y)
			this.context.lineTo(j.x, j.y)
			this.context.lineTo(k.x, k.y)
			this.context.closePath()

			this.context.fillStyle = "#" + this.colors[idx]
			this.context.fill()
		}
	}

	movePoints(diff) {
		this.points = this.points.map((point) => {return {x: point.x, y: point.y + diff}})
	}
}

const drawRubons = (rubons) => {
	initCanvas()

	rubons.forEach((rubon) => {
		rubon.draw()
	})
}

const createRubons = () => {
	const rubons = []
	seed = originalSeed

	const deltaBetweenRubons = (isMobile() ? 600 : 800)
	const numberOfRubon = 20
	let color = 0.2 // 0.2 because chrome blue instead of pink
	for (let i=0; i < numberOfRubon; i += 1) {
		rubons.push(new Rubon(i * deltaBetweenRubons, color))
		color = rubons[rubons.length - 1].color
	}

	return rubons
}

const fshader = `
precision mediump float;
void main(void) {
  gl_FragColor = vec4(0.9, 0.3, 0.6, 1.0);
}
`

const vshader = `
attribute vec3 position;

void main(void) {
  gl_Position = vec4(position, 1.0);
}
`

const createShader = (gl, sourceCode, type) => {
  const shader = gl.createShader( type )
  gl.shaderSource( shader, sourceCode )
  gl.compileShader( shader )

  if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
    const info = gl.getShaderInfoLog( shader )
    throw 'Could not compile WebGL program. \n\n' + info
  }
  return shader
}

const initShaders = (gl) => {
  const fragmentShader = createShader(gl, fshader, gl.FRAGMENT_SHADER)
  const vertexShader = createShader(gl, vshader, gl.VERTEX_SHADER)

  const shader_prog = gl.createProgram()
  gl.attachShader(shader_prog, vertexShader)
  gl.attachShader(shader_prog, fragmentShader)
  gl.linkProgram(shader_prog)

  if (!gl.getProgramParameter(shader_prog, gl.LINK_STATUS)) {
    console.error("Could not initialise shaders")
  }

  gl.useProgram(shader_prog)

  shader_prog.positionLocation = gl.getAttribLocation(shader_prog, "position")
  gl.enableVertexAttribArray(shader_prog.positionLocation)

  return shader_prog
}

const initBuffers = (gl) => {
  const triangleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer)
  const vertices = [
     0.0,  1.0,  0.0,
    -1.0, -1.0,  0.0,
     1.0, -1.0,  0.0,
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  triangleVertexPositionBuffer.itemSize = 3;
  triangleVertexPositionBuffer.numItems = 3;

  return triangleVertexPositionBuffer
}

const drawScene = (gl, triangleVertexPositionBuffer, shader_prog) => {
  gl.viewport(0,0, gl.viewportWidth, gl.viewportHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer)
  gl.vertexAttribPointer(shader_prog.positionLocation, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)

  gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems)
}

export const generateRubon = () => {
  var canvas = document.getElementById("ribbon")
  const gl = canvas.getContext("webgl")

  if (!gl) {
    console.alert("webgl is note available!!")
  }
  gl.viewportWidth = canvas.width
  gl.viewportHeight = canvas.height
  const shader_prog = initShaders(gl)
  const triangleVertexPositionBuffer = initBuffers(gl)
  gl.clearColor(0,0,0,1)
  gl.enable(gl.DEPTH_TEST)

  drawScene(gl, triangleVertexPositionBuffer, shader_prog)
	// const rubons = createRubons()

	// drawRubons(rubons)

	// if( !isMobile() ) {
	// 	$('#ribbon').css({'position': 'fixed'})
	// 	setInterval(function(){
	// 		$('#ribbon').css({
	// 			'top' : -($(document).scrollTop() * 0.5)+"px"
	// 		});
	// 	}, 1)
	// } else {
	// 	const canvas = document.getElementsByTagName("canvas")[0]
  //   const img = canvas.toDataURL("image/png");

	// 	$("body").css({
	// 		"background-image": "url(" + img + ")",
	// 		"-webkit-background-image": "url(" + img + ")",
	// 		"background-repeat": "repeat",
	// 	})

	// 	$("#ribbon").hide()
	// }
}
