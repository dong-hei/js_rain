
# js_rain

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

//선언
const THUNDER_RATE = 0.007
let total
let rains = []
let drops = []
let thunder
let mouse = {x:0, y:0, isActive: false}


const randomBetween = (min,max) =>{
    return Math.floor(Math.random() * (max - min  +1) + min)
}


//빗줄기
class Rain{
    constructor(x, y, velocity){
        this.x = x
        this.y = y
        this.velocity = velocity
    }
    
    draw(){
        const { x,y, velocity } = this
        ctx.beginPath() // 그림그릴거라고 알린다.
        ctx.moveTo(x,y)
        ctx.lineTo(x + velocity.x * 2 , y + velocity.y * 2) // x,y 좌표로 라인을 그리겠다고 선언
        ctx.strokeStyle = '#8899a6' //스트로크 색상
        ctx.lineWidth = 1.5
        ctx.stroke() //그린다
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
//물방울 튀기기
class Drop{
    constructor(x, y, velocity){
        this.x = x
        this.y = y
        this.velocity = velocity
        this.gravity = 1.5
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, 1.5, 0 , Math.PI * 2) // 튀기는 원 그리기
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
        gradient.addColorStop(0, `rgba(66,84,99, ${this.opacity})`) //시작 색
        gradient.addColorStop(1, `rgba(18,23,27, ${this.opacity})`) //끝 색 
        ctx.fillStyle = gradient
        ctx.fillRect(0,0, innerWidth, innerHeight) //전체 배경식을 칠한다.
    }

    animate(){
        if (this.opacity < 0 ) return 
        this.opacity -= 0.005
        this.draw()
    }
}

//초기화 : 윈도우 리사이즈됐을때 캔버스의 가로세로 길이를 유동적으로 만들기위해서
function init(){
    canvas.width = innerWidth
    canvas.height = innerHeight
//캔버스 가로,세로 길이를 화면의 가로,세로길이에 대입한다.

    total = Math.floor(innerWidth * innerHeight / 15000)
    rains= []
    drops= []
    thunder = new Thunder()

    for (let i = 0; i < total; i++){
        const x = randomBetween(0, innerWidth)
        const y = randomBetween(0, innerHeight) //랜덤으로 떨어지게끔

        const velocity = {
            // x: randomBetween(-1, 1),
            y: randomBetween(13, 18)
        }

        rains.push(new Rain(x, y, velocity))
    }

}

//랜더
function render(){
    ctx.clearRect(0,0, canvas.width, canvas.height)
    if (Math.random() < THUNDER_RATE) thunder.opacity = 1
    thunder.animate()
    rains.forEach(rain => rain.animate())
    drops.forEach((drop,index)=> {
        drop.animate()
        if (drop.y > innerHeight) drops.splice(index,1 )}) //완전히 떨어지면 제거
    window.requestAnimationFrame(render)
    // 매 프레임마다 그리고 지움을 반복
}

//리사이즈 이벤트
window.addEventListener('resize', () => init())
canvas.addEventListener('mouseenter', () => mouse.isActive = true)
canvas.addEventListener('mouseleave', () => mouse.isActive = false)
canvas.addEventListener('mousemove',e => {
    mouse.x = e.clientX
    mouse.y = e.clientY
})

//api 날씨 데이터를 가져온다
function getWeatherData(){
    const lat = 37.532600 //위도
    const lon = 127.024612 //경도
    const appKey = 'appKey 홈페이지 참조'
    const data = axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appKey}`)
    return data
}

getWeatherData().then(res => {
    const currentWeather =res.data.weather[0].main
    console.log(currentWeather)
    const rainingStatus = ['Rain','Thunderstorm', 'Drizzle', 'Clear']
    // rain으로 선택시 비오는 날에만 동작
    if (rainingStatus.includes(currentWeather)){
        init()
        render()
    }
