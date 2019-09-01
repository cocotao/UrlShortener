const app = require('./app');

const PORT = 7000;
app.listen(PORT, () => {
    console.log(`Server started on port`, PORT);
});