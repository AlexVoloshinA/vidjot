const express = require('express');


const app = express();


//Index route
app.get('/', (req,res) => {
  res.send('Hello world');
});

//About route

app.get('/about', (req,res) => {
  res.send('About');
});

const port = 5000;

app.listen(port, () => {
  console.log(`Listening on the port ${port}`);
});