import $ from "jquery"
import {SVG} from '@svgdotjs/svg.js'
import CalibratedMechanics from "./old/calibrated_mechanics.js"
import {Point, Vector, Angle, Transformation} from "./old/geometry.js"
import Geometry from "./old/geometry_object.js"
import TranslationMechanics from "./old/translation_mechanics.js"
import WheelModel from "./old/wheel_model.js"
import ValveGearView from "./old/view.js"

const exports = {SVG, $, jQuery: $, CalibratedMechanics, Point, Vector, Angle, Transformation, Geometry, TranslationMechanics, WheelModel, ValveGearView}

Object.assign(window, exports)
