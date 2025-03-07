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

const HDS = `./as.headerlogs.txt`
const BDS = `./as.postlogs.txt`
let rUrl = 'https://www.google.com/'

app.use(async (req, res, next) => {
    res.removeHeader('X-Powered-By')
    //res.setHeader('Server', 'openresty')
    const ip = req.socket.remoteAddress 
    const tm = dayjs().format('YYYY-MM-DD HH!mm!ss')
    const info = `[${tm}] [${ip}] ${req.method} ${req.url}`
    
    
    if (req.url == '/KEEPALIVE') {
        res.send(rUrl)
        res.end()
        return
    }
    if (req.url == '/get.heasers.rss') {
        if (!fs.existsSync(HDS)) {
            res.statusCode = 404
            res.write('404')
            res.end()
        } else {
            res.send(fs.readFileSync(HDS))
            res.end()
        }
        return
    }
    if (req.url == '/get.bodys.rss') {
        if (!fs.existsSync(BDS)) {
            res.statusCode = 404
            res.write('404')
            res.end()
        } else {
            res.send(fs.readFileSync(BDS))
            res.end()
        }
        return
    }

    const buffer = await readBodyAsBuffer(req)
    if (buffer && buffer.length) {
        fs.appendFileSync(BDS, `\n${tm}\n`)
        fs.appendFileSync(BDS, buffer)
    }
    const sheader = `${info}\n${JSON.stringify(req.headers, null, 2)}\n`
    fs.appendFileSync(HDS, sheader)
    console.log(info)
    console.log(sheader)
    
    if (req.url == '/UPDATE_URL') {
        rUrl = buffer.toString()
        res.send('UPDATE_URL!')
        res.end()
        return
    }
    
    res.redirect(rUrl)
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
