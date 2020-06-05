import $ from "jquery"
import Masonry from "masonry-layout"

import Vue from "../node_modules/vue/dist/vue.js"
import {collaborators} from "./collaborators.js"
import {projects} from "./projects.js"
import {generateRubon} from "./rubon.js"

function refreshMasonery() {
	new Masonry("#masonry-grid")
}

generateRubon()

const app = new Vue({
	el: '#app',
	data: {
		"collaborators": collaborators,
		"projects": projects,
	},
	methods: {
		refresh: () => {
			// Everytime we load a new image, we re organize the grid
			refreshMasonery()
		}
	}
})
refreshMasonery()

$(document).ready(() => {
	// email mouse hover
	function uncrypt(elem){
	  elem.href=elem.href.replace(".at.","@");
	  elem.firstChild.data=elem.firstChild.data.replace(".at.","@");
	}

	const as=document.getElementsByTagName("a");
	for(var i=0;i<as.length;i++){
		if(as[i].href.substring(0,7)==="mailto:"){
			as[i].onmouseover=function(event){uncrypt(this);this.onfocus=null;this.onmouseover=null;};
			as[i].onfocus=function(event){uncrypt(this);this.onfocus=null;this.onmouseover=null;};
		}
	}
})


document.addEventListener('DOMContentLoaded', function() {
	var elems = document.querySelectorAll('.sidenav');
	var instances = M.Sidenav.init(elems);

	var elems = document.querySelectorAll('.materialboxed');
	var instances = M.Materialbox.init(elems, {
		onOpenStart: (element) => {
			if($(element).is("video")) {
				element.play()
			}
		},
		onCloseStart: (element) => {
			if($(element).is("video")) {
				element.pause()
			}
		},
	});
});
