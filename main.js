async function validatieInput(artist){
    const response = await fetch(`https://hikar.org/course/imm/songs.php?artist=${artist}`)
    console.log(response)
    const artists = await response.json();
    let html = ""
    artists.forEach(artist => { 
        console.log(artist)
        html += `Title: ${artist.title} Name: ${artist.artist}`
    });
    document.getElementById('artists').innerHTML = html;
}

document.getElementById("button").addEventListener('click', ()=> {
    console.log("clicked")
    const artist = document.getElementById('artistName').value;
    validatieInput(artist);
})


if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./svcw.js')
        .then(registration => {
            console.log('Registered successfully.');
        })
        .catch(e => {
            console.error(`Service worker registration failed: ${e}`);
        });    
} else {
    alert('Sorry, offline functionality not available, please update your browser!');
}