import $ from "jquery"
import Masonry from "masonry-layout"

import Vue from "../node_modules/vue/dist/vue.js"
import {collaborators} from "./collaborators.js"
import {projects} from "./projects.js"
import {generateRubon} from "./rubon.js"

const app = new Vue({
  el: '#app',
  data: {
    "collaborators": collaborators,
    "projects": projects,
  },
})

$(document).ready(() => {
	// email mouse hover
	function uncrypt(elem){
    elem.href=elem.href.replace(".at.","@");
    elem.firstChild.data=elem.firstChild.data.replace(".at.","@");
  }

  var as=document.getElementsByTagName("a");
  for(var i=0;i<as.length;i++){
    if(as[i].href.substring(0,7)==="mailto:"){
      as[i].onmouseover=function(event){uncrypt(this);this.onfocus=null;this.onmouseover=null;};
      as[i].onfocus=function(event){uncrypt(this);this.onfocus=null;this.onmouseover=null;};
    }
	}

	// Sort correctly the grid and wait until all image are loaded
	let counter = 0
	const masoneryInterval = setInterval(() =>{
		generateRubon()
		new Masonry("#masonry-grid")
		counter += 1

		if (counter > 30) {
			clearInterval(masoneryInterval)
		}
	}, 200);
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
