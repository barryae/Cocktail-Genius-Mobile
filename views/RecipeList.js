import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components';

const Container = styled.View`
align-items: center;
flex: 1;
justify-content: center;
`

export default function RecipeList() {
    //take in base64

    useEffect(() => {
        findRecipesFromPhoto(photo)
    }, [])

    //Vision AI

    var urlEncodedImage = '';
    var visionAIKeywords = [];

    function findRecipesFromPhoto() {
        function textDetection() {
            body = {
                requests: [
                    {
                        image: {
                            content: `${urlEncodedImage}`
                        },
                        features: [
                            {
                                maxResults: 10,
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
                            content: `${urlEncodedImage}`
                        },
                        features: [
                            {
                                maxResults: 10,
                                type: "LABEL_DETECTION",
                            }
                        ]
                    }
                ]
            }
        }

        textDetection();
        labelDetection();

        var textDetectionSettings = {
            "url": "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDtQXAjtldc8mxTZIGCPDDGYuBkg8hpzBE",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
            },
            "data": JSON.stringify(body),

        }

        var labelDetectionSettings = {
            "url": "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDtQXAjtldc8mxTZIGCPDDGYuBkg8hpzBE",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
            },
            "data": JSON.stringify(body2),

        }

        fetch(textDetectionSettings).then(function (response) {
            console.log(response);
            var resultText;
            for (var i = 1; i < response.responses[0].textAnnotations.length; i++) {
                resultText = response.responses[0].textAnnotations[i].description;
                visionAIKeywords.push(resultText.toLowerCase())
            }

            fetch(labelDetectionSettings).then(function (response2) {
                for (var i = 0; i < response2.responses[0].labelAnnotations.length; i++) {
                    resultLabel = response2.responses[0].labelAnnotations[i].description;
                    visionAIKeywords.push(resultLabel.toLowerCase());
                }
            }).then(function (keywords) {
                console.log(visionAIKeywords)
                getIngredientsList(visionAIKeywords)
            })
        })
    };

    // Cockatail DB

    const multiIngredientQueryUrl = 'https://www.thecocktaildb.com/api/json/v2/8673533/filter.php?i='

    const recipeIdQueryUrl = 'https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i='

    function getIngredientsList(visionAIKeywords) {
        const ingredientsQueryUrl = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list'
        return fetch(ingredientsQueryUrl, {
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
                console.log(filteredRecipes)

                for (let i = 0; i < filteredRecipes.length; i++) {

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
        return fetch((multiIngredientQueryUrl + ingr), {
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
        return $.ajax((recipeIdQueryUrl + id), {
            method: 'GET'
        }).then(function (response) {
            return response.drinks[0];
        })
    }

    return (
        <Container>
            {filteredRecipes > 0 ? (
                <>
                    {filteredRecipes.map(recipe => (
                        <Card
                            category={recipe.category}
                            title={recipe.title}
                            description={recipe.description}
                            picture={recipe.picture}
                            ingredients={recipe.ingredients}>
                        </Card>
                    ))}
                </>
            ) : (
                    <Text>No Results to Display</Text>
                )
            }
        </Container>
    )

}
