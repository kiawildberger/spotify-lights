const { client_id, client_secret, refresh_token } = require("./config.json")
const fetch = require("node-fetch"), { stringify } = require("querystring"), fs = require("fs"), color = require("colorthief")

// stinky spotify auth *cough* nasty

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64')
const gettoken = 'https://accounts.spotify.com/api/token'
const current_url = 'https://api.spotify.com/v1/me/player/currently-playing'
async function getAccessToken() {
    const resp = await fetch(gettoken, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: stringify({
            grant_type: 'refresh_token',
            refresh_token,
        }),
    }).catch(err => console.log("bones > "+err))
    return resp.json()
}
async function getCurrent() {
    const {access_token} = await getAccessToken()

    const re = await fetch(`${current_url}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    }).catch(err => console.log("shit > "+err))

    try {
        await re.json().then(j => {
            fetch(j.item.album.images[0].url).then(res => {
                let writer = fs.createWriteStream("./playing.jpg")
                res.body.pipe(writer)
                writer.on('finish', () => {
                    color.getColor("./playing.jpg").then(color => {
                        led(color)
                        fs.unlinkSync("./playing.jpg")
                    }).catch(err => console.log(err))
                })
            }).catch(err => console.log(err))
        })
    } catch(err) { 
        console.log("not currently listening")
        led([255, 255, 255])
    }
}
getCurrent()

// colors :okayge:

const rgbToHex = rgb => '#' + rgb.map(x => { const hex = x.toString(16); return hex.length === 1 ? '0' + hex : hex}).join('') // not stolen i swear

function led(color) {
    console.log(rgbToHex(color))
}