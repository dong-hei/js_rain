const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const THUNDER_RATE = 0.007
let total
let rains = []
let drops = []
let thunder
let mouse = {x:0, y:0, isActive: false}

const randomBetween = (min,max) =>{
    return Math.floor(Math.random() * (max - min  +1) + min)
}

class Rain{
    constructor(x, y, velocity){
        this.x = x
        this.y = y
        this.velocity = velocity
    }

    draw(){
        const { x,y, velocity } = this
        ctx.beginPath() 
        ctx.moveTo(x,y)
        ctx.lineTo(x + velocity.x * 2 , y + velocity.y * 2) 
        ctx.strokeStyle = '#8899a6'
        ctx.lineWidth = 1.5
        ctx.stroke()
    }

    splash(){
        for (let i = 0; i < 3 ; i++){
            const velocity = {
                x: -this.velocity.x + randomBetween(-10, -3),
                y: -this.velocity.y + randomBetween(15, 3)

            }
            drops.push(new Drop(this.x, innerHeight, velocity))
        }
    }

    animate(){
        if (this.y > innerHeight){
            this.splash()
            this.x = randomBetween(-innerWidth * 0.2, innerWidth * 1.5)
            this.y = -20
        }
        this.velocity.x = mouse.isActive
        ? randomBetween(-1, 1) + (-innerWidth /2 + mouse.x) / 55
        : randomBetween(-1, 1)

        this.x += this.velocity.x
        this.y += this.velocity.y

        this.draw()
    }

}

class Drop{
    constructor(x, y, velocity){
        this.x = x
        this.y = y
        this.velocity = velocity
        this.gravity = 1.5
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, 1.5, 0 , Math.PI * 2)
        ctx.fillStyle = '#8899a6'
        ctx.fill()
    }

   

    animate(){
        this.velocity.y += this.gravity
        this.x += this.velocity.x
        this.y += this.velocity.y

        this.draw()
    }

   
}

class Thunder{
    constructor(){
        this.opacity = 0
    }

    draw(){
        const gradient = ctx.createLinearGradient(0,0,0, innerHeight)
        gradient.addColorStop(0, `rgba(66,84,99, ${this.opacity})`) 
        gradient.addColorStop(1, `rgba(18,23,27, ${this.opacity})`)
        ctx.fillStyle = gradient
        ctx.fillRect(0,0, innerWidth, innerHeight) 
    }

    animate(){
        if (this.opacity < 0 ) return 
        this.opacity -= 0.005
        this.draw()
    }
}

function init(){
    canvas.width = innerWidth
    canvas.height = innerHeight

    total = Math.floor(innerWidth * innerHeight / 15000)
    rains= []
    drops= []
    thunder = new Thunder()

    for (let i = 0; i < total; i++){
        const x = randomBetween(0, innerWidth)
        const y = randomBetween(0, innerHeight) 

        const velocity = {
            y: randomBetween(13, 18)
        }

        rains.push(new Rain(x, y, velocity))
    }

}

function render(){
    ctx.clearRect(0,0, canvas.width, canvas.height)
    if (Math.random() < THUNDER_RATE) thunder.opacity = 1
    thunder.animate()
    rains.forEach(rain => rain.animate())
    drops.forEach((drop,index)=> {
        drop.animate()
        if (drop.y > innerHeight) drops.splice(index,1 )}) //완전히 떨어지면 제거
    window.requestAnimationFrame(render)
}

window.addEventListener('resize', () => init())
canvas.addEventListener('mouseenter', () => mouse.isActive = true)
canvas.addEventListener('mouseleave', () => mouse.isActive = false)
canvas.addEventListener('mousemove',e => {
    mouse.x = e.clientX
    mouse.y = e.clientY
})


function getWeatherData(){
    const lat = 37.532600
    const lon = 127.024612
    const appKey = '307cedd58b0d9287f330f6bbe4e51678'
    const data = axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appKey}`)
    return data
}

getWeatherData().then(res => {
    const currentWeather =res.data.weather[0].main
    console.log(currentWeather)
    const rainingStatus = ['Rain','Thunderstorm', 'Drizzle', 'Clear']
    if (rainingStatus.includes(currentWeather)){
        init()
        render()
    }
})
