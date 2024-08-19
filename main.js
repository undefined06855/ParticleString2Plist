let mappings = -1
const NO_INPUT_PLACEHOLDER = "Awaiting input..."

// i wouldve used a library but they're so large and i only need 1% of the plist features
// so it's easier to do this
function plistFromObject(obj) {
    const header = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n`
    const footer = `</dict>\n</plist>\n`
    let body = ""

    for (let [key, value] of Object.entries(obj)) {
        // only need to support strings and real numbers (floats) for this one
        let valueType = typeof value == "string" ? "string" : "real"
        body += `    <key>${key}</key>\n`
        body += `    <${valueType}>${value}</${valueType}>\n`
    }
    
    return header + body + footer
}

async function convert(string) {
    if (string == "") {
        return NO_INPUT_PLACEHOLDER
    }

    if (mappings == -1) {
        // mappings are not cached!
        await fetchMappings()
    }

    let split = string.split("a")
    let mapped = {}
    for (let [label, index] of Object.entries(mappings)) {
        if (typeof index != "number") {
            // this is a set value that cannot be changed though gd
            let value = index[0]
            mapped[label] = value
            continue
        }

        let userValue = split[index]
        if (typeof userValue == "undefined") {
            // uh
            userValue = 0
        }
        let floatified = parseFloat(userValue)
        if (isNaN(floatified)) {
            // uh
            floatified = 0
        }
        mapped[label] = floatified
    }

    return plistFromObject(mapped)
}

async function fetchMappings() {
    let obj = await fetch("https://06855.xyz/ParticleString2Plist/mappings.json")
    let res = await obj.text()
    mappings = JSON.parse(res)
}

async function onConvert(/*CCObject* sender :troll:*/) {
    let string = document.querySelector("#particle-input").value
    let plist = await convert(string)
    document.querySelector("#result").value = plist

    document.querySelector("#btn-copy").disabled = plist == NO_INPUT_PLACEHOLDER
    document.querySelector("#btn-download").disabled = plist == NO_INPUT_PLACEHOLDER
}

document.querySelector("#particle-input").addEventListener("input", () => {
    onConvert()
})
onConvert()

document.querySelector("#btn-copy").addEventListener("click", () => {
    navigator.clipboard.writeText(document.querySelector("#result").value)
})

document.querySelector("#btn-download").addEventListener("click", () => {
    let el = document.createElement("a")
    el.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(document.querySelector("#result").value))
    el.setAttribute("download", "particle.plist")
    document.body.appendChild(el)
    el.click()
    document.body.removeChild(el)
})

