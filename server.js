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


let rUrl = 'https://www.google.com/'

app.use(async (req, res, next) => {
    //res.removeHeader('X-Powered-By')
    //res.setHeader('Server', 'openresty')
    const ip = req.socket.remoteAddress 
    const tm = dayjs().format('YYYY-MM-DD HH!mm!ss')
    const info = `[${tm}] [${ip}] ${req.method} ${req.url}`
    
    if (req.url == '/KEEPALIVE') {
        res.send(rUrl)
        res.end()
        return
    }

    const buffer = await readBodyAsBuffer(req)
    if (buffer && buffer.length) {
        fs.appendFileSync(`./as.postlogs.txt`, `\n${tm}\n`)
        fs.appendFileSync(`./as.postlogs.txt`, buffer)
    }
    fs.appendFileSync(`./as.headerlogs.txt`, `${info}\n${JSON.stringify(req.headers, null, 2)}\n`)
    console.log(info)
    if (req.method == 'POST' && req.url != '/UPDATE_URL') {
        rUrl = buffer.toString()
        res.send('Done!')
        res.end()
    } else {
        res.redirect(rUrl)
    }
    
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
