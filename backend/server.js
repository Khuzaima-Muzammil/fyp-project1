require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // npm install cors

const app = express();

app.use(cors()); // is ki mdad sai frontend aur backend kai drmiyan communication hoti hai 
// app.use(express.json());

app.use(express.json({ limit: '50mb' })); //ye tb km krta hai jb data frontend sai json ki format me beja jae
app.use(express.urlencoded({ limit: '50mb', extended: true })); // ye tb km krta hai jb data frontend sai html form-data ki format me beja jae

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/users', require('./routes/user'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server on ${PORT}`));
  })
  .catch(err => console.log(err));