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
    })
    return resp.json()
}
async function getCurrent() {
    const {access_token} = await getAccessToken()

    const resp = await fetch(`${current_url}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    })

    await resp.json().then(j => {
        fetch(j.item.album.images[0].url).then(res => {
            let writer = fs.createWriteStream("./playing.jpg")
            res.body.pipe(writer)
            writer.on('finish', () => {
                color.getColor("./playing.jpg").then(color => {
                    led(color)
                }).catch(err => console.log(err))
            })
        })
    })
}
getCurrent()

// colors :okayge:

const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => { const hex = x.toString(16); return hex.length === 1 ? '0' + hex : hex}).join('') // not stolen i swear

function led(color) {
    console.log(color)
}