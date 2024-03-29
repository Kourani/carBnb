



import {csrfFetch} from "./csrf"


const GET_SPOTS = "/spots/GET_SPOTS"
const ONE_SPOT = "/spots/SPOT_DETAIL"
const CREATE_SPOT = "/spots/NEW_SPOT"
const DELETE_SPOT ="/spots/DELETE_SPOT"
const UPDATE_SPOT ="/spots/UPDATE_SPOT"
const CREATE_IMAGE='/spots/spotId/CREATE_IMAGE'


//ACTIONS

function loadSpots(spots) {
    return{
        type: GET_SPOTS,
        spots
    }
}

function specificSpot(spotData){
    return{
        type: ONE_SPOT,
        spotData
    }
}

function newSpot(newData){
    return{
        type: CREATE_SPOT,
        newData
    }
}

function deleteSpotData(thunkData){
    return{
        type: DELETE_SPOT,
        thunkData
    }
}

function editSpot(updateSpotThunkData){
    return {
        type:UPDATE_SPOT,
        updateSpotThunkData
    }
}

function imageCreate(createImageThunkData){
    return {
        type:CREATE_IMAGE,
        createImageThunkData
    }
}

//thunk

export const getSpots = () => async dispatch =>{
    const response = await fetch('/api/spots')

    if(response.ok){
        const loadedSpots = await response.json()
        dispatch(loadSpots(loadedSpots))
        return loadedSpots
    }
    return response
}

export const spotDetails = (spotId) => async (dispatch) =>{
    const response = await fetch(`/api/spots/${spotId}`)

    if(response.ok){ //check for errors via statusCode before passing to reducer
        const data = await response.json()
        // console.log('spotDetailsData',data)
        dispatch(specificSpot(data)) //data.Spots

        return data
    }
    return response
}

export const createSpot = (payload) => async (dispatch) =>{
    const response = await csrfFetch(`/api/spots`, {
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(payload)
    })

    if(response.ok){
        const matchedSpot = await response.json()
        // console.log('Inside createSpot Thunk',matchedSpot)
        dispatch(newSpot(matchedSpot))
        return matchedSpot
    }

    // console.log('INSIDE THUNNK', response)
    return await response.json()
}

export const deleteSpot = (spotId) => async (dispatch) => {

    const response = await csrfFetch(`/api/spots/${spotId}`,{
        method: 'DELETE'
    })

    if(response.ok){
        const retrivedData = await response.json()
        // console.log('SPOT STORE ... DELETE THUNK',retrivedData)
        dispatch(deleteSpotData(spotId))
        return retrivedData
    }

    return await response.json()

}

export const updateSpot = (spotId,payload) => async(dispatch) =>{
    const response = await csrfFetch(`/api/spots/${spotId}`, {
        method:'PUT',
        headers:{
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify(payload)
    })

    if(response.ok){
        const spotUpdate = await response.json()
        dispatch(editSpot(spotUpdate))

        // console.log('Inside Update Spot Thunk',spotUpdate)
        return spotUpdate
    }

    return await response.json()
}



export const createImage = (spotId,payload) => async (dispatch) =>{

    const response = await csrfFetch(`/api/spots/${spotId}/images`, {
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(payload)
    })

    if(response.ok){
        const pictures = await response.json()
        // console.log('Inside createSpot Thunk',pictures)
        dispatch(imageCreate(pictures))
        return pictures
    }

    // console.log('INSIDE THUNNK', response)
    return await response.json()
}





//set up of initial state
const initialState = {}

//reducer
const spotReducer = (state=initialState, action) =>{

    switch (action.type){

        case ONE_SPOT:
            const foundSpot = {...action.spotData}

            return {

                ...state,
                matched: foundSpot
            }

        case GET_SPOTS:
            const allSpots ={}
            action.spots.Spots.forEach(element=>{
                allSpots[element.id] = element
            })

            return {
                ...allSpots,
            }

        case CREATE_SPOT:

            const createdSpot = {...action.newData}
            return{
                createdSpot
            }

        case DELETE_SPOT:

            const newState = {...state}
            delete newState[action.thunkData]

            return newState

        case UPDATE_SPOT:
            const fixedSpot = {...action.updateSpotThunkData}
            return{
                ...state,
                updatedSpot:fixedSpot

            }

        case CREATE_IMAGE:
            const addedImage = {...action.createImageThunkData}
            return{
                ...state,
                images:addedImage,

            }

        default:
            return state
    }
}

export default spotReducer
