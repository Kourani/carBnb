
import './AllSpots.css'
import { getSpots } from "../../store/spot";
import * as reviewActions from '../../store/review'

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useState } from 'react';

function AllSpots(){

    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(()=>{
        dispatch(getSpots())
    },[dispatch])

    const spotState = useSelector(state=>state.spot)

    const spotValues = Object.values(spotState)

    const [hovered, setHovered]=useState('')


    const [hoveredElement, setHoveredElement]=useState(null)

    const handleMouseEnter=(element)=>{
        setHovered(element.id)
        setHoveredElement(element)
    }

    const handleMouseLeave=()=>{
        setHovered('')
        setHoveredElement(null)
    }

    //creates the star icon
    const star = () => {
        return (
            <div style={{ color: "black", fontSize: "20px" }}>
                <i className="fa fa-star"></i>
            </div>
        );
    };


    function spotTiles(){

        function onClicked(element){
            history.push(`/spots/${element.id}`)
            dispatch(reviewActions.getSpotReviews(element.id))
            return
        }

        return spotValues.map(element =>{
            return(

                <div className='landingPage' onClick={()=>onClicked(element)} onMouseEnter={()=>handleMouseEnter(element)} onMouseLeave={()=>handleMouseLeave()}>


                    {hovered===element.id && <div className={hovered ? 'hoverTrue' : 'hoverFalse'}>{hoveredElement.name}</div>}

                    <button className='spotTileButton' key='spotTile' >
                        <img src={element.previewImage} alt='Spot Preview' />
                    </button>

                    <div className='tileInformation'>

                        <div className='line1'>

                            <div className='leftHalf1'>
                                {element.city}, {element.state}
                            </div>

                            <div className='rightHalf1'>
                                <div className='starFunction'>{star()}</div>
                                <div className='averageRating'>{element.avgRating ? element?.avgRating?.toFixed(1) : 'New'}</div>
                            </div>

                        </div>

                        <div className='price'>
                            <div className='priceBold'>
                                ${element.price}
                            </div>
                            night
                        </div>

                    </div>

                </div>
            )
        })
    }

    return(
        <div className='spotGrid'>
            {spotTiles()}
        </div>
    )

}

export default AllSpots
