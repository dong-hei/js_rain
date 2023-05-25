# js_rain 

선언
<br></br>
const THUNDER_RATE = 0.007<br></br>
let total<br></br>
let rains = []<br></br>
let drops = []<br></br>
let thunder<br></br>
let mouse = {x:0, y:0, isActive: false}<br></br>
const randomBetween = (min,max) =>{
    return Math.floor(Math.random() * (max - min  +1) + min)
}
<br></br>

빗줄기
<br></br>class Rain{
<br></br>constructor(x, y, velocity){
        this.x = x
        this.y = y
        this.velocity = velocity
    }
<br></br>

빗줄기 그리기
<br></br> draw(){
<br></br>     const { x,y, velocity } = this
<br></br>     ctx.beginPath() // 그림그릴거라고 알린다.
<br></br>    ctx.moveTo(x,y)
<br></br>     ctx.lineTo(x + velocity.x * 2 , y + velocity.y * 2) // x,y 좌표로 라인을 그리겠다고 선언
<br></br>     ctx.strokeStyle = '#8899a6' //스트로크 색상
<br></br>     ctx.lineWidth = 1.5
<br></br>    ctx.stroke() //그린다
    }

떨어지는 위치 루프
<br></br>  splash(){
        for (let i = 0; i < 3 ; i++){
            const velocity = {
                x: -this.velocity.x + randomBetween(-10, -3),
                y: -this.velocity.y + randomBetween(15, 3)

            }
            drops.push(new Drop(this.x, innerHeight, velocity))
        }
    }
<br></br>

떨어지는 속도 조정
<br></br> animate(){
<br></br>  if (this.y > innerHeight){
            this.splash()
            this.x = randomBetween(-innerWidth * 0.2, innerWidth * 1.5)
            this.y = -20
        }
<br></br>     this.velocity.x = mouse.isActive
        ? randomBetween(-1, 1) + (-innerWidth /2 + mouse.x) / 55
        : randomBetween(-1, 1)

        this.x += this.velocity.x
        this.y += this.velocity.y

        this.draw()
    }

}
<br></br>

물방울 튀기기
<br></br>class Drop{
<br></br> constructor(x, y, velocity){
        this.x = x
        this.y = y
        this.velocity = velocity
        this.gravity = 1.5
    }
<br></br>
물방울 그리기
<br></br>   draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, 1.5, 0 , Math.PI * 2) // 튀기는 원 그리기
        ctx.fillStyle = '#8899a6'
        ctx.fill()
    }

<br></br>
물방울 떨어지는 위치 조정
<br></br>  animate(){
        this.velocity.y += this.gravity
        this.x += this.velocity.x
        this.y += this.velocity.y

        this.draw()
    }

   
}
<br></br>
번개
<br></br>class Thunder{
    constructor(){
        this.opacity = 0
    }
   
   <br></br>
번개 위치
 <br></br>   draw(){
        const gradient = ctx.createLinearGradient(0,0,0, innerHeight)
        gradient.addColorStop(0, `rgba(66,84,99, ${this.opacity})`) //시작 색
        gradient.addColorStop(1, `rgba(18,23,27, ${this.opacity})`) //끝 색 
        ctx.fillStyle = gradient
        ctx.fillRect(0,0, innerWidth, innerHeight) //전체 배경식을 칠한다.
    }

<br></br>
번개 투명도
<br></br>   animate(){
        if (this.opacity < 0 ) return 
        this.opacity -= 0.005
        this.draw()
    }
}

<br></br>
초기화 : 윈도우 리사이즈됐을때 캔버스의 가로세로 길이를 유동적으로 만들기위해서
<br></br>function init(){
    canvas.width = innerWidth
    canvas.height = innerHeight
캔버스 가로,세로 길이를 화면의 가로,세로길이에 대입한다.
    total = Math.floor(innerWidth * innerHeight / 15000)
    rains= []
    drops= []
    thunder = new Thunder()

<br></br>
<br></br>번개 랜덤으로 떨어지게끔
    for (let i = 0; i < total; i++){
        const x = randomBetween(0, innerWidth)
        const y = randomBetween(0, innerHeight) 
   
   <br></br>
<br></br>속도 조정
        const velocity = {
            // x: randomBetween(-1, 1),
            y: randomBetween(13, 18)
        }rains.push(new Rain(x, y, velocity))
    }

}

<br></br>
랜더
<br></br>function render(){
    ctx.clearRect(0,0, canvas.width, canvas.height)
    if (Math.random() < THUNDER_RATE) thunder.opacity = 1
    thunder.animate()
    rains.forEach(rain => rain.animate())
    drops.forEach((drop,index)=> {
        drop.animate()
        if (drop.y > innerHeight) drops.splice(index,1 )}) 완전히 떨어지면 제거
    window.requestAnimationFrame(render)
    매 프레임마다 그리고 지움을 반복
}

<br></br>
<br></br>리사이즈 이벤트
window.addEventListener('resize', () => init())
canvas.addEventListener('mouseenter', () => mouse.isActive = true)
canvas.addEventListener('mouseleave', () => mouse.isActive = false)
canvas.addEventListener('mousemove',e => {
    mouse.x = e.clientX
    mouse.y = e.clientY
})
<br></br>
api 날씨 데이터를 가져온다
<br></br>function getWeatherData(){
    const lat = 37.532600 //위도
    const lon = 127.024612 //경도
    const appKey = 'appKey 홈페이지 참조'
    const data = axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appKey}`)
    return data
}

<br></br>
getWeatherData().then(res => {
<br></br>  const currentWeather =res.data.weather[0].main
    console.log(currentWeather)
    const rainingStatus = ['Rain','Thunderstorm', 'Drizzle', 'Clear'] rain으로 선택시 비오는 날에만 동작
    if (rainingStatus.includes(currentWeather)){
        init()
        render()
    }
