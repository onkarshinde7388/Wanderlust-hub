const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("C:\\Users\\ONKAR\\OneDrive\\Wanderlust Hub Project\\models\\listing.js");

const Mongo_Url = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=> {
    console.log("connected to DB");
}). catch((err) =>  {
    console.log(err);
});

async function main() {
    await mongoose.connect(Mongo_Url);
};

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({
        ...obj,owner: "683eb1aae6f59273c2400607",
    }));
    await Listing.insertMany(initData.data);
    console.log("data was intiliazed");
};

initDB();