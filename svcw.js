const CACHE_NAME = 'cache1';
const urlsToCache = [
    'index.html',
    'dist/main.bundle.js',
    'main.css'
];


function displayMessage(msg) { 
    console.log(msg); 
}


function createDB() {

    return new Promise((resolve, reject) => {
        const request = indexedDB.open("music", 2);
        request.onupgradeneeded = e => {
            const db = e.target.result;
            const objectStore = db.createObjectStore("music", {keyPath: "artist"})
        }

        request.onsuccess = function (e) {
            db = e.target.result;
            resolve(db);
        }

        request.onerror = function(e) {
            reject('error opening databse')
        }

    });
} 


function searchDB(ev) {
    const parts = ev.request.url.split("?");
      const artist = parts[1].replace("artist=","");

      return new Promise((resolve, reject) => {
        const request = objectStore.get(artist);

        request.onsuccess = function (e) {
            resolve(e.target.result);
        }

        request.onerror = function(e) {
            reject('no artist found')
        }

    });

}



self.addEventListener('install', ev=> {
    console.log('Installed the service worker...');
    ev.waitUntil(
        caches.open(CACHE_NAME)
                .then(cache=> {
                    return cache.addAll(urlsToCache);
                })
    );
});

self.addEventListener('activate', ev=> {
    ev.waitUntil(
        // Create the database. If the promise resolves, add the database to
        // the service worker by making it a property of self.
        createDB().then ( db => {
            console.log('DB created!');
            self.db = db;
        })
    );
    return self.clients.claim();

});


self.addEventListener('fetch', ev => {
    console.log(`Service worker intercepted: ${ev.request.url}`);
    const url = new URL(ev.request.url);

    if(ev.request.url.indexOf("https://hikar.org/course/imm/songs.php") != -1) {
        ev.respondWith(
            searchDB(ev).then(res=> {
                if(res) {
                    const str = JSON.stringify(res.records);
                    return new Response(str, { headers: {"Content-Type": "application/json"}})    
                } else {
                    return fetch(ev.request)
                    .then(resp2 => {
                        return resp2.json().then(jsondata => {
                            return dbadd(artist, jsondata)
                            .then (()=> {
                                const str = JSON.stringify(jsondata);
                                return new Response(str, {headers:
                                {"Content-Type": "application/json"},
                                })
                            })
                        })
                    })    
                }
            })
        )
    } else {
        return fetch(ev.request);
    }
})