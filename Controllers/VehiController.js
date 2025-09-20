const Vehicle = require("../Model/VehiModel");


///data display
const getAllVehicles = async(req, res) =>{

    let Vehicles;
    

    try{
        Vehicles = await Vehicle.find();
    }catch(err){
        console.log(err);
    }

    if(!Vehicles){
        return res.status(500).json({ message: "Error fetching vehicles" });

}



    return res.status(200).json({ Vehicles });


};

///data insert

const addVehicles = async(req, res) => {
    const{ vehicleType, vehicleName,seat } = req.body;
        const vehicleImage = req.file ? [req.file.path] : [];



    let vehicles;

    try{

        vehicles = new Vehicle({ vehicleImage,vehicleType, vehicleName,seat});
        await vehicles.save();
    }catch(err){
        console.log(err);
    }


    //not insert vehicles
if(!vehicles){
    return res.status(404).json({message:"unable to add vehicles"});
}

    return res.status(200).json({ vehicles });


};




//get by Id


const getById = async(req, res, next) =>{

    const id = req.params.id;

    let vehicles;

    try{
        vehicles = await Vehicle.findById(id);
    }catch(err){
        console.log(err);
    }
    //not available vehicles


    if(!vehicles){
    return res.status(404).json({message:"vehicle not found"});
}

    return res.status(200).json({ vehicles });

};



//UPDATE USER DETAILS

const updateVehicle = async (req, res) => {

    const id = req.params.id;

    const {  vehicleType, vehicleName, seat } = req.body;


      const vehicleImage = req.file ? [req.file.path] : undefined;




    let vehicles;

    try {
        vehicles = await Vehicle.findByIdAndUpdate(
             id,
    {
        ...(vehicleImage && { vehicleImage }), // only update if new image
        vehicleType,
        vehicleName,
        seat
    },
    { new: true } 
        
);

 
    } catch (err) {
        console.log(err);
    }

    if (!vehicles) {
        return res.status(404).json({ message: "Unable to update Vehicle Details" });
    }

    return res.status(200).json({ vehicles });
};



//delete vehicles

const deleteVehicle = async(req, res, next) => {

    const id = req.params.id;
    
    let vehicles; 

    try{
        vehicles = await Vehicle.findByIdAndDelete(id)
    }catch(err){
        console.log(err);
    }

    
    if(!vehicles){
    return res.status(404).json({message:"unable to delete"});
}

    return res.status(200).json({ vehicles });





}




exports.getAllVehicles = getAllVehicles;

exports.addVehicles = addVehicles;

exports.getById = getById;

exports.updateVehicle = updateVehicle;

exports.deleteVehicle = deleteVehicle;