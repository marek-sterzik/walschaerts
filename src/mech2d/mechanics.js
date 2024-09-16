import Body from "./body.js"

export default class Mechanics
{
    constructor()
    {
        this.maxIterations = 1000
        this.maxStableTrack = 0.0001
        this.immediateCommit = false
        this.bodies = {}
    }

    addBody = (body) => {
        this.bodies[body.getId()] = body
        return this
    }

    removeBody = (body) => {
        delete this.bodies[body.getId()]
    }

    solve = () => {
        var i = 0
        while (this.maxIterations === null || i < this.maxIterations) {
            if (this.iteration()) {
                break
            }
            i++
        }
        return i + 1
    }

    iteration = () => {
        var stable = true
        for (var bodyId in this.bodies) {
            var body = this.bodies[bodyId]
            body.move(this.immediateCommit)
            if (!body.stable(this.maxStableTrack)) {
                stable = false
            }
        }
        if (!this.immediateCommit) {
            for (var bodyId in this.bodies) {
                var body = this.bodies[bodyId]
                body.commitMove()
            }
        }
        return stable
    }
}
