

const express = require('express')
const bcrypt = require('bcryptjs');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, User, Review, Booking, Image, Sequelize, sequelize } = require('../../db/models');

const router = express.Router();

const { check, body } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


// const { validationResult } = require('express-validator');

const { Op } = require("sequelize");

const validateSpot = [
  check('address')
  .exists({ checkFalsy: true })
  .isAlphanumeric('en-US',{ignore: ' '})
  .notEmpty()
  .withMessage( "Street address is required"),

    check('city')
      .exists({ checkFalsy: true })
      .isAlpha('en-US',{ignore: ' '})
      .notEmpty()
      .withMessage( "City is required"),

    check('state')
      .exists({ checkFalsy: true })
      .isAlpha('en-US',{ignore: ' '})
      .notEmpty()
      .withMessage("State is required"),

    check('country')
      .exists({ checkFalsy: true })
      .isAlpha('en-US',{ignore: ' '})
      .notEmpty()
      .withMessage("Country is required"),

    check('lat')
      // .optional({values: 'undefined' | 'null' | 'falsy'})
      .optional()
      .if((_, { req }) => req.body.lng !== undefined && req.body.lng !== null && req.body.lng !== '')
      .isNumeric().withMessage('Lat must be a number'),

    check('lng')
      // .optional({values: 'undefined' | 'null' | 'falsy'})
      .optional()
      .if((_, { req }) => req.body.lng !== undefined && req.body.lng !== null && req.body.lng !== '')
      .isNumeric().withMessage('Lng must be a number'),


    check('name')
      // .exists({ checkFalsy: true })
      // .isAlpha('en-US',{ignore: ' '})
      .isLength({min:undefined, max:50})
      .withMessage("Name must be less than 50 characters")
      .notEmpty()
      // .optional()
      .withMessage("Name must be less than 50 characters"),

    check('description')
      .exists({ checkFalsy: true })
      .isAlpha('en-US',{ignore: ' '})
      .notEmpty()
      .isLength({min:30, max:undefined})
      .withMessage("Description is required"),



    check('price')
      .exists({ checkFalsy: true })
      .isDecimal().withMessage('Price must be a number')
      .notEmpty()
      .withMessage( "Price per day is required"),

    handleValidationErrors
  ];

const validateImage = [
  check('url').custom((value)=> {
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    const urlLowercase = value.toLowerCase();
    if (!imageExtensions.some(ext => urlLowercase.endsWith(ext))) {
      throw new Error('URL does not end with .jpg or .jpeg or .png');
    }
    return true
}),
]


const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    // .isEmpty()
    // .isAlphanumeric('en-US',{ignore: ' '})
    // .isAlpha('en-US', {ignore: ' !'})
    // .withMessage("Review text can only contain letters and !"),
    .withMessage("Review text is required"),


  check('stars')
    // .exists({ checkFalsy: true })
    // .isNumeric()
    // .notEmpty()
    .isInt({min:1, max:5})
    .withMessage( "Stars must be an integer from 1 to 5"),

  handleValidationErrors
];

const validateBooking= [

  check('startDate')
    .exists({ checkFalsy: true })
    // .isNumeric()
    .notEmpty()
    // .isDate()
    .withMessage( "startDate required")
    .isDate()
    .withMessage('startDate must be in the following format yyyy-mm-dd'),

    check('endDate')
    .exists({ checkFalsy: true })
    // .isNumeric()
    .notEmpty()
    // .isDate()
    .withMessage( "endDate required, must be in the following format yyyy-mm-dd")
    .isDate()
    .withMessage('endDate must be in the following format yyyy-mm-dd'),

    check('endDate').custom((value, { req }) => {
      if(new Date(value) <= new Date(req.body.startDate)) {
          throw new Error ( "endDate cannot be on or before startDate");
      }
      return true
  }),

  handleValidationErrors
];


const validateQuery= [

  check('page')
    // .exists({ checkFalsy: true })
    .optional()
    .isNumeric()
    .notEmpty()
    .isInt(({min:0, max:10}))
    .withMessage('Please provide a valid page.'),

  check('size')
    // .exists({ checkFalsy: true })
    .optional()
    .isNumeric()
    .notEmpty()
    .isInt(({min:0, max:20}))
    .withMessage('Please provide a valid size.'),

    check('minLat')
    .optional()
    .isDecimal()
    .withMessage('Please provide a valid Latitude.'),

    check('maxLat')
    .optional()
    // .exists({ checkFalsy: false })
    .isDecimal()
    // .notEmpty()
    .withMessage('Please provide a valid Latitude.'),

    check('minLng')
    .optional()
    // .exists({ checkFalsy: true })
    .isDecimal()
    // .notEmpty()
    .withMessage('Please provide a valid Longitude.'),

    check('maxLng')
    .optional()
    // .exists({ checkFalsy: true })
    .isDecimal()
    // .notEmpty()
    .withMessage('Please provide a valid Longitude.'),

    check('minPrice')
    .optional()
    // .exists({ checkFalsy: true })
    .isNumeric()
    // .notEmpty()
    .withMessage('Please provide a valid Price.'),

    check('maxPrice')
    .optional()
    // .exists({ checkFalsy: true })
    .isNumeric()
    // .notEmpty()
    .withMessage('Please provide a valid Price.'),


  handleValidationErrors
];


//get all the spots
  router.get('/', validateQuery, async(req,res)=>{

    let {
          page,
          size,
          minLat,
          maxLat,
          minLng,
          maxLng,
          minPrice,
          maxPrice
    } = req.query

         //if all the query params do NOT exist !
         if(!minLat && !minLng && !minPrice && !maxPrice && !maxLng && !maxLat && !page && !size){
          //finds all the spots
          console.log('HEREEEEEEEEEEEEE')

          page=1
          size=20

        const allSpots = await Spot.findAll({
          attributes:[
            'id', 'ownerId',
            'address', 'city', 'state',
            'country', 'lat', 'lng',
            'name', 'description', 'price',
            'createdAt', 'updatedAt'
          ],
          limit:size,
          offset:(page-1)*size
        })

        // res.json(allSpots)

        //gets all the reviews
        const allReviews = await Review.findAll()
        // res.json(allReviews)

        console.log(allReviews.length, 'Reviews')
        console.log(allSpots.length, 'Spots')


        const allImages = await Image.findAll({
          where:{imagableType:'Spot'}
        })
        console.log(allImages.length)


        const insertableSpots = allSpots.map(x => x.get({ plain: true }))

        for(let i=0; i<allSpots.length; i++){
            let sum = 0
            let totalReviews = 0
          for(let z=0; z<allReviews.length; z++){
            if(allSpots[i].id === allReviews[z].spotId){
              sum = sum + allReviews[z].stars
              totalReviews++
            }
          }
          let average = sum/totalReviews
          insertableSpots[i].avgRating = average

          for(let d=0; d<allImages.length; d++){
            if(allSpots[i].id === allImages[d].imagableId){
              insertableSpots[i].previewImage = allImages[d].url
            }
          }

          if(!insertableSpots[i].previewImage){
            insertableSpots[i].previewImage = null
          }
        }

        let object = {Spots:insertableSpots}
        res.json(object)
        return
          }

    //converts page and size input to a number data type
    page = parseInt(page);
    size = parseInt(size);

    //sets the page and size to default values
    if(isNaN(page)) page =1
    if(!page) page=1
    if(page<0) page=1


    if(isNaN(size)) size =20
    if(!size) size=20
    if(size<0) size=20

    console.log('page',page)
    console.log('size',size)
    console.log('offset', size*(page-1))




    minLng = parseInt(minLng) || -1000
    maxLng = parseInt(maxLng) || 1000

    minPrice = parseInt(minPrice) || 0
    maxPrice = parseInt(maxPrice) || 10000000

    minLat = parseInt(minLat) || -1000
    maxLat = parseInt(maxLat) || 1000


        //finds all the spots
      const allSpots = await Spot.findAll({
        attributes:[
          'id', 'ownerId',
          'address', 'city', 'state',
          'country', 'lat', 'lng',
          'name', 'description', 'price',
          'createdAt', 'updatedAt'
        ],
        where:{
          lat:{
            [Op.between]:[minLat,maxLat]
          },
          lng:{
            [Op.between]:[minLng,maxLng]
          },
          price:{
            [Op.between]:[minPrice,maxPrice]
          }
        },

        limit:size,
        offset: size*(page-1)
      })



      // res.json(allSpots)

      //gets all the reviews
      const allReviews = await Review.findAll()
      // res.json(allReviews)

      console.log(allReviews.length, 'Reviews')
      console.log(allSpots.length, 'Spots')


      const allImages = await Image.findAll({
        where:{imagableType:'Spot'}
      })
      console.log(allImages.length)


      const insertableSpots = allSpots.map(x => x.get({ plain: true }))

      for(let i=0; i<allSpots.length; i++){
          let sum = 0
          let totalReviews = 0
        for(let z=0; z<allReviews.length; z++){
          if(allSpots[i].id === allReviews[z].spotId){
            sum = sum + allReviews[z].stars
            totalReviews++
          }
        }
        let average = sum/totalReviews
        insertableSpots[i].avgRating = average

        for(let d=0; d<allImages.length; d++){
          if(allSpots[i].id === allImages[d].imagableId){
            insertableSpots[i].previewImage = allImages[d].url
          }
        }

        if(!insertableSpots[i].previewImage){
          insertableSpots[i].previewImage = null
        }
      }

      let object = {Spots:insertableSpots, page:page, size:size}
      res.json(object)
  })

//get spots of current user
router.get('/current', requireAuth, async(req,res)=>{

  //AVERAGE
  const spotReviews = await Spot.findAll(
    {
      // group:['id'],
        include:
        [
            {
                model:Review,
                attributes:['spotId','stars']
            },
        ],
        where:{ownerId:req.user.id}
    })



    // res.json(spotReviews)

    //creates an empty array
    let undy = []
    let twos = []

    //pushes each review arraies of reviews into undy array
    //creates an array where # of elements = # of spots, and the value of each element is the # of reviews for that spot

    // console.log(spotReviews.length, '# of spots') //# of spots
    // console.log(spotReviews[0].Reviews.length, '# of reviews per spot')


    for(let i=0; i<spotReviews.length; i++){
      // console.log(spotReviews, 'ssssssssssssssss')
      console.log(spotReviews[i].Reviews.length, 'reviews in order')
      if(spotReviews[i].Reviews.length>0)
      {
        undy.push(spotReviews[i].Reviews)
        twos.push(spotReviews[i].Reviews.length)
      }
    }

    // res.json(undy)

    console.log(twos, 'twos')
    // res.json(twos)


    let average = []

    if(undy.length>0){
      for(let z = 0; z<undy.length; z++){
        if(Array.isArray(undy[z]) && undy[z].length>0)
        {
          console.log('99999999')
          if(undy[z].length === twos[z]){
            // console.log(undy[z].length)
            // console.log(twos[z].length)
            console.log('1111111111')
            let sum = 0
            for(let y=0; y<undy[z].length; y++){
              console.log('aaaaaaa')

              sum = sum + undy[z][y].stars
              console.log(sum)
              // average.push(sum/twos[z])

            }
            average.push(sum/twos[z])
          }
        }
      }
    }


    console.log(average)
    // res.json(average)

    let currentSpot = await Spot.findAll({

      attributes:[
        'id', 'ownerId', 'address',
        'city', 'state', 'country',
        'lat', 'lng', 'name', 'description',
        'price', 'createdAt', 'updatedAt'
      ],
        where:{ownerId:req.user.id}
    })

    let findImage = await Image.findAll({
      where:{imagableType:'Spot'}
    })





    // res.json(currentSpot)

  // console.log(req.user.id)
  for(let i=0; i<currentSpot.length; i++)
  {
    if(currentSpot[i].ownerId === req.user.id)
    {
      // res.json(currentSpot)

       //you cannot add to the object until you get the PLAIN OBJECTS !!
        const plainFirst = currentSpot.map(x => x.get({ plain: true }))


        // res.json(findImage)

        console.log(findImage[0].imagableId,'gggggggggggg')

        if(average.length>0){
          for(let h=0; h<average.length; h++){
            plainFirst[h].avgRating = average[h]
          }
        }

        for(let i=0; i<plainFirst.length; i++){
          for(let s=0; s<findImage.length; s++){
            if(plainFirst[i].id===findImage[s].imagableId){
              plainFirst[i].previewImage=findImage[s].url
            }
          }
        }
        // res.json(plainFirst)
        //adds the averageRating key value pair into the object
        console.log(average.length,'average array')
        // res.json(average.length)


        for(let i=0; i<plainFirst.length; i++){
          if(!plainFirst[i].avgRating){
            console.log('here')
            plainFirst[i].avgRating=null
          }
          if(!plainFirst[i].previewImage){
            plainFirst[i].previewImage=null
          }
        }

        let plainFirst1 ={Spots:plainFirst}
        res.json(plainFirst1)
        return
    }

    // res.send('you are not the owner of the spot')


  }

   // res.status(403).json({message:'Forbidden'})
  res.json([])
})


//get details for a spot from an id
router.get('/:id' , async (req,res) =>{


    const find = await Spot.findByPk(req.params.id)

    if(!find){
        res.status(404).json({message:"Spot couldn't be found", statusCode:404})
        return
    }

    //an array of objects of ALL the reviews for SELECTED SPOT :: SO ALL HAVE THE SAME SPOT ID
    const allReviews = await Review.findAll({
      where:{
        spotId:req.params.id
      },

      // attributes:{
      //   group: ['id'],
      //   include:[
      //       [Sequelize.fn('COUNT', sequelize.col('review')), 'num'],
      //       [Sequelize.fn('AVG', sequelize.col('stars')), 'avg']
      //   ]
    // }
    })

    //total number of reviews for SELECTED SPOT
    let total = allReviews.length


    let sum = 0
    for(let i=0; i<allReviews.length; i++){

      sum = sum + allReviews[i].stars
    }

      let average = sum/total



    //finds ALL spots AT SELECTED SPOT
    const all = await Spot.findAll({
        where:{
            id:req.params.id
        },
        attributes:[
          'id', 'ownerId', 'address',
          'city', 'state', 'country',
          'lat', 'lng', 'name', 'description',
          'price', 'createdAt', 'updatedAt'
        ],
        // attributes:{
        //     include:[
        //         [Sequelize.fn('COUNT', sequelize.col('review')), 'numReviews'],
        //         [Sequelize.fn('AVG', sequelize.col('stars')), 'avgRating']
        //     ]
        // },
        // include:[
            // {
            //     model:Review,
            //     attributes:[
            //         [Sequelize.fn('COUNT', sequelize.col('review')), 'number of reviews'],
            //         [Sequelize.fn('AVG', sequelize.col('stars')), 'average rating']
            //     ]
            // },

        //     {model:Image,
        //     attributes: ['id','url','preview']},

        //     {model:User,
        //     attributes:['id', 'firstName', 'lastName'] }
        // ],
    })

    //turns allSpots array of objects plain so that I CAN INSERT INTO OBJECT
    const plainFirst = all.map(x => x.get({ plain: true }))

    plainFirst[0].numReviews = total
    plainFirst[0].avgStarRating = average


    const lastly = await Spot.findAll({
      where:{
        id:req.params.id
      },
      include:[
        {model:Image,
          attributes: ['id','url','preview']},

          {model:User,
          attributes:['id', 'firstName', 'lastName'] }
      ],
      })


      // res.json(lastly)
      if(plainFirst[0].id === lastly[0].id){
        plainFirst[0].SpotImages = lastly[0].Images
        plainFirst[0].Owner = lastly[0].User
      }

    res.json(plainFirst[0])

})

//create a spot
router.post('/', requireAuth,  validateSpot, async(req,res) =>{


    const {
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price} = req.body

    let newSpot = await Spot.create({
        ownerId:req.user.id,
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,

    })



    res.status(201).json(newSpot)


})

//delete a spot !!
router.delete('/:id', requireAuth, async(req,res) =>{


    let spotDelete = await Spot.findByPk(req.params.id)

    if(!spotDelete)
    {
        return res.status(404).json({message:"Spot couldn't be found", statusCode:404})
    }

        if(spotDelete.ownerId === req.user.id)
        {
          await spotDelete.destroy()
          res.json({
            message:'Successfully Deleted',
            statusCode:200
          })
          return
        }

        // res.send('you are not the owner of this Spot')
        res.status(403).json({message:'Forbidden', statusCode:403})

})

//edit a spot
router.put('/:spotId',requireAuth, validateSpot, async(req,res) =>{

    let findSpot = await Spot.findByPk(req.params.spotId)

    if(!findSpot)
    {
        res.status(404).json({message:"Spot couldn't be found", statusCode:404})
        return
    }

    const {
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price } = req.body

  if(findSpot.ownerId === req.user.id)
  {
    await findSpot.update({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price
  })

  // res.json(findSpot)

  const alas = await Spot.findAll({
    where:{id:req.params.spotId},
    attributes:[
      'id', 'ownerId', 'address','city',
      'state', 'country', 'lat',
      'lng','name', 'description', 'price',
      'createdAt', 'updatedAt'
    ]
  })

  res.json(alas[0])
  return
  }


  res.status(403).json({message:'Forbidden', statusCode:403})
  return

})


//create a review for a spot based on spots id
router.post('/:spotId/reviews', requireAuth, validateReview, async(req,res)=>{

    let find = await Spot.findByPk(req.params.spotId)
    if(!find){
        res.status(404).send({message:"Spot couldn't be found", statusCode:404})
        return
    }

    const {review, stars} = req.body


    let findReview = await Review.findAll({
      where:{spotId: req.params.spotId}
    })

  //does not allow the current user to create a second review for the same spot

  // console.log(findReview.review)
  // console.log(findReview.userId, 'userId')
  // console.log(req.user.id)

  // res.json(findReview)
  for(let i=0; i<findReview.length; i++)
  {
    if(findReview[i].userId === req.user.id && findReview[i].review){

      console.log('here')
      // res.status(403).send('you have already created a review for this spot')
      res.status(403).json({message:"User already has a review for this spot", statusCode:403})
      return
    }

  }

    let createReview = await Review.create({
        userId: req.user.id,
        spotId:req.params.spotId,
        review,
        stars,
        })

    res.status(201).json(createReview)
    return
})

//create an image for a spot
router.post('/:id/images', requireAuth, validateImage, async(req,res)=>{

    const { id, url, preview } = req.body

    let find = await Spot.findByPk(req.params.id)

    if(!find){
        res.status(404).json({message:"Spot couldn't be found", statusCode:404})
        return
    }

    if(find.ownerId !== req.user.id){
      // res.send('you are not the owner of the spot')
      res.status(403).json({message:'Forbidden', statusCode:403})
      return
    }

    let createImage = await Image.create({
        id,
        url,
        preview,
        imagableId:req.params.id,
        imagableType:'Spot'
    }, {
      attributes:{
        exclude:['imagableId', 'imagableType', 'updatedAt', 'createdAt']
      }
    })

    console.log(createImage.id, 'idcreate')

    let findCreatedImage = await Image.findAll({
      where:{id:createImage.id},
      attributes:{exclude:['imagableId', 'imagableType', 'updatedAt', 'createdAt']}
    })

    // console.log(createImage)


    res.json(findCreatedImage[0])
})



//get all bookings for a spot by spot Id
router.get('/:id/bookings' ,requireAuth, async (req,res) =>{


  const findSpot = await Spot.findByPk(req.params.id)

  if(!findSpot){
    res.status(404).json({message:"Spot couldn't be found", statusCode:404})
    return
    }

    console.log(findSpot.ownerId, 'owner')
    console.log(req.user.id, 'current')



    if(findSpot.ownerId !== req.user.id)
    {
      const bookingInfo = await Booking.findAll({
        where:{spotId:req.params.id},
        attributes:['spotId', 'startDate', 'endDate']
      })

      let finalObj={Bookings:bookingInfo}
      return res.json(finalObj)
    }

  const bookingSpot = await Booking.findAll({
    where:{spotId:req.params.id},
    include:[{
      model:User,
      attributes:['id', 'firstName', 'lastName']
    }],

    attributes:{include:[
      "id",
    "spotId",
    "userId",
    "startDate",
    "endDate",
    "createdAt",
    "updatedAt"]}
  })

  let finalObj2={Bookings:bookingSpot}
  res.json(finalObj2)
})

//get all reviews by a spots id
router.get('/:spotId/reviews' , async (req,res) =>{

  const find = await Spot.findByPk(req.params.spotId)

  if(!find){
      return res.status(404).json({message:"Spot couldn't be found", statusCode:404})
  }

  const all = await Review.findAll({
      where:{spotId:req.params.spotId},
      include:[
        {
          model:User,
          attributes:['id', 'firstName', 'lastName']
        },
        // {
        //   model:Image
        // }
      ]
  })

  // res.json(all)

  let findImageR = await Image.findAll({
    where:{imagableType:'Review'},
    attributes:['id', 'url', 'imagableId']

  })

  // res.json(findImageR)

  let findImageRI = await Image.findAll({
    where:{imagableType:'Review'},
    attributes:['id', 'url']
  })


  const plainFirst = all.map(x => x.get({ plain: true }))

      let ReviewImagess = []

  //iterate through the image array of objects twice
        for(let t=0; t<findImageRI.length; t++){
          for(let a=0; a<findImageRI.length; a++)
          {
            if(findImageR[t].id === findImageRI[a].id){

              for(let i=0; i<all.length; i++){
                for(let d=0; d<findImageR.length; d++){

                  // console.log(plainFirst[i].id, findImageR[d].imagableId)
                  if(plainFirst[i].id === findImageR[d].imagableId){
                    // res.json(findImageR)
                    // res.json(findImageR[d])

                    console.log(plainFirst[i].id,'reviewssssssssssss')
                    console.log(findImageR[d].imagableId)

                    // if(!ReviewImages.length){
                    //   ReviewImages.push(findImageRI[d])
                    // }

                    // for(let kink=0; kink<ReviewImages.length; kink++){
                    //   // console.log(ReviewImages[kink].id,'pppppp')
                    //   if(ReviewImages[kink].id !== findImageRI[d].id){
                    //     console.log(ReviewImages[kink].id,'review Array')
                    //     console.log(findImageRI[d].id, 'images')
                    //     ReviewImages.push(findImageRI[d])
                    //     plainFirst[i].ReviewImages = ReviewImages
                    //   }
                    // }

                    // if(ReviewImages.length<10)
                    // {
                      ReviewImagess.push(findImageRI[d])
                      // plainFirst[i].ReviewImages = ReviewImagess
                    // }

                    // res.json(plainFirst[i])
                  }
                }
              }
            }
          }
        }

      const seen = new Set();
      const uniqueImages = ReviewImagess.filter(item => {
      const duplicate = seen.has(item.id);
        seen.add(item.id);
        return !duplicate;
      });

      let v = uniqueImages.map(item => item)
      // ["1", "2", "3"]





       //iterate through the image array of objects twice
       for(let t=0; t<findImageRI.length; t++){
        for(let a=0; a<findImageRI.length; a++)
        {
          if(findImageR[t].id === findImageRI[a].id){

            for(let i=0; i<all.length; i++){
              for(let d=0; d<findImageR.length; d++){

                // console.log(plainFirst[i].id, findImageR[d].imagableId)
                if(plainFirst[i].id === findImageR[d].imagableId){
                    plainFirst[i].ReviewImages = v

                }
              }
            }
          }
        }
      }


        for(let k=0; k<plainFirst.length; k++){

          if(!plainFirst[k].ReviewImages)
          {
            plainFirst[k].ReviewImages = []
          }

        }

      let object = {Reviews:plainFirst}
      res.json(object)
      return
})


//create a booking based on spot id
router.post('/:id/bookings', requireAuth, validateBooking, async(req,res)=>{

    //returns the desired spot ... an object
      let findSpot = await Spot.findByPk(req.params.id)

      //if the desired spot does not exist 404
      if(!findSpot){
        res.status(404).json({message:"Spot couldn't be found", statusCode:404})
        return
      }

      //find the bookings that match the spot id
      let findBooking = await Booking.findAll({
        where:{spotId:req.params.id},
        raw: true
      })

      //if the current user owns the spot then do not create a booking
      if(findSpot.ownerId === req.user.id) {
            return res.status(403).json({message:"Forbidden", statusCode:403})
      }

      //gets the data
      const {startDate, endDate} = req.body


      let newStart1 = new Date(startDate)
      let newEnd1 = new Date(endDate)

      let date = newStart1.getDate();

      if (date < 10) {
        date =  '0' + date
      }

      let  month = newStart1.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12

      console.log(month)
      if (month < 10) {
        month =  '0' + month
      }


      let year = newStart1.getFullYear();

    let newStart = year + "-" + month + "-" + date;



    console.log(newStart, 'test new start')


    let day = newEnd1.getDate();

    if (day < 10) {
      day = '0' + day;
    }

    let monthh = newEnd1.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12

    if (monthh < 10) {
      monthh = '0' + monthh;
    }




    let yearr = newEnd1.getFullYear();

    let newEnd = yearr + "-" + monthh + "-" + day;

    console.log(newEnd, 'test new End')



      for(let i=0; i<findBooking.length; i++){

        console.log(newStart, newEnd)

        if(newStart >= findBooking[i].startDate && newStart <=findBooking[i].endDate){


      console.log('first')
      console.log(newStart)
      console.log(newEnd)
      console.log(findBooking[i].startDate)
      console.log(findBooking[i].endDate)

          res.status(403).json({ message: "Sorry, this spot is already booked for the specified dates",
          statusCode: 403,
          errors: [
              "Start date conflicts with an existing booking"]
              })

          return
        }

        if(newEnd >= findBooking[i].startDate && newStart <=findBooking[i].endDate){

      console.log('second')
      console.log(newStart)
      console.log(newEnd)
      console.log(findBooking[i].startDate)
      console.log(findBooking[i].endDate)


          res.status(403).json({ message: "Sorry, this spot is already booked for the specified dates",
          statusCode: 403,
          errors: [
              "End date conflicts with an existing booking"]
              })
              return
        }

        if(findBooking[i].startDate >= newStart && findBooking[i].endDate <= newEnd){


      console.log('first')
      console.log(newStart)
      console.log(newEnd)
      console.log(findBooking[i].startDate)
      console.log(findBooking[i].endDate)


          res.status(403).json({ message: "Sorry, this spot is already booked for the specified dates",
          statusCode: 403,
          errors: [
            "Start date conflicts with an existing booking",
              "End date conflicts with an existing booking"]
              })
              return
        }

      }



      // for(let m=0; m<startYear.length; m++){

      //   console.log(mmmmmmmmmmmm)

      //   if(bodyEnd[0] >= endYear[l])
      //   {

      //     for(let t=0; t<endYear.length; t++){
      //       if(bodyStart[0] <= startYear[l]){

      //         if(bodyStart[2] <= endDay[l] && bodyEnd[2] <=endDay[l]){

      //           res.status(403).json({ message: "Sorry, this spot is already booked for the specified dates",
      //             statusCode: 403,
      //             errors: [
      //                 "Start date conflicts with an existing booking",
      //                 "End date conflicts with an existing booking",'aaaaaaaaaaaaa']
      //                 })

      //                 return}

      //       }
      //     }
      //   }
      // }

      console.log('bloast')
      console.log(newStart)
      console.log(newEnd)


    createBooking = await Booking.create({
      spotId:req.params.id,
      userId:req.user.id,
      startDate,
      endDate,
    })

    return res.json(createBooking)
})


module.exports = router;
