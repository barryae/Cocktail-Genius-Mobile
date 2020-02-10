//Image upload

//Vision AI API request:
//filter JSON response for meaningful keywords
//(use a list of liquor types to look for?
//use a list of all ingredients?)
const realFileBtn = document.getElementById("real-file");
const customBtn = document.getElementById("custom-button");
const customTxt = document.getElementById("custom-text");


customBtn.addEventListener("click", function () {
    realFileBtn.click();
});

realFileBtn.addEventListener("change", function (event) {
    console.log(event.target.files[0])
    if (realFileBtn.value) {
        customTxt.innerHTML = realFileBtn.value.match(
            /[\/\\]([\w\d\s\.\-\(\)]+)$/
        )[1];
    } else {
        customTxt.innerHTML = "No file chosen, yet.";
    }
});

$("#real-file").change(function (event) {
    console.log(event.target.files)
    encodeImageFileAsURL(event.target);
});

function encodeImageFileAsURL(element) {
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
        urlSearchVar = reader.result.split(',')[1]
    }
    reader.readAsDataURL(file);
}

//Vision AI

var urlSearchVar = '';
let uploadedImage
var visionAIKeywords = [];

$("#search-button").on("click", function () {
    //urlSearchVar = $("#UriSearch").val();
    $(this).hide();
    let spin = document.createElement('div')
    spin.innerHTML =
        `<div class="spinner-border" id="spinner" role="status">
  <span class="sr-only">Loading...</span>
    </div>`
    $(".jumbotron").append(spin)
    function textDetection() {
        body = {
            requests: [
                {
                    image: {
                        content: `${urlSearchVar}`
                    },
                    features: [
                        {
                            maxResults: 10,
                            //Want to use text as well

                            type: "TEXT_DETECTION",



                        }
                    ]
                }
            ]
        }
    }

    function labelDetection() {
        body2 = {
            requests: [
                {
                    image: {
                        content: `${urlSearchVar}`
                    },
                    features: [
                        {
                            maxResults: 10,
                            //Want to use text as well

                            type: "LABEL_DETECTION",



                        }
                    ]
                }
            ]
        }
    }

    textDetection();
    labelDetection();


    var settings = {
        "url": "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDtQXAjtldc8mxTZIGCPDDGYuBkg8hpzBE",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
        },
        "data": JSON.stringify(body),

    }

    var settings2 = {
        "url": "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDtQXAjtldc8mxTZIGCPDDGYuBkg8hpzBE",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
        },
        "data": JSON.stringify(body2),

    }

    $.ajax(settings).done(function (response) {
        console.log(response);
        var resultText;
        //TEXT DETECTION
        for (var i = 1; i < response.responses[0].textAnnotations.length; i++) {
            resultText = response.responses[0].textAnnotations[i].description;
            //console.log(response.responses[0].textAnnotations[i].description);
            visionAIKeywords.push(resultText.toLowerCase())
            // var myJSON = JSON.stringify(resultText);
            // var resultText3 = response.responses[0].textAnnotations[0].description;
        }

        $.ajax(settings2).done(function (response2) {
            // WORKING CODE FOR LABEL_DETECTION

            for (var i = 0; i < response2.responses[0].labelAnnotations.length; i++) {
                resultLabel = response2.responses[0].labelAnnotations[i].description;
                //console.log(resultLabel);

                visionAIKeywords.push(resultLabel.toLowerCase());


            }

        }).then(function (keywords) {
            console.log(visionAIKeywords)
            getIngredientsList(visionAIKeywords)
        })
    })

});

//Cockatail DB

//partial Url query for the multiingredients search (needs ingredients
//seperated by commas)
const multiIngredientQueryUrl = 'https://www.thecocktaildb.com/api/json/v2/8673533/filter.php?i='

//partial Url query for search by ID
//needs ID string
const recipeIdQueryUrl = 'https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i='

//function to test functions specific to Cocktail DB
//(add to main() later)

function getIngredientsList(visionAIKeywords) {
    const ingredientsQueryUrl = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list'
    return $.ajax({
        url: ingredientsQueryUrl,
        method: 'GET'
    }).then(function (response) {
        const ingredientsList = [];
        let drinksArr = response.drinks;
        for (let i = 0; i < drinksArr.length; i++) {
            let ingredient = drinksArr[i].strIngredient1.toLowerCase();
            ingredientsList.push(ingredient);
        }
        ingredientsFilter(ingredientsList, visionAIKeywords)
    })
}

let filteredIngredientKeywords = [];
function ingredientsFilter(ingredientsList, arr) {
    console.log(ingredientsList, arr);

    for (let i = 0; i < arr.length; i++) {
        let keyword = arr[i];
        //console.log('bool', ingredientsList.includes(keyword))
        if (ingredientsList.includes(keyword) && !filteredIngredientKeywords.includes(keyword)) {
            filteredIngredientKeywords.push(keyword);
        }
    }
    console.log('filtered keyword', filteredIngredientKeywords)
    queryStringMaker(filteredIngredientKeywords)
}

function queryStringMaker(arr) {
    console.log(arr)
    let queryStrings = []
    for (let i = 0; i < arr.length; i++) {
        queryStrings.push(arr[i])
        for (let n = i + 1; n < arr.length; n++) {
            let string = arr[i] + "," + arr[n]
            queryStrings.push(string)
            for (let x = n + 1; x < arr.length; x++) {
                let stringX = arr[i] + "," + arr[n] + "," + arr[x]
                queryStrings.push(stringX)
                for (let z = x + 1; z < arr.length; z++) {
                    let stringZ = arr[i] + "," + arr[n] + "," + arr[x] + "," + arr[z]
                    queryStrings.push(stringZ)
                }
            }
        }
    }

    getIds(queryStrings)
        .then(function (ids) {
            //console.log(ids)›
            ids = ids.flat()
            const recipeReq = ids.map(function (id) {
                return checkId(id);
            });
            return Promise.all(recipeReq);
        })
        .then(function (recipes) {
            console.log(recipes)
            const filteredRecipes = {};
            for (let i = 0; i < recipes.length; i++) {
                let count = 0
                const drink = recipes[i];
                const drinkId = drink.idDrink;
                const ingrNum = drink["strIngredient" + (filteredIngredientKeywords.length + 2)];
                //console.log(!filteredRecipes[drinkId], ingrNum === null, drink.strAlcoholic == "Alcoholic", drink.strCategory === "Ordinary Drink")
                if (!filteredRecipes[drinkId] && (ingrNum === null || filteredIngredientKeywords.length === 1) && drink.strAlcoholic == "Alcoholic") {
                    for (let k in drink) {
                        const prop = drink[k]
                        for (let i = 0; i < filteredIngredientKeywords.length; i++) {
                            if (prop !== null) {
                                if (k.includes('strIngredient') && prop.toLowerCase().includes(filteredIngredientKeywords[i])) {
                                    count += 1
                                }
                            }
                        }
                    }
                    //console.log(count)
                    if (count == filteredIngredientKeywords.length && Object.values(filteredRecipes).length < 6 || filteredIngredientKeywords.length === 1 && Object.values(filteredRecipes).length < 6) {
                        filteredRecipes[drinkId] = drink;
                    }
                    else if (count == filteredIngredientKeywords.length - 1 && Object.values(filteredRecipes).length < 6 || filteredIngredientKeywords.length === 1 && Object.values(filteredRecipes).length < 6) {
                        filteredRecipes[drinkId] = drink;
                    }
                    else if (count == filteredIngredientKeywords.length - 2 && Object.values(filteredRecipes).length < 6 || filteredIngredientKeywords.length === 1 && Object.values(filteredRecipes).length < 6) {
                        filteredRecipes[drinkId] = drink;
                    }
                }
            }
            return Object.values(filteredRecipes);
        })
        .then(function (filteredRecipes) {
            for (let i = 0; i < filteredRecipes.length; i++) {
                $('#spinner').hide()
                $('#photo-prompt').text(ingrString(filteredIngredientKeywords))

                const ingredientList = [];
                const currentRecipe = filteredRecipes[i]

                for (let i = 1; i < 15; i++) {
                    const ingredient = currentRecipe['strIngredient' + (i)]
                    const measurement = currentRecipe['strMeasure' + (i)]
                    if (ingredient) {
                        ingredientList.push(`<li>${measurement ? measurement : ''} ${ingredient}</li>`)
                    }
                }

                let newElement = document.createElement('section')
                newElement.innerHTML = `
                        <div class="card">
                        <h3 class="card-title">${filteredRecipes[i].strDrink}</h3>
                        <div class="row">
                        <div class="col-sm">
                            <img src="${filteredRecipes[i].strDrinkThumb}" id="cardPics" ></img>

                            <div class="right"> Ingredients:
                            <ul id="ingredients-${i}"></ul>
                            <p class="right"> Instructions: 

                            ${filteredRecipes[i].strInstructions}</p>
                        </div>
                        </div>
                        </div>
                        `.trim()

                $(".finalResults").append(newElement)

                let index = i
                ingredientList.forEach(el => $(`#ingredients-${index}`).append(el))

                // console.log(filteredRecipes[i]);
                // finalEverything = $('<ul>');
                // function listMeasurements(currentRecipe) {
                //     let finalIngredients = [];
                //     for (let i = 0; i < 15; i++) {
                //         let currentIngr = currentRecipe['strIngredient' + (i + 1)]
                //         if (currentIngr !== null) {
                //             finalIngredients.push(currentIngr);
                //         }
                //     }
                //     console.log(finalIngredients)
                //     let finalMeas = []
                //     for (let i = 0; i < 15; i++) {
                //         let currentMeas = currentRecipe['strMeasure' + (i + 1)]
                //         if (currentMeas !== null && currentMeas !== undefined) {
                //             finalMeas.push(currentMeas);
                //         }
                //     }
                //     console.log(finalMeas)
                //     for (let i = 0; i < finalIngredients.length; i++) {
                //         let addedElement = document.createElement('li')
                //         addedElement.innerHTML = `
                //         ${" *" + define(finalMeas[i]) + " " + finalIngredients[i] + " "}`;
                //         //console.log(addedElement);
                //         finalEverything.append(addedElement);
                //         function define(meas) {
                //             if (meas !== undefined) {
                //                 return meas
                //             } else {
                //                 return ''
                //             }
                //         }
                //     }

                // }


                // console.log(finalEverything)
                // listMeasurements(currentRecipe)
            }
            $(".finalResults").append("<button class='btn btn-secondary'>" + "Search Again" + "</button>");
            $("button").on("click", function () {
                location.reload();
            })

        })

}

function ingrString(filteredIngredientKeywords) {
    let string = "The ingredients we found were: "
    for (let i = 0; i < filteredIngredientKeywords.length; i++) {
        string = string + filteredIngredientKeywords[i]
        if (i < filteredIngredientKeywords.length - 1) {
            string += ', '
        }
    }
    string += '.'
    return string
}

function getIds(arr) {
    const postReqs = arr.map(function (ingr) {
        return makeIds(ingr);
    });
    return Promise.all(postReqs);
}



function makeIds(ingr) {
    return $.ajax({
        url: multiIngredientQueryUrl + ingr,
        method: 'GET'
    }).then(function (response) {
        if (!Array.isArray(response.drinks)) {
            return [];
        }
        return response.drinks.map(function (drink) {
            return drink.idDrink;
        });
    });

}

function checkId(id) {
    return $.ajax({
        url: recipeIdQueryUrl + id,
        method: 'GET'
    }).then(function (response) {
        return response.drinks[0];
    })
}







//format 
// Title of Cocktail
// Image
// Ingredients + amounts
// instructions
// glass?

