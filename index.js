//* Autor = Walaleitor / Sebastián Salazar
const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');


const obtenerFacultades = async(urlFacultades = 'https://www.utem.cl/facultades/') => {
    const urls = [];
    try {
        let response = await fetch(urlFacultades);
        let body = await response.text();
        let $ = cheerio.load(body)
        $('a', '.lista-bullet').each(function() {
            let url = $(this).attr('href');
            urls.push(url);
        });

    } catch (err) {
        throw err;
    }
    return urls
};

const obtenerCarreras = async(urlFacultad) => {
    const urlsCarreras = [];

    try {
        let response = await fetch(urlFacultad);
        let body = await response.text();
        let $ = cheerio.load(body);
        $('a', '#menu-carreras-psu-portal').each(function() {
            let url = $(this).attr('href');

            urlsCarreras.push(url);
        });
    } catch (err) {
        throw err;
    }
    return urlsCarreras;

}

const obtenerMalla = async(urlCarrera) => {
    const semestres = [];
    const nombreSemestres = [];
    let codigo;
    let nombre;
    let carrera;
    try {
        let response = await fetch(urlCarrera)
        let body = await response.text();
        let $ = cheerio.load(body);
        nombre = $('h1', '.articulo-principal').text();
        //Obtiene codigo de la carrera
        $('li', '.val-item-igral').each(function(index, element) {
            if (index === 4) {
                codigo = $(element).text();
            }
        });
        //Obtiene nombre de la carrera
        nombre = $('h1', '.articulo-principal').text();
        $('h4', '.malla-semestre').each(function() {
            let nombreSemestre = $(this).text();
            nombreSemestres.push(nombreSemestre);
        });
        //Obtiene los ramos por semestre
        $('ul', '.malla-anual').each(function(index, element) {
            let ramos = []
            let semestre = $('li', element);
            semestre.each(function() {
                let ramo = $(this).text();
                ramos.push(ramo);
            })
            semestres.push({
                numero: index + 1,
                semestre: nombreSemestres[index],
                asignaturas: ramos

            })
        });
    } catch (err) {
        throw err
    }
    //retorna el objeto con el formato por carrera
    return {
        nombre,
        codigo,
        semestres
    };
}

const obtenerJson = async() => {
    try {
        const facultadesUrl = await obtenerFacultades();
        const carrerasUrl = await Promise.all(facultadesUrl.map(async url => {
            carreraUrl = await obtenerCarreras(url);
            return carreraUrl;
        }))
        const final = await Promise.all(carrerasUrl.map(async facultad => {
            carreras = await Promise.all(facultad.map(async carrera => {
                return await obtenerMalla(carrera);
            }))
            return {
                carreras
            }
        }))
        const json = JSON.stringify({
            facultades: final
        })
        fs.writeFileSync('data.json', json)
    } catch (err) {
        throw err;
    }

};


obtenerJson()
    .then(r => r);