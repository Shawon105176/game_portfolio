import * as CANNON from 'cannon-es'

export class World {
    constructor() {
        this.setInstance()
        this.setMaterials()
        this.setContactMaterials()
    }

    setInstance() {
        this.instance = new CANNON.World()
        
        // Set gravity
        this.instance.gravity.set(0, -9.82, 0)
        
        // Set the broadphase algorithm
        this.instance.broadphase = new CANNON.NaiveBroadphase()
        
        // Set the solver
        this.instance.solver.iterations = 10
        this.instance.solver.tolerance = 0.0001
        
        // Allow sleeping
        this.instance.allowSleep = true
    }

    setMaterials() {
        // Default material
        this.defaultMaterial = new CANNON.Material('default')
        
        // Car material
        this.carMaterial = new CANNON.Material('car')
        
        // Ground material
        this.groundMaterial = new CANNON.Material('ground')
        
        // Obstacle material
        this.obstacleMaterial = new CANNON.Material('obstacle')
    }

    setContactMaterials() {
        // Car-Ground contact
        this.carGroundContactMaterial = new CANNON.ContactMaterial(
            this.carMaterial,
            this.groundMaterial,
            {
                friction: 0.8,
                restitution: 0.1
            }
        )
        this.instance.addContactMaterial(this.carGroundContactMaterial)

        // Car-Obstacle contact
        this.carObstacleContactMaterial = new CANNON.ContactMaterial(
            this.carMaterial,
            this.obstacleMaterial,
            {
                friction: 0.5,
                restitution: 0.5
            }
        )
        this.instance.addContactMaterial(this.carObstacleContactMaterial)

        // Default contact material
        this.defaultContactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: 0.4,
                restitution: 0.3
            }
        )
        this.instance.defaultContactMaterial = this.defaultContactMaterial
    }

    update(deltaTime) {
        this.instance.step(1 / 60, deltaTime / 1000, 3)
    }

    destroy() {
        this.instance.bodies.forEach(body => {
            this.instance.removeBody(body)
        })
    }
}
// 