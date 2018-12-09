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

export const generateRubon = () => {
	const rubons = createRubons()

	drawRubons(rubons)

	if( !isMobile() ) {
		$('#ribbon').css({'position': 'fixed'})
		setInterval(function(){
			$('#ribbon').css({
				'top' : -($(document).scrollTop() * 0.5)+"px"
			});
		}, 1)
	} else {
		const canvas = document.getElementsByTagName("canvas")[0]
    const img = canvas.toDataURL("image/png");

		$("body").css({
			"background-image": "url(" + img + ")",
			"-webkit-background-image": "url(" + img + ")",
			"background-repeat": "repeat",
		})

		$("#ribbon").hide()
	}
}
