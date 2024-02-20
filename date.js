module.exports.getDate = getDate
module.exports.getDay = getDay

function getDate(){
    var today = new Date()
    var options = {weekday:'long',day:'numeric',month:'long'}
    var day = today.toLocaleDateString('en-US', options)
    return day
}

function getDay(){
    var today = new Date()
    var options = {weekday:'long'}
    var day = today.toLocaleDateString('en-US', options)
    return day
}