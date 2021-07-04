module.exports = function startDb() {

  const { MONGODB_URL = 'mongodb://127.0.0.1:27017/musicapp?retryWrites=true&w=majority&replicaSet=rs' } = process.env;
  
  const config = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    autoIndex: false,
    connectTimeoutMS: 300000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 30000, // Close sockets after 45 seconds of inactivity
  };
  
  mongoose.connect(MONGODB_URL, config);
  mongoose.set('debug', false);
  mongoose.Promise = global.Promise;
  
  const db = mongoose.connection;
  
  db.on('connected', () => {
    console.log(MONGODB_URL);
    console.log('Mongoose default connection open');
  });
  
  db.on('reconnected', () => {
    console.log('Mongoose default connection reconnected');
  });
  
  db.on('error', (err) => {
    console.log('Mongoose default connection error: ' + err);
  });
  
  const SIGS = [
    'SIGINT', // Ctrl + C
    'SIGBREAK', // Ctrl + C
    'SIGTERM', // Soft Shutown
  ];
  
  SIGS.forEach((SIG) => {
    process.on(SIG, () => {
      mongoose.connection.close(() => {
        console.log(`Close On ${SIG}`);
        process.exit(1);
      });
    });
  });
};