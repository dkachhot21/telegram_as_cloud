const { default: mongoose } = require("mongoose");

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log(`Database Connected :`, connect.connection.host);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDB;