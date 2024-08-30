import $ from "jquery"
import { SVG, PathArray } from '@svgdotjs/svg.js'

console.log("start")
console.log(SVG.PathArray)
console.log("end")

SVG.PathArray = PathArray

window.$ = $
window.jQuery = $
window.SVG = SVG
