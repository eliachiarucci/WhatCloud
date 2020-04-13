//const fs = require('fs');


function array_from_text(text, taboos, min_length=1) {
    var taboo_re = new RegExp("\\b" + taboos + "\\b", "gi"); // Creiamo la regular expression contenente le bad words
    var risate_re = new RegExp(["aha", "hah"].join("|"), "gi"); // Creiamo la regular expression per le risate
    var messages_array = text.split(/[\n]/); // Creiamo un array contenente tutti i messaggi divisi per new line
    var parsed_messages = [];

    // Per ogni elemento nell'array, eseguiamo pulizia
    messages_array.forEach(function(message){

        parsed_messages.push(...message.split(':') // Dividiamo il messaggio in un array diviso per il simbolo di punteggiatura :
        .slice(3) // Eliminiamo intestazione messaggio -> tutto il contenuto presente prima del terzo :
        .join() // Riformiamo la stringa dopo aver eliminato gli array
        .replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g, ' ') // Eliminiamo la punteggiatura
        .replace(taboo_re, '') // Eliminiamo le brutte parole con la regular expression creata in precedenza
        .replace(risate_re, '') // Eliminiamo le risate
        .split(' ') // Ripristiniamo l'array pulito dividendo gli elementi per gli spazi
        .filter(word => word.length >= min_length) // Ora navighiamo l'array e filtriamo tutti gli elementi vuoti
        )
    })

    return parsed_messages;

}


function dictionary_frequencies_from_array(parsed_messages) {

    var dictionary_frequencies = {};

    parsed_messages.forEach(function(word) {

        word = word.toLowerCase().trim(); // Rendiamo tutto lower case e trimmiamo per sicurezza

        if (dictionary_frequencies[word] != undefined) {  // Controlliamo se la chiave (parola) è già presente
            dictionary_frequencies[word] += 1; // Se è già presente, aggiungiamo 1 al valore
        } else {
            dictionary_frequencies[word] = 1; // Se non è presente, inizializziamo chiave e valore a 1
        }
    })

    return dictionary_frequencies;

}


function to_object_array(dictionary_frequencies) {

    var object_array = []

    for (var key in dictionary_frequencies) { // Cicliamo ogni coppia chiave:valore nell'oggetto
        // Per ogni coppia chiave:valore pushiamo nell'array un oggetto con le corrispondenti caratteristiche
        object_array.push({"text": key, "size": dictionary_frequencies[key]}) 
    }

    return object_array;

}

async function text_elaboration(length = 2) {

    //const text = fs.readFileSync('./input_word_cloud.txt', 'utf-8'); // Carichiamo i messaggi whatsapp grezzi
    const fetch_text = await fetch('./files/input_word_cloud.txt');
    var text = await fetch_text.text();

    //var taboos = fs.readFileSync('./MostUsedWordsItalian.txt', 'utf-8'); // Carichiamo la lista di taboo -> parole da eliminare nei messaggi
    const fetch_taboos = await fetch('./files/MostUsedWordsItalian.txt');
    var taboos = await fetch_taboos.text();
    taboos = taboos.replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g, '').split(/[\n \t]/g).filter(word => word != '').join('\\b|\\b')

    // Creiamo un array filtrato contenente tutte le parole di tutti i messaggi
    var array = array_from_text(text, taboos, length);

    // Trasformiamo l'array in un oggetto chiave:valore contenente la parola e le volte che viene ripetuta
    var dictionary_frequencies = dictionary_frequencies_from_array(array); 

    // Cicliamo il main object e trasformiamolo in un array di oggetti -> ci serve per la libreria
    var object_array = to_object_array(dictionary_frequencies);
    
    return object_array

}



