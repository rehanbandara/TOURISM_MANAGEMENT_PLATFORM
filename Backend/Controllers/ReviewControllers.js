const Review = require("../Model/ReviewModel");

//data display
const getAllReviews = async (req, res, next) => {

    let reviews;
    //Get all users
    try{
        reviews = await Review.find()
        // .populate("user", "name email") // populate user details
        // .populate("hotel", "name location"); // populate hotel details
    }catch (err) {
        console.log(err);
    }
    //not found
    if(!reviews){
         return res.status(404).json({message:"Reviews not found"})
    }
    //Display all users
    return res.status(200).json({ reviews })

};


//data insert
const addReviews = async (req, res, next) => {

    const { user, hotel, rating, comment } = req.body;

    let reviews;

    try{
        reviews = new Review({ user, hotel, rating, comment });
        await reviews.save();
    }catch (err) {
        console.log(err); 
    }

    //not insert users
    if(!reviews) {
        return res.status(404).json({ message: "unable to add reviews"});
    }
    return res.status(200).json({ reviews });
};

//Get by Id
const getById = async(req, res, next) => {
    
    const id = req.params.id;

    let review;

    try{
        review = await Review.findById(id);
        // .populate("user", "name email")
        // .populate("hotel", "name location");
    }catch (err) {
        console.log(err);
    }
    //not available users
    if(!review) {
        return res.status(404).json({ message: "Review not found"});
    }
    return res.status(200).json({ review });
};

//Update User Details
const updateReview = async (req, res, next) => {

    const id = req.params.id;

    const { rating, comment, isDeleted } = req.body;

    let review;

     try {
        reviews = await Review.findByIdAndUpdate(id,
            { rating, comment, isDeleted },
            { new: true }
        );
    }catch(err) {
        console.log(err);
    }
    if(!reviews) {
        return res.status(404).json({ message: "Unable to update review Details"});
    }
    return res.status(200).json({ reviews });
};

//Delete User Details
const deleteReview = async (req, res, next) => {

    const id = req.params.id;

    let review;

    try {
        review = await Review.findByIdAndDelete(id)
    }catch(err) {
        console.log(err);
    }
    if(!review) {
        return res.status(404).json({ message: "Unable to Delete review Details"});
    }
    return res.status(200).json({ review });
};


exports.getAllReviews = getAllReviews;
exports.addReviews = addReviews;
exports.getById = getById
exports.updateReview = updateReview;
exports.deleteReview = deleteReview;


