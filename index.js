const axios = require('axios');
const util = require('util')


//ex 1 retouner 'yoda'
const getStarWarsCharacter = async(name) => {

  const url = `https://swapi.co/api/people/?search=${name}`;
  try{
    const response = await axios.get(url);
    const data = response.data;
    const characterName = data.results[0].name;

    console.log(characterName);
    return characterName;
  }
  catch(error){
    console.log('ERROR : ', error)
  }
}
// getStarWarsCharacter('yoda');



//HELPER function
//rassembler toutes les pages de résultats d'une route en un seul tableau de données
const getData = async(url, callback = null) => {
  try{

    const response1 = await axios.get(url); //1er call
    console.log(url);

    let rawDataArray = [];
    rawDataArray.push(response1);

    const numberOfCalls = Math.ceil(response1.data.count / 10); //nombre de fois qu'on va faire appel à l'api sur les differentes pages

    if (numberOfCalls >= 2 ){
      const promises = [];

      for (let i = 2; i <= numberOfCalls; i ++) {
        const url2 = `${url}/?page=${i}`;
        console.log(url2);
        promises.push(axios.get(url2));
      }

      const responses = await Promise.all(promises);
      rawDataArray = rawDataArray.concat(responses);

      if(callback !== null){
        console.log('with callback');
        callback(refineData(rawDataArray));
      } else {
        console.log('no callback');
        return refineData(rawDataArray);
      }
    }
    return refineData(rawDataArray);;
  }
  catch(error){
    console.log('ERROR !: ', error);
  }
}


//affiner la donnée brute
const refineData = (rawData) => {

  const refinedData = [];

  for (const pages of rawData){
    for (const page of pages.data.results){
      refinedData.push(page)
    }
  }
  return refinedData;
}

// getData('https://swapi.co/api/people');
// getData('https://swapi.co/api/species');




//ex 2
//Retourne les espèces qui comptent plus de 2 individus
const getStarWarsSpeciesMoreThanTwoPeople = (refinedData) => {

  const speciesMoreThanTwo = [];

  for (const specie of refinedData){
    if(specie.people.length >= 2){
      speciesMoreThanTwo.push(specie.name);
    };
  }
  console.log(speciesMoreThanTwo);
  return speciesMoreThanTwo;
}

// getData('https://swapi.co/api/species', getStarWarsSpeciesMoreThanTwoPeople); //avec callback dans getData() OK
// getStarWarsSpeciesMoreThanTwoPeople(getData('https://swapi.co/api/species')); //en inversant et faisant un return dans getData(), KO




//ex 3
//Retourne la somme des tailles de tous les humains
const sumAllHumansSize = (refinedData) => {

  const sizeArray = [];

  for (const character of refinedData){
    if(character.species.includes("https://swapi.co/api/species/1/")){
      const size = parseInt(character.height, 10);
      // console.log(size);
      if (!isNaN(size)){
        sizeArray.push(size);
      }
    }
  }
  return sum(sizeArray);
}


const sum = (arg) => {
  if (Array.isArray(arg)){
    const result = arg.reduce((a, b)=>{
      return a + b;
    })
    console.log(result);
  } else {
    return
  }
}

// getData('https://swapi.co/api/people', sumAllHumansSize); //avec callback dans getData() OK
// sumAllHumansSize(getData('https://swapi.co/api/people')); //en inversant et faisant un return dans getData(), KO




// ex 4
// Retourne un tableau de tous les tous les humains, nom, taille, poids, noms des films, nom de planète d'origine
const aggregateHumanData = async(refinedData) => {
  try {
    const refinedPlanets = await getData('https://swapi.co/api/planets');
    const refinedFilms = await getData('https://swapi.co/api/films');

    const aggregatedData = [];


    for (const character of refinedData){
      if(character.species.includes("https://swapi.co/api/species/1/")){
        aggregatedData.push(character.name, character.height, character.mass);
        addPlanets(aggregatedData, refinedPlanets, character);
        addFilms(aggregatedData, refinedFilms, character);

        aggregatedData.push( '------------------------------');
      }
    }
    console.log(util.inspect(aggregatedData, { maxArrayLength: null })) //pour ne pas limiter l'affichage à 100 element dans le terminal
    return aggregatedData;
  }
    catch(error) {
      console.log(error);
    }
}


const addPlanets = (aggregatedData, refinedPlanets, character) => {
    for (const planet of refinedPlanets){
      if(planet.url === character.homeworld){
        aggregatedData.push(planet.name);
      }
    }
}


const addFilms = (aggregatedData, refinedFilms, character) => {
    for (const film of refinedFilms){
      if(character.films.includes(film.url)){
        aggregatedData.push(film.title);
      }
    }
}

// getData('https://swapi.co/api/people', aggregateHumanData); //avec callback dans getData() OK
