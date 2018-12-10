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
	const pr = window.devicePixelRatio || 1
	const w = window.innerWidth

	const canvasWidth = w*pr
	const h = window.innerHeight

	return {
		width: w,
		height: h,
	}
}

class Rubon {
	constructor(initialOffset = 0, color = 0) {
		this.color = color

		this.initialOffset = initialOffset

		const {width, height, context} = initCanvas()

		this.generatePointsAndColors(width, height)

		this.offsetY = 0
	}

	getNextY(j) {
		const halfDisplayHeight = 4.0
		return (((j.y + random()) % 1.0) / halfDisplayHeight) - this.initialOffset
	}

	generatePointAndColor(points, height) {
		const i = points[points.length - 2]
		const j = points[points.length - 1]

		const nextX = j.x + (random() * 0.08)
		const nextY = this.getNextY(j)

		this.color -= (Math.PI*2) / -50
		this.colors.push({
			r: (Math.cos(this.color) + 1) / 2,
			g: (Math.cos(this.color+(Math.PI*2)/3) + 1) / 2,
			b: (Math.cos(this.color+Math.PI*2/3*2) + 1) / 2,
		})

		points.push({
			x:nextX,
			y:nextY
		})
	}

	generatePointsAndColors(width, height) {
		this.points = [
			{x: 0, y:  0.1 - this.initialOffset},
			{x: 0, y: -0.1 - this.initialOffset},
		]
		this.colors = []

		while (this.points[this.points.length - 1].x < 1.0) {
			this.generatePointAndColor(this.points, height)
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

	const numberOfRubon = 20
	let color = 0.2 // 0.2 because chrome blue instead of pink
	for (let i=0; i < numberOfRubon; i += 1) {
		rubons.push(new Rubon(i * 0.9, color))
		color = rubons[rubons.length - 1].color
	}

	return rubons
}

const fshader = `
precision mediump float;
varying vec3 v_color;

void main(void) {
	gl_FragColor = vec4(v_color,  0.5);
}
`

const vshader = `
attribute vec4 position;
attribute vec3 color;
uniform float scrollOffset;
varying vec3 v_color;

void main(void) {
	// *2 -1 [-1,1] and not [0,1]
	vec2 newPos = position.xy * 2.0 - 1.0;
	newPos.y += position.z + scrollOffset;
	v_color = color;

	gl_Position = vec4(newPos, 0.0, 1.0);
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
  shader_prog.color = gl.getAttribLocation(shader_prog, "color")
  gl.enableVertexAttribArray(shader_prog.color)

  shader_prog.scrollOffset = gl.getUniformLocation(shader_prog, "scrollOffset");

  return shader_prog
}

const initBuffers = (gl, rubon) => {
  const triangleVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer)

  const vertices = []
  const colors = []
	for (let i=0;i<rubon.points.length-2;i+=1) {
		vertices.push(rubon.points[i].x)
		vertices.push(rubon.points[i].y)
		vertices.push(rubon.initialOffset)

		vertices.push(rubon.points[i + 1].x)
		vertices.push(rubon.points[i + 1].y)
		vertices.push(rubon.initialOffset)

		vertices.push(rubon.points[i + 2].x)
		vertices.push(rubon.points[i + 2].y)
		vertices.push(rubon.initialOffset)

		for(let j=0;j<3;j++) {
			colors.push(rubon.colors[i].r)
			colors.push(rubon.colors[i].g)
			colors.push(rubon.colors[i].b)
		}
	}

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
  triangleVertexPositionBuffer.itemSize = 3;
  triangleVertexPositionBuffer.numItems = vertices.length / 3;

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
	colorBuffer.itemSize = 3
  colorBuffer.numItems = colors.length / 3;

  return {
		position: triangleVertexPositionBuffer,
		color: colorBuffer,
	}
}

const drawScene = (gl, buffers, shader_prog) => {
	const backgroundColor = 238/255
	gl.clearColor(backgroundColor,backgroundColor,backgroundColor,1.0)
	gl.clear(gl.COLOR_BUFFER_BIT)
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

	buffers.forEach((buffer) => {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position)
		gl.vertexAttribPointer(shader_prog.positionLocation, buffer.position.itemSize, gl.FLOAT, false, 0, 0)

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer.color)
		gl.vertexAttribPointer(shader_prog.color, buffer.color.itemSize, gl.FLOAT, false, 0, 0)

		const scrollValue = $(document).scrollTop() / document.documentElement.clientHeight / 2
		gl.uniform1f (shader_prog.scrollOffset, scrollValue)

		gl.drawArrays(gl.TRIANGLES, 0, buffer.position.numItems)
	})
}

export const generateRubon = () => {
	const rubons = createRubons()

  var canvas = document.getElementById("ribbon")
	const gl = canvas.getContext("webgl", {
		antialias: true,
	})


	if (!gl) {
		console.error("webgl is note available!!")
	}

	canvas.width = gl.viewportWidth = window.innerWidth
	canvas.height = gl.viewportHeight = window.innerHeight

	const shader_prog = initShaders(gl)
	const buffers = rubons.map((rubon) => initBuffers(gl, rubon))

	gl.enable(gl.BLEND)
	gl.viewport(0,0, gl.viewportWidth, gl.viewportHeight)

	let oldScroll = -199
	setInterval(function(){
		const newScroll = $(document).scrollTop()
		if (oldScroll != newScroll) {
			drawScene(gl, buffers, shader_prog)
			oldScroll = newScroll
		}
	}, 1)

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
