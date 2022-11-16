const express = require('express')
const dayjs = require('dayjs')
const fs = require('fs')
const app = express()
const port = process.env.PORT || 3000

readBodyAsBuffer = async (req) => {
    return new Promise((resolve, reject) => {
        let buffer = Buffer.alloc(0)
        req.setEncoding(null)
        req.on(
            "data",
            (chunk) => (buffer = Buffer.concat([buffer, Buffer.from(chunk)]))
        )
        req.on("end", () => resolve(buffer))
        req.on("error", reject)
    })
}


if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data')
}



app.use(async (req, res, next) => {
    res.removeHeader('X-Powered-By')
    res.setHeader('Server', 'openresty')
    const ip = req.socket.remoteAddress 
    const tm = dayjs().format('YYYY-MM-DD HH!mm!ss')
    const info = `[${tm}] [${ip}] ${req.method} ${req.url}`

    const buffer = await readBodyAsBuffer(req)
    if (buffer && buffer.length) {
        fs.writeFileSync(`./data/${tm}.txt`, buffer)
    }
    fs.writeFileSync(`./data/header.${tm}.txt`, `${info}\n${JSON.stringify(req.headers, null, 2)}`)
    console.log(info)
    res.redirect('https://www.google.com/')
    //next()
})
app.all('/', (req, res) => {
    res.send('Hello World!')
})
app.use((req, res) => {
    res.statusCode = 400
    res.write('Bad Request')
    res.end()
})
//app.listen(port, '0.0.0.0', () => {
app.listen(port, () => {    
    console.log(`Example app listening on port ${port}`)
})
